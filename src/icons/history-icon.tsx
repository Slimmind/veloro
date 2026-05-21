type IconProps = {
	color?: string;
};

export const HistoryIcon = ({ color = '#535bf2' }: IconProps) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		fill='none'
		stroke={color}
		strokeLinecap='round'
		strokeLinejoin='round'
		strokeWidth='2'
	>
		<path d='M3 3v5h5' />
		<path d='M3.05 13A9 9 0 1 0 6 5.3L3 8' />
		<path d='M12 7v5l4 2' />
	</svg>
);
