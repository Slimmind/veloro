import type { TrackStatus } from '../model/useTrackRecording';
import { CrossIcon } from '../../../icons/cross-icon';
import { SaveIcon } from '../../../icons/save-icon';
import './tracking-panel.styles.css';

function formatTime(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	const pad = (n: number) => String(n).padStart(2, '0');
	return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function formatDistance(meters: number): string {
	if (meters < 1000) return `${Math.round(meters)} м`;
	return `${(meters / 1000).toFixed(2)} км`;
}

interface TrackingPanelProps {
	status: TrackStatus;
	elapsed: number;
	distance: number;
	onPause: () => void;
	onResume: () => void;
	onStop: () => void;
	onClear: () => void;
	onSave?: () => void;
}

export const TrackingPanel = ({
	status,
	elapsed,
	distance,
	onPause,
	onResume,
	onStop,
	onClear,
	onSave,
}: TrackingPanelProps) => {
	if (status === 'idle') return null;

	const statusLabel =
		status === 'recording' ? 'Запись' : status === 'paused' ? 'Пауза' : 'Остановлено';

	return (
		<div className='tracking-panel'>
			<div className='tracking-panel__indicator'>
				<span className={`tracking-panel__dot ${status === 'recording' ? 'tracking-panel__dot--active' : ''}`} />
				<span className='tracking-panel__label'>{statusLabel}</span>
			</div>
			<div className='tracking-panel__stats'>
				<span className='tracking-panel__time'>{formatTime(elapsed)}</span>
				<span className='tracking-panel__distance'>{formatDistance(distance)}</span>
			</div>
			<div className='tracking-panel__controls'>
				{status !== 'stopped' ? (
					<>
						{status === 'recording' ? (
							<button type='button' className='tracking-panel__btn' onClick={onPause}>
								Пауза
							</button>
						) : (
							<button type='button' className='tracking-panel__btn' onClick={onResume}>
								Продолжить
							</button>
						)}
						<button
							type='button'
							className='tracking-panel__btn tracking-panel__btn--stop'
							onClick={onStop}
						>
							Стоп
						</button>
					</>
				) : (
					<>
						<button
							type='button'
							className='tracking-panel__btn tracking-panel__btn--icon'
							onClick={onClear}
							aria-label='Удалить запись'
							title='Удалить запись'
						>
							<CrossIcon size='16' />
						</button>
						{onSave && (
							<button
								type='button'
								className='tracking-panel__btn tracking-panel__btn--icon'
								onClick={onSave}
								aria-label='Сохранить трек'
								title='Сохранить трек'
							>
								<SaveIcon size='20' />
							</button>
						)}
					</>
				)}
			</div>
		</div>
	);
};
