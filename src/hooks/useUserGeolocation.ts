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

		// Stop previous watch before starting a new one
		if (watchIdRef.current !== null) {
			navigator.geolocation.clearWatch(watchIdRef.current);
			watchIdRef.current = null;
		}

		setLoading(true);
		setError(null);

		return new Promise<string | null>((resolve) => {
			let firstUpdate = true;

			watchIdRef.current = navigator.geolocation.watchPosition(
				(pos) => {
					const { latitude, longitude, accuracy } = pos.coords;
					const userPosition: LatLngTuple = [latitude, longitude];

					setPosition(userPosition);
					setAccuracy(accuracy);

					if (firstUpdate) {
						firstUpdate = false;
						setLoading(false);
						if (map) {
							map.flyTo(userPosition, zoom, { animate: true, duration: 1.2 });
						}
						resolve(null);
					}
				},
				(err) => {
					console.warn('Geolocation error:', err);
					const msg = err.code === 1
						? 'Доступ к геолокации запрещён'
						: 'Не удалось определить местоположение';
					setError(msg);
					if (firstUpdate) {
						firstUpdate = false;
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
