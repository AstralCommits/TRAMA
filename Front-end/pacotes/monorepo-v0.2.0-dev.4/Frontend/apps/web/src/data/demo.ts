export const banner = '/images/agreste-header.jpg';

export const modules = [
  'Visão Geral',
  'Dados de Vendas',
  'Tendências',
  'Comparação de Categorias',
  'Cenário da Concorrência',
  'Relatórios',
];

export const demoCategories = [
  'Jeans',
  'Moda feminina',
  'Moda masculina',
  'Moda infantil',
  'Moda praia',
  'Moletom',
] as const;

export type Sale = {
  id: number;
  mesAno: string;
  category: string;
  quantity: number;
  revenue: number;
  city: string;
  sourceName: string;
};

const monthlyDemoValues = [
  { month: '2026-09', values: [[380, 22800], [210, 12600], [155, 9300], [125, 6250], [85, 4250], [95, 8550]] },
  { month: '2026-10', values: [[420, 26880], [235, 14335], [148, 8880], [142, 7100], [91, 5005], [103, 9476]] },
];

export function initialSalesForCity(city: string): Sale[] {
  return monthlyDemoValues.flatMap(({ month, values }, monthIndex) => values.map(([quantity, revenue], categoryIndex) => ({
    id: (monthIndex + 1) * 100 + categoryIndex + 1,
    mesAno: month,
    category: demoCategories[categoryIndex],
    quantity,
    revenue,
    city,
    sourceName: 'Conjunto fictício para demonstração',
  })));
}

export const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
export const total = (sales: Sale[]) => sales.reduce((sum, row) => sum + row.revenue, 0);
export const quantity = (sales: Sale[]) => sales.reduce((sum, row) => sum + row.quantity, 0);
export const variation = (current: number, previous: number) => previous > 0
  ? `${((current - previous) / previous * 100).toFixed(1).replace('.', ',')}%`
  : 'Sem base anterior';

export type Filters = { period: string; category: string };

export function filtered(sales: Sale[], filters: Filters, previous = false): Sale[] {
  const [monthName, yearText] = filters.period.split(' de ');
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const month = monthNames.indexOf(monthName) + 1;
  const year = Number(yearText);
  const reference = new Date(year, month - 1 - (previous ? 1 : 0), 1);
  const key = `${reference.getFullYear()}-${String(reference.getMonth() + 1).padStart(2, '0')}`;
  return sales.filter((sale) => sale.mesAno === key && (filters.category === 'Todas' || sale.category === filters.category));
}
