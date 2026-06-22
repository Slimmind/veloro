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
					<button
						key={key}
						onClick={() => onChange(key)}
						className={`btn map-style-thumb ${activeStyle === key ? 'active' : ''}`}
						title={MAP_STYLES[key].label}
						type='button'
					>
						<img
							src={MAP_STYLES[key].thumbnail}
							alt={MAP_STYLES[key].label}
							draggable={false}
						/>
					</button>
				))}
			</div>
		</div>
	);
};
