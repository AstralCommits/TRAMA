import type { CategoriaTendencia, IndicadoresParams } from '@/types/indicadores';
import { classifyTrend } from '@/types/indicadores';
import { getIndicadores } from './indicadoresService';

export async function getTendencias(params: IndicadoresParams, signal?: AbortSignal): Promise<CategoriaTendencia[]> {
  const response = await getIndicadores(params, signal);
  if (!Array.isArray(response.categorias)) throw new Error('A API não retornou a lista de categorias esperada.');
  return response.categorias.map((item) => ({
    ...item,
    classificacao: classifyTrend(item.variacaoPercentual),
  }));
}
