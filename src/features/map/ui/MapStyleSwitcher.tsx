import { Button } from '../../../shared/ui/button';
import { MAP_STYLES } from '../model/map-styles';
import type { MapStyleKey } from '../model/map-styles';


interface MapStyleSwitcherProps {
	activeStyle: MapStyleKey;
	onChange: (style: MapStyleKey) => void;
}

export const MapStyleSwitcher = ({ activeStyle, onChange }: MapStyleSwitcherProps) => {
	return (
		<div className='map-style-switcher'>
			<h5 className='map-style-switcher__title'>Виды карты</h5>
			<div className='map-style-switcher__container'>
				{(Object.keys(MAP_STYLES) as MapStyleKey[]).map((key) => (
					<Button
						key={key}
						onClick={() => onChange(key)}
						className={`btn btn--style ${activeStyle === key ? 'active' : ''}`}
						title={MAP_STYLES[key].label}
					>
						{MAP_STYLES[key].label}
					</Button>
				))}
			</div>
		</div>
	);
};
