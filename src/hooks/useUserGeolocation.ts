import { useCallback, useEffect, useRef, useState } from 'react';
import type { LatLngTuple, Map as LeafletMap } from 'leaflet';

export interface UseGeolocationReturn {
	position: LatLngTuple | null;
	accuracy: number | null;
	loading: boolean;
	error: string | null;
	findMe: (map?: LeafletMap, zoom?: number) => Promise<string | null>;
}

export const useUserGeolocation = (): UseGeolocationReturn => {
	const [position, setPosition] = useState<LatLngTuple | null>(null);
	const [accuracy, setAccuracy] = useState<number | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const watchIdRef = useRef<number | null>(null);

	useEffect(() => {
		return () => {
			if (watchIdRef.current !== null) {
				navigator.geolocation.clearWatch(watchIdRef.current);
			}
		};
	}, []);

	const findMe = useCallback(async (map?: LeafletMap, zoom = 14): Promise<string | null> => {
		if (!navigator.geolocation) {
			const msg = 'Геолокация не поддерживается браузером';
			setError(msg);
			return msg;
		}

		if (watchIdRef.current !== null) {
			navigator.geolocation.clearWatch(watchIdRef.current);
			watchIdRef.current = null;
		}

		setLoading(true);
		setError(null);

		return new Promise<string | null>((resolve) => {
			// On mobile, GPS cold-start returns a coarse fix first (100–300 m),
			// then refines over a few seconds. Wait until accuracy is good enough
			// before flying the map, so we land on the precise position.
			const GOOD_ACCURACY_M = 50;
			const MAX_ATTEMPTS = 5;
			let resolved = false;
			let attempts = 0;
			let latestPos: LatLngTuple | null = null;
			let safetyTimer: ReturnType<typeof setTimeout>;

			const doResolve = (pos: LatLngTuple | null) => {
				if (resolved) return;
				resolved = true;
				clearTimeout(safetyTimer);
				setLoading(false);
				if (pos && map) {
					map.flyTo(pos, zoom, { animate: true, duration: 1.2 });
				}
				resolve(null);
			};

			// Safety net: if GPS never reaches GOOD_ACCURACY_M, fly to best available position
			safetyTimer = setTimeout(() => doResolve(latestPos), 8000);

			watchIdRef.current = navigator.geolocation.watchPosition(
				(pos) => {
					const { latitude, longitude, accuracy } = pos.coords;
					const userPosition: LatLngTuple = [latitude, longitude];

					setPosition(userPosition);
					setAccuracy(accuracy);
					latestPos = userPosition;
					attempts++;

					if (!resolved && (accuracy <= GOOD_ACCURACY_M || attempts >= MAX_ATTEMPTS)) {
						doResolve(userPosition);
					}
				},
				(err) => {
					console.warn('Geolocation error:', err);
					clearTimeout(safetyTimer);
					const msg = err.code === 1
						? 'Доступ к геолокации запрещён'
						: 'Не удалось определить местоположение';
					setError(msg);
					if (!resolved) {
						resolved = true;
						setLoading(false);
						resolve(msg);
					}
				},
				{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
			);
		});
	}, []);

	return { position, accuracy, loading, error, findMe };
};
