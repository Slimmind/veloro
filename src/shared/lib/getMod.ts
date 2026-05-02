export const getMod = (baseClass: string, mod?: string): string => {
	return mod
		? mod
				.split(' ')
				.map((item) => `${baseClass}--${item}`)
				.join(' ')
		: '';
};

