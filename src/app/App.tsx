import { useCallback, useEffect, useRef, useState } from 'react';
import type { LatLngTuple } from 'leaflet';
import { MainHeader, PathBuilder, useMapSearch, useRouteHistory, type SearchResult } from '../features/search';
import type { RouteMode } from '../features/search';
import { MainMap } from '../features/map';
import { useRoute } from '../features/map/model/useRoute';
import { useTrackRecording } from '../features/map/model/useTrackRecording';
import { TrackingPanel } from '../features/map/ui/TrackingPanel';
import { DEFAULT_MAP_STYLE } from '../features/map/model/map-styles';
import type { MapStyleKey } from '../features/map/model/map-styles';
import { useUserGeolocation } from '../hooks/useUserGeolocation';
import { useAuth } from '../features/auth/model/useAuth';
import { useSavedRoutes } from '../features/map/model/useSavedRoutes';

export const App = () => {
	const [activeStyle, setActiveStyle] = useState<MapStyleKey>(DEFAULT_MAP_STYLE);
	const [pendingRoute, setPendingRoute] = useState<SearchResult | null>(null);
	const [pathBuilderOpen, setPathBuilderOpen] = useState(false);
	const [routeMode, setRouteMode] = useState<RouteMode | null>(null);
	const [routeFromPoint, setRouteFromPoint] = useState<LatLngTuple | null>(null);
	const [isCurrentRouteSaved, setIsCurrentRouteSaved] = useState(false);

	const geolocation = useUserGeolocation();
	const { route, waypoints, routeFrom, routeTo, buildRoute, restoreRoute, addWaypoint, undoWaypoint, error: routeError, clearRoute } = useRoute();
	const [isRecordedRoute, setIsRecordedRoute] = useState(false);
	const tracking = useTrackRecording(geolocation.position);
	const { results, loading, error, search } = useMapSearch();
	const { history: routeHistory, addToHistory } = useRouteHistory();
	const { user, authLoading } = useAuth();
	const { savedRoutes, saveRoute, deleteRoute } = useSavedRoutes(authLoading ? undefined : (user?.uid ?? null));

	const [showGeoError, setShowGeoError] = useState(false);
	const geoErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (!geolocation.error) return;
		setPendingRoute(null);
		if (geoErrorTimerRef.current) clearTimeout(geoErrorTimerRef.current);
		setShowGeoError(true);
		geoErrorTimerRef.current = setTimeout(() => setShowGeoError(false), 4000);
	}, [geolocation.error]);

	// Build pending route once geolocation becomes available
	useEffect(() => {
		if (pendingRoute && geolocation.position) {
			buildRoute(geolocation.position, pendingRoute.position);
			setPendingRoute(null);
		}
	}, [geolocation.position, pendingRoute, buildRoute]);

	const handleSearch = useCallback(
		async (query: string) => {
			await search(query);
		},
		[search],
	);

	const handleDirectionClick = useCallback(
		(result: SearchResult) => {
			setIsCurrentRouteSaved(false);
			setIsRecordedRoute(false);
			addToHistory(result);
			if (geolocation.position) {
				buildRoute(geolocation.position, result.position);
			} else {
				setPendingRoute(result);
				geolocation.findMe();
			}
		},
		[geolocation, buildRoute, addToHistory],
	);

	const handleModeSelect = useCallback((mode: RouteMode) => {
		if (mode === 'record-track') {
			tracking.start();
			return;
		}
		setRouteMode(mode);
		setRouteFromPoint(null);
	}, [tracking.start]);

	const handleMapClick = useCallback(
		(latlng: LatLngTuple) => {
			if (!routeMode) return;

			if (routeMode === 'from-me') {
				setIsCurrentRouteSaved(false);
				setIsRecordedRoute(false);
				if (geolocation.position) {
					buildRoute(geolocation.position, latlng);
				} else {
					setPendingRoute({ name: '', position: latlng });
					geolocation.findMe();
				}
				setRouteMode(null);
			} else if (routeMode === 'point-to-point') {
				if (!routeFromPoint) {
					setRouteFromPoint(latlng);
				} else {
					setIsCurrentRouteSaved(false);
					setIsRecordedRoute(false);
					buildRoute(routeFromPoint, latlng);
					setRouteFromPoint(null);
					setRouteMode(null);
				}
			} else if (routeMode === 'add-waypoint') {
				setIsCurrentRouteSaved(false);
				addWaypoint(latlng);
				setRouteMode(null);
			}
		},
		[routeMode, routeFromPoint, geolocation, buildRoute, addWaypoint],
	);

	const handleSaveRoute = useCallback(() => {
		if (route && routeFrom && routeTo) {
			saveRoute(route, routeFrom, routeTo, waypoints);
		}
	}, [route, routeFrom, routeTo, waypoints, saveRoute]);

	const handleSaveTrack = useCallback(() => {
		const { trackPoints, distance, elapsed } = tracking;
		if (trackPoints.length >= 2) {
			saveRoute(
				{ coordinates: trackPoints, distance, duration: elapsed },
				trackPoints[0],
				trackPoints[trackPoints.length - 1],
				[],
				true,
			);
		}
		tracking.clear();
	}, [tracking, saveRoute]);

	const handleSelectSavedRoute = useCallback(
		(savedRoute: import('../features/map/model/useSavedRoutes').SavedRoute) => {
			setIsCurrentRouteSaved(true);
			if (savedRoute.isRecorded) {
				setIsRecordedRoute(true);
				restoreRoute({
					coordinates: savedRoute.coordinates,
					distance: savedRoute.distance,
					duration: savedRoute.duration,
				});
			} else {
				setIsRecordedRoute(false);
				buildRoute(savedRoute.from, savedRoute.to, savedRoute.waypoints);
			}
		},
		[buildRoute, restoreRoute],
	);

	return (
		<div className='app'>
			<MainHeader
				onSearch={handleSearch}
				onDirectionClick={handleDirectionClick}
				searchLoading={loading}
				searchResults={results}
				searchError={error}
				routeError={routeError}
				onRouteDismiss={() => { clearRoute(); setIsCurrentRouteSaved(false); setIsRecordedRoute(false); }}
				activeStyle={activeStyle}
				onStyleChange={setActiveStyle}
				userPosition={geolocation.position}
				routeHistory={routeHistory}
				savedRoutes={savedRoutes}
				onDeleteSavedRoute={deleteRoute}
				onSelectSavedRoute={handleSelectSavedRoute}
			/>
			<PathBuilder
				open={pathBuilderOpen}
				onToggle={() => setPathBuilderOpen((p) => !p)}
				onModeSelect={handleModeSelect}
				hasRoute={route !== null}
			/>
			<TrackingPanel
				status={tracking.status}
				elapsed={tracking.elapsed}
				distance={tracking.distance}
				onPause={tracking.pause}
				onResume={tracking.resume}
				onStop={tracking.stop}
				onClear={tracking.clear}
				onSave={user ? handleSaveTrack : undefined}
			/>
			<MainMap
				activeStyle={activeStyle}
				geolocation={geolocation}
				route={route}
				waypoints={waypoints}
				pickingPoint={routeMode !== null}
				routeFromPoint={routeFromPoint}
				onMapClick={handleMapClick}
				onClearRoute={() => { clearRoute(); setIsCurrentRouteSaved(false); setIsRecordedRoute(false); }}
				onUndoWaypoint={undoWaypoint}
				onSaveRoute={user ? handleSaveRoute : undefined}
				isSavedRoute={isCurrentRouteSaved}
				isRecordedRoute={isRecordedRoute}
				trackPoints={tracking.trackPoints}
			/>
			{showGeoError && geolocation.error && (
				<div className='geo-error-toast'>{geolocation.error}</div>
			)}
		</div>
	);
};
