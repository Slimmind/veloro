import type { LatLngTuple } from 'leaflet';

export function haversine(p1: LatLngTuple, p2: LatLngTuple): number {
	const R = 6371000;
	const toRad = (d: number) => (d * Math.PI) / 180;
	const lat1 = toRad(p1[0]);
	const lat2 = toRad(p2[0]);
	const dlat = lat2 - lat1;
	const dlng = toRad(p2[1] - p1[1]);
	const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlng / 2) ** 2;
	return R * 2 * Math.asin(Math.sqrt(a));
}
