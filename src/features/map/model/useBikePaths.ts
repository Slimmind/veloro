import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LatLngBounds } from 'leaflet';
import { fetchBikePathsOverpass } from '../../../shared/api/overpass';
import type { BikePath } from '../../../entities/bikePath';
import type { UseBikePathsReturn } from './types';
import { debounce } from '../../../shared/lib/debounce';

export const useBikePaths = (bounds: LatLngBounds | null): UseBikePathsReturn => {
	const [paths, setPaths] = useState<BikePath[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchPaths = useCallback(async (bbox: LatLngBounds) => {
		setLoading(true);
		try {
			const parsed = await fetchBikePathsOverpass(bbox);
			setPaths(parsed);
		} catch (err) {
			console.warn('Failed to fetch bike paths:', err);
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchPathsDebounced = useMemo(
		() => debounce(fetchPaths, 800),
		[fetchPaths],
	);

	useEffect(() => {
		if (!bounds) return;
		fetchPathsDebounced(bounds);
	}, [bounds, fetchPathsDebounced]);

	return { paths, loading };
};
