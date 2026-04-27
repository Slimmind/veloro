// src/components/main-map/BikePathsOverlay.tsx

import { useEffect, useState, useCallback } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import type { LatLngBounds } from 'leaflet';
import { getLeafletPathOptions, type PathStyleKey } from './bike-path-styles';
import type { BikePath, UseBikePathsReturn } from './types';

// Хук загрузки данных
const useBikePaths = (bounds: LatLngBounds | null): UseBikePathsReturn => {
	const [paths, setPaths] = useState<BikePath[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchPaths = useCallback(async (bbox: LatLngBounds) => {
		setLoading(true);
		try {
			const query = `
        [out:json][timeout:25];
        (
          way["highway"="cycleway"](${bbox.toBBoxString()});
          way["cycleway"~"lane|track|opposite_lane"](${bbox.toBBoxString()});
          way["route"="bicycle"](${bbox.toBBoxString()});
        );
        out geom;
      `;

			const response = await fetch('https://overpass-api.de/api/interpreter', {
				method: 'POST',
				body: `data=${encodeURIComponent(query)}`,
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			});

			const data = await response.json();

			const parsed: BikePath[] = data.elements
				.filter((el: any) => el.type === 'way' && el.geometry?.length >= 2)
				.map((el: any) => {
					const highway = el.tags.highway;
					const cycleway = el.tags.cycleway;
					const route = el.tags.route;

					let type: PathStyleKey = 'shared';
					if (highway === 'cycleway') type = 'cycleway';
					else if (cycleway === 'lane' || cycleway?.includes('lane'))
						type = 'lane';
					else if (route === 'bicycle') type = 'track';

					return {
						id: `way/${el.id}`,
						coordinates: el.geometry.map(
							(g: any) => [g.lat, g.lon] as [number, number],
						),
						type,
						surface: el.tags.surface as BikePath['surface'],
					};
				});

			setPaths(parsed);
		} catch (err) {
			console.warn('Failed to fetch bike paths:', err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!bounds) return;
		const timer = setTimeout(() => fetchPaths(bounds), 300);
		return () => clearTimeout(timer);
	}, [bounds, fetchPaths]);

	return { paths, loading };
};

// Компонент отрисовки
interface BikePathsOverlayProps {
	bounds: LatLngBounds | null;
	minZoom?: number; // Показывать оверлей только при достаточном зуме
}

export const BikePathsOverlay = ({
	bounds,
	minZoom = 12,
}: BikePathsOverlayProps) => {
	const { paths, loading } = useBikePaths(bounds);
	const map = useMap();

	// Не рендерим, если зум слишком маленький
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
						mouseover: (e) =>
							(e.target as any).setStyle({ weight: 7, color: '#fff' }),
						mouseout: (e) =>
							(e.target as any).setStyle(getLeafletPathOptions(path.type)),
					}}
				/>
			))}
		</>
	);
};
