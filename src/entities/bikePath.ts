import type { LatLngTuple } from 'leaflet';
import type { PathStyleKey } from '../shared/config/bike-path-styles';

export interface BikePath {
	id: string;
	coordinates: LatLngTuple[];
	type: PathStyleKey;
	surface?: 'paved' | 'unpaved' | 'unknown';
}

