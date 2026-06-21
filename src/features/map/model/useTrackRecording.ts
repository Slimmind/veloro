import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { LatLngTuple } from 'leaflet';

export type TrackStatus = 'idle' | 'recording' | 'paused' | 'stopped';

function haversine(p1: LatLngTuple, p2: LatLngTuple): number {
	const R = 6371000;
	const toRad = (d: number) => (d * Math.PI) / 180;
	const lat1 = toRad(p1[0]);
	const lat2 = toRad(p2[0]);
	const dlat = lat2 - lat1;
	const dlng = toRad(p2[1] - p1[1]);
	const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlng / 2) ** 2;
	return R * 2 * Math.asin(Math.sqrt(a));
}

export function useTrackRecording(currentPosition: LatLngTuple | null) {
	const [status, setStatus] = useState<TrackStatus>('idle');
	const [elapsed, setElapsed] = useState(0);
	const [trackPoints, setTrackPoints] = useState<LatLngTuple[]>([]);
	const lastPosRef = useRef<LatLngTuple | null>(null);

	useEffect(() => {
		if (status !== 'recording') return;
		const id = setInterval(() => setElapsed((e) => e + 1), 1000);
		return () => clearInterval(id);
	}, [status]);

	useEffect(() => {
		if (status !== 'recording' || !currentPosition) return;
		const last = lastPosRef.current;
		if (last?.[0] === currentPosition[0] && last?.[1] === currentPosition[1]) return;
		lastPosRef.current = currentPosition;
		setTrackPoints((prev) => [...prev, currentPosition]);
	}, [currentPosition, status]);

	const distance = useMemo(() => {
		let total = 0;
		for (let i = 1; i < trackPoints.length; i++) {
			total += haversine(trackPoints[i - 1], trackPoints[i]);
		}
		return total;
	}, [trackPoints]);

	const start = useCallback(() => {
		lastPosRef.current = null;
		setStatus('recording');
		setElapsed(0);
		setTrackPoints([]);
	}, []);

	const pause = useCallback(() => setStatus('paused'), []);
	const resume = useCallback(() => setStatus('recording'), []);
	const stop = useCallback(() => setStatus('stopped'), []);

	const clear = useCallback(() => {
		setStatus('idle');
		setTrackPoints([]);
		setElapsed(0);
		lastPosRef.current = null;
	}, []);

	return { status, elapsed, distance, trackPoints, start, pause, resume, stop, clear };
}
