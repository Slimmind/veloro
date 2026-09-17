const UPSTREAM_ENDPOINTS = [
	'https://overpass-api.de/api/interpreter',
	'https://overpass.kumi.systems/api/interpreter',
];

const PROXY_HEADERS = {
	'Content-Type': 'application/x-www-form-urlencoded',
	'Accept': '*/*',
	'User-Agent': 'veloro-cycling-app/1.0 (https://veloro.netlify.app)',
};

export default async (request: Request) => {
	const body = await request.text();

	for (const endpoint of UPSTREAM_ENDPOINTS) {
		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: PROXY_HEADERS,
				body,
			});
			if (response.ok) {
				const data = await response.text();
				return new Response(data, {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				});
			}
		} catch {
			// try next endpoint
		}
	}

	return new Response('Overpass unavailable', { status: 503 });
};

export const config = { path: '/api/overpass' };
