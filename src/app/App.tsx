import { useCallback, useEffect, useState } from 'react';
import type { LatLngTuple } from 'leaflet';
import { MainHeader, PathBuilder, useMapSearch, useRouteHistory, type SearchResult } from '../features/search';
import type { RouteMode } from '../features/search';
import { MainMap } from '../features/map';
import { useRoute } from '../features/map/model/useRoute';
import { DEFAULT_MAP_STYLE } from '../features/map/model/map-styles';
import type { MapStyleKey } from '../features/map/model/map-styles';
import { useUserGeolocation } from '../hooks/useUserGeolocation';

export const App = () => {
	const [activeStyle, setActiveStyle] = useState<MapStyleKey>(DEFAULT_MAP_STYLE);
	const [pendingRoute, setPendingRoute] = useState<SearchResult | null>(null);
	const [pathBuilderOpen, setPathBuilderOpen] = useState(false);
	const [routeMode, setRouteMode] = useState<RouteMode | null>(null);
	const [routeFromPoint, setRouteFromPoint] = useState<LatLngTuple | null>(null);

	const geolocation = useUserGeolocation();
	const { route, waypoints, buildRoute, addWaypoint, undoWaypoint, error: routeError, clearRoute } = useRoute();
	const { results, loading, error, search } = useMapSearch();
	const { history: routeHistory, addToHistory } = useRouteHistory();

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
					buildRoute(routeFromPoint, latlng);
					setRouteFromPoint(null);
					setRouteMode(null);
				}
			} else if (routeMode === 'add-waypoint') {
				addWaypoint(latlng);
				setRouteMode(null);
			}
		},
		[routeMode, routeFromPoint, geolocation, buildRoute, addWaypoint],
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
				onRouteDismiss={clearRoute}
				activeStyle={activeStyle}
				onStyleChange={setActiveStyle}
				userPosition={geolocation.position}
				routeHistory={routeHistory}
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
				onClearRoute={clearRoute}
				onUndoWaypoint={undoWaypoint}
			/>
		</div>
	);
};
