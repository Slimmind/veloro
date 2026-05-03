import { useCallback, useState } from 'react';
import type { LatLngTuple } from 'leaflet';
import { fetchRoute } from '../../../shared/api/ors';
import type { RouteResult } from '../../../shared/api/ors';

export type { RouteResult };

export interface UseRouteReturn {
	route: RouteResult | null;
	loading: boolean;
	error: string | null;
	buildRoute: (from: LatLngTuple, to: LatLngTuple) => Promise<void>;
	clearRoute: () => void;
}

export const useRoute = (): UseRouteReturn => {
	const [route, setRoute] = useState<RouteResult | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const buildRoute = useCallback(async (from: LatLngTuple, to: LatLngTuple) => {
		setLoading(true);
		setError(null);
		try {
			const result = await fetchRoute(from, to);
			setRoute(result);
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Не удалось построить маршрут');
		} finally {
			setLoading(false);
		}
	}, []);

	const clearRoute = useCallback(() => {
		setRoute(null);
		setError(null);
	}, []);

	return { route, loading, error, buildRoute, clearRoute };
};
