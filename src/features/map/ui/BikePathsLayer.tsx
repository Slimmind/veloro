import { useEffect, useRef } from 'react';
import type { YMapFeature } from '@yandex/ymaps3-types';
import { useYMap } from '../lib/ymap-context';
import { useBikePaths } from '../model/useBikePaths';
import { BIKE_PATH_STYLES, SATELLITE_BIKE_COLOR } from '../../../shared/config/bike-path-styles';
import type { Bounds } from '../../../shared/api/overpass';
import type { BikePath } from '../../../entities/bikePath';
import type { PathStyleKey } from '../../../shared/config/bike-path-styles';

const getColor = (type: PathStyleKey, satellite: boolean) =>
	satellite ? SATELLITE_BIKE_COLOR : BIKE_PATH_STYLES[type].color;

const getWidth = (type: PathStyleKey) => BIKE_PATH_STYLES[type].weight;
const getOpacity = (type: PathStyleKey, satellite: boolean) =>
	satellite ? 1 : BIKE_PATH_STYLES[type].opacity;

interface BikePathsLayerProps {
	bounds: Bounds | null;
	minZoom?: number;
	zoom: number;
	isSatellite?: boolean;
}

export const BikePathsLayer = ({
	bounds,
	minZoom = 12,
	zoom,
	isSatellite = false,
}: BikePathsLayerProps) => {
	const map = useYMap();
	const { paths } = useBikePaths(bounds, zoom >= minZoom);
	const featuresRef = useRef<Map<string, YMapFeature>>(new Map());

	useEffect(() => {
		if (!map) return;
		return () => {
			featuresRef.current.forEach((f) => map.removeChild(f));
			featuresRef.current.clear();
		};
	}, [map]);

	useEffect(() => {
		if (!map) return;

		const currentIds = new Set(featuresRef.current.keys());
		const nextIds = new Set(paths.map((p) => p.id));

		// Remove paths that are no longer present
		currentIds.forEach((id) => {
			if (!nextIds.has(id)) {
				const f = featuresRef.current.get(id)!;
				map.removeChild(f);
				featuresRef.current.delete(id);
			}
		});

		// Add new paths
		paths.forEach((path: BikePath) => {
			if (featuresRef.current.has(path.id)) return;

			const isDashed = path.type === 'track';
			const feature = new ymaps3.YMapFeature({
				id: path.id,
				geometry: {
					type: 'LineString',
					coordinates: path.coordinates.map(([lat, lng]) => [lng, lat]),
				},
				style: {
					stroke: [{
						color: getColor(path.type, isSatellite),
						width: getWidth(path.type),
						opacity: getOpacity(path.type, isSatellite),
						...(isDashed ? { dash: [3, 2] } : {}),
					}],
				},
			});
			map.addChild(feature);
			featuresRef.current.set(path.id, feature);
		});
	}, [map, paths, isSatellite]);

	return null;
};
