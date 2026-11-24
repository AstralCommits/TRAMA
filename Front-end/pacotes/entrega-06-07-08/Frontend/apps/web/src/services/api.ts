import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 15_000,
  withCredentials: true,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string; error?: string }>(error)) {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.error) return error.response.data.error;
    if (error.response?.status === 401) return 'Sua sessão expirou. Entre novamente.';
    if (error.response?.status === 403) return 'Acesso negado. Sua conta não tem permissão para esta operação.';
    if (error.response) return `O servidor respondeu com o status ${error.response.status}.`;
    if (error.code === 'ECONNABORTED') return 'A solicitação demorou demais. Tente novamente.';
    return 'Não foi possível conectar à API. Verifique se o backend está em execução.';
  }
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao buscar os dados.';
}

let csrfToken = '';
export function setApiCsrfToken(token: string): void { csrfToken = token; }

api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toUpperCase();
  if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    config.headers.set('X-XSRF-TOKEN', csrfToken);
  }
  return config;
});
