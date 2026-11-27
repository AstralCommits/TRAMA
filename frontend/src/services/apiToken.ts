const TOKEN_KEY = 'trama:api-token:v1';

export const SESSION_EXPIRED_EVENT = 'trama:sessao-expirada';

export type ApiClaims = {
  sub: string;
  perfil: 'ADMIN' | 'EMPRESARIO';
  idConfeccao?: number | null;
  exp: number;
};

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function getApiToken(): string | null {
  try {
    return storage()?.getItem(TOKEN_KEY) ?? null;
  } catch {
    return null;
  }
}

export function setApiToken(token: string) {
  try {
    storage()?.setItem(TOKEN_KEY, token);
  } catch {
    /* sem armazenamento disponível: o token vale só para esta página */
  }
}

export function clearApiToken() {
  try {
    storage()?.removeItem(TOKEN_KEY);
  } catch {
    /* nada a limpar */
  }
}

export function readApiClaims(token: string | null = getApiToken()): ApiClaims | null {
  const payload = token?.split('.')[1];
  if (!payload) return null;
  try {
    const bytes = Uint8Array.from(atob(payload.replace(/-/g, '+').replace(/_/g, '/')), (char) => char.charCodeAt(0));
    const claims = JSON.parse(new TextDecoder().decode(bytes)) as ApiClaims;
    return claims?.sub && claims.perfil && claims.exp ? claims : null;
  } catch {
    return null;
  }
}

export function hasValidApiToken(now: number = Date.now()): boolean {
  const claims = readApiClaims();
  return claims !== null && claims.exp * 1000 > now;
}
