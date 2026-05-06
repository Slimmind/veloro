type IconProps = {
  color?: string;
}

export const RouteIcon = ({ color = "#fff" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    fill="none"
    viewBox="0 0 16 16">
    <path fill={color} d="M5 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0M15 13a2 2 0 1 1-4 0 2 2 0 0 1 4 0M9 4.5a1.5 1.5 0 1 1 3 0V9h2V4.5a3.5 3.5 0 1 0-7 0v7a1.5 1.5 0 0 1-3 0V7H2v4.5a3.5 3.5 0 1 0 7 0z" />
  </svg>
); 