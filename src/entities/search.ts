import type { LatLngTuple } from '../shared/lib/types';

export interface SearchResult {
	name: string;
	position: LatLngTuple;
	bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
	type?: string;
}

