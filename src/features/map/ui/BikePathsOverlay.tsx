import { useState } from 'react';
import L from 'leaflet';
import type { LatLngBounds, LeafletMouseEvent } from 'leaflet';
import { Polyline, useMap, useMapEvents } from 'react-leaflet';
import { getLeafletPathOptions } from '../model/bike-path-styles';
import { useBikePaths } from '../model/useBikePaths';

interface BikePathsOverlayProps {
	bounds: LatLngBounds | null;
	minZoom?: number;
}

export const BikePathsOverlay = ({ bounds, minZoom = 12 }: BikePathsOverlayProps) => {
	const map = useMap();
	const [zoom, setZoom] = useState(() => map.getZoom());

	useMapEvents({
		zoomend: () => setZoom(map.getZoom()),
	});

	const { paths } = useBikePaths(bounds, zoom >= minZoom);

	if (zoom < minZoom) return null;

	return (
		<>
			{paths.map((path) => (
				<Polyline
					key={path.id}
					positions={path.coordinates}
					pathOptions={getLeafletPathOptions(path.type)}
					eventHandlers={{
						mouseover: (e: LeafletMouseEvent) =>
							(e.target as L.Path).setStyle({ weight: 7, color: '#fff' }),
						mouseout: (e: LeafletMouseEvent) =>
							(e.target as L.Path).setStyle(getLeafletPathOptions(path.type)),
					}}
				/>
			))}
		</>
	);
};
