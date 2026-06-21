type IconProps = {
	color?: string;
	size?: string;
};

export const RecordIcon = ({ color = 'var(--color-violet)', size = '24' }: IconProps) => (
	<svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 24 24' fill='none'>
		<circle cx='12' cy='12' r='10' stroke={color} strokeWidth='2' />
		<circle cx='12' cy='12' r='5' fill={color} />
	</svg>
);
