import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { LatLngBounds } from 'leaflet';

interface MapBoundsTrackerProps {
	onBoundsChange: (bounds: LatLngBounds) => void;
}

export const MapBoundsTracker = ({ onBoundsChange }: MapBoundsTrackerProps) => {
	const map = useMap();

	useEffect(() => {
		const updateBounds = () => onBoundsChange(map.getBounds());

		updateBounds();
		map.on('moveend', updateBounds);

		return () => {
			map.off('moveend', updateBounds);
		};
	}, [map, onBoundsChange]);

	return null;
};

