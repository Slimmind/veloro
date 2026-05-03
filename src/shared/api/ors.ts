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
): Promise<RouteResult> {
	const [fromLat, fromLng] = from;
	const [toLat, toLng] = to;

	const res = await fetch(BASE_URL, {
		method: 'POST',
		headers: {
			Authorization: API_KEY,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			coordinates: [
				[fromLng, fromLat],
				[toLng, toLat],
			],
		}),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => res.statusText);
		throw new Error(`ORS error ${res.status}: ${text}`);
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
