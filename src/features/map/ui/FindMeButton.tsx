import { useState } from 'react';
import { useMap } from 'react-leaflet';
import { DirectionIcon } from '../../../icons/direction-icon';
import { useUserGeolocation } from '../../../hooks/useUserGeolocation';

export const FindMeButton = () => {
	const map = useMap();
	const { findMe, loading, error } = useUserGeolocation();
	const [showError, setShowError] = useState(false);

	const handleClick = async () => {
		setShowError(false);
		await findMe(map, 14);
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

			{showError && error && <div className='find-me-error'>{error}</div>}
		</div>
	);
};

