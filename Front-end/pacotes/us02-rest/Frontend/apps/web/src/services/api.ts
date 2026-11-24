import axios from 'axios';
import { getAccessToken } from '@/lib/auth.client';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.trim() || 'http://localhost:8080',
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string; error?: string }>(error)) {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.error) return error.response.data.error;
    if (error.response) return `O servidor respondeu com o status ${error.response.status}.`;
    if (error.code === 'ECONNABORTED') return 'A solicitação demorou demais. Tente novamente.';
    if (error.code === 'ERR_CANCELED') return 'A solicitação foi cancelada.';
    return 'Não foi possível conectar à API. Verifique se o backend está em execução.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Ocorreu um erro inesperado ao comunicar com a API.';
}
