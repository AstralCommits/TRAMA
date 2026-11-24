import type { CategoriaTendencia, IndicadoresParams } from '@/types/indicadores';
import { classifyTrend } from '@/types/indicadores';
import { getIndicadores } from './indicadoresService';

export async function getTendencias(params: IndicadoresParams, signal?: AbortSignal): Promise<CategoriaTendencia[]> {
  const response = await getIndicadores(params, signal);
  return response.indicadores.map((item) => ({
    categoria: item.categoria,
    faturamento: item.faturamentoAtual,
    pecasVendidas: item.quantidadeAtual,
    faturamentoAnterior: item.faturamentoAnterior,
    pecasVendidasAnterior: item.quantidadeAnterior,
    variacaoPercentual: item.variacaoPercentual,
    classificacao: classifyTrend(item.variacaoPercentual),
  }));
}
