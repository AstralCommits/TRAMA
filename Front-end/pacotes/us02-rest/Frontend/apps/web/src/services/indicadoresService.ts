import type { IndicadoresParams, IndicadoresResponse } from '@/types/indicadores';
import { api } from './api';

export async function getIndicadores(
  params: IndicadoresParams,
  signal?: AbortSignal,
): Promise<IndicadoresResponse> {
  const response = await api.get<IndicadoresResponse>('/api/indicadores', {
    params,
    signal,
  });
  return response.data;
}
