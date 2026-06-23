import { useState, useEffect } from 'react';
import { BackIcon } from '../../../icons/back-icon';
import { CrossIcon } from '../../../icons/cross-icon';
import { SaveIcon } from '../../../icons/save-icon';
import { formatDistance } from '../../../shared/lib/formatDistance';
import './route-info.styles.css';

interface RouteInfoProps {
	distance: number;
	duration: number;
	traveled?: number;
	hasWaypoints?: boolean;
	onSave?: () => void;
	isSaved?: boolean;
	onUndo?: () => void;
	onClear?: () => void;
}


function formatDuration(seconds: number): string {
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return `${minutes} мин`;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
}

export const RouteInfo = ({ distance, duration, traveled, hasWaypoints, onSave, isSaved, onUndo, onClear }: RouteInfoProps) => {
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		setSaved(false);
	}, [distance, duration]);

	const handleSave = () => {
		onSave?.();
		setSaved(true);
	};

	return (
		<div className='route-info'>
			{onSave && !saved && !isSaved && (
				<>
					<button className='route-info__btn' type='button' onClick={handleSave} title='Сохранить маршрут'>
						<SaveIcon />
					</button>
					<span className='route-info__divider' />
				</>
			)}
			{traveled != null && traveled > 0 ? (
				<>
					<span className='route-info__item'>{formatDistance(traveled)}</span>
					<span className='route-info__divider' />
					<span className='route-info__item'>{formatDistance(distance)}</span>
				</>
			) : (
				<>
					<span className='route-info__item'>{formatDistance(distance)}</span>
					<span className='route-info__divider' />
					<span className='route-info__item'>{formatDuration(duration)}</span>
				</>
			)}
			{hasWaypoints && onUndo && (
				<>
					<span className='route-info__divider' />
					<button className='route-info__btn' type='button' onClick={onUndo} title='Отменить последнюю точку'>
						<BackIcon />
					</button>
				</>
			)}
			{onClear && (
				<>
					<span className='route-info__divider' />
					<button className='route-info__btn' type='button' onClick={onClear} title='Удалить маршрут'>
						<CrossIcon />
					</button>
				</>
			)}
		</div>
	);
};
