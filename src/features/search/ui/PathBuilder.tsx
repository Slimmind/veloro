import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '../../../shared/ui/button';
import { RouteIcon } from '../../../icons/route-icon';
import './path-builder.styles.css';
import { PointToPointIcon } from '../../../icons/point-to-point';
import { CurrentToPoint } from '../../../icons/current-to-point';

export type RouteMode = 'from-me' | 'point-to-point';

const ROUTE_MODES: { mode: RouteMode; label: string; description: string; icon: ReactNode }[] = [
	{
		mode: 'from-me',
		label: 'От моего местоположения',
		description: 'Укажите точку назначения на карте',
		icon: <CurrentToPoint />,
	},
	{
		mode: 'point-to-point',
		label: 'От точки до точки',
		description: 'Укажите точку начала, затем точку конца маршрута',
		icon: <PointToPointIcon />,
	},
];

interface PathBuilderProps {
	open: boolean;
	onToggle: () => void;
	onModeSelect: (mode: RouteMode) => void;
}

export const PathBuilder = ({ open, onToggle, onModeSelect }: PathBuilderProps) => {
	const rootRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
				onToggle();
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [open, onToggle]);

	const handleSelect = (mode: RouteMode) => {
		onModeSelect(mode);
		onToggle();
	};

	return (
		<div className='path-builder-root' ref={rootRef}>
			<Button mod='circle icon' onClick={onToggle} aria-label='Построить маршрут'>
				<RouteIcon color='var(--color-white)' />
			</Button>
			<div className={`path-builder ${open ? '' : 'hidden'}`}>
				<h5 className='path-builder__title'>Построение маршрута</h5>
				<ul className='path-builder__list'>
					{ROUTE_MODES.map(({ mode, label, description, icon }) => (
						<li key={mode}>
							<button
								className='path-builder__option'
								type='button'
								onClick={() => handleSelect(mode)}
							>
								<span className='path-builder__option-icon'>{icon}</span>
								<span className='path-builder__option-text'>
									<h6 className='path-builder__option-label'>{label}</h6>
									<span className='path-builder__option-desc'>{description}</span>
								</span>
							</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};
