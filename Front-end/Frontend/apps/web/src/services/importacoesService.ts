import type { Importacao } from '@/types/api';
import { api } from './api';

export async function importCsv(file: File): Promise<Importacao> {
  const form = new FormData();
  form.append('arquivo', file);
  const response = await api.post<Importacao>('/api/importacoes', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  });
  return response.data;
}

export async function listImportacoes(signal?: AbortSignal): Promise<Importacao[]> {
  return (await api.get<Importacao[]>('/api/importacoes', { signal })).data;
}
