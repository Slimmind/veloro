import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../shared/ui/button';
import { BikeLegend } from '../../../shared/ui/bike-legend/BikeLegend';
import { MapStyleSwitcher } from '../../map/ui/MapStyleSwitcher';
import { useAuth } from '../../auth/model/useAuth';
import type { MapStyleKey } from '../../map/model/map-styles';
import type { SavedRoute } from '../../map/model/useSavedRoutes';
import { formatDistance } from '../../../shared/lib/formatDistance';
import './main-menu.styles.css';
import { EditIcon } from '../../../icons/edit-icon';
import { SaveIcon } from '../../../icons/save-icon';
import { CrossIcon } from '../../../icons/cross-icon';

interface MainMenuProps {
	open: boolean;
	onToggle: () => void;
	activeStyle: MapStyleKey;
	onStyleChange: (style: MapStyleKey) => void;
	savedRoutes?: SavedRoute[];
	onDeleteSavedRoute?: (id: string) => void;
	onSelectSavedRoute?: (route: SavedRoute) => void;
	onUpdateRouteName?: (id: string, name: string) => void;
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

export const MainMenu = ({ open, onToggle, activeStyle, onStyleChange, savedRoutes = [], onDeleteSavedRoute, onSelectSavedRoute, onUpdateRouteName }: MainMenuProps) => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const { user } = useAuth();
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editValue, setEditValue] = useState('');

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

	const handleEditStart = (id: string, currentName: string) => {
		setEditingId(id);
		setEditValue(currentName);
	};

	const handleEditConfirm = (id: string) => {
		onUpdateRouteName?.(id, editValue.trim());
		setEditingId(null);
		setEditValue('');
	};

	const handleEditCancel = () => {
		setEditingId(null);
		setEditValue('');
	};

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
									{editingId === r.id ? (
										<div className='main-menu__saved-edit'>
											<input
												className='main-menu__saved-edit-input'
												value={editValue}
												onChange={(e) => setEditValue(e.target.value)}
												placeholder='Название маршрута...'
												autoFocus
												onKeyDown={(e) => {
													if (e.key === 'Enter') handleEditConfirm(r.id);
													if (e.key === 'Escape') handleEditCancel();
												}}
											/>
											<button
												type='button'
												className='main-menu__saved-confirm'
												onClick={() => handleEditConfirm(r.id)}
												title='Сохранить'
											><SaveIcon size="20" color="var(--color-violet)" /></button>
											<button
												type='button'
												className='main-menu__saved-confirm'
												onClick={handleEditCancel}
												title='Отмена'
											>✕</button>
										</div>
									) : (
										<>
											<Button
												mod='circle icon edit'
												type='button'
												onClick={() => handleEditStart(r.id, r.name ?? '')}
												title='Переименовать'
											><EditIcon size="20" color="var(--color-white)" /></Button>
											<button
												type='button'
												className='main-menu__saved-route'
												onClick={() => {
													onSelectSavedRoute?.(r);
													onToggle();
												}}
											>
												{r.name && <span className='main-menu__saved-name'>{r.name}</span>}
												<div className='main-menu__saved-meta'>
													<span className='main-menu__saved-dist'>{formatDistance(r.distance)}</span>
													<span className='main-menu__saved-dur'>{formatDuration(r.duration)}</span>
													<span className='main-menu__saved-date'>{formatDate(r.createdAt)}</span>
												</div>
											</button>
											<Button
												mod='circle icon delete'
												type='button'
												onClick={() => onDeleteSavedRoute?.(r.id)}
												title='Удалить'
											><CrossIcon size="20" color="var(--color-white)" /></Button>
										</>
									)}
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
};
