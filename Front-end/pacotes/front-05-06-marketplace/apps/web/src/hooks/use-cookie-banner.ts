import { useCallback, useEffect, useState } from 'react';
import {
	acceptAllCookies,
	CookieConsentCategory,
	hasConsentDecision,
	isConsentGranted,
	onCookiePreferencesRequested,
	rejectOptionalCookies,
	saveConsent,
} from '@/lib/cookie-consent';

export type CookieChoices = {
	analytics: boolean;
	marketing: boolean;
	platformAnalytics: boolean;
};

const NO_OPTIONAL_COOKIES: CookieChoices = {
	analytics: false,
	marketing: false,
	platformAnalytics: false,
};

const grantedChoices = (): CookieChoices => ({
	analytics: isConsentGranted(CookieConsentCategory.Analytics),
	marketing: isConsentGranted(CookieConsentCategory.Marketing),
	platformAnalytics: isConsentGranted(CookieConsentCategory.PlatformAnalytics),
});

export function useCookieBanner() {
	const [isOpen, setIsOpen] = useState(false);
	const [isCustomizing, setIsCustomizing] = useState(false);
	const [choices, setChoices] = useState<CookieChoices>(NO_OPTIONAL_COOKIES);

	useEffect(() => {
		setIsOpen(!hasConsentDecision());

		return onCookiePreferencesRequested(() => {
			setChoices(grantedChoices());
			setIsCustomizing(true);
			setIsOpen(true);
		});
	}, []);

	const finish = useCallback((save: () => void) => {
		save();
		setIsCustomizing(false);
		setIsOpen(false);
	}, []);

	const setChoice = useCallback((category: keyof CookieChoices, isGranted: boolean) => {
		setChoices(current => ({ ...current, [category]: isGranted }));
	}, []);

	const customize = useCallback(() => {
		setChoices(grantedChoices());
		setIsCustomizing(true);
	}, []);

	const acceptAll = useCallback(() => finish(acceptAllCookies), [finish]);
	const rejectOptional = useCallback(() => finish(rejectOptionalCookies), [finish]);
	const saveChoices = useCallback(() => finish(() => saveConsent(choices)), [finish, choices]);

	return {
		isOpen,
		isCustomizing,
		choices,
		setChoice,
		customize,
		acceptAll,
		rejectOptional,
		saveChoices,
	};
}
