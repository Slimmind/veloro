import { useEffect, useRef } from 'react';
import type { YMapFeature } from '@yandex/ymaps3-types';
import { useYMap } from '../lib/ymap-context';
import type { LatLngTuple } from '../../../shared/lib/types';

export function traveledDistance(coords: LatLngTuple[], toIdx: number): number {
	let d = 0;
	for (let i = 0; i < toIdx; i++) {
		const [lat1, lng1] = coords[i];
		const [lat2, lng2] = coords[i + 1];
		const R = 6371000;
		const dLat = ((lat2 - lat1) * Math.PI) / 180;
		const dLng = ((lng2 - lng1) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) ** 2 +
			Math.cos((lat1 * Math.PI) / 180) *
				Math.cos((lat2 * Math.PI) / 180) *
				Math.sin(dLng / 2) ** 2;
		d += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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

const toYCoords = (coords: LatLngTuple[]): [number, number][] =>
	coords.map(([lat, lng]) => [lng, lat]);

interface RouteLineProps {
	coordinates: LatLngTuple[];
	userPosition?: LatLngTuple | null;
}

export const RouteLine = ({ coordinates, userPosition }: RouteLineProps) => {
	const map = useYMap();
	const traveledRef = useRef<YMapFeature | null>(null);
	const remainingRef = useRef<YMapFeature | null>(null);
	const fittedRef = useRef(false);

	useEffect(() => {
		if (!map) return;
		return () => {
			if (traveledRef.current) map.removeChild(traveledRef.current);
			if (remainingRef.current) map.removeChild(remainingRef.current);
			traveledRef.current = null;
			remainingRef.current = null;
			fittedRef.current = false;
		};
	}, [map]);

	useEffect(() => {
		if (!map || coordinates.length < 2) return;

		if (!fittedRef.current) {
			fittedRef.current = true;
			const lngs = coordinates.map((c) => c[1]);
			const lats = coordinates.map((c) => c[0]);
			const west = Math.min(...lngs) - 0.005;
			const east = Math.max(...lngs) + 0.005;
			const north = Math.max(...lats) + 0.005;
			const south = Math.min(...lats) - 0.005;
			map.setLocation({ bounds: [[west, north], [east, south]], duration: 800 });
		}

		const splitIdx = userPosition ? findClosestIndex(coordinates, userPosition) : 0;
		const traveled = coordinates.slice(0, splitIdx + 1);
		const remaining = coordinates.slice(splitIdx);

		if (userPosition && traveled.length >= 2) {
			const geom = { type: 'LineString' as const, coordinates: toYCoords(traveled) };
			if (!traveledRef.current) {
				traveledRef.current = new ymaps3.YMapFeature({
					geometry: geom,
					style: { stroke: [{ color: 'magenta', width: 8 }] },
				});
				map.addChild(traveledRef.current);
			} else {
				traveledRef.current.update({ geometry: geom });
			}
		} else if (traveledRef.current) {
			map.removeChild(traveledRef.current);
			traveledRef.current = null;
		}

		const remGeom = { type: 'LineString' as const, coordinates: toYCoords(remaining.length >= 2 ? remaining : coordinates) };
		if (!remainingRef.current) {
			remainingRef.current = new ymaps3.YMapFeature({
				geometry: remGeom,
				style: { stroke: [{ color: 'magenta', width: 4, opacity: 0.5, dash: [12, 8] }] },
			});
			map.addChild(remainingRef.current);
		} else {
			remainingRef.current.update({ geometry: remGeom });
		}
	}, [map, coordinates, userPosition]);

	return null;
};
