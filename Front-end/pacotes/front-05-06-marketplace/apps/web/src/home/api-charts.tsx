import { useEffect, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { ApiError, apiRequest } from '@/lib/api.client';

type RevenuePoint = { month: string; revenue: number };
type CategoryPoint = { category: string; pieces: number };
type LoadState<T> = { status: 'loading' | 'ready' | 'empty' | 'error' | 'unconfigured'; data: T[]; message?: string };
const revenueEndpoint = import.meta.env.VITE_TRAMA_REVENUE_ENDPOINT as string | undefined;
const categoryEndpoint = import.meta.env.VITE_TRAMA_CATEGORY_ENDPOINT as string | undefined;

function normalizeRevenue(input: unknown): RevenuePoint[] {
  const rows = Array.isArray(input) ? input : input && typeof input === 'object' && 'data' in input && Array.isArray((input as {data: unknown}).data) ? (input as {data: unknown[]}).data : [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== 'object') return [];
    const item = row as Record<string, unknown>;
    const month = item.month ?? item.mes ?? item.period;
    const revenue = Number(item.revenue ?? item.faturamento ?? item.total);
    return typeof month === 'string' && Number.isFinite(revenue) ? [{ month, revenue }] : [];
  });
}
function normalizeCategories(input: unknown): CategoryPoint[] {
  const rows = Array.isArray(input) ? input : input && typeof input === 'object' && 'data' in input && Array.isArray((input as {data: unknown}).data) ? (input as {data: unknown[]}).data : [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== 'object') return [];
    const item = row as Record<string, unknown>;
    const category = item.category ?? item.categoria ?? item.name;
    const pieces = Number(item.pieces ?? item.quantidade ?? item.quantity);
    return typeof category === 'string' && Number.isFinite(pieces) ? [{ category, pieces }] : [];
  });
}
function useApiData<T>(endpoint: string | undefined, normalize: (data: unknown) => T[]): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({ status: endpoint ? 'loading' : 'unconfigured', data: [] });
  useEffect(() => {
    let active = true;
    if (!endpoint?.trim()) { setState({ status: 'unconfigured', data: [] }); return; }
    setState({ status: 'loading', data: [] });
    apiRequest<unknown>(endpoint).then((payload) => {
      if (!active) return;
      const data = normalize(payload);
      setState(data.length ? { status: 'ready', data } : { status: 'empty', data: [] });
    }).catch((error: unknown) => {
      if (!active) return;
      setState({ status: 'error', data: [], message: error instanceof ApiError ? error.message : 'Não foi possível carregar os dados.' });
    });
    return () => { active = false; };
  }, [endpoint, normalize]);
  return state;
}
const normalizeRevenueData = (data: unknown) => normalizeRevenue(data);
const normalizeCategoryData = (data: unknown) => normalizeCategories(data);
function ChartStatus({ state }: { state: LoadState<unknown> }) {
  if (state.status === 'loading') return <p className="api-chart-state" role="status">Carregando dados da API…</p>;
  if (state.status === 'unconfigured') return <p className="api-chart-state">Integração pendente: configure o endpoint correspondente no arquivo <code>.env</code>. Nenhum dado de exemplo será exibido como real.</p>;
  if (state.status === 'empty') return <p className="api-chart-state">A API não retornou dados para este gráfico.</p>;
  if (state.status === 'error') return <p className="api-chart-state error" role="alert">{state.message}</p>;
  return null;
}
export function ApiCharts() {
  const revenue = useApiData(revenueEndpoint, normalizeRevenueData);
  const categories = useApiData(categoryEndpoint, normalizeCategoryData);
  return <section className="api-charts-section">
    <div className="issue-intro"><span className="eyebrow">FRONT-08 · DADOS DA API</span><h2>Indicadores conectados</h2><p>Gráficos abastecidos pelos endpoints configurados. Os dados só aparecem quando a API responder com registros válidos.</p></div>
    <div className="api-charts-grid">
      <article className="panel api-chart-panel"><h3>Evolução mensal do faturamento</h3><p>Valores retornados pela API (R$).</p>
        <ChartStatus state={revenue}/>{revenue.status === 'ready' && <div className="api-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={revenue.data}><CartesianGrid strokeDasharray="3 3" stroke="#ded2bd"/><XAxis dataKey="month" tick={{ fill: '#786953', fontSize: 11 }}/><YAxis tick={{ fill: '#786953', fontSize: 10 }} tickFormatter={(value: number) => `R$${value.toLocaleString('pt-BR')}`}/><Tooltip formatter={(value) => [Number(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}), 'Faturamento']}/><Legend/><Line type="monotone" dataKey="revenue" name="Faturamento" stroke="#9e5235" strokeWidth={3} activeDot={{ r: 6 }}/></LineChart></ResponsiveContainer></div>}
      </article>
      <article className="panel api-chart-panel"><h3>Peças por categoria têxtil</h3><p>Quantidade retornada pela API.</p>
        <ChartStatus state={categories}/>{categories.status === 'ready' && <div className="api-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={categories.data}><CartesianGrid strokeDasharray="3 3" stroke="#ded2bd"/><XAxis dataKey="category" tick={{ fill: '#786953', fontSize: 11 }}/><YAxis allowDecimals={false} tick={{ fill: '#786953', fontSize: 10 }}/><Tooltip formatter={(value) => [Number(value).toLocaleString('pt-BR'), 'Peças']}/><Legend/><Bar dataKey="pieces" name="Peças" fill="#59613b" radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></div>}
      </article>
    </div>
  </section>;
}
