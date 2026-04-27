// src/components/main-map/types.ts

import type { LatLngTuple } from 'leaflet';
import type { PathStyleKey } from './bike-path-styles';

export interface BikePath {
	id: string;
	coordinates: LatLngTuple[];
	type: PathStyleKey;
	surface?: 'paved' | 'unpaved' | 'unknown';
}

export interface UseBikePathsReturn {
	paths: BikePath[];
	loading: boolean;
}
