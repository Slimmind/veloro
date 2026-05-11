import type { Map as MLMap } from 'maplibre-gl';

export function removeLatinLabels(mlMap: MLMap): void {
  const style = mlMap.getStyle();
  if (!style?.layers) return;

  for (const layer of style.layers) {
    if (layer.type !== 'symbol') continue;
    const textField = (layer.layout as Record<string, unknown> | undefined)?.['text-field'];
    if (!textField) continue;
    if (!JSON.stringify(textField).includes('name:latin')) continue;

    mlMap.setLayoutProperty(layer.id, 'text-field', [
      'coalesce',
      ['get', 'name'],
      ['get', 'name:latin'],
    ]);
  }
}
