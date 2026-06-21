export const MAP_STYLES = {
	liberty: {
		type: 'vector' as const,
		url: 'https://tiles.openfreemap.org/styles/liberty',
		label: 'Детализированная',
	},
	bright: {
		type: 'vector' as const,
		url: 'https://tiles.openfreemap.org/styles/bright',
		label: 'Светлая',
	},
	positron: {
		type: 'vector' as const,
		url: 'https://tiles.openfreemap.org/styles/positron',
		label: 'Монохром',
	},
	satellite: {
		type: 'satellite' as const,
		url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
		label: 'Спутник',
	},
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;
export const DEFAULT_MAP_STYLE: MapStyleKey = 'bright';
