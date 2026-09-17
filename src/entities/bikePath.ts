import type { LatLngTuple } from '../shared/lib/types';
import type { PathStyleKey } from '../shared/config/bike-path-styles';

export interface BikePath {
	id: string;
	coordinates: LatLngTuple[];
	type: PathStyleKey;
	surface?: 'paved' | 'unpaved' | 'unknown';
}

