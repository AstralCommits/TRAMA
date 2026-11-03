import axios from 'axios';

/** Instância única para todas as chamadas ao backend Spring Boot. */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string; error?: string }>(error)) {
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
