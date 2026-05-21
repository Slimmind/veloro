import { useEffect, useRef } from 'react';
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
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
				onToggle();
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [open, onToggle]);

	return (
		<div ref={wrapperRef}>
			<Button mod='circle icon menu' onClick={onToggle}></Button>
			<div className={`main-menu ${open ? '' : 'hidden'}`}>
				<BikeLegend isSatellite={activeStyle === 'satellite'} />
				<MapStyleSwitcher activeStyle={activeStyle} onChange={onStyleChange} />
			</div>
		</div>
	);
};
