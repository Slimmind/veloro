// src/hooks/useUserGeolocation.ts

import { useCallback, useState } from 'react';
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

	const findMe = useCallback(async (map?: LeafletMap, zoom = 14): Promise<string | null> => {
		if (!navigator.geolocation) {
			const msg = 'Геолокация не поддерживается браузером';
			setError(msg);
			return msg;
		}

		setLoading(true);
		setError(null);

		try {
			const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 0,
				});
			});

			const { latitude, longitude, accuracy } = pos.coords;
			const userPosition: LatLngTuple = [latitude, longitude];

			setPosition(userPosition);
			setAccuracy(accuracy);

			// Если передана карта — центрируем её
			if (map) {
				map.flyTo(userPosition, zoom, { animate: true, duration: 1.2 });
			}
			return null;
		} catch (err: unknown) {
			console.warn('Geolocation error:', err);
			const geoErr = err as Partial<GeolocationPositionError> | undefined;
			const msg = geoErr?.code === 1
				? 'Доступ к геолокации запрещён'
				: 'Не удалось определить местоположение';
			setError(msg);
			return msg;
		} finally {
			setLoading(false);
		}
	}, []);

	return { position, accuracy, loading, error, findMe };
};
