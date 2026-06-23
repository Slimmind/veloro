type IconProps = {
	color?: string;
	size?: string;
};

export const PlayIcon = ({ color = 'currentColor', size = '16' }: IconProps) => (
	<svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 24 24' fill={color}>
		<polygon points='5,3 19,12 5,21' />
	</svg>
);
