import type { LatLngTuple } from 'leaflet';
import type { SearchResult } from '../../entities/search';

interface NominatimSearchItem {
	display_name: string;
	lat: string;
	lon: string;
	boundingbox?: [string, string, string, string] | string[];
	type?: string;
}

const isNominatimSearchItem = (value: unknown): value is NominatimSearchItem => {
	if (!value || typeof value !== 'object') return false;
	const v = value as Record<string, unknown>;
	return (
		typeof v.display_name === 'string' &&
		typeof v.lat === 'string' &&
		typeof v.lon === 'string'
	);
};

export interface NominatimSearchOptions {
	countryCodes?: string[];
	acceptLanguage?: string;
	limit?: number;
	viewbox?: string;
	bounded?: boolean;
}

export const searchNominatim = async (
	query: string,
	{
		countryCodes = ['by', 'ru', 'pl', 'lt', 'lv'],
		acceptLanguage = 'ru',
		limit = 5,
		viewbox = '23.0,56.0,33.0,51.0',
		bounded = true,
	}: NominatimSearchOptions = {},
): Promise<SearchResult[]> => {
	const trimmed = query.trim();
	if (!trimmed) return [];

	const params = new URLSearchParams({
		q: trimmed,
		format: 'json',
		limit: String(limit),
		addressdetails: '1',
		countrycodes: countryCodes.join(','),
		'accept-language': acceptLanguage,
		viewbox,
		bounded: bounded ? '1' : '0',
	});

	const response = await fetch(
		`https://nominatim.openstreetmap.org/search?${params}`,
	);

	if (!response.ok) throw new Error('Ошибка геокодинга');

	const data: unknown = await response.json();
	const items = Array.isArray(data) ? data : [];

	return items
		.filter(isNominatimSearchItem)
		.map((item): SearchResult => {
			const bboxRaw = item.boundingbox;
			const bbox = Array.isArray(bboxRaw)
				? (bboxRaw
						.map((v) => parseFloat(v))
						.filter((n) => Number.isFinite(n)) as number[])
				: [];

			return {
				name: item.display_name,
				position: [parseFloat(item.lat), parseFloat(item.lon)] as LatLngTuple,
				bbox:
					bbox.length === 4
						? ([bbox[0], bbox[1], bbox[2], bbox[3]] as [
								number,
								number,
								number,
								number,
						  ])
						: undefined,
				type: item.type ?? 'place',
			};
		});
};

