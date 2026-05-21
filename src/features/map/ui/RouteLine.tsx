import { useEffect } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';

interface RouteLineProps {
	coordinates: LatLngTuple[];
	userPosition?: LatLngTuple | null;
}

export function traveledDistance(coords: LatLngTuple[], toIdx: number): number {
	let d = 0;
	for (let i = 0; i < toIdx; i++) {
		d += L.latLng(coords[i]).distanceTo(L.latLng(coords[i + 1]));
	}
	return d;
}

export function findClosestIndex(coords: LatLngTuple[], pos: LatLngTuple): number {
	let minDist = Infinity;
	let minIdx = 0;
	for (let i = 0; i < coords.length; i++) {
		const d = (coords[i][0] - pos[0]) ** 2 + (coords[i][1] - pos[1]) ** 2;
		if (d < minDist) {
			minDist = d;
			minIdx = i;
		}
	}
	return minIdx;
}

const REMAINING_OPTIONS = {
	color: 'magenta',
	weight: 4,
	opacity: 0.5,
	dashArray: '12, 8',
	lineCap: 'round' as const,
	lineJoin: 'round' as const,
};

const TRAVELED_OPTIONS = {
	color: 'magenta',
	weight: 8,
	opacity: 1,
	dashArray: undefined,
	lineCap: 'round' as const,
	lineJoin: 'round' as const,
};

export const RouteLine = ({ coordinates, userPosition }: RouteLineProps) => {
	const map = useMap();

	useEffect(() => {
		if (coordinates.length > 1) {
			map.fitBounds(coordinates, { padding: [50, 50], animate: true });
		}
	}, [map, coordinates]);

	if (!userPosition) {
		return <Polyline positions={coordinates} pathOptions={REMAINING_OPTIONS} />;
	}

	const splitIdx = findClosestIndex(coordinates, userPosition);
	const traveled = coordinates.slice(0, splitIdx + 1);
	const remaining = coordinates.slice(splitIdx);

	return (
		<>
			{traveled.length > 1 && (
				<Polyline positions={traveled} pathOptions={TRAVELED_OPTIONS} />
			)}
			{remaining.length > 1 && (
				<Polyline positions={remaining} pathOptions={REMAINING_OPTIONS} />
			)}
		</>
	);
};
