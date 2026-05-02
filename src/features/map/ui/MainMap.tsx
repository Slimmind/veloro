import { useEffect, useState } from 'react';
import {
	MapContainer,
	Marker,
	Popup,
	ZoomControl,
	useMap,
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
import { UserLocation } from './UserLocation';
import { VectorTileLayer } from './VectorTileLayer';
import { BIKE_MARKER_ICON } from '../model/map-marker';
import { MAP_STYLES } from '../model/map-styles';
import { useUserGeolocation } from '../../../hooks/useUserGeolocation';

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
}

const SearchViewUpdater = ({
	position,
}: {
	position: LatLngTuple | undefined;
}) => {
	const map = useMap();

	useEffect(() => {
		if (!position) return;
		map.setView(position, 15, { animate: true });
	}, [map, position]);

	return null;
};

export const MainMap = ({ selectedResult }: MainMapProps) => {
	const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
	const [mlMap, setMlMap] = useState<MLMap | null>(null);
	const { position, accuracy, findMe, loading, error } = useUserGeolocation();

	return (
		<div className='main-map'>
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
				<FindMeButton findMe={findMe} loading={loading} error={error} />

				<VectorTileLayer styleUrl={MAP_STYLES.bright.url} onReady={setMlMap} />

				{mlMap && <BikePathsMlLayer mlMap={mlMap} bounds={mapBounds} minZoom={12} />}

				<MapBoundsTracker onBoundsChange={setMapBounds} />
				<UserLocation position={position} accuracy={accuracy} />

				<SearchViewUpdater position={selectedResult?.position} />
				{selectedResult && (
					<Marker position={selectedResult.position} icon={BIKE_MARKER_ICON}>
						<Popup>
							<strong>🔍 Найдено:</strong>
							<br />
							{selectedResult.name}
						</Popup>
					</Marker>
				)}
			</MapContainer>
		</div>
	);
};
