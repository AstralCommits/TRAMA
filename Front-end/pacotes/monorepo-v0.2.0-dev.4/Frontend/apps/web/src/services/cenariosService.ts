import { api } from '@/services/api';

export type Scenario = {
  idCenario: number;
  nome: string;
  descricao: string | null;
  categoriaId: number | null;
  percentualImpacto: number;
};

export type ScenarioPayload = {
  nome: string;
  descricao: string;
  categoriaId: number | null;
  percentualImpacto: number;
};

export type ScenarioSimulation = {
  faturamentoReal: number;
  faturamentoHipotetico: number;
  diferencaReais: number;
  diferencaPercentual: number;
};

export type ScenarioCategory = { idCategoria: number; nome: string };

export async function listScenarios(): Promise<Scenario[]> {
  const response = await api.get<Scenario[]>('/api/cenarios');
  return response.data;
}

export async function createScenario(payload: ScenarioPayload): Promise<Scenario> {
  const response = await api.post<Scenario>('/api/cenarios', payload);
  return response.data;
}

export async function updateScenario(id: number, payload: ScenarioPayload): Promise<Scenario> {
  const response = await api.put<Scenario>(`/api/cenarios/${id}`, payload);
  return response.data;
}

export async function deleteScenario(id: number): Promise<void> {
  await api.delete(`/api/cenarios/${id}`);
}

export async function simulateScenario(percentualImpacto: number, categoriaId: number | null): Promise<ScenarioSimulation> {
  const response = await api.post<ScenarioSimulation>('/api/cenarios/simular', { percentualImpacto, categoriaId });
  return response.data;
}
