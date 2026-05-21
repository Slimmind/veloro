import L from 'leaflet';

export const createBikeMarkerIcon = (overrides?: Partial<L.IconOptions>) => {
	return new L.Icon({
		iconUrl: '/marker.svg',
		iconSize: [40, 50],
		iconAnchor: [20, 50],
		popupAnchor: [0, -45],
		...overrides,
	});
};

export const BIKE_MARKER_ICON = createBikeMarkerIcon();
export const BIKE_MARKER_ICON_SATELLITE = createBikeMarkerIcon({ iconUrl: '/marker-satellite.svg' });

