const TOKEN_KEY = 'trama:api-token:v1';

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
