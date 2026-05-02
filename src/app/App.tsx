import { useCallback, useState } from 'react';
import { MainHeader, useMapSearch, type SearchResult } from '../features/search';
import { MainMap } from '../features/map';

export const App = () => {
	const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
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
			/>
			<MainMap selectedResult={selectedResult} />
		</div>
	);
};

