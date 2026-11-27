import axios from 'axios';
import { clearApiToken, getApiToken, SESSION_EXPIRED_EVENT } from '@/services/apiToken';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getApiToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearApiToken();
      if (typeof window !== 'undefined') window.dispatchEvent?.(new Event(SESSION_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  },
);

export function isApiConfigured(): boolean {
  return Boolean(import.meta.env.VITE_API_URL?.trim());
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string; error?: string; detail?: string; errors?: Record<string, string> }>(error)) {
    const campos = Object.values(error.response?.data?.errors ?? {});
    if (campos.length) return campos.join(' ');
    if (error.response?.data?.detail) return error.response.data.detail;
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.error) return error.response.data.error;
    if (error.response) {
      return `O servidor respondeu com o status ${error.response.status}.`;
    }
    if (error.code === 'ECONNABORTED') {
      return 'A solicitação demorou demais. Tente novamente.';
    }
    return 'Não foi possível conectar à API. Verifique se o backend está em execução.';
  }
  return 'Ocorreu um erro inesperado ao buscar os dados.';
}
