import axios from 'axios';

const TOKEN_KEY = 'trama:access-token:v1';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 15_000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.sessionStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && typeof window !== 'undefined') {
      const requestUrl = String(error.config?.url || '');
      const tokenExists = Boolean(window.sessionStorage.getItem(TOKEN_KEY));
      const isPublicAuthRequest = requestUrl.includes('/api/auth/login') || requestUrl.includes('/api/auth/register');
      if (tokenExists && !isPublicAuthRequest) {
        window.sessionStorage.removeItem(TOKEN_KEY);
        window.dispatchEvent(new Event('trama:auth-expired'));
      }
    }
    return Promise.reject(error);
  },
);

export function saveAccessToken(token: string) {
  if (typeof window !== 'undefined') window.sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  if (typeof window !== 'undefined') window.sessionStorage.removeItem(TOKEN_KEY);
}

export function hasAccessToken(): boolean {
  return typeof window !== 'undefined' && Boolean(window.sessionStorage.getItem(TOKEN_KEY));
}

type ApiErrorPayload = {
  detail?: unknown;
  message?: unknown;
  error?: unknown;
  errors?: unknown;
};

function readableMessage(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    const messages = value.map(readableMessage).filter((item): item is string => Boolean(item));
    return messages.length ? messages.join(' ') : undefined;
  }
  if (value && typeof value === 'object') {
    const messages = Object.values(value).map(readableMessage).filter((item): item is string => Boolean(item));
    return messages.length ? messages.join(' ') : undefined;
  }
  return undefined;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const data = error.response?.data;
    const serverMessage = data
      ? readableMessage(data.detail) || readableMessage(data.message) || readableMessage(data.error) || readableMessage(data.errors)
      : undefined;
    if (serverMessage) return serverMessage;

    if (error.code === 'ERR_CANCELED') return 'A solicitação foi cancelada.';
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'A solicitação demorou demais. Confira sua conexão e tente novamente.';
    }

    const status = error.response?.status;
    switch (status) {
      case 400:
      case 422:
        return 'Confira os dados informados e corrija os campos destacados.';
      case 401:
        return 'Sua sessão expirou ou não é válida. Entre novamente para continuar.';
      case 403:
        return 'Você não tem permissão para realizar esta ação.';
      case 404:
        return 'O registro ou recurso solicitado não foi encontrado.';
      case 409:
        return 'Este registro já existe ou entrou em conflito com uma alteração. Atualize a tela e confira os dados.';
      case 413:
        return 'O arquivo enviado é maior que o limite permitido.';
      case 429:
        return 'Muitas solicitações foram feitas em pouco tempo. Aguarde um pouco e tente novamente.';
      default:
        if (typeof status === 'number' && status >= 500) {
          return 'O servidor encontrou um problema. Tente novamente mais tarde.';
        }
        if (error.response) return `O servidor respondeu com o status ${status ?? 'desconhecido'}.`;
        return 'Não foi possível conectar à API. Verifique se o Back-end está em execução e se sua conexão está ativa.';
    }
  }
  return error instanceof Error && error.message.trim()
    ? error.message
    : 'Ocorreu um erro inesperado ao acessar o servidor.';
}
