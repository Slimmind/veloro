import { useCallback, useEffect, useState } from 'react';
import { MainHeader, useMapSearch, type SearchResult } from '../features/search';
import { MainMap } from '../features/map';
import { useRoute } from '../features/map/model/useRoute';
import { DEFAULT_MAP_STYLE } from '../features/map/model/map-styles';
import type { MapStyleKey } from '../features/map/model/map-styles';
import { useUserGeolocation } from '../hooks/useUserGeolocation';

export const App = () => {
	const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
	const [activeStyle, setActiveStyle] = useState<MapStyleKey>(DEFAULT_MAP_STYLE);
	const [pendingRoute, setPendingRoute] = useState<SearchResult | null>(null);

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
			<MainMap
				selectedResult={selectedResult}
				activeStyle={activeStyle}
				geolocation={geolocation}
				route={route}
			/>
		</div>
	);
};
