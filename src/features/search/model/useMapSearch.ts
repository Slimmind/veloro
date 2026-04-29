import { useCallback, useState } from 'react';
export type { SearchResult } from '../../../entities/search';
import type { SearchResult } from '../../../entities/search';
import { searchNominatim } from '../../../shared/api/nominatim';

export interface UseMapSearchReturn {
	results: SearchResult[];
	loading: boolean;
	error: string | null;
	search: (query: string) => Promise<void>;
	clearResults: () => void;
}

export const useMapSearch = (): UseMapSearchReturn => {
	const [results, setResults] = useState<SearchResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const search = useCallback(
		async (query: string) => {
			setLoading(true);
			setError(null);

			try {
				const parsed = await searchNominatim(query);
				setResults(parsed);
			} catch (err: unknown) {
				console.warn('Search error:', err);
				setError('Не удалось найти место. Попробуйте другой запрос.');
				setResults([]);
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	const clearResults = useCallback(() => {
		setResults([]);
		setError(null);
	}, []);

	return { results, loading, error, search, clearResults };
};

