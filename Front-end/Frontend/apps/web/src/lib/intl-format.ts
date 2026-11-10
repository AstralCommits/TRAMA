

type DateInput = Date | string | number;

type LocaleOption = {

	locale: string;
};

type DateOptions = LocaleOption & Intl.DateTimeFormatOptions & {

	timeZone?: string;
};

const toDate = (value: DateInput) => (value instanceof Date ? value : new Date(value));

const dateFormatter = (
	{ locale, timeZone = 'UTC', ...options }: DateOptions,
	fallback: Intl.DateTimeFormatOptions,
) => new Intl.DateTimeFormat(locale, { timeZone, ...(Object.keys(options).length ? options : fallback) });

export const formatNumber = (
	value: number,
	{ locale, ...options }: LocaleOption & Intl.NumberFormatOptions,
): string => new Intl.NumberFormat(locale, options).format(value);

export const formatMoney = (
	amount: number,
	{ locale, currency, ...options }: LocaleOption & { currency: string } & Intl.NumberFormatOptions,
): string => new Intl.NumberFormat(locale, { style: 'currency', currency, ...options }).format(amount);

export const formatDate = (value: DateInput, options: DateOptions): string =>
	dateFormatter(options, { dateStyle: 'long' }).format(toDate(value));

export const formatTime = (value: DateInput, options: DateOptions): string =>
	dateFormatter(options, { timeStyle: 'short' }).format(toDate(value));

export const formatDateRange = (start: DateInput, end: DateInput, options: DateOptions): string =>
	dateFormatter(options, { dateStyle: 'long' }).formatRange(toDate(start), toDate(end));
