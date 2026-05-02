import type { LatLngTuple } from 'leaflet';

export interface SearchResult {
	name: string;
	position: LatLngTuple;
	bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
	type?: string;
}

