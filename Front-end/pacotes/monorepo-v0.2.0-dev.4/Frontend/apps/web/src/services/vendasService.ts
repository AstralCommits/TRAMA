import { api } from '@/services/api';

export type MonthlySale = {
  idLancamento: number;
  mesAno: string;
  quantidade: number;
  faturamento: number;
  origem: 'MANUAL' | 'IMPORTACAO';
  origemDado: 'ENTREVISTA' | 'QUESTIONARIO' | 'FONTE_SECUNDARIA' | 'DEMONSTRACAO';
  nomeFonte: string;
  status: 'ATIVO' | 'CANCELADO';
  idConfeccao: number;
  confeccao: string;
  idCategoria: number;
  categoria: string;
};

export type CategoryOption = { idCategoria: number; nome: string };
export type MonthlySalePayload = {
  idConfeccao: number;
  idCategoria: number;
  mesAno: string;
  quantidade: number;
  faturamento: number;
  origem: 'MANUAL';
  origemDado: 'ENTREVISTA' | 'QUESTIONARIO' | 'FONTE_SECUNDARIA';
  nomeFonte: string;
};

export type ImportHistoryItem = {
  idImportacao: number;
  nomeArquivo: string;
  dataImportacao: string;
  qtdLinhas: number | null;
  status: 'CONCLUIDA' | 'ERRO';
  idUsuario: number;
};

export async function listMonthlySales(): Promise<MonthlySale[]> {
  const response = await api.get<MonthlySale[]>('/api/vendas');
  return response.data;
}

export async function createMonthlySale(payload: MonthlySalePayload): Promise<MonthlySale> {
  const response = await api.post<MonthlySale>('/api/vendas', payload);
  return response.data;
}

export async function updateMonthlySale(id: number, payload: MonthlySalePayload): Promise<MonthlySale> {
  const response = await api.put<MonthlySale>(`/api/vendas/${id}`, payload);
  return response.data;
}

export async function cancelMonthlySale(id: number): Promise<void> {
  await api.delete(`/api/vendas/${id}`);
}

export async function listCategories(): Promise<CategoryOption[]> {
  const response = await api.get<CategoryOption[]>('/api/categorias');
  return response.data;
}

export async function importMonthlyCsv(file: File): Promise<ImportHistoryItem> {
  const form = new FormData();
  form.append('arquivo', file);
  const response = await api.post<ImportHistoryItem>('/api/importacoes', form, { timeout: 60_000 });
  return response.data;
}

export async function listImportHistory(): Promise<ImportHistoryItem[]> {
  const response = await api.get<ImportHistoryItem[]>('/api/importacoes');
  return response.data;
}
