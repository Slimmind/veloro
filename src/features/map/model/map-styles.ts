export const MAP_STYLES = {
	liberty: {
		url: 'https://tiles.openfreemap.org/styles/liberty',
		label: 'Liberty',
	},
	bright: {
		url: 'https://tiles.openfreemap.org/styles/bright',
		label: 'Bright',
	},
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;
export const DEFAULT_MAP_STYLE: MapStyleKey = 'liberty';
