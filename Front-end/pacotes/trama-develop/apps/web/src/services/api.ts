import axios from 'axios';
import { clearAccessToken, getAccessToken } from '@/lib/auth-token.client';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 15_000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        clearAccessToken();
        window.dispatchEvent(new CustomEvent('trama:session-expired'));
      } else if (error.response?.status === 403) {
        window.dispatchEvent(new CustomEvent('trama:access-denied'));
      }
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string; error?: string; detail?: string }>(error)) {
    const body = error.response?.data;
    if (body?.message) return body.message;
    if (body?.detail) return body.detail;
    if (body?.error) return body.error;
    if (error.response?.status === 401) return 'Sua sessão terminou. Entre novamente.';
    if (error.response?.status === 403) return 'Você não tem permissão para realizar esta ação.';
    if (error.response) return `O servidor respondeu com o status ${error.response.status}.`;
    if (error.code === 'ECONNABORTED') return 'A solicitação demorou demais. Tente novamente.';
    return 'Não foi possível conectar à API. Verifique se o Back-end está em execução.';
  }
  return 'Ocorreu um erro inesperado ao buscar os dados.';
}
