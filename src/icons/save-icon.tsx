type IconProps = {
  color?: string;
  size?: string;
};

export const SaveIcon = ({ color = "var(--color-white)", size = "32" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24"><path stroke={color} stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 0 1 2-2h8.172a2 2 0 0 1 1.414.586l3.828 3.828A2 2 0 0 1 20 9.828V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><path stroke={color} stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4h5v3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1zM7 15a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5H7z" /></svg>
);