import type { Cenario, Simulacao } from '@/types/api';
import { api } from './api';

type CenarioInput = { nome: string; categoriaId?: number; percentualImpacto: number };

export async function simularCenario(
  percentualImpacto: number,
  categoriaId?: number,
  signal?: AbortSignal,
): Promise<Simulacao> {
  return (await api.post<Simulacao>('/api/cenarios/simular', { percentualImpacto, categoriaId }, { signal })).data;
}

export async function listCenarios(signal?: AbortSignal): Promise<Cenario[]> {
  return (await api.get<Cenario[]>('/api/cenarios', { signal })).data;
}

export async function createCenario(input: CenarioInput): Promise<Cenario> {
  return (await api.post<Cenario>('/api/cenarios', input)).data;
}
