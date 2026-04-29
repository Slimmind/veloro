import L from 'leaflet';

const MARKER_SVG_URL = '/marker.svg';

export const createBikeMarkerIcon = (overrides?: Partial<L.IconOptions>) => {
	return new L.Icon({
		iconUrl: MARKER_SVG_URL,
		iconSize: [40, 50],
		iconAnchor: [20, 50],
		popupAnchor: [0, -45],
		...overrides,
	});
};

export const BIKE_MARKER_ICON = createBikeMarkerIcon();

