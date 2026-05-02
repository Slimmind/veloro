import { useEffect, useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import type { GeoJSONSource, Map as MLMap } from 'maplibre-gl';
import type { LatLngBounds } from 'leaflet';
import { useBikePaths } from '../model/useBikePaths';
import { BIKE_PATH_STYLES } from '../../../shared/config/bike-path-styles';
import type { BikePath } from '../../../entities/bikePath';

const SOURCE_ID = 'bike-paths';

const toGeoJSON = (paths: BikePath[]) => ({
	type: 'FeatureCollection' as const,
	features: paths.map((path) => ({
		type: 'Feature' as const,
		properties: { type: path.type },
		geometry: {
			type: 'LineString' as const,
			// GeoJSON is [lng, lat]; Leaflet LatLngTuple is [lat, lng]
			coordinates: path.coordinates.map(([lat, lng]) => [lng, lat]),
		},
	})),
});

const setupLayers = (mlMap: MLMap) => {
	mlMap.addSource(SOURCE_ID, {
		type: 'geojson',
		data: { type: 'FeatureCollection', features: [] },
	});

	// Solid lines: cycleway, lane, shared
	mlMap.addLayer({
		id: 'bike-paths-solid',
		type: 'line',
		source: SOURCE_ID,
		minzoom: 12,
		filter: ['!=', ['get', 'type'], 'track'],
		paint: {
			'line-color': ['match', ['get', 'type'],
				'cycleway', BIKE_PATH_STYLES.cycleway.color,
				'lane',     BIKE_PATH_STYLES.lane.color,
				            BIKE_PATH_STYLES.shared.color,
			],
			'line-width': ['match', ['get', 'type'],
				'cycleway', BIKE_PATH_STYLES.cycleway.weight,
				'lane',     BIKE_PATH_STYLES.lane.weight,
				            BIKE_PATH_STYLES.shared.weight,
			],
			'line-opacity': ['match', ['get', 'type'],
				'cycleway', BIKE_PATH_STYLES.cycleway.opacity,
				'lane',     BIKE_PATH_STYLES.lane.opacity,
				            BIKE_PATH_STYLES.shared.opacity,
			],
		},
	});

	// Dashed lines: track
	mlMap.addLayer({
		id: 'bike-paths-dashed',
		type: 'line',
		source: SOURCE_ID,
		minzoom: 12,
		filter: ['==', ['get', 'type'], 'track'],
		paint: {
			'line-color':   BIKE_PATH_STYLES.track.color,
			'line-width':   BIKE_PATH_STYLES.track.weight,
			'line-opacity': BIKE_PATH_STYLES.track.opacity,
			'line-dasharray': [3, 2],
		},
	});
};

interface BikePathsMlLayerProps {
	mlMap: MLMap;
	bounds: LatLngBounds | null;
	minZoom?: number;
}

export const BikePathsMlLayer = ({ mlMap, bounds, minZoom = 12 }: BikePathsMlLayerProps) => {
	const map = useMap();
	const [zoom, setZoom] = useState(() => map.getZoom());

	useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

	const { paths } = useBikePaths(bounds, zoom >= minZoom);

	// Add source + layers once
	useEffect(() => {
		setupLayers(mlMap);
		return () => {
			if (mlMap.getLayer('bike-paths-solid')) mlMap.removeLayer('bike-paths-solid');
			if (mlMap.getLayer('bike-paths-dashed')) mlMap.removeLayer('bike-paths-dashed');
			if (mlMap.getSource(SOURCE_ID)) mlMap.removeSource(SOURCE_ID);
		};
	}, [mlMap]);

	// Sync store → GeoJSON source atomically
	useEffect(() => {
		const source = mlMap.getSource(SOURCE_ID) as GeoJSONSource | undefined;
		if (!source) return;
		source.setData(toGeoJSON(paths));
	}, [paths, mlMap]);

	return null;
};
