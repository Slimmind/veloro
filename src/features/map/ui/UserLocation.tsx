import { useEffect, useRef } from 'react';
import type { YMapFeature, YMapMarker } from '@yandex/ymaps3-types';
import { useYMap } from '../lib/ymap-context';
import { createMarkerElement } from '../model/map-marker';
import type { LatLngTuple } from '../../../shared/lib/types';

const ACCURACY_CIRCLE_POINTS = 64;

const buildCircleCoords = (center: LatLngTuple, radiusM: number): [number, number][] => {
	const [lat, lng] = center;
	const latRad = (lat * Math.PI) / 180;
	const dLat = (radiusM / 111320) * (180 / Math.PI);
	const dLng = dLat / Math.cos(latRad);
	const pts: [number, number][] = [];
	for (let i = 0; i <= ACCURACY_CIRCLE_POINTS; i++) {
		const angle = (i / ACCURACY_CIRCLE_POINTS) * 2 * Math.PI;
		pts.push([lng + dLng * Math.cos(angle), lat + dLat * Math.sin(angle)]);
	}
	return pts;
};

interface UserLocationProps {
	position: LatLngTuple | null;
	accuracy: number | null;
	satellite?: boolean;
}

export const UserLocation = ({ position, accuracy, satellite = false }: UserLocationProps) => {
	const map = useYMap();
	const markerRef = useRef<YMapMarker | null>(null);
	const circleRef = useRef<YMapFeature | null>(null);

	useEffect(() => {
		if (!map) return;
		return () => {
			if (markerRef.current) map.removeChild(markerRef.current);
			if (circleRef.current) map.removeChild(circleRef.current);
			markerRef.current = null;
			circleRef.current = null;
		};
	}, [map]);

	useEffect(() => {
		if (!map || !position) return;

		const [lat, lng] = position;
		const lngLat: [number, number] = [lng, lat];

		if (!markerRef.current) {
			const el = createMarkerElement(satellite);
			markerRef.current = new ymaps3.YMapMarker({ coordinates: lngLat }, el);
			map.addChild(markerRef.current);
		} else {
			markerRef.current.update({ coordinates: lngLat });
		}

		if (accuracy && accuracy > 0) {
			const circleGeom = {
				type: 'Polygon' as const,
				coordinates: [buildCircleCoords(position, accuracy)],
			};
			if (!circleRef.current) {
				circleRef.current = new ymaps3.YMapFeature({
					geometry: circleGeom,
					style: {
						fill: 'rgba(147, 197, 253, 0.15)',
						stroke: [{ color: '#3b82f6', width: 1 }],
					},
				});
				map.addChild(circleRef.current);
			} else {
				circleRef.current.update({ geometry: circleGeom });
			}
		}
	}, [map, position, accuracy, satellite]);

	return null;
};
