// src/components/main-map/UserLocation.tsx

import { useEffect } from 'react';
import { useMap, Marker, Circle, Popup } from 'react-leaflet';
import { useUserGeolocation } from '../../hooks/useUserGeolocation';
import { BIKE_MARKER_ICON } from './map-marker';

export const UserLocation = () => {
	const map = useMap();
	const { position, accuracy, findMe } = useUserGeolocation();

	// При монтировании автоматически ищем пользователя
	useEffect(() => {
		findMe(map);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Запускаем только один раз

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

			<Marker position={position} icon={BIKE_MARKER_ICON}>
				<Popup>
					<strong>🚴 Вы здесь</strong>
					{accuracy && <br />}
					{accuracy && `Точность: ±${Math.round(accuracy)} м`}
				</Popup>
			</Marker>
		</>
	);
};
