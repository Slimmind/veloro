type IconProps = {
	color?: string;
};

export const UserIcon = ({ color = 'currentColor' }: IconProps) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='20'
		height='20'
		fill='none'
		stroke={color}
		strokeLinecap='round'
		strokeLinejoin='round'
		strokeWidth='2'
		viewBox='0 0 24 24'
	>
		<circle cx='12' cy='7' r='4' />
		<path d='M3 21v-2a7 7 0 0 1 14 0v2' />
	</svg>
);
