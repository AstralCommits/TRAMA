import { useCallback, useEffect, useMemo, useState } from 'react';

type ListFilterOptions<Item> = {
	items: readonly Item[];

	searchText?: (item: Item) => string;

	categoryOf?: (item: Item) => string | readonly string[];

	pageSize?: number;
};

const normalize = (value: string) => value
	.normalize('NFD')
	.replace(/\p{Diacritic}/gu, '')
	.toLocaleLowerCase()
	.trim();

const toList = (value: string | readonly string[]) => (typeof value === 'string' ? [value] : value);

export function useListFilter<Item>({ items, searchText, categoryOf, pageSize }: ListFilterOptions<Item>) {
	const [query, setQuery] = useState('');
	const [category, setCategory] = useState<string | null>(null);
	const [page, setPage] = useState(1);

	const categories = useMemo(() => {
		if (!categoryOf) {
			return [];
		}

		return [...new Set(items.flatMap(item => toList(categoryOf(item))))];
	}, [items, categoryOf]);

	const needle = normalize(query);

	const matches = useMemo(() => items.filter((item) => {
		if (category && categoryOf && !toList(categoryOf(item)).includes(category)) {
			return false;
		}

		if (needle && searchText && !normalize(searchText(item)).includes(needle)) {
			return false;
		}

		return true;
	}), [items, category, categoryOf, needle, searchText]);

	const pageCount = pageSize ? Math.max(1, Math.ceil(matches.length / pageSize)) : 1;
	const currentPage = Math.min(page, pageCount);
	const results = pageSize ? matches.slice((currentPage - 1) * pageSize, currentPage * pageSize) : matches;

	useEffect(() => {
		setPage(1);
	}, [needle, category]);

	const reset = useCallback(() => {
		setQuery('');
		setCategory(null);
		setPage(1);
	}, []);

	return {
		query,
		setQuery,
		category,
		setCategory,
		categories,
		matches,
		results,
		isFiltered: Boolean(needle || category),
		page: currentPage,
		pageCount,
		setPage,
		reset,
	};
}
