import type { BikePath } from '../../../entities/bikePath';

// Module-level store — persists for the entire app session regardless of component lifecycle
const pathsById = new Map<string, BikePath>();
const listeners = new Set<() => void>();

let snapshot: BikePath[] = [];

const notifyListeners = () => {
	snapshot = [...pathsById.values()];
	listeners.forEach((fn) => fn());
};

export const bikePathsStore = {
	addPaths(newPaths: BikePath[]) {
		let changed = false;
		for (const path of newPaths) {
			if (!pathsById.has(path.id)) {
				pathsById.set(path.id, path);
				changed = true;
			}
		}
		if (changed) notifyListeners();
	},
	subscribe(fn: () => void) {
		listeners.add(fn);
		return () => {
			listeners.delete(fn);
		};
	},
	getSnapshot(): BikePath[] {
		return snapshot;
	},
};
