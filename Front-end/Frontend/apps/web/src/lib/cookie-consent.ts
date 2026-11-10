export enum CookieConsentCategory {
  Analytics = "analytics",
  Marketing = "marketing",
  PlatformAnalytics = "platformAnalytics",
}

export type CookieChoices = {
  analytics: boolean;
  marketing: boolean;
  platformAnalytics: boolean;
};

const STORAGE_KEY = "trama-cookie-consent-v1";

type StoredConsent = CookieChoices & {
  version: 1;
  decidedAt: string;
};

const preferenceListeners = new Set<() => void>();

function readConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const value: unknown = JSON.parse(saved);

    if (!value || typeof value !== "object") return null;

    const consent = value as Partial<StoredConsent>;

    if (
      consent.version !== 1 ||
      typeof consent.analytics !== "boolean" ||
      typeof consent.marketing !== "boolean" ||
      typeof consent.platformAnalytics !== "boolean"
    ) {
      return null;
    }

    return consent as StoredConsent;
  } catch {
    return null;
  }
}

export function hasConsentDecision(): boolean {
  return readConsent() !== null;
}

export function isConsentGranted(
  category: CookieConsentCategory
): boolean {
  return readConsent()?.[category] ?? false;
}

export function saveConsent(choices: CookieChoices): void {
  if (typeof window === "undefined") return;

  const consent: StoredConsent = {
    ...choices,
    version: 1,
    decidedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(consent)
    );
  } catch {
    // O armazenamento pode estar indisponível no navegador.
  }
}

export function acceptAllCookies(): void {
  saveConsent({
    analytics: true,
    marketing: true,
    platformAnalytics: true,
  });
}

export function rejectOptionalCookies(): void {
  saveConsent({
    analytics: false,
    marketing: false,
    platformAnalytics: false,
  });
}

export function onCookiePreferencesRequested(
  callback: () => void
): () => void {
  preferenceListeners.add(callback);

  return () => {
    preferenceListeners.delete(callback);
  };
}

export function openCookiePreferences(): void {
  preferenceListeners.forEach((callback) => callback());
}
