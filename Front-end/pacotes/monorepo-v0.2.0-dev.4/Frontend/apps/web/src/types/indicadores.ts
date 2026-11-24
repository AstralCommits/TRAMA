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

export interface CategoriaIndicador {
  categoria: string;
  faturamento: number;
  pecasVendidas: number;
  faturamentoAnterior: number;
  pecasVendidasAnterior: number;
  variacaoPercentual: number | null;
}

export interface IndicadoresResponse {
  inicio: string;
  fim: string;
  quantidadeTotal: number;
  faturamentoTotal: number;
  pecasVendidas: number;
  faturamentoTotalAnterior: number;
  pecasVendidasAnterior: number;
  ticketMedioPorPeca: number;
  categorias: CategoriaIndicador[];
  categoriaLider: { categoria: string; faturamento: number } | null;
  quantidadeLancamentos: number;
  categoriaId: number | null;
  cidade: string | null;
}

export type TrendClassification = 'ALTA' | 'QUEDA' | 'ESTÁVEL';

export interface CategoriaTendencia extends CategoriaIndicador {
  classificacao: TrendClassification;
}

export function toIndicadoresParams(filters: PeriodFilters): IndicadoresParams {
  const inicio = `${filters.anoInicial}-${filters.mesInicial.padStart(2, '0')}`;
  const fim = `${filters.anoFinal}-${filters.mesFinal.padStart(2, '0')}`;
  return {
    inicio,
    fim,
    ...(filters.cidade ? { cidade: filters.cidade } : {}),
  };
}

export function isPeriodValid(filters: PeriodFilters): boolean {
  const start = Number(filters.anoInicial) * 12 + Number(filters.mesInicial);
  const end = Number(filters.anoFinal) * 12 + Number(filters.mesFinal);
  return Number.isFinite(start) && Number.isFinite(end) && start <= end;
}

export function classifyTrend(variation: number | null): TrendClassification | null {
  if (variation === null || !Number.isFinite(variation)) return null;
  if (variation >= 5) return 'ALTA';
  if (variation <= -5) return 'QUEDA';
  return 'ESTÁVEL';
}
