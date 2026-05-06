import { useCallback, useEffect, useState } from 'react';
import type { LatLngTuple } from 'leaflet';
import { MainHeader, PathBuilder, useMapSearch, type SearchResult } from '../features/search';
import type { RouteMode } from '../features/search';
import { MainMap } from '../features/map';
import { useRoute } from '../features/map/model/useRoute';
import { DEFAULT_MAP_STYLE } from '../features/map/model/map-styles';
import type { MapStyleKey } from '../features/map/model/map-styles';
import { useUserGeolocation } from '../hooks/useUserGeolocation';

export const App = () => {
	const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
	const [activeStyle, setActiveStyle] = useState<MapStyleKey>(DEFAULT_MAP_STYLE);
	const [pendingRoute, setPendingRoute] = useState<SearchResult | null>(null);
	const [pathBuilderOpen, setPathBuilderOpen] = useState(false);
	const [routeMode, setRouteMode] = useState<RouteMode | null>(null);
	const [routeFromPoint, setRouteFromPoint] = useState<LatLngTuple | null>(null);

	const geolocation = useUserGeolocation();
	const { route, buildRoute } = useRoute();
	const { results, loading, error, search, clearResults } = useMapSearch();

	// Build pending route once geolocation becomes available
	useEffect(() => {
		if (pendingRoute && geolocation.position) {
			buildRoute(geolocation.position, pendingRoute.position);
			setPendingRoute(null);
		}
	}, [geolocation.position, pendingRoute, buildRoute]);

	const handleSearch = useCallback(
		async (query: string) => {
			setSelectedResult(null);
			await search(query);
		},
		[search],
	);

	const handleSearchSelect = useCallback(
		(result: SearchResult) => {
			clearResults();
			setSelectedResult(result);
		},
		[clearResults],
	);

	const handleDirectionClick = useCallback(
		(result: SearchResult) => {
			if (geolocation.position) {
				buildRoute(geolocation.position, result.position);
			} else {
				setPendingRoute(result);
				geolocation.findMe();
			}
		},
		[geolocation, buildRoute],
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
			}
		},
		[routeMode, routeFromPoint, geolocation, buildRoute],
	);

	return (
		<div className='app'>
			<MainHeader
				onSearch={handleSearch}
				onSearchSelect={handleSearchSelect}
				onDirectionClick={handleDirectionClick}
				searchLoading={loading}
				searchResults={results}
				searchError={error}
				activeStyle={activeStyle}
				onStyleChange={setActiveStyle}
			/>
			<PathBuilder
				open={pathBuilderOpen}
				onToggle={() => setPathBuilderOpen((p) => !p)}
				onModeSelect={handleModeSelect}
			/>
			<MainMap
				selectedResult={selectedResult}
				activeStyle={activeStyle}
				geolocation={geolocation}
				route={route}
				pickingPoint={routeMode !== null}
				routeFromPoint={routeFromPoint}
				onMapClick={handleMapClick}
			/>
		</div>
	);
};
