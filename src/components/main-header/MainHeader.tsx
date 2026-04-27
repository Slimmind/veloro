// src/components/main-header/MainHeader.tsx

import { useState, useRef, useEffect } from 'react';
import './main-header.styles.css';
import type { LatLngTuple } from 'leaflet';
import Button from '../button';

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

	// Закрытие выпадающего списка при клике вне
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

	return (
		<header className='main-header'>
			<form onSubmit={handleSubmit} className='search-form' ref={dropdownRef}>
				<input
					name='path'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onFocus={() => searchResults.length > 0 && setShowResults(true)}
					placeholder='Поиск места...'
					className='search-input'
					autoComplete='off'
				/>

				<Button
					type='submit'
					mod='circle search'
					disabled={searchLoading}
					aria-label='Найти'
				>
					{searchLoading && <span className='spinner-mini' />}
				</Button>

				{/* 🔽 Выпадающий список результатов */}
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
								<span className='result-icon'>📍</span>
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
