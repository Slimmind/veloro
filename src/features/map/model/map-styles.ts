// Thumbnail tiles: z=13, Berlin area (x=4401, y=2686). ArcGIS uses z/y/x order.
export const MAP_STYLES = {
	liberty: {
		type: 'vector' as const,
		url: 'https://tiles.openfreemap.org/styles/liberty',
		label: 'Детализированная',
		thumbnail: 'https://tile.openstreetmap.org/13/4401/2686.png',
	},
	bright: {
		type: 'vector' as const,
		url: 'https://tiles.openfreemap.org/styles/bright',
		label: 'Светлая',
		thumbnail: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/13/4401/2686.png',
	},
	positron: {
		type: 'vector' as const,
		url: 'https://tiles.openfreemap.org/styles/positron',
		label: 'Монохром',
		thumbnail: 'https://a.basemaps.cartocdn.com/light_all/13/4401/2686.png',
	},
	satellite: {
		type: 'satellite' as const,
		url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
		label: 'Спутник',
		thumbnail: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/2686/4401',
	},
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;
export const DEFAULT_MAP_STYLE: MapStyleKey = 'bright';
