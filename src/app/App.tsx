import { useCallback, useState } from 'react';
import { MainHeader, useMapSearch, type SearchResult } from '../features/search';
import { MainMap } from '../features/map';
import { DEFAULT_MAP_STYLE } from '../features/map/model/map-styles';
import type { MapStyleKey } from '../features/map/model/map-styles';

export const App = () => {
	const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
	const [activeStyle, setActiveStyle] = useState<MapStyleKey>(DEFAULT_MAP_STYLE);
	const { results, loading, error, search, clearResults } = useMapSearch();

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

	return (
		<div className='app'>
			<MainHeader
				onSearch={handleSearch}
				onSearchSelect={handleSearchSelect}
				searchLoading={loading}
				searchResults={results}
				searchError={error}
				activeStyle={activeStyle}
				onStyleChange={setActiveStyle}
			/>
			<MainMap selectedResult={selectedResult} activeStyle={activeStyle} />
		</div>
	);
};

