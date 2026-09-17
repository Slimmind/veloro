import { useState } from 'react';
import { useYMap } from '../lib/ymap-context';
import type { LatLngTuple } from '../../../shared/lib/types';
import { DirectionIcon } from '../../../icons/direction-icon';
import { Button } from '../../../shared/ui/button';

interface FindMeButtonProps {
	findMe: (flyTo?: (position: LatLngTuple, zoom: number) => void, zoom?: number) => Promise<string | null>;
	loading: boolean;
	error: string | null;
}

export const FindMeButton = ({ findMe, loading, error }: FindMeButtonProps) => {
	const map = useYMap();
	const [showError, setShowError] = useState(false);

	const handleClick = async () => {
		setShowError(false);
		const flyTo = map
			? (pos: LatLngTuple, zoom: number) =>
				map.setLocation({ center: [pos[1], pos[0]], zoom, duration: 1200 })
			: undefined;
		const err = await findMe(flyTo, 14);
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
