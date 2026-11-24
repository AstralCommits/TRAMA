import type { Sale } from '@/data/demo';
import type { Confeccao, Venda, VendaInput } from '@/types/api';
import { api } from './api';

export function toSale(venda: Venda, confeccoes: Confeccao[]): Sale {
  const confeccao = confeccoes.find((item) => item.idConfeccao === venda.idConfeccao);
  return {
    id: venda.idLancamento,
    product: `Lançamento mensal · ${venda.confeccao}`,
    category: venda.categoria,
    quantity: venda.quantidade,
    price: venda.quantidade > 0 ? venda.faturamento / venda.quantidade : 0,
    revenue: venda.faturamento,
    date: `${venda.mesAno}-01`,
    city: confeccao?.cidade,
    confection: venda.confeccao,
  };
}

export async function listVendas(signal?: AbortSignal): Promise<Venda[]> {
  return (await api.get<Venda[]>('/api/vendas', { signal })).data;
}

export async function createVenda(input: VendaInput): Promise<Venda> {
  return (await api.post<Venda>('/api/vendas', { ...input, origem: 'MANUAL' })).data;
}

export async function updateVenda(venda: Venda, input: VendaInput): Promise<Venda> {
  return (await api.put<Venda>(`/api/vendas/${venda.idLancamento}`, { ...input, origem: venda.origem })).data;
}

export async function cancelVenda(id: number): Promise<void> {
  await api.delete(`/api/vendas/${id}`);
}
