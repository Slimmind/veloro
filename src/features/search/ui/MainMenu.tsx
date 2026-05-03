import { Button } from '../../../shared/ui/button';
import { BikeLegend } from '../../../shared/ui/bike-legend/BikeLegend';
import { MapStyleSwitcher } from '../../map/ui/MapStyleSwitcher';
import type { MapStyleKey } from '../../map/model/map-styles';
import './main-menu.styles.css';

interface MainMenuProps {
	open: boolean;
	onToggle: () => void;
	activeStyle: MapStyleKey;
	onStyleChange: (style: MapStyleKey) => void;
}

export const MainMenu = ({ open, onToggle, activeStyle, onStyleChange }: MainMenuProps) => {
	return (
		<>
			<Button mod='circle icon menu' onClick={onToggle}></Button>
			<div className={`main-menu ${open ? '' : 'hidden'}`} onClick={onToggle}>
				<BikeLegend />
				<MapStyleSwitcher activeStyle={activeStyle} onChange={onStyleChange} />
			</div>
		</>
	);
};
