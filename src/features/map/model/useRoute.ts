import { useCallback, useState } from 'react';
import type { LatLngTuple } from 'leaflet';
import { fetchRoute } from '../../../shared/api/ors';
import type { RouteResult } from '../../../shared/api/ors';

export type { RouteResult };

export interface UseRouteReturn {
	route: RouteResult | null;
	waypoints: LatLngTuple[];
	routeFrom: LatLngTuple | null;
	routeTo: LatLngTuple | null;
	loading: boolean;
	error: string | null;
	buildRoute: (from: LatLngTuple, to: LatLngTuple, waypoints?: LatLngTuple[]) => Promise<void>;
	addWaypoint: (point: LatLngTuple) => Promise<void>;
	undoWaypoint: () => Promise<void>;
	clearRoute: () => void;
}

export const useRoute = (): UseRouteReturn => {
	const [route, setRoute] = useState<RouteResult | null>(null);
	const [waypoints, setWaypoints] = useState<LatLngTuple[]>([]);
	const [routeFrom, setRouteFrom] = useState<LatLngTuple | null>(null);
	const [routeTo, setRouteTo] = useState<LatLngTuple | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const buildRoute = useCallback(async (from: LatLngTuple, to: LatLngTuple, wps: LatLngTuple[] = []) => {
		setLoading(true);
		setError(null);
		try {
			const result = await fetchRoute(from, to, wps);
			setRoute(result);
			setRouteFrom(from);
			setRouteTo(to);
			setWaypoints(wps);
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Не удалось построить маршрут');
		} finally {
			setLoading(false);
		}
	}, []);

	const addWaypoint = useCallback(async (point: LatLngTuple) => {
		if (!routeFrom || !routeTo) return;
		const next = [...waypoints, point];
		setWaypoints(next);
		await buildRoute(routeFrom, routeTo, next);
	}, [routeFrom, routeTo, waypoints, buildRoute]);

	const undoWaypoint = useCallback(async () => {
		if (!routeFrom || !routeTo || waypoints.length === 0) return;
		const next = waypoints.slice(0, -1);
		setWaypoints(next);
		await buildRoute(routeFrom, routeTo, next);
	}, [routeFrom, routeTo, waypoints, buildRoute]);

	const clearRoute = useCallback(() => {
		setRoute(null);
		setWaypoints([]);
		setRouteFrom(null);
		setRouteTo(null);
		setError(null);
	}, []);

	return { route, waypoints, routeFrom, routeTo, loading, error, buildRoute, addWaypoint, undoWaypoint, clearRoute };
};
