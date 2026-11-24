import type { CategoriaTendencia, IndicadoresParams } from '@/types/indicadores';
import { classifyTrend } from '@/types/indicadores';
import { api } from './api';
import { getIndicadores } from './indicadoresService';

type CategoriaApi = { idCategoria: number; nome: string };

function periodFromIndex(index: number): { mes: number; ano: number } {
  const ano = Math.floor(index / 12);
  const mes = index - ano * 12 + 1;
  return { mes, ano };
}

export async function getTendencias(params: IndicadoresParams, signal?: AbortSignal): Promise<CategoriaTendencia[]> {
  const categoriesResponse = await api.get<CategoriaApi[]>('/api/categorias', { signal });
  const startIndex = params.anoInicial * 12 + params.mesInicial - 1;
  const endIndex = params.anoFinal * 12 + params.mesFinal - 1;
  if (endIndex < startIndex) throw new Error('O período inicial precisa ser anterior ou igual ao período final.');

  const span = endIndex - startIndex + 1;
  const previousStart = periodFromIndex(startIndex - span);
  const previousEnd = periodFromIndex(startIndex - 1);
  const previousParams: IndicadoresParams = {
    ...params,
    mesInicial: previousStart.mes,
    anoInicial: previousStart.ano,
    mesFinal: previousEnd.mes,
    anoFinal: previousEnd.ano,
  };

  return Promise.all(categoriesResponse.data.map(async (category) => {
    const categoryParams = { ...params, categoriaId: category.idCategoria };
    const previousCategoryParams = { ...previousParams, categoriaId: category.idCategoria };
    const [current, previous] = await Promise.all([
      getIndicadores(categoryParams, signal),
      getIndicadores(previousCategoryParams, signal),
    ]);
    const previousRevenue = previous.faturamentoTotal;
    const variation = previousRevenue > 0
      ? ((current.faturamentoTotal - previousRevenue) / previousRevenue) * 100
      : current.faturamentoTotal === 0 ? 0 : null;

    return {
      categoria: category.nome,
      faturamento: current.faturamentoTotal,
      pecasVendidas: current.quantidadeTotal,
      faturamentoAnterior: previousRevenue,
      pecasVendidasAnterior: previous.quantidadeTotal,
      variacaoPercentual: variation,
      classificacao: classifyTrend(variation),
    };
  })).then((rows) => rows.filter((row) => row.faturamento > 0 || row.faturamentoAnterior > 0));
}
