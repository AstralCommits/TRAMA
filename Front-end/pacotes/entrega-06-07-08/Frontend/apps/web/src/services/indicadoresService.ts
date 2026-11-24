import type { IndicadoresParams, IndicadoresResponse } from '@/types/indicadores';
import { api } from './api';

export async function getIndicadores(
  params: IndicadoresParams,
  signal?: AbortSignal,
): Promise<IndicadoresResponse> {
  const response = await api.get<IndicadoresResponse>('/api/indicadores', { params, signal });
  const data = response.data;
  if (!data || !Array.isArray(data.indicadores) || !Array.isArray(data.faturamentoMensal)) {
    throw new Error('A API retornou um contrato de indicadores incompatível. Confira o backend atualizado.');
  }
  return data;
}
