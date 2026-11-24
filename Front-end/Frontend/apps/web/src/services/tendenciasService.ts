import type { CategoriaTendencia, IndicadoresParams, TrendClassification } from '@/types/indicadores';
import { api } from './api';
import { toApiParams } from './indicadoresService';

type TendenciaApi = {
  categoria: string;
  faturamento: number;
  pecasVendidas?: number;
  faturamentoAnterior?: number;
  pecasVendidasAnterior?: number;
  variacaoPercentual?: number | null;
  classificacao: 'ALTA' | 'QUEDA' | 'ESTAVEL' | 'SEM_BASE';
};

const CLASSIFICACOES: Record<TendenciaApi['classificacao'], TrendClassification> = {
  ALTA: 'ALTA',
  QUEDA: 'QUEDA',
  ESTAVEL: 'ESTÁVEL',
  SEM_BASE: 'SEM BASE',
};

export function fromApi(item: TendenciaApi): CategoriaTendencia {
  const variacao = typeof item.variacaoPercentual === 'number' && Number.isFinite(item.variacaoPercentual)
    ? item.variacaoPercentual
    : null;
  return {
    ...item,
    variacaoPercentual: variacao,
    classificacao: CLASSIFICACOES[item.classificacao] ?? 'SEM BASE',
  };
}

export async function getTendencias(params: IndicadoresParams, signal?: AbortSignal): Promise<CategoriaTendencia[]> {
  const response = await api.get<TendenciaApi[]>('/api/indicadores/tendencias', {
    params: toApiParams(params),
    signal,
  });
  if (!Array.isArray(response.data)) throw new Error('A API não retornou a lista de tendências esperada.');
  return response.data.map(fromApi);
}
