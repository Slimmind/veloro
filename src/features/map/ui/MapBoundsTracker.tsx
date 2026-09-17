import { useEffect } from 'react';
import { useYMap } from '../lib/ymap-context';
import type { Bounds } from '../../../shared/api/overpass';

interface MapBoundsTrackerProps {
	onBoundsChange: (bounds: Bounds) => void;
}

export const MapBoundsTracker = ({ onBoundsChange }: MapBoundsTrackerProps) => {
	const map = useYMap();

	useEffect(() => {
		if (!map) return;

		const emitBounds = () => {
			const b = map.bounds;
			// LngLatBounds: [[west, north], [east, south]]
			onBoundsChange({
				west: b[0][0],
				north: b[0][1],
				east: b[1][0],
				south: b[1][1],
			});
		};

		emitBounds();

		const listener = new ymaps3.YMapListener({ onActionEnd: emitBounds });
		map.addChild(listener);

		return () => {
			map.removeChild(listener);
		};
	}, [map, onBoundsChange]);

	return null;
};
