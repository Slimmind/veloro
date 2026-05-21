/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope & {
	__WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

const PRECACHE_NAME = 'veloro-precache-v1';
const CACHE_RUNTIME = 'veloro-runtime-v1';
const CACHE_TILES   = 'veloro-tiles-v1';
const CACHE_STYLES  = 'veloro-styles-v1';
const CACHE_API     = 'veloro-api-v1';

const ALL_CACHES = [PRECACHE_NAME, CACHE_RUNTIME, CACHE_TILES, CACHE_STYLES, CACHE_API];

const TILE_MAX_AGE_S  = 30 * 24 * 60 * 60; // 30 days
const TILE_MAX_ENTRIES = 2000;
const API_MAX_AGE_S   = 24 * 60 * 60;       // 24 h

const PRECACHE_URLS = self.__WB_MANIFEST.map((e) => e.url);

// ─── Lifecycle ────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(PRECACHE_NAME);
			await cache.addAll(PRECACHE_URLS);
			await self.skipWaiting();
		})(),
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const keys = await caches.keys();
			await Promise.all(
				keys.filter((k) => !ALL_CACHES.includes(k)).map((k) => caches.delete(k)),
			);
			await self.clients.claim();
		})(),
	);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isFresh(response: Response, maxAgeSeconds: number): boolean {
	const raw = response.headers.get('x-cached-at');
	const ts = raw ? Number(raw) : NaN;
	const ms = isNaN(ts)
		? (() => { const d = response.headers.get('date'); return d ? new Date(d).getTime() : 0; })()
		: ts;
	return (Date.now() - ms) / 1000 < maxAgeSeconds;
}

// Stamp responses with the cache-insertion time so TTL is reliable.
async function stampedClone(response: Response): Promise<Response> {
	const buf = await response.clone().arrayBuffer();
	const headers = new Headers(response.headers);
	headers.set('x-cached-at', String(Date.now()));
	return new Response(buf, { status: response.status, headers });
}

// Evict oldest entries when the cache exceeds maxEntries (fire-and-forget).
function trimCache(cacheName: string, maxEntries: number): void {
	caches.open(cacheName).then(async (cache) => {
		const keys = await cache.keys();
		if (keys.length > maxEntries) {
			await Promise.all(keys.slice(0, keys.length - maxEntries).map((k) => cache.delete(k)));
		}
	});
}

// ─── Strategies ───────────────────────────────────────────────────────────────

// CacheFirst — serve from cache if fresh, otherwise fetch and store.
async function cacheFirst(
	req: Request,
	cacheName: string,
	maxAgeSeconds: number,
	maxEntries?: number,
): Promise<Response> {
	const cache = await caches.open(cacheName);
	const cached = await cache.match(req);
	if (cached && isFresh(cached, maxAgeSeconds)) return cached;

	const fresh = await fetch(req);
	if (fresh.ok) {
		cache.put(req, await stampedClone(fresh));
		if (maxEntries) trimCache(cacheName, maxEntries);
	}
	return fresh;
}

// StaleWhileRevalidate — serve cached immediately, refresh in background.
async function staleWhileRevalidate(req: Request, cacheName: string): Promise<Response> {
	const cache = await caches.open(cacheName);
	const cached = await cache.match(req);

	const revalidate = fetch(req).then(async (res) => {
		if (res.ok) cache.put(req, await stampedClone(res));
		return res;
	});

	return cached ?? revalidate;
}

// NetworkFirst — prefer live response, fall back to cache within TTL.
async function networkFirst(
	req: Request,
	cacheName: string,
	maxAgeSeconds: number,
): Promise<Response> {
	const cache = await caches.open(cacheName);
	try {
		const fresh = await fetch(req);
		if (fresh.ok) cache.put(req, await stampedClone(fresh));
		return fresh;
	} catch {
		const cached = await cache.match(req);
		if (cached && isFresh(cached, maxAgeSeconds)) return cached;
		return new Response('Offline', {
			status: 503,
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		});
	}
}

// ─── Routing ─────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
	const req = event.request;
	if (req.method !== 'GET') return;

	const url = new URL(req.url);

	// Satellite raster tiles (ArcGIS) — never change, long CacheFirst
	if (url.hostname === 'server.arcgisonline.com') {
		event.respondWith(cacheFirst(req, CACHE_TILES, TILE_MAX_AGE_S, TILE_MAX_ENTRIES));
		return;
	}

	// OpenFreeMap vector tiles, glyphs, sprites — CacheFirst
	if (url.hostname === 'tiles.openfreemap.org' && !url.pathname.startsWith('/styles/')) {
		event.respondWith(cacheFirst(req, CACHE_TILES, TILE_MAX_AGE_S, TILE_MAX_ENTRIES));
		return;
	}

	// OpenFreeMap style JSON — StaleWhileRevalidate (small file, may update)
	if (url.hostname === 'tiles.openfreemap.org' && url.pathname.startsWith('/styles/')) {
		event.respondWith(staleWhileRevalidate(req, CACHE_STYLES));
		return;
	}

	// Nominatim geocoding — NetworkFirst, 24 h stale fallback
	if (url.hostname === 'nominatim.openstreetmap.org') {
		event.respondWith(networkFirst(req, CACHE_API, API_MAX_AGE_S));
		return;
	}

	// Same-origin only below this point
	if (url.origin !== self.location.origin) return;

	if (req.mode === 'navigate') {
		event.respondWith(
			(async () => {
				try {
					const fresh = await fetch(req);
					const cache = await caches.open(CACHE_RUNTIME);
					cache.put(req, fresh.clone());
					return fresh;
				} catch {
					const cache = await caches.open(CACHE_RUNTIME);
					return (await cache.match(req)) ??
						new Response('Offline', {
							status: 503,
							headers: { 'Content-Type': 'text/plain; charset=utf-8' },
						});
				}
			})(),
		);
		return;
	}

	// Same-origin static assets — CacheFirst (hashed filenames, safe forever)
	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE_RUNTIME);
			const cached = await cache.match(req);
			if (cached) return cached;
			const fresh = await fetch(req);
			cache.put(req, fresh.clone());
			return fresh;
		})(),
	);
});
