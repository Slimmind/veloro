import { useEffect, useRef } from 'react';
import { Button } from '../../../shared/ui/button';
import { BikeLegend } from '../../../shared/ui/bike-legend/BikeLegend';
import { MapStyleSwitcher } from '../../map/ui/MapStyleSwitcher';
import { useAuth } from '../../auth/model/useAuth';
import type { MapStyleKey } from '../../map/model/map-styles';
import type { SavedRoute } from '../../map/model/useSavedRoutes';
import './main-menu.styles.css';

interface MainMenuProps {
	open: boolean;
	onToggle: () => void;
	activeStyle: MapStyleKey;
	onStyleChange: (style: MapStyleKey) => void;
	savedRoutes?: SavedRoute[];
	onDeleteSavedRoute?: (id: string) => void;
	onSelectSavedRoute?: (route: SavedRoute) => void;
}

function formatDistance(metres: number): string {
	return metres < 1000 ? `${Math.round(metres)} м` : `${(metres / 1000).toFixed(1)} км`;
}

function formatDuration(seconds: number): string {
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return `${minutes} мин`;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
}

function formatDate(ts: number): string {
	return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export const MainMenu = ({ open, onToggle, activeStyle, onStyleChange, savedRoutes = [], onDeleteSavedRoute, onSelectSavedRoute }: MainMenuProps) => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const { user } = useAuth();

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
				{user && savedRoutes.length > 0 && (
					<div className='main-menu__saved'>
						<h5 className='main-menu__saved-title'>Сохранённые маршруты</h5>
						<ul className='main-menu__saved-list'>
							{savedRoutes.map((r) => (
								<li key={r.id} className='main-menu__saved-item'>
									<button
										type='button'
										className='main-menu__saved-route'
										onClick={() => {
											onSelectSavedRoute?.(r);
											onToggle();
										}}
									>
										<span className='main-menu__saved-dist'>{formatDistance(r.distance)}</span>
										<span className='main-menu__saved-dur'>{formatDuration(r.duration)}</span>
										<span className='main-menu__saved-date'>{formatDate(r.createdAt)}</span>
									</button>
									<button
										type='button'
										className='main-menu__saved-delete'
										onClick={() => onDeleteSavedRoute?.(r.id)}
										title='Удалить'
									>
										✕
									</button>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
};
