import type { CategoriaTendencia, IndicadoresParams } from '@/types/indicadores';
import { classifyTrend } from '@/types/indicadores';
import { getIndicadores } from './indicadoresService';

export async function getTendencias(params: IndicadoresParams, signal?: AbortSignal): Promise<CategoriaTendencia[]> {
  const response = await getIndicadores({ ...params, incluirVariacao: true }, signal);
  if (!Array.isArray(response.categorias)) throw new Error('A API não retornou a lista de categorias esperada.');
  return response.categorias.map((item) => {
    if (typeof item.variacaoPercentual !== 'number' || !Number.isFinite(item.variacaoPercentual)) {
      throw new Error(`A API não informou a variação percentual da categoria "${item.categoria}".`);
    }
    return { ...item, variacaoPercentual: item.variacaoPercentual, classificacao: classifyTrend(item.variacaoPercentual) };
  });
}
