import { useState } from 'react';
import { useMap } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import { DirectionIcon } from '../../../icons/direction-icon';
import { Button } from '../../../shared/ui/button';

interface FindMeButtonProps {
	findMe: (map?: LeafletMap, zoom?: number) => Promise<string | null>;
	loading: boolean;
	error: string | null;
}

export const FindMeButton = ({ findMe, loading, error }: FindMeButtonProps) => {
	const map = useMap();
	const [showError, setShowError] = useState(false);

	const handleClick = async () => {
		setShowError(false);
		const err = await findMe(map, 14);
		if (err) {
			setShowError(true);
			setTimeout(() => setShowError(false), 3000);
		}
	};

	return (
		<div className='find-me-control'>
			<Button
				onClick={handleClick}
				disabled={loading}
				className={`btn btn--circle btn--icon btn--find-me ${loading ? 'loading' : ''} ${showError ? 'error' : ''}`}
				title='Найти моё местоположение'
				aria-label='Найти моё местоположение'
			>
				{loading ? (
					<span className='spinner' aria-hidden='true' />
				) : (
					<DirectionIcon />
				)}
			</Button>

			{showError && error && <div className='find-me-error'>{error}</div>}
		</div>
	);
};
