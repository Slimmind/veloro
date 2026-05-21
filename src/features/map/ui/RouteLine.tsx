import { useEffect } from 'react';
import { Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';

interface RouteLineProps {
	coordinates: LatLngTuple[];
	distance: number;
	duration: number;
	userPosition?: LatLngTuple | null;
}

function formatDistance(metres: number): string {
	return metres < 1000
		? `${Math.round(metres)} м`
		: `${(metres / 1000).toFixed(1)} км`;
}

function formatDuration(seconds: number): string {
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return `${minutes} мин`;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
}

function traveledDistance(coords: LatLngTuple[], toIdx: number): number {
	let d = 0;
	for (let i = 0; i < toIdx; i++) {
		d += L.latLng(coords[i]).distanceTo(L.latLng(coords[i + 1]));
	}
	return d;
}

const LABEL_W = 180;
const LABEL_H = 32;

function makeRouteLabelIcon(distance: number, duration: number, traveled?: number): L.DivIcon {
	const text = traveled != null && traveled > 0
		? `${formatDistance(traveled)}\u00a0/\u00a0${formatDistance(distance)}`
		: `${formatDistance(distance)}\u00a0·\u00a0${formatDuration(duration)}`;
	return L.divIcon({
		className: 'route-label-anchor',
		html: `<div class="route-label">${text}</div>`,
		iconSize: [LABEL_W, LABEL_H],
		iconAnchor: [LABEL_W / 2, LABEL_H / 2],
	});
}

function findClosestIndex(coords: LatLngTuple[], pos: LatLngTuple): number {
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

export const RouteLine = ({ coordinates, distance, duration, userPosition }: RouteLineProps) => {
	const map = useMap();

	useEffect(() => {
		if (coordinates.length > 1) {
			map.fitBounds(coordinates, { padding: [50, 50], animate: true });
		}
	}, [map, coordinates]);

	const midPoint = coordinates[Math.floor(coordinates.length / 2)];

	if (!userPosition) {
		return (
			<>
				<Polyline positions={coordinates} pathOptions={REMAINING_OPTIONS} />
				<Marker position={midPoint} icon={makeRouteLabelIcon(distance, duration)} interactive={false} zIndexOffset={500} />
			</>
		);
	}

	const splitIdx = findClosestIndex(coordinates, userPosition);
	const traveled = coordinates.slice(0, splitIdx + 1);
	const remaining = coordinates.slice(splitIdx);
	const driven = splitIdx > 0 ? traveledDistance(coordinates, splitIdx) : 0;

	return (
		<>
			{traveled.length > 1 && (
				<Polyline positions={traveled} pathOptions={TRAVELED_OPTIONS} />
			)}
			{remaining.length > 1 && (
				<Polyline positions={remaining} pathOptions={REMAINING_OPTIONS} />
			)}
			<Marker position={midPoint} icon={makeRouteLabelIcon(distance, duration, driven > 0 ? driven : undefined)} interactive={false} zIndexOffset={500} />
		</>
	);
};
