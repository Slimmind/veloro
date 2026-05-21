import { BIKE_PATH_STYLES, SATELLITE_BIKE_COLOR } from '../../config/bike-path-styles';
import './bike-legend.styles.css';

interface BikeLegendProps {
	isSatellite?: boolean;
}

export const BikeLegend = ({ isSatellite = false }: BikeLegendProps) => {
	return (
		<div className='bike-legend'>
			<h5 className='bike-legend-title'>Типы велодорожек</h5>
			<ul className='bike-legend-list'>
				{Object.entries(BIKE_PATH_STYLES).map(([key, style], index) => {
					const color = isSatellite && index === 0 ? SATELLITE_BIKE_COLOR : style.color;
					return (
						<li key={key} className='bike-legend-list-item'>
							<div
								style={{
									width: 28,
									height: style.pattern === 'dashed' ? 0 : 4,
									borderTop: `3px ${style.pattern === 'dashed' ? 'dashed' : 'solid'} ${color}`,
									opacity: style.opacity,
									borderRadius: 2,
									flexShrink: 0,
								}}
							/>
							<span>{style.label}</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
};
