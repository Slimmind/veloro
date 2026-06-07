import { useCallback, useEffect, useState } from 'react';
import type { LatLngTuple } from 'leaflet';
import { MainHeader, PathBuilder, useMapSearch, useRouteHistory, type SearchResult } from '../features/search';
import type { RouteMode } from '../features/search';
import { MainMap } from '../features/map';
import { useRoute } from '../features/map/model/useRoute';
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
	const { route, waypoints, routeFrom, routeTo, buildRoute, addWaypoint, undoWaypoint, error: routeError, clearRoute } = useRoute();
	const { results, loading, error, search } = useMapSearch();
	const { history: routeHistory, addToHistory } = useRouteHistory();
	const { user, authLoading } = useAuth();
	const { savedRoutes, saveRoute, deleteRoute } = useSavedRoutes(authLoading ? undefined : (user?.uid ?? null));

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
		setRouteMode(mode);
		setRouteFromPoint(null);
	}, []);

	const handleMapClick = useCallback(
		(latlng: LatLngTuple) => {
			if (!routeMode) return;

			if (routeMode === 'from-me') {
				setIsCurrentRouteSaved(false);
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

	const handleSelectSavedRoute = useCallback(
		(from: LatLngTuple, to: LatLngTuple, wps: LatLngTuple[]) => {
			setIsCurrentRouteSaved(true);
			buildRoute(from, to, wps);
		},
		[buildRoute],
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
				onRouteDismiss={() => { clearRoute(); setIsCurrentRouteSaved(false); }}
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
			<MainMap
				activeStyle={activeStyle}
				geolocation={geolocation}
				route={route}
				waypoints={waypoints}
				pickingPoint={routeMode !== null}
				routeFromPoint={routeFromPoint}
				onMapClick={handleMapClick}
				onClearRoute={() => { clearRoute(); setIsCurrentRouteSaved(false); }}
				onUndoWaypoint={undoWaypoint}
				onSaveRoute={user ? handleSaveRoute : undefined}
				isSavedRoute={isCurrentRouteSaved}
			/>
		</div>
	);
};
