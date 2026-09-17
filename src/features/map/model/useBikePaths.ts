import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { fetchBikePathsOverpass } from '../../../shared/api/overpass';
import type { Bounds } from '../../../shared/api/overpass';
import { bikePathsStore } from './bikePathsStore';
import type { UseBikePathsReturn } from './types';
import { debounce } from '../../../shared/lib/debounce';

export const useBikePaths = (bounds: Bounds | null, enabled: boolean): UseBikePathsReturn => {
	const paths = useSyncExternalStore(
		bikePathsStore.subscribe,
		bikePathsStore.getSnapshot,
	);

	const fetchPaths = useCallback(async (bbox: Bounds) => {
		try {
			const fetched = await fetchBikePathsOverpass(bbox);
			bikePathsStore.addPaths(fetched);
		} catch (err) {
			console.warn('Failed to fetch bike paths:', err);
		}
	}, []);

	const fetchPathsDebounced = useMemo(
		() => debounce(fetchPaths, 800),
		[fetchPaths],
	);

	useEffect(() => {
		if (!bounds || !enabled) return;
		fetchPathsDebounced(bounds);
	}, [bounds, enabled, fetchPathsDebounced]);

	return { paths };
};
