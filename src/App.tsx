// src/App.tsx

import { useCallback, useState } from 'react';
import { MainHeader } from './components/main-header/MainHeader';
import { MainMap } from './components/main-map/MainMap';
import { useMapSearch, type SearchResult } from './hooks/useMapSearch';

export const App = () => {
	// 📍 Последний выбранный результат геокодинга
	const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

	// 🔎 Поиск (Nominatim) и список результатов
	const { results, loading, error, search, clearResults } = useMapSearch();

	const handleSearch = useCallback(
		async (query: string) => {
			// При новом поиске сбрасываем выбранную точку.
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
