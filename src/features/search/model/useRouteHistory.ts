import { useCallback, useState } from 'react';
import type { SearchResult } from '../../../entities/search';

const STORAGE_KEY = 'veloro-route-history';
const MAX_ITEMS = 5;

export const useRouteHistory = () => {
	const [history, setHistory] = useState<SearchResult[]>(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored ? (JSON.parse(stored) as SearchResult[]) : [];
		} catch {
			return [];
		}
	});

	const addToHistory = useCallback((result: SearchResult) => {
		setHistory((prev) => {
			const deduplicated = prev.filter(
				(item) =>
					item.position[0] !== result.position[0] ||
					item.position[1] !== result.position[1],
			);
			const next = [result, ...deduplicated].slice(0, MAX_ITEMS);
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			} catch {}
			return next;
		});
	}, []);

	return { history, addToHistory };
};
