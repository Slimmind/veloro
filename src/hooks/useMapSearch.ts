// src/components/main-map/useMapSearch.ts

import { useCallback, useState } from 'react';
import type { LatLngTuple } from 'leaflet';

export interface SearchResult {
	name: string;
	position: LatLngTuple;
	bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
	type?: string;
}

export interface UseMapSearchReturn {
	results: SearchResult[];
	loading: boolean;
	error: string | null;
	search: (query: string, countryCodes?: string[]) => Promise<void>;
	clearResults: () => void;
}

export const useMapSearch = (): UseMapSearchReturn => {
	const [results, setResults] = useState<SearchResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const search = useCallback(
		async (
			query: string,
			countryCodes: string[] = ['by', 'ru', 'pl', 'lt', 'lv'],
		) => {
			if (!query.trim()) {
				setResults([]);
				return;
			}

			setLoading(true);
			setError(null);

			try {
				// 🌍 Nominatim API (бесплатный геокодер OSM)
				const params = new URLSearchParams({
					q: query.trim(),
					format: 'json',
					limit: '5',
					addressdetails: '1',
					countrycodes: countryCodes.join(','),
					'accept-language': 'ru',
					// 🔍 Приоритет результатов в границах Беларуси
					viewbox: '23.0,56.0,33.0,51.0', // minLon,minLat,maxLon,maxLat
					bounded: '1', // Строго внутри viewbox (опционально)
				});

				// В браузере нельзя безопасно выставлять заголовок `User-Agent`,
				// поэтому делаем простой GET-запрос.
				const response = await fetch(
					`https://nominatim.openstreetmap.org/search?${params}`,
				);

				if (!response.ok) throw new Error('Ошибка геокодинга');

				const data = await response.json();

				const parsed: SearchResult[] = data.map((item: any) => ({
					name: item.display_name,
					position: [parseFloat(item.lat), parseFloat(item.lon)] as LatLngTuple,
					bbox: item.boundingbox?.map((v: string) => parseFloat(v)),
					type: item.type || 'place',
				}));

				setResults(parsed);
			} catch (err: any) {
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

	// Примечание: дебаунс не используется в текущей реализации,
	// поиск выполняется по submit из формы в `MainHeader`.
	return { results, loading, error, search, clearResults };
};
