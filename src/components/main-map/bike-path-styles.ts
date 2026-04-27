// src/components/main-map/bike-path-styles.ts

export const BIKE_PATH_STYLES = {
	cycleway: {
		color: '#22c55e',
		weight: 5,
		opacity: 1,
		label: 'Выделенная велодорожка',
		pattern: 'solid' as const,
	},
	lane: {
		color: '#84cc16',
		weight: 4,
		opacity: 0.9,
		label: 'Велополоса на дороге',
		pattern: 'solid' as const,
	},
	track: {
		color: '#06b6d4',
		weight: 3,
		opacity: 0.85,
		label: 'Веломаршрут',
		pattern: 'dashed' as const,
	},
	shared: {
		color: '#f59e0b',
		weight: 3,
		opacity: 0.7,
		label: 'Общая дорога (допустимо для вело)',
		pattern: 'solid' as const,
	},
} as const;

export type PathStyleKey = keyof typeof BIKE_PATH_STYLES;

// Хелпер для получения Leaflet-стилей
export const getLeafletPathOptions = (key: PathStyleKey) => {
	const style = BIKE_PATH_STYLES[key];
	return {
		color: style.color,
		weight: style.weight,
		opacity: style.opacity,
		...(style.pattern === 'dashed' && { dashArray: '8, 4' as const }),
	};
};
