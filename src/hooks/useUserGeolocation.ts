import { useCallback, useEffect, useRef, useState } from 'react';
import type { LatLngTuple } from '../shared/lib/types';

export interface UseGeolocationReturn {
	position: LatLngTuple | null;
	accuracy: number | null;
	loading: boolean;
	error: string | null;
	findMe: (flyTo?: (position: LatLngTuple, zoom: number) => void, zoom?: number) => Promise<string | null>;
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

	const findMe = useCallback(async (
		flyTo?: (position: LatLngTuple, zoom: number) => void,
		zoom = 14,
	): Promise<string | null> => {
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
				if (pos && flyTo) {
					flyTo(pos, zoom);
				}
				resolve(null);
			};

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
						? 'Доступ к геолокации запрещён — разрешите его в настройках браузера'
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
