

const digitsOnly = (value: string) => value.replace(/\D/g, '');

export const telHref = (phone: string): string => {
	const isInternational = phone.trim().startsWith('+');

	return `tel:${isInternational ? '+' : ''}${digitsOnly(phone)}`;
};

export const mailtoHref = ({ email, subject, body }: { email: string; subject?: string; body?: string }): string => {
	const params = [
		subject && `subject=${encodeURIComponent(subject)}`,
		body && `body=${encodeURIComponent(body)}`,
	].filter(Boolean);

	return `mailto:${email}${params.length ? `?${params.join('&')}` : ''}`;
};

export const whatsappUrl = ({ phone, text }: { phone: string; text?: string }): string =>
	`https://wa.me/${digitsOnly(phone)}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const mapsUrl = ({ query }: { query: string }): string =>
	`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
