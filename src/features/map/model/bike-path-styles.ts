import { BIKE_PATH_STYLES } from '../../../shared/config/bike-path-styles';
import type { PathStyleKey } from '../../../shared/config/bike-path-styles';

export { BIKE_PATH_STYLES, type PathStyleKey };

export const getLeafletPathOptions = (key: PathStyleKey) => {
	const style = BIKE_PATH_STYLES[key];
	return {
		color: style.color,
		weight: style.weight,
		opacity: style.opacity,
		...(style.pattern === 'dashed' && { dashArray: '8, 4' as const }),
	};
};
