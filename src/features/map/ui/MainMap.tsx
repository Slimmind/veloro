import { useEffect, useRef, useState } from 'react';
import type { YMap, YMapDefaultFeaturesLayer, YMapEntity, YMapFeature, YMapMarker } from '@yandex/ymaps3-types';
import { YMapContext } from '../lib/ymap-context';
import { BikePathsLayer } from './BikePathsLayer';
import { FindMeButton } from './FindMeButton';
import { MapBoundsTracker } from './MapBoundsTracker';
import { RouteLine, findClosestIndex, traveledDistance } from './RouteLine';
import { RouteInfo } from './RouteInfo';
import { UserLocation } from './UserLocation';
import { createMarkerElement } from '../model/map-marker';
import type { MapStyleKey } from '../model/map-styles';
import type { RouteResult } from '../model/useRoute';
import type { UseGeolocationReturn } from '../../../hooks/useUserGeolocation';
import type { LatLngTuple } from '../../../shared/lib/types';
import type { Bounds } from '../../../shared/api/overpass';
import './main-map.styles.css';

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
	onSaveRoute?: (name: string) => void;
	isSavedRoute?: boolean;
	isRecordedRoute?: boolean;
	routeName?: string;
	trackPoints?: LatLngTuple[];
}

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
	isRecordedRoute = false,
	routeName,
	trackPoints = [],
}: MainMapProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [map, setMap] = useState<YMap | null>(null);
	const [mapBounds, setMapBounds] = useState<Bounds | null>(null);
	const [zoom, setZoom] = useState(13);

	const schemeLayerRef = useRef<YMapEntity<unknown> | null>(null);
	const featLayerRef = useRef<YMapDefaultFeaturesLayer | null>(null);
	const trackFeatureRef = useRef<YMapFeature | null>(null);
	const fromMarkerRef = useRef<YMapMarker | null>(null);
	const waypointFeaturesRef = useRef<YMapFeature[]>([]);

	const { position, accuracy, findMe, loading, error } = geolocation;
	const isSatellite = activeStyle === 'satellite';

	// ─── Initialize map ───────────────────────────────────────────────────────
	useEffect(() => {
		if (!containerRef.current) return;
		let ymap: YMap | null = null;

		// Guard: script may fail to load (e.g. API key not authorized for this domain)
		const win = window as Window & { ymaps3?: typeof ymaps3 };
		if (!win.ymaps3) {
			console.error('Yandex Maps API не загружен. Проверьте API-ключ и разрешённые домены на developer.tech.yandex.ru');
			return;
		}

		ymaps3.ready.then(() => {
			if (!containerRef.current) return;

			ymap = new ymaps3.YMap(containerRef.current, {
				location: { center: [27.56, 53.9], zoom: 13 },
			});

			const scheme = new ymaps3.YMapDefaultSchemeLayer({});
			ymap.addChild(scheme);
			schemeLayerRef.current = scheme;

			const featLayer = new ymaps3.YMapDefaultFeaturesLayer({});
			ymap.addChild(featLayer);
			featLayerRef.current = featLayer;

			setMap(ymap);
		});

		return () => {
			ymap?.destroy();
			setMap(null);
			schemeLayerRef.current = null;
			featLayerRef.current = null;
		};
	}, []);

	// ─── Pan to user once map is ready ────────────────────────────────────────
	useEffect(() => {
		if (!map) return;
		const flyTo = (pos: LatLngTuple, z: number) =>
			map.setLocation({ center: [pos[1], pos[0]], zoom: z, duration: 1200 });
		findMe(flyTo, 14);
	}, [map]); // eslint-disable-line react-hooks/exhaustive-deps

	// ─── Style layer switching ─────────────────────────────────────────────────
	useEffect(() => {
		if (!map || !schemeLayerRef.current) return;

		map.removeChild(schemeLayerRef.current);
		// YMapDefaultSatelliteLayer exists at runtime; the types stub is incomplete
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const SatLayer = (ymaps3 as any).YMapDefaultSatelliteLayer as new (props?: object) => YMapEntity<unknown>;
		const newLayer = isSatellite
			? new SatLayer({})
			: new ymaps3.YMapDefaultSchemeLayer({});
		map.addChild(newLayer, 0);
		schemeLayerRef.current = newLayer;
	}, [map, isSatellite]);

	// ─── Click + zoom listener ────────────────────────────────────────────────
	useEffect(() => {
		if (!map) return;

		const clickListener = new ymaps3.YMapListener({
			onClick: (_obj, e) => {
				if (onMapClick && e) {
					onMapClick([e.coordinates[1], e.coordinates[0]]);
				}
			},
		});
		const moveListener = new ymaps3.YMapListener({
			onActionEnd: ({ location }) => {
				setZoom(location.zoom);
			},
		});

		map.addChild(clickListener);
		map.addChild(moveListener);

		return () => {
			map.removeChild(clickListener);
			map.removeChild(moveListener);
		};
	}, [map, onMapClick]);

	// ─── Track recording polyline ─────────────────────────────────────────────
	const displayTrack = isRecordedRoute && route ? route.coordinates : trackPoints;

	useEffect(() => {
		if (!map) return;

		if (displayTrack.length >= 2) {
			const geom = {
				type: 'LineString' as const,
				coordinates: displayTrack.map(([lat, lng]) => [lng, lat] as [number, number]),
			};
			if (!trackFeatureRef.current) {
				trackFeatureRef.current = new ymaps3.YMapFeature({
					geometry: geom,
					style: { stroke: [{ color: '#22c55e', width: 5, opacity: 0.85 }] },
				});
				map.addChild(trackFeatureRef.current);
			} else {
				trackFeatureRef.current.update({ geometry: geom });
			}
		} else if (trackFeatureRef.current) {
			map.removeChild(trackFeatureRef.current);
			trackFeatureRef.current = null;
		}
	}, [map, displayTrack]);

	// ─── Route-from-point marker ──────────────────────────────────────────────
	useEffect(() => {
		if (!map) return;

		if (routeFromPoint) {
			const coords: [number, number] = [routeFromPoint[1], routeFromPoint[0]];
			if (!fromMarkerRef.current) {
				fromMarkerRef.current = new ymaps3.YMapMarker(
					{ coordinates: coords },
					createMarkerElement(isSatellite),
				);
				map.addChild(fromMarkerRef.current);
			} else {
				fromMarkerRef.current.update({ coordinates: coords });
			}
		} else if (fromMarkerRef.current) {
			map.removeChild(fromMarkerRef.current);
			fromMarkerRef.current = null;
		}
	}, [map, routeFromPoint, isSatellite]);

	// ─── Waypoint markers ─────────────────────────────────────────────────────
	useEffect(() => {
		if (!map) return;

		waypointFeaturesRef.current.forEach((f) => map.removeChild(f));
		waypointFeaturesRef.current = [];

		waypoints.forEach((wp) => {
			const f = new ymaps3.YMapFeature({
				geometry: { type: 'Point', coordinates: [wp[1], wp[0]] },
				style: {
					fill: 'magenta',
					stroke: [{ color: 'white', width: 2 }],
					zIndex: 10,
				},
			});
			map.addChild(f);
			waypointFeaturesRef.current.push(f);
		});
	}, [map, waypoints]);

	// ─── Traveled distance calc (for RouteInfo) ───────────────────────────────
	const routeTraveled = route && !isRecordedRoute && position
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
					routeName={routeName}
					onUndo={onUndoWaypoint}
					onClear={onClearRoute}
				/>
			)}

			<div ref={containerRef} style={{ width: '100%', height: '100%' }} />

			{map && (
				<YMapContext.Provider value={map}>
					{route && !isRecordedRoute && (
						<RouteLine coordinates={route.coordinates} userPosition={position} />
					)}
					<BikePathsLayer
						bounds={mapBounds}
						zoom={zoom}
						isSatellite={isSatellite}
					/>
					<UserLocation position={position} accuracy={accuracy} satellite={isSatellite} />
					<MapBoundsTracker onBoundsChange={setMapBounds} />
					<FindMeButton findMe={findMe} loading={loading} error={error} />
				</YMapContext.Provider>
			)}
		</div>
	);
};
