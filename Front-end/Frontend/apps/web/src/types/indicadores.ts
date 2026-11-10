export interface PeriodFilters {
  mesInicial: string;
  anoInicial: string;
  mesFinal: string;
  anoFinal: string;
  cidade: string;
}

export interface IndicadoresParams {
  mesInicial: number;
  anoInicial: number;
  mesFinal: number;
  anoFinal: number;
  cidade?: string;
  incluirVariacao?: boolean;
}

export interface CategoriaIndicador {
  categoria: string;
  faturamento: number;
  pecasVendidas?: number;
  faturamentoAnterior?: number;
  pecasVendidasAnterior?: number;
  variacaoPercentual?: number;
}

/** Contrato esperado da resposta de GET /api/indicadores. */
export interface IndicadoresResponse {
  faturamentoTotal: number;
  pecasVendidas: number;
  faturamentoTotalAnterior?: number;
  pecasVendidasAnterior?: number;
  categorias: CategoriaIndicador[];
  categoriaLider?: {
    categoria: string;
    faturamento?: number;
  } | null;
}

export type TrendClassification = 'ALTA' | 'QUEDA' | 'ESTÁVEL';

export interface CategoriaTendencia extends CategoriaIndicador {
  variacaoPercentual: number;
  classificacao: TrendClassification;
}

export function toIndicadoresParams(filters: PeriodFilters): IndicadoresParams {
  return {
    mesInicial: Number(filters.mesInicial),
    anoInicial: Number(filters.anoInicial),
    mesFinal: Number(filters.mesFinal),
    anoFinal: Number(filters.anoFinal),
    ...(filters.cidade ? { cidade: filters.cidade } : {}),
  };
}

export function isPeriodValid(filters: PeriodFilters): boolean {
  const start = Number(filters.anoInicial) * 12 + Number(filters.mesInicial);
  const end = Number(filters.anoFinal) * 12 + Number(filters.mesFinal);
  return Number.isFinite(start) && Number.isFinite(end) && start <= end;
}

export function classifyTrend(variation: number): TrendClassification {
  if (variation >= 5) return 'ALTA';
  if (variation <= -5) return 'QUEDA';
  return 'ESTÁVEL';
}
