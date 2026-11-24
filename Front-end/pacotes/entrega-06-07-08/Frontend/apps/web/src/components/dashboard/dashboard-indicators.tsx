import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, Boxes, CalendarRange, MapPin, RefreshCw, TrendingUp } from 'lucide-react';
import { money, quantity, total, type Sale } from '@/data/demo';
import type { CategoriaTendencia, IndicadoresParams, IndicadoresResponse } from '@/types/indicadores';
import { getIndicadores } from '@/services/indicadoresService';
import { getTendencias } from '@/services/tendenciasService';
import { getApiErrorMessage } from '@/services/api';

type Props = { sales: Sale[]; defaultCity: string; isDemo: boolean };
type Period = { startMonth: number; startYear: number; endMonth: number; endYear: number; city: string };
type CategoryRow = { category: string; revenue: number; previousRevenue: number; pieces: number; variation: number | null };
type MonthRow = { mes: string; faturamento: number; quantidade: number };

const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const cities = ['Toritama', 'Caruaru', 'Santa Cruz do Capibaribe'];
const chartCurrency = (value: number) => new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL', notation: value >= 100_000 ? 'compact' : 'standard', maximumFractionDigits: 0,
}).format(value);

function monthIndex(year: number, month: number) { return year * 12 + month - 1; }
function dateIndex(date: string) {
  const [year, month] = date.split('-').map(Number);
  return monthIndex(year, month);
}
function monthKey(index: number) {
  const year = Math.floor(index / 12);
  const month = index % 12 + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}
function defaultPeriod(sales: Sale[] = []): Period {
  const latestSale = [...sales].sort((a, b) => b.date.localeCompare(a.date))[0];
  const now = latestSale ? new Date(`${latestSale.date}T12:00:00`) : new Date();
  const month = now.getMonth() + 1;
  return { startMonth: month, startYear: now.getFullYear(), endMonth: month, endYear: now.getFullYear(), city: '' };
}
function formatVariation(value: number | null) {
  if (value === null) return 'Sem base anterior';
  return `${value > 0 ? '+' : ''}${value.toFixed(1).replace('.', ',')}%`;
}
function formatMonthLabel(value: string) {
  const [year, month] = value.split('-').map(Number);
  return `${monthNames[month - 1]?.slice(0, 3)}/${String(year).slice(2)}`;
}

export function DashboardIndicators({ sales, defaultCity, isDemo }: Props) {
  const [period, setPeriod] = useState<Period>(() => defaultPeriod(isDemo ? sales : []));
  const [showPrevious, setShowPrevious] = useState(true);
  const [remoteData, setRemoteData] = useState<IndicadoresResponse | null>(null);
  const [apiMessage, setApiMessage] = useState('');
  const [remoteLoading, setRemoteLoading] = useState(!isDemo);
  const [reloadCount, setReloadCount] = useState(0);
  const start = monthIndex(period.startYear, period.startMonth);
  const end = monthIndex(period.endYear, period.endMonth);
  const validPeriod = start <= end;
  const span = end - start + 1;
  const previousStart = start - span;
  const previousEnd = start - 1;

  const filtered = useMemo(() => {
    if (!validPeriod) return { current: [] as Sale[], previous: [] as Sale[] };
    const current: Sale[] = [];
    const previous: Sale[] = [];
    for (const sale of sales) {
      const saleMonth = dateIndex(sale.date);
      const city = sale.city || defaultCity;
      if (period.city && city !== period.city) continue;
      if (saleMonth >= start && saleMonth <= end) current.push(sale);
      if (saleMonth >= previousStart && saleMonth <= previousEnd) previous.push(sale);
    }
    return { current, previous };
  }, [sales, period.city, start, end, previousStart, previousEnd, validPeriod, defaultCity]);

  useEffect(() => {
    if (isDemo) {
      setRemoteData(null);
      setApiMessage('');
      setRemoteLoading(false);
      return;
    }
    if (!validPeriod) {
      setRemoteData(null);
      setApiMessage('O período inicial precisa ser anterior ou igual ao período final.');
      setRemoteLoading(false);
      return;
    }
    const controller = new AbortController();
    const params: IndicadoresParams = {
      inicio: monthKey(start),
      fim: monthKey(end),
      ...(period.city ? { cidade: period.city } : {}),
    };
    setRemoteLoading(true);
    setApiMessage('');
    getIndicadores(params, controller.signal)
      .then((data) => { setRemoteData(data); setApiMessage(''); })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setRemoteData(null);
          setApiMessage(getApiErrorMessage(error));
        }
      })
      .finally(() => { if (!controller.signal.aborted) setRemoteLoading(false); });
    return () => controller.abort();
  }, [isDemo, validPeriod, start, end, period.city, reloadCount]);

  const localGroups: CategoryRow[] = Array.from(new Set([...filtered.current, ...filtered.previous].map((sale) => sale.category)))
    .sort().map((category) => {
      const currentRows = filtered.current.filter((sale) => sale.category === category);
      const previousRows = filtered.previous.filter((sale) => sale.category === category);
      const currentRevenue = total(currentRows);
      const previousCategoryRevenue = total(previousRows);
      const variation = previousCategoryRevenue > 0
        ? ((currentRevenue - previousCategoryRevenue) / previousCategoryRevenue) * 100
        : currentRevenue === 0 ? 0 : null;
      return { category, revenue: currentRevenue, previousRevenue: previousCategoryRevenue, pieces: quantity(currentRows), variation };
    });

  const remoteGroups: CategoryRow[] = (remoteData?.indicadores ?? []).map((item) => ({
    category: item.categoria,
    revenue: item.faturamentoAtual,
    previousRevenue: item.faturamentoAnterior,
    pieces: item.quantidadeAtual,
    variation: item.variacaoPercentual,
  }));
  const groups = (isDemo ? localGroups : remoteGroups).sort((a, b) => b.revenue - a.revenue);
  const revenue = isDemo ? total(filtered.current) : (remoteData?.totalFaturamento ?? 0);
  const pieces = isDemo ? quantity(filtered.current) : (remoteData?.totalQuantidade ?? 0);
  const previousRevenue = isDemo ? total(filtered.previous) : (remoteData?.totalFaturamentoAnterior ?? 0);
  const leader = groups.find((item) => item.revenue > 0);
  const maxBar = Math.max(1, ...groups.map((group) => group.revenue), ...(showPrevious ? groups.map((group) => group.previousRevenue) : []));
  const revenueChange = showPrevious && previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : null;

  const monthlyRows: MonthRow[] = isDemo
    ? Array.from({ length: Math.max(0, span) }, (_, index) => {
        const month = monthKey(start + index);
        const monthSales = filtered.current.filter((sale) => sale.date.startsWith(month));
        return { mes: month, faturamento: total(monthSales), quantidade: quantity(monthSales) };
      })
    : (remoteData?.faturamentoMensal ?? []).map((item) => ({
        mes: item.mes, faturamento: item.faturamento, quantidade: item.quantidade,
      }));

  return (
    <>
      <section className="trama-filter-panel" aria-label="Filtros de indicadores">
        <div className="trama-filter-heading"><CalendarRange size={17} /><b>Período de análise</b><span>Os indicadores são recalculados ao alterar os filtros.</span></div>
        <div className="trama-filter-grid">
          <label>De<div className="trama-month-fields">
            <select value={period.startMonth} onChange={(e) => setPeriod({ ...period, startMonth: Number(e.target.value) })}>{monthNames.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select>
            <select aria-label="Ano inicial" value={period.startYear} onChange={(e) => setPeriod({ ...period, startYear: Number(e.target.value) })}>{Array.from({ length: 8 }, (_, index) => new Date().getFullYear() - 3 + index).map((year) => <option key={year}>{year}</option>)}</select>
          </div></label>
          <label>Até<div className="trama-month-fields">
            <select value={period.endMonth} onChange={(e) => setPeriod({ ...period, endMonth: Number(e.target.value) })}>{monthNames.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select>
            <select aria-label="Ano final" value={period.endYear} onChange={(e) => setPeriod({ ...period, endYear: Number(e.target.value) })}>{Array.from({ length: 8 }, (_, index) => new Date().getFullYear() - 3 + index).map((year) => <option key={year}>{year}</option>)}</select>
          </div></label>
          <label><span><MapPin size={13} /> Cidade</span><select value={period.city} onChange={(e) => setPeriod({ ...period, city: e.target.value })}>
            <option value="">Todas as cidades</option>{cities.map((city) => <option key={city}>{city}</option>)}
          </select></label>
          <label className="trama-compare-toggle"><input type="checkbox" checked={showPrevious} onChange={(e) => setShowPrevious(e.target.checked)} /> Comparar com período anterior</label>
        </div>
        {!validPeriod && <p className="auth-error" role="alert">O período inicial precisa ser anterior ou igual ao período final.</p>}
      </section>

      {isDemo && <div className="demo-notice" role="note"><b>DADOS FICTÍCIOS — AMBIENTE DE DEMONSTRAÇÃO.</b> Os valores abaixo são ilustrativos e não representam movimentações reais de empresas.</div>}
      {!isDemo && remoteLoading && <div className="panel" role="status">Carregando indicadores do servidor…</div>}
      {!isDemo && apiMessage && <div className="panel auth-error" role="alert"><p>{apiMessage}</p><button type="button" onClick={() => setReloadCount((value) => value + 1)}><RefreshCw size={14} /> Tentar novamente</button></div>}

      <div className="metrics trama-kpis">
        <article><span><TrendingUp size={15} /> Faturamento total</span><strong>{isDemo || remoteData ? money(revenue) : '—'}</strong><small>{!showPrevious ? 'Comparação com período anterior desativada' : revenueChange === null ? 'Sem base anterior para comparação' : `${formatVariation(revenueChange)} em relação ao período anterior`}</small></article>
        <article><span><Boxes size={15} /> Peças vendidas</span><strong>{isDemo || remoteData ? pieces.toLocaleString('pt-BR') : '—'}</strong><small>{isDemo ? `${filtered.current.length} registros demonstrativos` : remoteData ? 'Valor retornado pela API' : 'Aguardando resposta da API'}</small></article>
        <article><span><BarChart3 size={15} /> Categoria líder</span><strong>{isDemo || remoteData ? (leader?.category || '—') : '—'}</strong><small>{leader ? `${money(leader.revenue)} em faturamento` : 'Sem categoria no período'}</small></article>
      </div>

      <section className="chart-grid trama-api-charts">
        <article className="panel">
          <div className="panel-title"><div><span className="eyebrow">EVOLUÇÃO NO PERÍODO</span><h3>Faturamento mensal</h3></div></div>
          {(!isDemo && !remoteData) || monthlyRows.length === 0
            ? <p>{remoteLoading ? 'Carregando série mensal…' : 'Não há dados de faturamento para o período selecionado.'}</p>
            : <div className="trama-recharts-container"><ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRows} margin={{ top: 10, right: 18, left: 12, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e2d7" />
                  <XAxis dataKey="mes" tickFormatter={formatMonthLabel} minTickGap={18} />
                  <YAxis tickFormatter={(value: number) => chartCurrency(value)} width={92} />
                  <Tooltip labelFormatter={(label) => `Mês: ${label}`} formatter={(value) => [money(Number(value)), 'Faturamento']} />
                  <Legend />
                  <Line type="monotone" dataKey="faturamento" name="Faturamento" stroke="#526b43" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer></div>}
        </article>
        <article className="panel">
          <div className="panel-title"><div><span className="eyebrow">DISTRIBUIÇÃO DA PRODUÇÃO</span><h3>Peças por categoria</h3></div></div>
          {(!isDemo && !remoteData) || groups.length === 0
            ? <p>{remoteLoading ? 'Carregando categorias…' : 'Não há dados de peças por categoria.'}</p>
            : <div className="trama-recharts-container"><ResponsiveContainer width="100%" height="100%">
                <BarChart data={groups} layout="vertical" margin={{ top: 8, right: 22, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e2d7" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="category" width={110} />
                  <Tooltip formatter={(value) => [Number(value).toLocaleString('pt-BR'), 'Peças']} />
                  <Legend />
                  <Bar dataKey="pieces" name="Peças" fill="#9b7653" radius={[0, 5, 5, 0]}>
                    {groups.map((group) => <Cell key={group.category} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer></div>}
        </article>
      </section>

      <section className="panel trama-chart-panel">
        <div className="panel-title"><div><span className="eyebrow">DESEMPENHO COMERCIAL</span><h3>Faturamento por categoria</h3></div><span className="trama-chart-legend"><i /> Atual {showPrevious && <><i className="previous-dot" /> Anterior</>}</span></div>
        {(!isDemo && !remoteData) || groups.length === 0 ? <p>{remoteLoading ? 'Carregando categorias…' : 'Não há dados para o período selecionado.'}</p> : <div className="trama-category-bars">
          {groups.map((group) => <div className="trama-category-bar" key={group.category}>
            <div className="trama-category-bar-label"><b>{group.category}</b><span>{money(group.revenue)}</span></div>
            <div className="trama-bar-track"><i style={{ width: `${(group.revenue / maxBar) * 100}%` }} /></div>
            {showPrevious && <div className="trama-bar-track previous"><i style={{ width: `${(group.previousRevenue / maxBar) * 100}%` }} /></div>}
          </div>)}
        </div>}
      </section>

      <section className="panel">
        <div className="panel-title"><div><span className="eyebrow">DETALHAMENTO</span><h3>Indicadores por categoria</h3></div><small>{period.city || 'Todas as cidades'}</small></div>
        <div className="table-wrap"><table><thead><tr><th>Categoria</th><th>Peças</th><th>Faturamento</th><th>Período anterior</th><th>Variação</th></tr></thead><tbody>
          {groups.map((group) => <tr key={group.category}><td><b>{group.category}</b></td><td>{group.pieces.toLocaleString('pt-BR')}</td><td>{money(group.revenue)}</td><td>{showPrevious ? money(group.previousRevenue) : '—'}</td><td>{showPrevious ? formatVariation(group.variation) : '—'}</td></tr>)}
        </tbody></table>{groups.length === 0 && !remoteLoading && !apiMessage && <p>Não há dados para o período selecionado.</p>}</div>
      </section>
      <p className="data-source-note">Fonte: {isDemo ? 'dados demonstrativos fictícios, armazenados neste navegador.' : 'API do back-end TRAMA (GET /api/indicadores), filtrada pela confecção autenticada.'}</p>
    </>
  );
}

export function TrendAnalysis({ sales, defaultCity, isDemo }: Props) {
  const [period, setPeriod] = useState<Period>(() => defaultPeriod(isDemo ? sales : []));
  const [remoteTrends, setRemoteTrends] = useState<CategoriaTendencia[] | null>(null);
  const [apiMessage, setApiMessage] = useState('');
  const [remoteLoading, setRemoteLoading] = useState(!isDemo);
  const [reloadCount, setReloadCount] = useState(0);
  const start = monthIndex(period.startYear, period.startMonth);
  const end = monthIndex(period.endYear, period.endMonth);
  const valid = start <= end;
  const span = end - start + 1;
  const previousStart = start - span;
  const previousEnd = start - 1;

  useEffect(() => {
    if (isDemo) { setRemoteTrends(null); setApiMessage(''); setRemoteLoading(false); return; }
    if (!valid) { setRemoteTrends(null); setApiMessage('Período inválido.'); setRemoteLoading(false); return; }
    const controller = new AbortController();
    const params: IndicadoresParams = { inicio: monthKey(start), fim: monthKey(end), ...(period.city ? { cidade: period.city } : {}) };
    setRemoteLoading(true);
    getTendencias(params, controller.signal)
      .then((data) => { setRemoteTrends(data); setApiMessage(''); })
      .catch((error: unknown) => { if (!controller.signal.aborted) { setRemoteTrends(null); setApiMessage(getApiErrorMessage(error)); } })
      .finally(() => { if (!controller.signal.aborted) setRemoteLoading(false); });
    return () => controller.abort();
  }, [isDemo, valid, start, end, period.city, reloadCount]);

  const current = valid ? sales.filter((sale) => {
    const city = sale.city || defaultCity;
    return dateIndex(sale.date) >= start && dateIndex(sale.date) <= end && (!period.city || city === period.city);
  }) : [];
  const previous = valid ? sales.filter((sale) => {
    const city = sale.city || defaultCity;
    return dateIndex(sale.date) >= previousStart && dateIndex(sale.date) <= previousEnd && (!period.city || city === period.city);
  }) : [];
  const names = Array.from(new Set([...current, ...previous].map((sale) => sale.category)));
  const localRows: CategoriaTendencia[] = names.map((category) => {
    const now = total(current.filter((sale) => sale.category === category));
    const before = total(previous.filter((sale) => sale.category === category));
    const variation = before > 0 ? ((now - before) / before) * 100 : null;
    return { categoria: category, faturamento: now, faturamentoAnterior: before,
      pecasVendidas: quantity(current.filter((sale) => sale.category === category)),
      pecasVendidasAnterior: quantity(previous.filter((sale) => sale.category === category)),
      variacaoPercentual: variation,
      classificacao: variation === null ? 'SEM BASE' : variation >= 5 ? 'ALTA' : variation <= -5 ? 'QUEDA' : 'ESTÁVEL' };
  });
  const rows = (isDemo ? localRows : (remoteTrends ?? [])).map((item) => ({
    category: item.categoria, now: item.faturamento, before: item.faturamentoAnterior,
    variation: item.variacaoPercentual, classification: item.classificacao,
  })).sort((a, b) => (b.variation ?? -Infinity) - (a.variation ?? -Infinity));

  return <>
    <section className="trama-filter-panel"><div className="trama-filter-heading"><TrendingUp size={17}/><b>Classificação de tendências</b><span>Comparação com o período imediatamente anterior.</span></div>
      <div className="trama-filter-grid">
        <label>Início<div className="trama-month-fields"><select value={period.startMonth} onChange={(e) => setPeriod({ ...period, startMonth: Number(e.target.value) })}>{monthNames.map((month, i) => <option key={month} value={i + 1}>{month}</option>)}</select><select value={period.startYear} aria-label="Ano inicial" onChange={(e) => setPeriod({ ...period, startYear: Number(e.target.value) })}>{Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 3 + i).map((year) => <option key={year}>{year}</option>)}</select></div></label>
        <label>Fim<div className="trama-month-fields"><select value={period.endMonth} onChange={(e) => setPeriod({ ...period, endMonth: Number(e.target.value) })}>{monthNames.map((month, i) => <option key={month} value={i + 1}>{month}</option>)}</select><select value={period.endYear} aria-label="Ano final" onChange={(e) => setPeriod({ ...period, endYear: Number(e.target.value) })}>{Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 3 + i).map((year) => <option key={year}>{year}</option>)}</select></div></label>
        <label>Cidade<select value={period.city} onChange={(e) => setPeriod({ ...period, city: e.target.value })}><option value="">Todas as cidades</option>{cities.map((city) => <option key={city}>{city}</option>)}</select></label>
      </div>
    </section>
    {!valid && <p className="auth-error" role="alert">O período inicial precisa ser anterior ou igual ao final.</p>}
    {isDemo && <div className="demo-notice"><b>DADOS FICTÍCIOS — AMBIENTE DE DEMONSTRAÇÃO.</b> A análise utiliza apenas os dados de exemplo do navegador.</div>}
    {!isDemo && remoteLoading && <div className="panel" role="status">Carregando tendências da API…</div>}
    {!isDemo && apiMessage && <div className="panel auth-error" role="alert"><p>{apiMessage}</p><button type="button" onClick={() => setReloadCount((value) => value + 1)}>Tentar novamente</button></div>}
    <div className="trend-summary-cards">
      <article><span>Em alta</span><strong>{rows.filter((r) => r.variation !== null && r.variation >= 5).length}</strong></article>
      <article><span>Estáveis</span><strong>{rows.filter((r) => r.variation !== null && r.variation > -5 && r.variation < 5).length}</strong></article>
      <article><span>Em queda</span><strong>{rows.filter((r) => r.variation !== null && r.variation <= -5).length}</strong></article>
    </div>
    <section className="panel"><div className="panel-title"><div><span className="eyebrow">ANÁLISE POR CATEGORIA</span><h3>Movimentação do mercado da sua empresa</h3></div><small>Ordenado por crescimento</small></div>
      <div className="table-wrap"><table><thead><tr><th>Categoria</th><th>Faturamento atual</th><th>Faturamento anterior</th><th>Variação</th><th>Classificação</th></tr></thead><tbody>
        {rows.map((row) => <tr key={row.category}><td><b>{row.category}</b></td><td>{money(row.now)}</td><td>{money(row.before)}</td><td>{formatVariation(row.variation)}</td><td><span className={`trend-status ${row.classification.toLowerCase().replace(' ', '-')}`}>{row.classification}</span></td></tr>)}
      </tbody></table>{rows.length === 0 && !remoteLoading && <p>Não há dados para o período selecionado.</p>}</div>
    </section>
    <div className="panel trend-rules"><b>Regras utilizadas</b><p><span className="trend-status alta">ALTA</span> variação maior ou igual a +5% · <span className="trend-status queda">QUEDA</span> variação menor ou igual a -5% · <span className="trend-status estável">ESTÁVEL</span> variação entre -5% e +5%.</p><small>Sem faturamento no período anterior, a categoria aparece como “Sem base” e não recebe classificação automática. {isDemo ? 'Fonte: dados fictícios da demonstração.' : 'Fonte: API do back-end.'}</small></div>
  </>;
}
