// src/components/main-map/FindMeButton.tsx

import { useState } from 'react';
import { useMap } from 'react-leaflet';
import { useUserGeolocation } from '../../hooks/useUserGeolocation';
import { DirectionIcon } from '../../icons/direction-icon';

export const FindMeButton = () => {
	const map = useMap();
	const { findMe, loading, error } = useUserGeolocation();
	const [showError, setShowError] = useState(false);

	const handleClick = async () => {
		setShowError(false);
		await findMe(map, 14); // 14 — комфортный зум для города
		// Если была ошибка — покажем её на 3 секунды
		if (error) {
			setShowError(true);
			setTimeout(() => setShowError(false), 3000);
		}
	};

	return (
		<div className='find-me-control'>
			<button
				onClick={handleClick}
				disabled={loading}
				className={`btn btn--circle btn--find-me ${loading ? 'loading' : ''} ${showError ? 'error' : ''}`}
				title='Найти моё местоположение'
				aria-label='Найти моё местоположение'
			>
				{loading ? (
					<span className='spinner' aria-hidden='true' />
				) : (
					<DirectionIcon />
				)}
			</button>

			{/* Всплывающее сообщение об ошибке */}
			{showError && error && <div className='find-me-error'>{error}</div>}
		</div>
	);
};
