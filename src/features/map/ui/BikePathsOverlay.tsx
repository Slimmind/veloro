import { useCallback, useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import type { LatLngBounds, LeafletMouseEvent } from 'leaflet';
import { Polyline, useMap } from 'react-leaflet';
import { getLeafletPathOptions } from '../model/bike-path-styles';
import { fetchBikePathsOverpass } from '../../../shared/api/overpass';
import type { BikePath } from '../../../entities/bikePath';
import type { UseBikePathsReturn } from '../model/types';
import { debounce } from '../../../shared/lib/debounce';

const useBikePaths = (bounds: LatLngBounds | null): UseBikePathsReturn => {
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
		() => debounce(fetchPaths, 350),
		[fetchPaths],
	);

	useEffect(() => {
		if (!bounds) return;
		fetchPathsDebounced(bounds);
	}, [bounds, fetchPathsDebounced]);

	return { paths, loading };
};

interface BikePathsOverlayProps {
	bounds: LatLngBounds | null;
	minZoom?: number;
}

export const BikePathsOverlay = ({ bounds, minZoom = 12 }: BikePathsOverlayProps) => {
	const { paths, loading } = useBikePaths(bounds);
	const map = useMap();

	if (map.getZoom() < minZoom) return null;
	if (loading && paths.length === 0) return null;

	return (
		<>
			{paths.map((path) => (
				<Polyline
					key={path.id}
					positions={path.coordinates}
					pathOptions={getLeafletPathOptions(path.type)}
					eventHandlers={{
						mouseover: (e: LeafletMouseEvent) =>
							(e.target as L.Path).setStyle({ weight: 7, color: '#fff' }),
						mouseout: (e: LeafletMouseEvent) =>
							(e.target as L.Path).setStyle(getLeafletPathOptions(path.type)),
					}}
				/>
			))}
		</>
	);
};

