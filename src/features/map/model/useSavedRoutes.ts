import { useState, useEffect, useCallback } from 'react';
import {
	collection,
	query,
	where,
	addDoc,
	deleteDoc,
	doc,
	onSnapshot,
} from 'firebase/firestore';
import type { LatLngTuple } from 'leaflet';
import { db } from '../../../shared/config/firebase';
import type { RouteResult } from '../../../shared/api/ors';

export interface SavedRoute {
	id: string;
	from: LatLngTuple;
	to: LatLngTuple;
	waypoints: LatLngTuple[];
	distance: number;
	duration: number;
	coordinates: LatLngTuple[];
	createdAt: number;
	isRecorded: boolean;
}

export const useSavedRoutes = (userId: string | null | undefined) => {
	const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);

	useEffect(() => {
		if (userId === undefined) return; // auth still resolving
		if (!userId) {
			setSavedRoutes([]);
			return;
		}
		const q = query(
			collection(db, 'savedRoutes'),
			where('userId', '==', userId),
		);
		return onSnapshot(
			q,
			(snapshot) => {
				const routes = snapshot.docs
					.map((d) => {
						const data = d.data();
						return {
							id: d.id,
							from: data.from as LatLngTuple,
							to: data.to as LatLngTuple,
							waypoints: JSON.parse(data.waypoints) as LatLngTuple[],
							distance: data.distance as number,
							duration: data.duration as number,
							coordinates: JSON.parse(data.coordinates) as LatLngTuple[],
							createdAt: data.createdAt as number,
							isRecorded: (data.isRecorded as boolean | undefined) ?? false,
						} satisfies SavedRoute;
					})
					.sort((a, b) => b.createdAt - a.createdAt);
				setSavedRoutes(routes);
			},
			(err) => console.error('savedRoutes snapshot error:', err),
		);
	}, [userId]);

	const saveRoute = useCallback(
		async (route: RouteResult, from: LatLngTuple, to: LatLngTuple, waypoints: LatLngTuple[], isRecorded = false) => {
			if (!userId) return;
			await addDoc(collection(db, 'savedRoutes'), {
				userId,
				from,
				to,
				waypoints: JSON.stringify(waypoints),
				distance: route.distance,
				duration: route.duration,
				coordinates: JSON.stringify(route.coordinates),
				createdAt: Date.now(),
				isRecorded,
			});
		},
		[userId],
	);

	const deleteRoute = useCallback(async (id: string) => {
		await deleteDoc(doc(db, 'savedRoutes', id));
	}, []);

	return { savedRoutes, saveRoute, deleteRoute };
};
