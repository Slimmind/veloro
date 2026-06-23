type IconProps = {
	color?: string;
	size?: string;
};

export const PauseIcon = ({ color = 'currentColor', size = '16' }: IconProps) => (
	<svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 24 24' fill={color}>
		<rect x='5' y='4' width='4' height='16' rx='1' />
		<rect x='15' y='4' width='4' height='16' rx='1' />
	</svg>
);
