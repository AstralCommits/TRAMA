
let accessToken: string | null = null;
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export class ApiError extends Error {
  constructor(message: string, public status: number, public payload?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}
export function clearAccessToken() {
  accessToken = null;
}
export function getApiBaseUrl() {
  return apiBaseUrl;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!apiBaseUrl) throw new ApiError('API não configurada. Defina VITE_API_BASE_URL.', 0);
  const headers = new Headers(init.headers);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`, {
      ...init, headers, credentials: 'include',
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique a API e sua conexão.', 0);
  }
  const contentType = response.headers.get('content-type') ?? '';
  const payload: unknown = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '');
  if (response.status === 401) {
    clearAccessToken();
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('trama:unauthorized'));
    throw new ApiError('Sua sessão expirou ou não é válida. Entre novamente.', 401, payload);
  }
  if (response.status === 403) throw new ApiError('Você não tem permissão para realizar esta operação.', 403, payload);
  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'message' in payload
      ? String((payload as { message: unknown }).message)
      : `A API retornou o erro ${response.status}.`;
    throw new ApiError(message, response.status, payload);
  }
  return payload as T;
}
