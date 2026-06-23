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
	// Wall-clock timestamp of the current recording segment start (null when paused/stopped)
	const startedAtRef = useRef<number | null>(null);
	// Milliseconds accumulated in previous segments (before pauses)
	const accumulatedRef = useRef<number>(0);

	useEffect(() => {
		if (status !== 'recording') return;

		const update = () => {
			if (startedAtRef.current !== null) {
				setElapsed(Math.floor((accumulatedRef.current + (Date.now() - startedAtRef.current)) / 1000));
			}
		};

		const id = setInterval(update, 1000);
		// Catch up immediately when the user returns after screen lock / app switch
		document.addEventListener('visibilitychange', update);

		return () => {
			clearInterval(id);
			document.removeEventListener('visibilitychange', update);
		};
	}, [status]);

	useEffect(() => {
		if (status !== 'recording' || !currentPosition) return;
		const last = lastPosRef.current;
		if (last !== null && haversine(last, currentPosition) < 3) return;
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
		startedAtRef.current = Date.now();
		accumulatedRef.current = 0;
		setStatus('recording');
		setElapsed(0);
		setTrackPoints([]);
	}, []);

	const pause = useCallback(() => {
		if (startedAtRef.current !== null) {
			accumulatedRef.current += Date.now() - startedAtRef.current;
			startedAtRef.current = null;
		}
		setStatus('paused');
	}, []);

	const resume = useCallback(() => {
		startedAtRef.current = Date.now();
		setStatus('recording');
	}, []);

	const stop = useCallback(() => {
		if (startedAtRef.current !== null) {
			const totalMs = accumulatedRef.current + (Date.now() - startedAtRef.current);
			accumulatedRef.current = totalMs;
			startedAtRef.current = null;
			setElapsed(Math.floor(totalMs / 1000));
		}
		setStatus('stopped');
	}, []);

	const clear = useCallback(() => {
		startedAtRef.current = null;
		accumulatedRef.current = 0;
		lastPosRef.current = null;
		setStatus('idle');
		setTrackPoints([]);
		setElapsed(0);
	}, []);

	return { status, elapsed, distance, trackPoints, start, pause, resume, stop, clear };
}
