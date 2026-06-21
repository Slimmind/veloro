import { useEffect, useRef, useState } from 'react';
import {
	MapContainer,
	Marker,
	Polyline,
	Popup,
	ZoomControl,
	useMap,
	useMapEvents,
} from 'react-leaflet';

import L from 'leaflet';
import type { LatLngBounds, LatLngTuple } from 'leaflet';
import type { Map as MLMap, StyleSpecification } from 'maplibre-gl';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

import { BikePathsMlLayer } from './BikePathsMlLayer';
import { FindMeButton } from './FindMeButton';
import { MapBoundsTracker } from './MapBoundsTracker';
import { RouteLine, findClosestIndex, traveledDistance } from './RouteLine';
import { RouteInfo } from './RouteInfo';
import { UserLocation } from './UserLocation';
import { VectorTileLayer } from './VectorTileLayer';
import { BIKE_MARKER_ICON, BIKE_MARKER_ICON_SATELLITE } from '../model/map-marker';
import { MAP_STYLES } from '../model/map-styles';
import { removeLatinLabels } from '../model/removeLatinLabels';
import { buildSatelliteHybridStyle } from '../model/buildSatelliteHybridStyle';
import type { MapStyleKey } from '../model/map-styles';
import type { RouteResult } from '../model/useRoute';
import type { UseGeolocationReturn } from '../../../hooks/useUserGeolocation';
import 'leaflet/dist/leaflet.css';
import './main-map.styles.css';

delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
	iconUrl: icon,
	iconRetinaUrl: iconRetina,
	shadowUrl: shadow,
});

interface MainMapProps {
	activeStyle: MapStyleKey;
	geolocation: UseGeolocationReturn;
	route: RouteResult | null;
	waypoints?: LatLngTuple[];
	pickingPoint?: boolean;
	routeFromPoint?: LatLngTuple | null;
	onMapClick?: (latlng: LatLngTuple) => void;
	onClearRoute?: () => void;
	onUndoWaypoint?: () => void;
	onSaveRoute?: () => void;
	isSavedRoute?: boolean;
	trackPoints?: LatLngTuple[];
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

const MapClickHandler = ({ onClick }: { onClick: (latlng: LatLngTuple) => void }) => {
	useMapEvents({
		click(e) {
			onClick([e.latlng.lat, e.latlng.lng]);
		},
	});
	return null;
};

export const MainMap = ({
	activeStyle,
	geolocation,
	route,
	waypoints = [],
	pickingPoint = false,
	routeFromPoint = null,
	onMapClick,
	onClearRoute,
	onUndoWaypoint,
	onSaveRoute,
	isSavedRoute,
	trackPoints = [],
}: MainMapProps) => {
	const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
	const [mlMap, setMlMap] = useState<MLMap | null>(null);
	const [satelliteStyle, setSatelliteStyle] = useState<StyleSpecification | null>(null);

	const { position, accuracy, findMe, loading, error } = geolocation;
	const currentStyle = MAP_STYLES[activeStyle];
	const markerIcon = activeStyle === 'satellite' ? BIKE_MARKER_ICON_SATELLITE : BIKE_MARKER_ICON;

	useEffect(() => {
		setMlMap(null);
		if (currentStyle.type === 'satellite') {
			buildSatelliteHybridStyle(currentStyle.url).then(setSatelliteStyle);
		}
	}, [activeStyle]);

	useEffect(() => {
		if (!mlMap) return;
		removeLatinLabels(mlMap);
	}, [mlMap]);

	const routeTraveled = route && position
		? (() => {
			const idx = findClosestIndex(route.coordinates, position);
			return idx > 0 ? traveledDistance(route.coordinates, idx) : 0;
		})()
		: 0;

	return (
		<div className={`main-map ${pickingPoint ? 'main-map--picking' : ''}`}>
			{route && (
				<RouteInfo
					distance={route.distance}
					duration={route.duration}
					traveled={routeTraveled}
					hasWaypoints={waypoints.length > 0}
					onSave={onSaveRoute}
					isSaved={isSavedRoute}
					onUndo={onUndoWaypoint}
					onClear={onClearRoute}
				/>
			)}
			<MapContainer
				center={[53.9, 27.56] as LatLngTuple}
				zoom={13}
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
				) : satelliteStyle ? (
					<VectorTileLayer styleObject={satelliteStyle} onReady={setMlMap} />
				) : null}

				{mlMap && <BikePathsMlLayer mlMap={mlMap} bounds={mapBounds} minZoom={12} isSatellite={activeStyle === 'satellite'} />}

				<MapBoundsTracker onBoundsChange={setMapBounds} />
				<UserLocation position={position} accuracy={accuracy} icon={markerIcon} />

				{route && <RouteLine coordinates={route.coordinates} userPosition={position} />}

				{trackPoints.length >= 2 && (
					<Polyline positions={trackPoints} color='#22c55e' weight={5} opacity={0.85} />
				)}

				{onMapClick && <MapClickHandler onClick={onMapClick} />}

				{routeFromPoint && (
					<Marker position={routeFromPoint} icon={markerIcon}>
						<Popup>Начало маршрута</Popup>
					</Marker>
				)}

				{waypoints.map((wp, i) => (
					<Marker key={`wp-${i}`} position={wp} icon={markerIcon}>
						<Popup>Точка пути {i + 1}</Popup>
					</Marker>
				))}

			</MapContainer>
		</div>
	);
};
