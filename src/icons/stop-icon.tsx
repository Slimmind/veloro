type IconProps = {
	color?: string;
	size?: string;
};

export const StopIcon = ({ color = 'currentColor', size = '16' }: IconProps) => (
	<svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 24 24' fill={color}>
		<rect x='4' y='4' width='16' height='16' rx='2' />
	</svg>
);
