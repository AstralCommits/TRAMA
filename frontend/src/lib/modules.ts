import { modules } from '@/data/demo';

const sectionLabels: Record<number, string> = {
  0: 'VISÃO DO NEGÓCIO',
  1: 'INDICADORES',
  3: 'ANÁLISE COMERCIAL',
  8: 'GESTÃO DA OPERAÇÃO',
  14: 'ADMINISTRAÇÃO',
};

export const ADMIN_MODULES = ['Gerenciamento de Categorias', 'Gerenciamento de Confecções', 'Lançamento de Vendas'];

export const API_MODULES = [
  'Visão Geral',
  'Dashboard de Indicadores',
  'Análise de Tendências',
  'Dados de Vendas',
  'Tendências por Categoria',
  'Simulador de Impacto da Concorrência',
  'Gerenciamento de Categorias',
  'Gerenciamento de Confecções',
  'Lançamento de Vendas',
];

export function sectionOf(item: string): string {
  const index = modules.indexOf(item);
  const start = Object.keys(sectionLabels).map(Number).filter((value) => value <= index).pop() ?? 0;
  return sectionLabels[start];
}

export function visibleModules(apiMode: boolean, isAdmin: boolean): string[] {
  return modules
    .filter((item) => !apiMode || API_MODULES.includes(item))
    .filter((item) => !ADMIN_MODULES.includes(item) || isAdmin || (apiMode && item === 'Lançamento de Vendas'));
}
