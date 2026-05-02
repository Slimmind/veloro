import type { LatLngBounds } from 'leaflet';
import type { BikePath } from '../../entities/bikePath';
import type { PathStyleKey } from '../../features/map/model/bike-path-styles';

type CacheEntry<T> = {
	value: T;
	expiresAt: number;
};

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
const RATE_LIMIT_TTL_MS = 30 * 1000; // 30s cooldown after 429
const cache = new Map<string, CacheEntry<BikePath[]>>();
const inflight = new Map<string, Promise<BikePath[]>>();

// Snap coordinates to a 0.1° grid (~11 km) so that small pans reuse the same cached bbox.
// Floor south/west, ceil north/east — ensures the snapped bbox fully covers the viewport.
const SNAP = 0.1;
const snapFloor = (v: number) => Math.floor(v / SNAP) * SNAP;
const snapCeil = (v: number) => Math.ceil(v / SNAP) * SNAP;

// Overpass expects (S,W,N,E); Leaflet's toBBoxString() returns W,S,E,N — build manually.
const toOverpassBbox = (bbox: LatLngBounds) => {
	const s = snapFloor(bbox.getSouth());
	const w = snapFloor(bbox.getWest());
	const n = snapCeil(bbox.getNorth());
	const e = snapCeil(bbox.getEast());
	return `${s.toFixed(1)},${w.toFixed(1)},${n.toFixed(1)},${e.toFixed(1)}`;
};

const toCacheKey = toOverpassBbox;

interface OverpassElementWay {
	type: 'way';
	id: number;
	tags: Record<string, string | undefined>;
	geometry?: Array<{ lat: number; lon: number }>;
}

interface OverpassResponse {
	elements: unknown[];
}

const isOverpassWay = (value: unknown): value is OverpassElementWay => {
	if (!value || typeof value !== 'object') return false;
	const v = value as Record<string, unknown>;
	if (v.type !== 'way') return false;
	if (typeof v.id !== 'number') return false;
	if (!v.tags || typeof v.tags !== 'object') return false;
	return true;
};

export const fetchBikePathsOverpass = async (
	bbox: LatLngBounds,
): Promise<BikePath[]> => {
	const key = toCacheKey(bbox);
	const now = Date.now();

	const cached = cache.get(key);
	if (cached && cached.expiresAt > now) return cached.value;

	const pending = inflight.get(key);
	if (pending) return pending;

	const overpassBbox = toOverpassBbox(bbox);
	const query = `
    [out:json][timeout:25];
    (
      way["highway"="cycleway"](${overpassBbox});
      way["cycleway"~"lane|track|opposite_lane"](${overpassBbox});
      way["route"="bicycle"](${overpassBbox});
    );
    out geom;
  `;

	const promise = (async () => {
		const response = await fetch('https://overpass-api.de/api/interpreter', {
			method: 'POST',
			body: `data=${encodeURIComponent(query)}`,
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		});

		if (response.status === 429) {
			cache.set(key, { value: [], expiresAt: now + RATE_LIMIT_TTL_MS });
			throw new Error('Overpass rate limit (429)');
		}

		if (!response.ok) {
			throw new Error(`Overpass error: ${response.status}`);
		}

		const data: unknown = await response.json();
		const elements =
			data && typeof data === 'object'
				? (data as OverpassResponse).elements ?? []
				: [];

		const parsed = (Array.isArray(elements) ? elements : [])
			.filter(isOverpassWay)
			.filter((el) => (el.geometry?.length ?? 0) >= 2)
			.map((el) => {
				const highway = el.tags.highway;
				const cycleway = el.tags.cycleway;
				const route = el.tags.route;

				let type: PathStyleKey = 'shared';
				if (highway === 'cycleway') type = 'cycleway';
				else if (cycleway === 'lane' || cycleway?.includes('lane')) type = 'lane';
				else if (route === 'bicycle') type = 'track';

				return {
					id: `way/${el.id}`,
					coordinates: (el.geometry ?? []).map(
						(g) => [g.lat, g.lon] as [number, number],
					),
					type,
					surface: el.tags.surface as BikePath['surface'],
				};
			});

		cache.set(key, { value: parsed, expiresAt: now + CACHE_TTL_MS });
		return parsed;
	})().finally(() => {
		inflight.delete(key);
	});

	inflight.set(key, promise);
	return promise;
};

