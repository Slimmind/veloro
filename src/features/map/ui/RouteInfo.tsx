import './route-info.styles.css';

interface RouteInfoProps {
	distance: number;
	duration: number;
	traveled?: number;
}

function formatDistance(metres: number): string {
	return metres < 1000
		? `${Math.round(metres)} м`
		: `${(metres / 1000).toFixed(1)} км`;
}

function formatDuration(seconds: number): string {
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return `${minutes} мин`;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
}

export const RouteInfo = ({ distance, duration, traveled }: RouteInfoProps) => (
	<div className='route-info'>
		{traveled != null && traveled > 0 ? (
			<>
				<span className='route-info__item'>{formatDistance(traveled)}</span>
				<span className='route-info__divider' />
				<span className='route-info__item'>{formatDistance(distance)}</span>
			</>
		) : (
			<>
				<span className='route-info__item'>{formatDistance(distance)}</span>
				<span className='route-info__divider' />
				<span className='route-info__item'>{formatDuration(duration)}</span>
			</>
		)}
	</div>
);
