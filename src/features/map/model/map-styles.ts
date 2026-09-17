// Thumbnails use free tile services — no auth required
export const MAP_STYLES = {
	normal: {
		label: 'Схема',
		// OSM tile around Minsk (z=13, x=4892, y=2686)
		thumbnail: 'https://tile.openstreetmap.org/13/4892/2686.png',
	},
	satellite: {
		label: 'Спутник',
		thumbnail: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/2686/4892',
	},
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;
export const DEFAULT_MAP_STYLE: MapStyleKey = 'normal';
