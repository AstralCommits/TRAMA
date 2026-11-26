import type { Categoria, Confeccao, ConfeccaoInput } from '@/types/api';
import { api } from './api';

export async function listCategorias(signal?: AbortSignal): Promise<Categoria[]> {
  return (await api.get<Categoria[]>('/api/categorias', { signal })).data;
}

export async function createCategoria(nome: string): Promise<Categoria> {
  return (await api.post<Categoria>('/api/categorias', { nome })).data;
}

export async function deleteCategoria(id: number): Promise<void> {
  await api.delete(`/api/categorias/${id}`);
}

export async function listConfeccoes(signal?: AbortSignal): Promise<Confeccao[]> {
  return (await api.get<Confeccao[]>('/api/confeccoes', { signal })).data;
}

export async function createConfeccao(input: ConfeccaoInput): Promise<Confeccao> {
  return (await api.post<Confeccao>('/api/confeccoes', input)).data;
}

export async function deleteConfeccao(id: number): Promise<void> {
  await api.delete(`/api/confeccoes/${id}`);
}
