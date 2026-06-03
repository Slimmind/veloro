import type { LatLngTuple } from 'leaflet';

export interface RouteResult {
	coordinates: LatLngTuple[];
	distance: number; // metres
	duration: number; // seconds
}

const API_KEY = import.meta.env.VITE_ORS_API_KEY as string;
const BASE_URL = 'https://api.openrouteservice.org/v2/directions/cycling-regular/geojson';

export async function fetchRoute(
	from: LatLngTuple,
	to: LatLngTuple,
	waypoints: LatLngTuple[] = [],
): Promise<RouteResult> {
	const toCoord = ([lat, lng]: LatLngTuple) => [lng, lat];

	const res = await fetch(BASE_URL, {
		method: 'POST',
		headers: {
			Authorization: API_KEY,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			coordinates: [from, ...waypoints, to].map(toCoord),
		}),
	});

	if (!res.ok) {
		const json = await res.json().catch(() => null);
		const orsMessage = json?.error?.message as string | undefined;
		if (orsMessage?.toLowerCase().includes('routable point')) {
			throw new Error('Не удалось построить маршрут: точка назначения недостижима (возможно, это водоём или закрытая территория). Попробуйте построить маршрут к точке на карте от вашего текущего местоположения.');
		}
		throw new Error(orsMessage ?? `Ошибка маршрутизации (${res.status})`);
	}

	const data = await res.json();
	const feature = data?.features?.[0];
	if (!feature) throw new Error('Маршрут не найден');

	const coordinates: LatLngTuple[] = feature.geometry.coordinates.map(
		([lng, lat]: [number, number]) => [lat, lng],
	);

	const { distance, duration } = feature.properties.summary;
	return { coordinates, distance, duration };
}
