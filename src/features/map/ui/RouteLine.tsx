import { useEffect } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';

interface RouteLineProps {
	coordinates: LatLngTuple[];
}

export const RouteLine = ({ coordinates }: RouteLineProps) => {
	const map = useMap();

	useEffect(() => {
		if (coordinates.length > 1) {
			map.fitBounds(coordinates, { padding: [50, 50], animate: true });
		}
	}, [map, coordinates]);

	return (
		<Polyline
			positions={coordinates}
			pathOptions={{
				color: 'magenta',
				weight: 5,
				opacity: 0.85,
				dashArray: '12, 8',
				lineCap: 'round',
				lineJoin: 'round',
			}}
		/>
	);
};
