export const MAP_STYLES = {
	liberty: {
		type: 'vector' as const,
		url: 'https://tiles.openfreemap.org/styles/liberty',
		label: 'Liberty',
	},
	bright: {
		type: 'vector' as const,
		url: 'https://tiles.openfreemap.org/styles/bright',
		label: 'Bright',
	},
	satellite: {
		type: 'raster' as const,
		url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
		label: 'Satellite',
	},
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;
export const DEFAULT_MAP_STYLE: MapStyleKey = 'liberty';
