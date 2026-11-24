import type { IndicadoresParams, IndicadoresResponse } from '@/types/indicadores';
import { api } from './api';

function toYearMonth(year: number, month: number): string {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error('Informe um período válido para consultar os indicadores.');
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export async function getIndicadores(
  params: IndicadoresParams,
  signal?: AbortSignal,
): Promise<IndicadoresResponse> {
  const response = await api.get<IndicadoresResponse>('/api/indicadores', {
    params: {
      inicio: toYearMonth(params.anoInicial, params.mesInicial),
      fim: toYearMonth(params.anoFinal, params.mesFinal),
      ...(params.categoriaId ? { categoriaId: params.categoriaId } : {}),
      ...(params.cidade ? { cidade: params.cidade } : {}),
    },
    signal,
  });
  return response.data;
}
