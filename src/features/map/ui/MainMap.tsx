import { useEffect, useRef, useState } from 'react';
import {
	MapContainer,
	Marker,
	Popup,
	TileLayer,
	ZoomControl,
	useMap,
	useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import type { LatLngBounds, LatLngTuple } from 'leaflet';
import type { Map as MLMap } from 'maplibre-gl';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

import { BikePathsMlLayer } from './BikePathsMlLayer';
import { FindMeButton } from './FindMeButton';
import { MapBoundsTracker } from './MapBoundsTracker';
import { RouteLine } from './RouteLine';
import { UserLocation } from './UserLocation';
import { VectorTileLayer } from './VectorTileLayer';
import { BIKE_MARKER_ICON } from '../model/map-marker';
import { MAP_STYLES } from '../model/map-styles';
import type { MapStyleKey } from '../model/map-styles';
import type { RouteResult } from '../model/useRoute';
import type { UseGeolocationReturn } from '../../../hooks/useUserGeolocation';
import type { SearchResult } from '../../../entities/search';

import 'leaflet/dist/leaflet.css';
import './main-map.styles.css';

delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
	iconUrl: icon,
	iconRetinaUrl: iconRetina,
	shadowUrl: shadow,
});

interface MainMapProps {
	selectedResult: SearchResult | null;
	activeStyle: MapStyleKey;
	geolocation: UseGeolocationReturn;
	route: RouteResult | null;
	pickingPoint?: boolean;
	routeFromPoint?: LatLngTuple | null;
	onMapClick?: (latlng: LatLngTuple) => void;
}

const MapInitializer = ({ findMe }: { findMe: (map?: import('leaflet').Map, zoom?: number) => Promise<string | null> }) => {
	const map = useMap();
	const initialized = useRef(false);

	useEffect(() => {
		if (initialized.current) return;
		initialized.current = true;
		findMe(map, 14);
	}, [map, findMe]);

	return null;
};

const SearchViewUpdater = ({ position }: { position: LatLngTuple | undefined }) => {
	const map = useMap();

	useEffect(() => {
		if (!position) return;
		map.setView(position, 15, { animate: true });
	}, [map, position]);

	return null;
};

const MapClickHandler = ({ onClick }: { onClick: (latlng: LatLngTuple) => void }) => {
	useMapEvents({
		click(e) {
			onClick([e.latlng.lat, e.latlng.lng]);
		},
	});
	return null;
};

export const MainMap = ({
	selectedResult,
	activeStyle,
	geolocation,
	route,
	pickingPoint = false,
	routeFromPoint = null,
	onMapClick,
}: MainMapProps) => {
	const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
	const [mlMap, setMlMap] = useState<MLMap | null>(null);

	const { position, accuracy, findMe, loading, error } = geolocation;
	const currentStyle = MAP_STYLES[activeStyle];

	useEffect(() => {
		setMlMap(null);
	}, [activeStyle]);

	return (
		<div className={`main-map ${pickingPoint ? 'main-map--picking' : ''}`}>
			<MapContainer
				center={selectedResult?.position || ([53.9, 27.56] as LatLngTuple)}
				zoom={selectedResult ? 15 : 13}
				style={{ height: '100%', width: '100%' }}
				zoomControl={false}
				scrollWheelZoom={true}
				doubleClickZoom={true}
				touchZoom={true}
				dragging={true}
			>
				<ZoomControl position='bottomright' />
				<MapInitializer findMe={findMe} />
				<FindMeButton findMe={findMe} loading={loading} error={error} />

				{currentStyle.type === 'vector' ? (
					<VectorTileLayer styleUrl={currentStyle.url} onReady={setMlMap} />
				) : (
					<TileLayer url={currentStyle.url} />
				)}

				{mlMap && <BikePathsMlLayer mlMap={mlMap} bounds={mapBounds} minZoom={12} />}

				<MapBoundsTracker onBoundsChange={setMapBounds} />
				<UserLocation position={position} accuracy={accuracy} />

				{route && <RouteLine coordinates={route.coordinates} />}

				{onMapClick && <MapClickHandler onClick={onMapClick} />}

				{routeFromPoint && (
					<Marker position={routeFromPoint} icon={BIKE_MARKER_ICON}>
						<Popup>Начало маршрута</Popup>
					</Marker>
				)}

				<SearchViewUpdater position={selectedResult?.position} />
				{selectedResult && (
					<Marker position={selectedResult.position} icon={BIKE_MARKER_ICON}>
						<Popup>{selectedResult.name}</Popup>
					</Marker>
				)}
			</MapContainer>
		</div>
	);
};
