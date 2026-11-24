import { api } from './api';

export type Cotacao = {
  id: string;
  produtoId?: string | number;
  empresaId?: string | number;
  quantidade?: number;
  valorUnitario?: number;
  valorTotal?: number;
  status?: string;
  observacoes?: string;
  criadaEm?: string;
};

export type CotacaoPayload = {
  produtoId: string | number;
  quantidade: number;
  observacoes?: string;
  prazoEntrega?: string;
};

export type CotacaoFilters = {
  status?: string;
  produtoId?: string | number;
  empresaId?: string | number;
};

export async function getCotacoes(filters: CotacaoFilters = {}, signal?: AbortSignal): Promise<Cotacao[]> {
  const response = await api.get<Cotacao[] | { content?: Cotacao[]; data?: Cotacao[] }>('/api/cotacoes', {
    params: filters,
    signal,
  });
  const body = response.data;
  if (Array.isArray(body)) return body;
  return body.content ?? body.data ?? [];
}

export async function getCotacaoById(id: string | number, signal?: AbortSignal): Promise<Cotacao> {
  const response = await api.get<Cotacao>(`/api/cotacoes/${encodeURIComponent(String(id))}`, { signal });
  return response.data;
}

export async function criarCotacao(payload: CotacaoPayload): Promise<Cotacao> {
  const response = await api.post<Cotacao>('/api/cotacoes', payload);
  return response.data;
}
