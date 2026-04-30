import { useEffect, useRef, useState } from 'react';
import type { LatLngTuple } from 'leaflet';
import { Button } from '../../../shared/ui/button';
import { BikeLegend } from '../../map/ui/BikeLegend';
import './main-header.styles.css';
import { PinIcon } from '../../../icons/pin-icon';

interface MainHeaderProps {
	onSearchSelect: (result: { name: string; position: LatLngTuple }) => void;
	onSearch: (query: string) => Promise<void>;
	searchLoading?: boolean;
	searchResults?: Array<{ name: string; position: LatLngTuple }>;
	searchError?: string | null;
}

export const MainHeader = ({
	onSearchSelect,
	onSearch,
	searchLoading = false,
	searchResults = [],
	searchError = null,
}: MainHeaderProps) => {
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [showResults, setShowResults] = useState(false);
	const dropdownRef = useRef<HTMLFormElement>(null);

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
		onSearchSelect(result);
	};

	const clearInput = () => {
		setSearchQuery('');
	};

	return (
		<header className='main-header'>
			<BikeLegend />
			<form onSubmit={handleSubmit} className='search-form' ref={dropdownRef}>
				<div className='input-wrap'>
					<input
						name='path'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onFocus={() => searchResults.length > 0 && setShowResults(true)}
						placeholder='Поиск...'
						className='search-input'
						autoComplete='off'
					/>
					{searchQuery && (
						<Button mod='circle cross' onClick={clearInput}></Button>
					)}
				</div>

				<Button
					type='submit'
					mod='circle icon search'
					disabled={searchLoading}
					aria-label='Найти'
				>
					{searchLoading && <span className='spinner-mini' />}
				</Button>

				{showResults && (searchResults.length > 0 || searchError) && (
					<div className='search-results-dropdown'>
						{searchError && <div className='search-error'>{searchError}</div>}

						{searchResults.map((result, index) => (
							<button
								key={index}
								type='button'
								className='search-result-item'
								onClick={() => handleSelect(result)}
							>
								<span className='result-icon'>
									<PinIcon />
								</span>
								<span className='result-name'>{result.name}</span>
							</button>
						))}

						{searchResults.length === 0 &&
							!searchError &&
							searchQuery.trim() && (
								<div className='search-no-results'>Ничего не найдено</div>
							)}
					</div>
				)}
			</form>
		</header>
	);
};
