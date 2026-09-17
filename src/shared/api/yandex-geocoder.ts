import type { LatLngTuple } from '../lib/types';
import type { SearchResult } from '../../entities/search';

const API_KEY = import.meta.env.VITE_YANDEX_GEOCODER_API_KEY as string;
const BASE_URL = 'https://geocode-maps.yandex.ru/v1/';

interface GeoObject {
	Point: { pos: string };
	metaDataProperty: {
		GeocoderMetaData: {
			text: string;
			kind: string;
		};
	};
	boundedBy?: {
		Envelope: {
			lowerCorner: string;
			upperCorner: string;
		};
	};
}

interface FeatureMember {
	GeoObject: GeoObject;
}

const parseCorner = (s: string): [number, number] => {
	const [lng, lat] = s.split(' ').map(Number);
	return [lng, lat];
};

export const searchYandex = async (
	query: string,
	limit = 5,
): Promise<SearchResult[]> => {
	const trimmed = query.trim();
	if (!trimmed) return [];

	const params = new URLSearchParams({
		apikey: API_KEY,
		geocode: trimmed,
		format: 'json',
		results: String(limit),
		lang: 'ru_RU',
		bbox: '23.0,51.0~33.0,56.0',
		rspn: '1',
	});

	const response = await fetch(`${BASE_URL}?${params}`);
	if (!response.ok) throw new Error('Ошибка геокодинга');

	const data: unknown = await response.json();
	const members: FeatureMember[] =
		(data as { response?: { GeoObjectCollection?: { featureMember?: FeatureMember[] } } })
			?.response?.GeoObjectCollection?.featureMember ?? [];

	return members.map(({ GeoObject: geo }): SearchResult => {
		const [lngStr, latStr] = geo.Point.pos.split(' ');
		const position: LatLngTuple = [parseFloat(latStr), parseFloat(lngStr)];

		let bbox: [number, number, number, number] | undefined;
		if (geo.boundedBy) {
			const [minLng, minLat] = parseCorner(geo.boundedBy.Envelope.lowerCorner);
			const [maxLng, maxLat] = parseCorner(geo.boundedBy.Envelope.upperCorner);
			bbox = [minLng, minLat, maxLng, maxLat];
		}

		return {
			name: geo.metaDataProperty.GeocoderMetaData.text,
			position,
			bbox,
			type: geo.metaDataProperty.GeocoderMetaData.kind,
		};
	});
};
