// src/components/main-map/MainMap.tsx

import { useEffect, useState } from 'react';
import {
	MapContainer,
	TileLayer,
	ZoomControl,
	Marker,
	Popup,
	useMap,
} from 'react-leaflet';
import type { LatLngBounds, LatLngTuple } from 'leaflet';
import L from 'leaflet';

// 🎨 Фикс иконок
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
	iconUrl: icon,
	iconRetinaUrl: iconRetina,
	shadowUrl: shadow,
});

// 📦 Импорт подкомпонентов
import { UserLocation } from './UserLocation';
import { BikePathsOverlay } from './BikePathsOverlay';
import { MapBoundsTracker } from './MapBoundsTracker';
import BikeLegend from '../bike-legend';
import { FindMeButton } from './FindMeButton';
import { BIKE_MARKER_ICON } from './map-marker';
import type { SearchResult } from '../../hooks/useMapSearch';

// 🎨 Стили
import 'leaflet/dist/leaflet.css';
import './main-map.styles.css';

interface MainMapProps {
	selectedResult: SearchResult | null;
}

const SearchViewUpdater = ({
	position,
}: {
	position: LatLngTuple | undefined;
}) => {
	const map = useMap();

	useEffect(() => {
		if (!position) return;
		// Leaflet-View не обновляется автоматически при изменении props у MapContainer,
		// поэтому принудительно двигаем карту.
		map.setView(position, 15, { animate: true });
	}, [map, position]);

	return null;
};

export const MainMap = ({ selectedResult }: MainMapProps) => {
	const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);

	return (
		<div className='main-map'>
			{/* 📋 Легенда */}
			<BikeLegend />

			<MapContainer
				center={selectedResult?.position || ([53.9, 27.56] as LatLngTuple)}
				zoom={selectedResult ? 15 : 10} // При поиске — крупный зум
				style={{ height: '100%', width: '100%' }}
				zoomControl={false}
				scrollWheelZoom={true}
				doubleClickZoom={true}
				touchZoom={true}
				dragging={true}
			>
				<ZoomControl position='bottomright' />
				<FindMeButton />

				{/* 🗺️ Базовый вело-стиль */}
				<TileLayer
					url='https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png'
					attribution='&copy; CyclOSM | &copy; OpenStreetMap'
					maxZoom={20}
					minZoom={8}
				/>

				{/* 🔥 Велодорожки поверх */}
				{mapBounds && <BikePathsOverlay bounds={mapBounds} minZoom={12} />}

				{/* 📡 Отслеживание границ */}
				<MapBoundsTracker onBoundsChange={setMapBounds} />

				{/* 🚴 Местоположение пользователя */}
				<UserLocation />

				{/* 🔍 Маркер результата поиска */}
				<SearchViewUpdater position={selectedResult?.position} />
				{selectedResult && (
					<Marker position={selectedResult.position} icon={BIKE_MARKER_ICON}>
						<Popup>
							<strong>🔍 Найдено:</strong>
							<br />
							{selectedResult.name}
						</Popup>
					</Marker>
				)}
			</MapContainer>
		</div>
	);
};
