import { useEffect, useState } from 'react';
import { BIKE_PATH_STYLES } from '../model/bike-path-styles';
import { Button } from '../../../shared/ui/button';
import './bike-legend.styles.css';
import { QuestionIcon } from '../../../icons/question-icon';

export const BikeLegend = () => {
	const [hidden, setHidden] = useState<boolean>(false);

	function toggleLegend() {
		setHidden(!hidden);
	}

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setHidden(true);
		}, 10000);

		return () => window.clearTimeout(timeoutId);
	}, []);

	return (
		<>
			<Button mod='circle icon' onClick={toggleLegend}>
				<QuestionIcon />
			</Button>
			<div className={`bike-legend ${hidden ? 'hidden' : ''}`}>
				<h5 className='bike-legend-title'>🚴 Типы велодорожек</h5>
				<ul className='bike-legend-list'>
					{Object.entries(BIKE_PATH_STYLES).map(([key, style]) => (
						<li key={key} className='bike-legend-list-item'>
							<div
								style={{
									width: 28,
									height: style.pattern === 'dashed' ? 0 : 4,
									borderTop: `3px ${style.pattern === 'dashed' ? 'dashed' : 'solid'} ${style.color}`,
									opacity: style.opacity,
									borderRadius: 2,
									flexShrink: 0,
								}}
							/>
							<span style={{ color: '#374151', lineHeight: 1.3 }}>
								{style.label}
							</span>
						</li>
					))}
				</ul>
			</div>
		</>
	);
};
