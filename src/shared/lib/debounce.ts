export const debounce = <Args extends readonly unknown[], R>(
	fn: (...args: Args) => R,
	delay: number,
) => {
	let timeout: ReturnType<typeof setTimeout>;
	return (...args: Args) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => fn(...args), delay);
	};
};

