export interface PeriodFilters {
  mesInicial: string;
  anoInicial: string;
  mesFinal: string;
  anoFinal: string;
  cidade: string;
}

export interface IndicadoresParams {
  inicio: string;
  fim: string;
  categoriaId?: number;
  cidade?: string;
}

export interface IndicadorAgregadoApi {
  categoriaId: number;
  categoria: string;
  quantidadeAtual: number;
  faturamentoAtual: number;
  quantidadeAnterior: number;
  faturamentoAnterior: number;
  variacaoPercentual: number | null;
  tendencia: 'ALTA' | 'QUEDA' | 'ESTAVEL' | 'SEM_BASE' | string;
}

export interface FaturamentoMensalApi {
  mes: string;
  quantidade: number;
  faturamento: number;
}

export interface IndicadoresResponse {
  inicio: string;
  fim: string;
  inicioComparacao: string;
  fimComparacao: string;
  cidade?: string | null;
  categoriaId?: number | null;
  totalQuantidade: number;
  totalFaturamento: number;
  totalQuantidadeAnterior: number;
  totalFaturamentoAnterior: number;
  indicadores: IndicadorAgregadoApi[];
  faturamentoMensal: FaturamentoMensalApi[];
  mensagem?: string | null;
}

export interface CategoriaIndicador {
  categoria: string;
  faturamento: number;
  pecasVendidas: number;
  faturamentoAnterior: number;
  pecasVendidasAnterior: number;
  variacaoPercentual: number | null;
}

export type TrendClassification = 'ALTA' | 'QUEDA' | 'ESTÁVEL' | 'SEM BASE';

export interface CategoriaTendencia extends CategoriaIndicador {
  variacaoPercentual: number | null;
  classificacao: TrendClassification;
}

export function toIndicadoresParams(filters: PeriodFilters): IndicadoresParams {
  const inicio = `${filters.anoInicial}-${String(filters.mesInicial).padStart(2, '0')}`;
  const fim = `${filters.anoFinal}-${String(filters.mesFinal).padStart(2, '0')}`;
  return { inicio, fim, ...(filters.cidade ? { cidade: filters.cidade } : {}) };
}

export function isPeriodValid(filters: PeriodFilters): boolean {
  const start = Number(filters.anoInicial) * 12 + Number(filters.mesInicial);
  const end = Number(filters.anoFinal) * 12 + Number(filters.mesFinal);
  return Number.isFinite(start) && Number.isFinite(end) && start <= end;
}

export function classifyTrend(variation: number | null): TrendClassification {
  if (variation === null) return 'SEM BASE';
  if (variation >= 5) return 'ALTA';
  if (variation <= -5) return 'QUEDA';
  return 'ESTÁVEL';
}
