
export const workspaceModules = [
  'Início',
  'Minhas vendas',
  'Meus produtos',
  'Indicadores',
  'Tendências',
  'Comparar mercado',
  'Relatórios',
  'Organização e equipe',
  'Configurações',
] as const;

export type WorkspaceModule = typeof workspaceModules[number];
