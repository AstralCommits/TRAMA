import { api } from './api';

export type Artesao = {
  id: string;
  nome: string;
  especialidade?: string;
  municipio?: string;
  descricao?: string;
  produtoDestaque?: string;
};

export type ArtesaoPayload = Omit<Artesao, 'id'>;
type RecordData = Record<string, unknown>;

function asRecord(value: unknown): RecordData {
  return value !== null && typeof value === 'object' ? value as RecordData : {};
}

function asText(...values: unknown[]): string | undefined {
  const value = values.find((item) => typeof item === 'string' && item.trim().length > 0);
  return typeof value === 'string' ? value.trim() : undefined;
}

function unwrapList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const record = asRecord(payload);
  for (const key of ['content', 'data', 'items', 'artesaos', 'artesãos']) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
    const nested = asRecord(record[key]);
    for (const nestedKey of ['content', 'items', 'artesaos', 'artesãos']) {
      if (Array.isArray(nested[nestedKey])) return nested[nestedKey] as unknown[];
    }
  }
  return [];
}

function normalizeArtesao(value: unknown, index: number): Artesao {
  const record = asRecord(value);
  return {
    id: String(record.id ?? record.codigo ?? `artesao-${index + 1}`),
    nome: asText(record.nome, record.name, record.nomeCompleto, record.nomeArtesao) ?? `Artesão ${index + 1}`,
    especialidade: asText(record.especialidade, record.tecnica, record.técnica, record.specialty),
    municipio: asText(record.municipio, record.cidade, record.city),
    descricao: asText(record.descricao, record.description, record.bio),
    produtoDestaque: asText(record.produtoDestaque, record.produto, record.productName),
  };
}

export async function getArtesaos(signal?: AbortSignal): Promise<Artesao[]> {
  const response = await api.get<unknown>('/api/artesaos', { signal });
  return unwrapList(response.data).map(normalizeArtesao);
}

export async function getArtesaoById(id: string | number, signal?: AbortSignal): Promise<Artesao> {
  const response = await api.get<unknown>(`/api/artesaos/${encodeURIComponent(String(id))}`, { signal });
  return normalizeArtesao(response.data, 0);
}

export async function criarArtesao(payload: ArtesaoPayload): Promise<Artesao> {
  const response = await api.post<unknown>('/api/artesaos', payload);
  return normalizeArtesao(response.data, 0);
}

export async function atualizarArtesao(id: string | number, payload: Partial<ArtesaoPayload>): Promise<Artesao> {
  const response = await api.put<unknown>(`/api/artesaos/${encodeURIComponent(String(id))}`, payload);
  return normalizeArtesao(response.data, 0);
}

export async function excluirArtesao(id: string | number): Promise<void> {
  await api.delete(`/api/artesaos/${encodeURIComponent(String(id))}`);
}
