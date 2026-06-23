import { useEffect, useRef, useState } from 'react';
import type { LatLngTuple } from 'leaflet';
import type { MapStyleKey } from '../../map/model/map-styles';
import type { SearchResult } from '../../../entities/search';
import type { SavedRoute } from '../../map/model/useSavedRoutes';
import { Button } from '../../../shared/ui/button';
import { BikeLegend } from '../../../shared/ui/bike-legend/BikeLegend';
import { MainMenu } from './MainMenu';
import { PinIcon } from '../../../icons/pin-icon';
import { HistoryIcon } from '../../../icons/history-icon';
import { Auth } from '../../auth/ui/Auth';
import { haversine } from '../../../shared/lib/haversine';
import { formatDistance } from '../../../shared/lib/formatDistance';
import './main-header.styles.css';

interface MainHeaderProps {
	onSearch: (query: string) => Promise<void>;
	onDirectionClick: (result: SearchResult) => void;
	searchLoading?: boolean;
	searchResults?: SearchResult[];
	searchError?: string | null;
	routeError?: string | null;
	onRouteDismiss?: () => void;
	routeHistory?: SearchResult[];
	activeStyle: MapStyleKey;
	onStyleChange: (style: MapStyleKey) => void;
	userPosition?: LatLngTuple | null;
	savedRoutes?: SavedRoute[];
	onDeleteSavedRoute?: (id: string) => void;
	onSelectSavedRoute?: (route: SavedRoute) => void;
}


export const MainHeader = ({
	onSearch,
	onDirectionClick,
	searchLoading = false,
	searchResults = [],
	searchError = null,
	routeError = null,
	onRouteDismiss,
	routeHistory = [],
	activeStyle,
	onStyleChange,
	userPosition = null,
	savedRoutes = [],
	onDeleteSavedRoute,
	onSelectSavedRoute,
}: MainHeaderProps) => {
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [showResults, setShowResults] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [authOpen, setAuthOpen] = useState(false);
	const [legendVisible, setLegendVisible] = useState(true);
	const dropdownRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => setLegendVisible(false), 10000);
		return () => window.clearTimeout(timeoutId);
	}, []);

	const handleMenuToggle = () => {
		if (!menuOpen) setLegendVisible(false);
		setMenuOpen((prev) => !prev);
	};

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setShowResults(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			await onSearch(searchQuery);
			setShowResults(true);
		}
	};

	const handleSelect = (result: { name: string; position: LatLngTuple }) => {
		setSearchQuery(result.name);
		setShowResults(false);
		onDirectionClick(result);
	};

	const clearInput = () => {
		setSearchQuery('');
	};

	return (
		<header className='main-header'>
			<MainMenu
				open={menuOpen}
				onToggle={handleMenuToggle}
				activeStyle={activeStyle}
				onStyleChange={(style) => { onStyleChange(style); setMenuOpen(false); }}
				savedRoutes={savedRoutes}
				onDeleteSavedRoute={onDeleteSavedRoute}
				onSelectSavedRoute={onSelectSavedRoute}
			/>
			{legendVisible && !menuOpen && (
				<div className='bike-legend-panel'>
					<BikeLegend isSatellite={activeStyle === 'satellite'} />
				</div>
			)}
			<form onSubmit={handleSubmit} className='search-form' ref={dropdownRef}>
				<div className='input-wrap'>
					<input
						name='path'
						value={searchQuery}
						onChange={(e) => {
							const value = e.target.value;
							setSearchQuery(value);
							if (!value && routeHistory.length > 0) {
								setShowResults(true);
							} else if (value) {
								setShowResults(false);
							}
						}}
						onFocus={() =>
							(searchResults.length > 0 ||
								(!searchQuery && routeHistory.length > 0)) &&
							setShowResults(true)
						}
						placeholder='Поиск...'
						className='search-input'
						autoComplete='off'
					/>
					{searchQuery && (
						<Button mod='circle clear cross' onClick={clearInput}></Button>
					)}
				</div>

				<Button
					type='submit'
					mod='circle clear icon search'
					disabled={searchLoading}
					aria-label='Найти'
				>
					{searchLoading && <span className='spinner-mini' />}
				</Button>

				{showResults &&
					(searchResults.length > 0 ||
						searchError ||
						(!searchQuery && routeHistory.length > 0)) && (
						<div className='search-results-dropdown'>
							{searchQuery ? (
								<>
									{searchError && (
										<div className='search-error'>{searchError}</div>
									)}
									<ul>
										{(userPosition
											? [...searchResults].sort(
												(a, b) =>
													haversine(userPosition, a.position) -
													haversine(userPosition, b.position),
											)
											: searchResults
										).map((result, index) => (
											<li key={index} className='search-result-item-wrapper'>
												<button
													className='search-result-item'
													type='button'
													onClick={() => handleSelect(result)}
												>
													<span className='result-icon'>
														<PinIcon />
													</span>
													<span className='result-name'>{result.name}</span>
													{userPosition && (
														<span className='result-distance'>
															{formatDistance(
																haversine(
																	userPosition,
																	result.position,
																),
															)}
														</span>
													)}
												</button>
											</li>
										))}
									</ul>
									{searchResults.length === 0 &&
										!searchError &&
										searchQuery.trim() && (
											<div className='search-no-results'>Ничего не найдено</div>
										)}
								</>
							) : (
								routeHistory.length > 0 && (
									<>
										<h5 className='history-label'>Недавние маршруты</h5>
										<ul>
											{routeHistory.map((result, index) => (
												<li key={index} className='search-result-item-wrapper'>
													<button
														className='search-result-item'
														type='button'
														onClick={() => handleSelect(result)}
													>
														<span className='result-icon'>
															<HistoryIcon />
														</span>
														<span className='result-name'>{result.name}</span>
														{userPosition && (
															<span className='result-distance'>
																{formatDistance(
																	haversine(
																		userPosition,
																		result.position,
																	),
																)}
															</span>
														)}
													</button>
												</li>
											))}
										</ul>
									</>
								)
							)}
						</div>
					)}
			</form>
			<Auth open={authOpen} onToggle={() => setAuthOpen((p) => !p)} />
			{routeError && (
				<div className='route-error' role='alert'>
					<span>{routeError}</span>
					{onRouteDismiss && (
						<Button
							mod='circle cross error'
							onClick={onRouteDismiss}
							aria-label='Закрыть'
						/>
					)}
				</div>
			)}
		</header>
	);
};
