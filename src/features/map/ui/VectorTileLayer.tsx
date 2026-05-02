import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@maplibre/maplibre-gl-leaflet';

interface VectorTileLayerProps {
	styleUrl: string;
}

export const VectorTileLayer = ({ styleUrl }: VectorTileLayerProps) => {
	const map = useMap();
	const layerRef = useRef<L.MaplibreGL | null>(null);

	// Create layer once on mount
	useEffect(() => {
		const layer = L.maplibreGL({ style: styleUrl, minZoom: 1 });
		layer.addTo(map);
		layerRef.current = layer;

		return () => {
			map.removeLayer(layer);
			layerRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [map]);

	// Update style without recreating the layer
	useEffect(() => {
		if (!layerRef.current) return;
		layerRef.current.getMaplibreMap().setStyle(styleUrl);
	}, [styleUrl]);

	return null;
};
