export function formatDistance(meters: number): string {
	return meters < 1000
		? `${Math.round(meters)} м`
		: `${(meters / 1000).toFixed(1)} км`;
}
