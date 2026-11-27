import type { IndicadoresParams, IndicadoresResponse } from '@/types/indicadores';
import { api } from './api';

export function toMesAno(ano: number, mes: number): string {
  return `${ano}-${String(mes).padStart(2, '0')}`;
}

export function toApiParams(params: IndicadoresParams) {
  return {
    inicio: toMesAno(params.anoInicial, params.mesInicial),
    fim: toMesAno(params.anoFinal, params.mesFinal),
    ...(params.cidade ? { cidade: params.cidade } : {}),
  };
}

export async function getIndicadores(
  params: IndicadoresParams,
  signal?: AbortSignal,
): Promise<IndicadoresResponse> {
  const response = await api.get<IndicadoresResponse>('/api/indicadores', {
    params: toApiParams(params),
    signal,
  });
  if (!Array.isArray(response.data?.categorias)) {
    throw new Error('A API não retornou a lista de categorias esperada.');
  }
  return response.data;
}
