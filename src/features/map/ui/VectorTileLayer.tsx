import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Map as MLMap, StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@maplibre/maplibre-gl-leaflet';

interface VectorTileLayerProps {
	styleUrl?: string;
	styleObject?: StyleSpecification;
	onReady?: (mlMap: MLMap) => void;
}

export const VectorTileLayer = ({ styleUrl, styleObject, onReady }: VectorTileLayerProps) => {
	const map = useMap();
	const layerRef = useRef<L.MaplibreGL | null>(null);

	useEffect(() => {
		const style = (styleObject ?? styleUrl)!;
		const layer = L.maplibreGL({ style, minZoom: 1 });
		layer.addTo(map);
		layerRef.current = layer;

		const mlMap = layer.getMaplibreMap();
		const handleReady = () => onReady?.(mlMap);

		if (mlMap.isStyleLoaded()) {
			handleReady();
		} else {
			mlMap.once('style.load', handleReady);
		}

		return () => {
			mlMap.off('style.load', handleReady);
			map.removeLayer(layer);
			layerRef.current = null;
		};
	}, [map, styleUrl, styleObject]);

	return null;
};
