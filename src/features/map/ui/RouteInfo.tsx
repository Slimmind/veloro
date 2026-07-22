import { useState, useEffect, useRef } from 'react';
import { BackIcon } from '../../../icons/back-icon';
import { CrossIcon } from '../../../icons/cross-icon';
import { SaveIcon } from '../../../icons/save-icon';
import { formatDistance } from '../../../shared/lib/formatDistance';
import './route-info.styles.css';
import { Button } from '../../../shared/ui/button';
import { CheckIcon } from '../../../icons/check-icon';

interface RouteInfoProps {
	distance: number;
	duration: number;
	traveled?: number;
	hasWaypoints?: boolean;
	onSave?: (name: string) => void;
	isSaved?: boolean;
	routeName?: string;
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

export const RouteInfo = ({ distance, duration, traveled, hasWaypoints, onSave, isSaved, routeName, onUndo, onClear }: RouteInfoProps) => {
	const [saved, setSaved] = useState(false);
	const [naming, setNaming] = useState(false);
	const [nameValue, setNameValue] = useState('');
	const [savedName, setSavedName] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		setSaved(false);
		setNaming(false);
		setNameValue('');
		setSavedName('');
	}, [distance, duration]);

	useEffect(() => {
		if (naming) inputRef.current?.focus();
	}, [naming]);

	const handleSaveClick = () => {
		setNaming(true);
	};

	const handleConfirmName = () => {
		const trimmed = nameValue.trim();
		onSave?.(trimmed);
		setSaved(true);
		setSavedName(trimmed);
		setNaming(false);
	};

	const handleCancelNaming = () => {
		setNaming(false);
		setNameValue('');
	};

	const displayName = naming
		? null
		: saved && savedName
			? savedName
			: isSaved && routeName
				? routeName
				: null;

	return (
		<div className='route-info'>
			{!naming && onSave && !saved && !isSaved && (
				<>
					<Button className='route-info__btn' type='button' onClick={handleSaveClick} title='Сохранить маршрут'>
						<SaveIcon color="var(--color-magenta)" />
					</Button>
					<span className='route-info__divider' />
				</>
			)}
			{naming && (
				<>
					<input
						ref={inputRef}
						className='route-info__name-input'
						value={nameValue}
						onChange={(e) => setNameValue(e.target.value)}
						placeholder='Название...'
						onKeyDown={(e) => {
							if (e.key === 'Enter') handleConfirmName();
							if (e.key === 'Escape') handleCancelNaming();
						}}
					/>
					<button className='route-info__btn' type='button' onClick={handleConfirmName} title='Подтвердить'>
						<CheckIcon size="32" color="var(--color-magenta)" />
					</button>
				</>
			)}
			{displayName && (
				<>
					<span className='route-info__name'>{displayName}</span>
					<span className='route-info__divider' />
				</>
			)}
			{!naming && (traveled != null && traveled > 0 ? (
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
			))}
			{hasWaypoints && onUndo && (
				<>
					<span className='route-info__divider' />
					<button className='route-info__btn' type='button' onClick={onUndo} title='Отменить последнюю точку'>
						<BackIcon color="var(--color-magenta)" />
					</button>
				</>
			)}
			{onClear && (
				<>
					<span className='route-info__divider' />
					<Button mod="circle icon delete" type='button' onClick={onClear} title='Удалить маршрут'>
						<CrossIcon />
					</Button>
				</>
			)}
		</div>
	);
};
