import { api } from './api';

export type Produto = {
  id: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  preco?: number;
  imagemUrl?: string;
  estoque?: number;
};

export type ProdutoPayload = Omit<Produto, 'id'>;

type RecordData = Record<string, unknown>;

function asRecord(value: unknown): RecordData {
  return value !== null && typeof value === 'object' ? value as RecordData : {};
}

function asText(...values: unknown[]): string | undefined {
  const value = values.find((item) => typeof item === 'string' && item.trim().length > 0);
  return typeof value === 'string' ? value.trim() : undefined;
}

function asNumber(...values: unknown[]): number | undefined {
  const value = values.find((item) => typeof item === 'number' || (typeof item === 'string' && item.trim() !== '' && Number.isFinite(Number(item))));
  return value === undefined ? undefined : Number(value);
}

function unwrapList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const record = asRecord(payload);
  for (const key of ['content', 'data', 'items', 'produtos', 'products']) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
    const nested = asRecord(record[key]);
    for (const nestedKey of ['content', 'items', 'produtos', 'products']) {
      if (Array.isArray(nested[nestedKey])) return nested[nestedKey] as unknown[];
    }
  }
  return [];
}

function normalizeProduto(value: unknown, index: number): Produto {
  const record = asRecord(value);
  return {
    id: String(record.id ?? record.codigo ?? `produto-${index + 1}`),
    nome: asText(record.nome, record.name, record.titulo, record.title, record.nomeProduto, record.productName) ?? `Produto ${index + 1}`,
    descricao: asText(record.descricao, record.description, record.detalhes, record.descricaoProduto),
    categoria: asText(record.categoria, record.category),
    preco: asNumber(record.preco, record.price, record.valor, record.precoUnitario),
    imagemUrl: asText(record.imagemUrl, record.imageUrl, record.imagem, record.foto, record.image, record.fotoUrl, record.urlImagem),
    estoque: asNumber(record.estoque, record.stock, record.quantidade),
  };
}

export async function getProdutos(signal?: AbortSignal): Promise<Produto[]> {
  const response = await api.get<unknown>('/api/produtos', { signal });
  return unwrapList(response.data).map(normalizeProduto);
}

export async function getProdutoById(id: string | number, signal?: AbortSignal): Promise<Produto> {
  const response = await api.get<unknown>(`/api/produtos/${encodeURIComponent(String(id))}`, { signal });
  return normalizeProduto(response.data, 0);
}

export async function criarProduto(payload: ProdutoPayload): Promise<Produto> {
  const response = await api.post<unknown>('/api/produtos', payload);
  return normalizeProduto(response.data, 0);
}

export async function atualizarProduto(id: string | number, payload: Partial<ProdutoPayload>): Promise<Produto> {
  const response = await api.put<unknown>(`/api/produtos/${encodeURIComponent(String(id))}`, payload);
  return normalizeProduto(response.data, 0);
}

export async function excluirProduto(id: string | number): Promise<void> {
  await api.delete(`/api/produtos/${encodeURIComponent(String(id))}`);
}
