import type { LayerSpecification, StyleSpecification } from 'maplibre-gl';

type SymbolLayer = Extract<LayerSpecification, { type: 'symbol' }>;

const SATELLITE_SOURCE = 'satellite-raster';
let cache: StyleSpecification | null = null;

export async function buildSatelliteHybridStyle(satelliteUrl: string): Promise<StyleSpecification> {
	if (cache) return cache;

	const res = await fetch('https://tiles.openfreemap.org/styles/liberty');
	const libertyStyle: StyleSpecification = await res.json();

	const allLayers: LayerSpecification[] = libertyStyle.layers;
	const symbolLayers = allLayers
		.filter((l): l is SymbolLayer => l.type === 'symbol')
		.map((layer): SymbolLayer => ({
			...layer,
			paint: {
				...layer.paint,
				'text-color': '#ffffff',
				'text-halo-color': 'rgba(0, 0, 0, 0.85)',
				'text-halo-width': 1.5,
			},
		}));

	cache = {
		...libertyStyle,
		sources: {
			...libertyStyle.sources,
			[SATELLITE_SOURCE]: {
				type: 'raster',
				tiles: [satelliteUrl],
				tileSize: 256,
			},
		},
		layers: [
			{ id: SATELLITE_SOURCE, type: 'raster', source: SATELLITE_SOURCE },
			...symbolLayers,
		],
	};

	return cache;
}
