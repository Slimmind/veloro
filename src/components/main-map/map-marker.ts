// src/components/main-map/map-marker.ts

import L from 'leaflet';

// 📁 Путь к файлу в public (начинается со слэша — от корня домена)
// Если файл лежит в: public/marker.svg
const MARKER_SVG_URL = '/marker.svg';

// Если файл в: public/assets/marker.svg → используйте '/assets/marker.svg'

export const createBikeMarkerIcon = (overrides?: Partial<L.IconOptions>) => {
	return new L.Icon({
		iconUrl: MARKER_SVG_URL, // ✅ Строка-путь, не импортированный модуль
		iconSize: [40, 50], // [width, height] — подставьте свои размеры
		iconAnchor: [20, 50], // Точка «острия»: x = ширина/2, y = высота
		popupAnchor: [0, -45], // Смещение попапа относительно iconAnchor
		...overrides,
	});
};

export const BIKE_MARKER_ICON = createBikeMarkerIcon();
