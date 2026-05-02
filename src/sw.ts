/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope & {
	// Will be injected by `workbox-build` during `injectManifest`.
	__WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

const PRECACHE_NAME = 'veloro-precache-v1';
const CACHE_NAME = 'veloro-runtime-v1';

// Используем `self.__WB_MANIFEST`, чтобы Workbox смог внедрить прекеш-манифест.
const PRECACHE_URLS = self.__WB_MANIFEST.map((e) => e.url);

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
				keys
					.filter((k) => k !== PRECACHE_NAME && k !== CACHE_NAME)
					.map((k) => caches.delete(k)),
			);
			await self.clients.claim();
		})(),
	);
});

// NOTE: Минимальный runtime cache, чтобы не блокировать сборку.
// Более умную стратегию/прекеш сделаем на этапе D (performance).
self.addEventListener('fetch', (event) => {
	const req = event.request;
	if (req.method !== 'GET') return;

	const url = new URL(req.url);
	if (url.origin !== self.location.origin) return;

	// Cache-first for static assets, network-first for navigations.
	if (req.mode === 'navigate') {
		event.respondWith(
			(async () => {
				try {
					const fresh = await fetch(req);
					const cache = await caches.open(CACHE_NAME);
					cache.put(req, fresh.clone());
					return fresh;
				} catch {
					const cache = await caches.open(CACHE_NAME);
					const cached = await cache.match(req);
					if (cached) return cached;
					return new Response('Offline', {
						status: 503,
						statusText: 'Offline',
						headers: { 'Content-Type': 'text/plain; charset=utf-8' },
					});
				}
			})(),
		);
		return;
	}

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			const cached = await cache.match(req);
			if (cached) return cached;

			const fresh = await fetch(req);
			cache.put(req, fresh.clone());
			return fresh;
		})(),
	);
});

