import { Circle, Marker, Popup } from 'react-leaflet';
import type { Icon, LatLngTuple } from 'leaflet';
import { BIKE_MARKER_ICON } from '../model/map-marker';

interface UserLocationProps {
	position: LatLngTuple | null;
	accuracy: number | null;
	icon?: Icon;
}

export const UserLocation = ({ position, accuracy, icon = BIKE_MARKER_ICON }: UserLocationProps) => {
	if (!position) return null;

	return (
		<>
			{accuracy && (
				<Circle
					center={position}
					radius={accuracy}
					pathOptions={{
						color: '#3b82f6',
						fillColor: '#93c5fd',
						fillOpacity: 0.15,
						weight: 1,
					}}
				>
					<Popup>📍 Точность: ±{Math.round(accuracy)} м</Popup>
				</Circle>
			)}

			<Marker position={position} icon={icon}>
				<Popup>
					<strong>🚴 Вы здесь</strong>
					{accuracy && <br />}
					{accuracy && `Точность: ±${Math.round(accuracy)} м`}
				</Popup>
			</Marker>
		</>
	);
};
