import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Boxes, CalendarRange, MapPin, TrendingUp } from 'lucide-react';
import { money, quantity, total, type Sale } from '@/data/demo';
import type { IndicadoresResponse, CategoriaTendencia, IndicadoresParams } from '@/types/indicadores';
import { getIndicadores } from '@/services/indicadoresService';
import { getTendencias } from '@/services/tendenciasService';
import { getApiErrorMessage } from '@/services/api';

type Props = { sales: Sale[]; defaultCity: string };
type Period = { startMonth: number; startYear: number; endMonth: number; endYear: number; city: string };

const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const cities = ['Toritama', 'Caruaru', 'Santa Cruz do Capibaribe'];

function monthIndex(year: number, month: number) { return year * 12 + month - 1; }
function dateIndex(date: string) {
  const [year, month] = date.split('-').map(Number);
  return monthIndex(year, month);
}
function defaultPeriod(sales: Sale[] = []): Period {
  const latestSale = [...sales].sort((a, b) => b.date.localeCompare(a.date))[0];
  const now = latestSale ? new Date(`${latestSale.date}T12:00:00`) : new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  const start = new Date(end.getFullYear(), end.getMonth(), 1);
  return { startMonth: start.getMonth() + 1, startYear: start.getFullYear(), endMonth: end.getMonth() + 1, endYear: end.getFullYear(), city: '' };
}
function formatVariation(value: number | null) {
  if (value === null) return 'Sem base anterior';
  return `${value > 0 ? '+' : ''}${value.toFixed(1).replace('.', ',')}%`;
}

export function DashboardIndicators({ sales, defaultCity }: Props) {
  const [period, setPeriod] = useState<Period>(() => defaultPeriod(sales));
  const [showPrevious, setShowPrevious] = useState(true);
  const [remoteData, setRemoteData] = useState<IndicadoresResponse | null>(null);
  const [apiMessage, setApiMessage] = useState('');
  const apiConfigured = Boolean(import.meta.env.VITE_API_URL?.trim());
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
    if (!apiConfigured || !validPeriod) { setRemoteData(null); setApiMessage(''); return; }
    const controller = new AbortController();
    const params: IndicadoresParams = {
      mesInicial: period.startMonth, anoInicial: period.startYear,
      mesFinal: period.endMonth, anoFinal: period.endYear,
      ...(period.city ? { cidade: period.city } : {}),
    };
    getIndicadores(params, controller.signal)
      .then((data) => { setRemoteData(data); setApiMessage(''); })
      .catch((error: unknown) => { if (!controller.signal.aborted) { setRemoteData(null); setApiMessage(`${getApiErrorMessage(error)} Exibindo os registros salvos nesta conta.`); } });
    return () => controller.abort();
  }, [apiConfigured, validPeriod, period.startMonth, period.startYear, period.endMonth, period.endYear, period.city]);

  const revenue = remoteData?.faturamentoTotal ?? total(filtered.current);
  const pieces = remoteData?.pecasVendidas ?? quantity(filtered.current);
  const previousRevenue = remoteData?.faturamentoTotalAnterior ?? total(filtered.previous);
  const categoryNames = Array.from(new Set([...filtered.current, ...filtered.previous].map((sale) => sale.category))).sort();
  const localGroups = categoryNames.map((category) => {
    const currentRows = filtered.current.filter((sale) => sale.category === category);
    const previousRows = filtered.previous.filter((sale) => sale.category === category);
    const currentRevenue = total(currentRows);
    const previousCategoryRevenue = total(previousRows);
    const variation = previousCategoryRevenue > 0
      ? ((currentRevenue - previousCategoryRevenue) / previousCategoryRevenue) * 100
      : currentRevenue === 0 ? 0 : null;
    return { category, revenue: currentRevenue, previousRevenue: previousCategoryRevenue, pieces: quantity(currentRows), variation };
  });
  const groups = (remoteData
    ? remoteData.categorias.map((item) => ({ category: item.categoria, revenue: item.faturamento, previousRevenue: item.faturamentoAnterior ?? 0, pieces: item.pecasVendidas ?? 0, variation: item.variacaoPercentual ?? null }))
    : localGroups).sort((a, b) => b.revenue - a.revenue);
  const leader = remoteData?.categoriaLider?.categoria
    ? { category: remoteData.categoriaLider.categoria, revenue: remoteData.categoriaLider.faturamento ?? 0 }
    : groups[0] && groups[0].revenue > 0 ? groups[0] : undefined;
  const maxBar = Math.max(1, ...groups.map((group) => group.revenue), ...(showPrevious ? groups.map((group) => group.previousRevenue) : []));
  const revenueChange = showPrevious && previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : null;

  return (
    <>
      <section className="trama-filter-panel" aria-label="Filtros de indicadores">
        <div className="trama-filter-heading"><CalendarRange size={17} /><b>Período de análise</b><span>Os indicadores são recalculados ao alterar os filtros.</span></div>
        <div className="trama-filter-grid">
          <label>De
            <div className="trama-month-fields">
              <select value={period.startMonth} onChange={(e) => setPeriod({ ...period, startMonth: Number(e.target.value) })}>{monthNames.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select>
              <select aria-label="Ano inicial" value={period.startYear} onChange={(e) => setPeriod({ ...period, startYear: Number(e.target.value) })}>{Array.from({ length: 8 }, (_, index) => new Date().getFullYear() - 3 + index).map((year) => <option key={year}>{year}</option>)}</select>
            </div>
          </label>
          <label>Até
            <div className="trama-month-fields">
              <select value={period.endMonth} onChange={(e) => setPeriod({ ...period, endMonth: Number(e.target.value) })}>{monthNames.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select>
              <select aria-label="Ano final" value={period.endYear} onChange={(e) => setPeriod({ ...period, endYear: Number(e.target.value) })}>{Array.from({ length: 8 }, (_, index) => new Date().getFullYear() - 3 + index).map((year) => <option key={year}>{year}</option>)}</select>
            </div>
          </label>
          <label><span><MapPin size={13} /> Cidade</span>
            <select value={period.city} onChange={(e) => setPeriod({ ...period, city: e.target.value })}>
              <option value="">Todas as cidades</option>
              {cities.map((city) => <option key={city}>{city}</option>)}
              <option>Outra cidade do Agreste</option>
            </select>
          </label>
          <label className="trama-compare-toggle"><input type="checkbox" checked={showPrevious} onChange={(e) => setShowPrevious(e.target.checked)} /> Comparar com período anterior</label>
        </div>
        {!validPeriod && <p className="auth-error" role="alert">O período inicial precisa ser anterior ou igual ao período final.</p>}
      </section>

      <div className="metrics trama-kpis">
        <article><span><TrendingUp size={15} /> Faturamento total</span><strong>{money(revenue)}</strong><small>{!showPrevious ? 'Comparação com período anterior desativada' : revenueChange === null ? 'Sem base anterior para comparação' : `${formatVariation(revenueChange)} em relação ao período anterior`}</small></article>
        <article><span><Boxes size={15} /> Peças vendidas</span><strong>{pieces.toLocaleString('pt-BR')}</strong><small>{remoteData ? 'Valor retornado pela API' : `${filtered.current.length} registros de venda no período`}</small></article>
        <article><span><BarChart3 size={15} /> Categoria líder</span><strong>{leader?.category || '—'}</strong><small>{leader ? `${money(leader.revenue)} em faturamento` : 'Sem categoria no período'}</small></article>
      </div>

      <section className="panel trama-chart-panel">
        <div className="panel-title"><div><span className="eyebrow">DESEMPENHO COMERCIAL</span><h3>Faturamento por categoria</h3></div><span className="trama-chart-legend"><i /> Atual {showPrevious && <><i className="previous-dot" /> Anterior</>}</span></div>
        {!validPeriod ? null : groups.length === 0 ? <p>Não há dados para o período selecionado. Cadastre vendas para visualizar os indicadores.</p> : <div className="trama-category-bars">
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
        </tbody></table>{groups.length === 0 && <p>Não há dados para o período selecionado.</p>}</div>
      </section>
      {apiMessage && <p className="auth-error" role="status">{apiMessage}</p>}
      <p className="data-source-note">Fonte: {remoteData ? 'API do backend (GET /api/indicadores).' : 'registros de vendas salvos nesta conta e neste navegador.'}</p>
    </>
  );
}

export function TrendAnalysis({ sales, defaultCity }: Props) {
  const [period, setPeriod] = useState<Period>(() => defaultPeriod(sales));
  const [remoteTrends, setRemoteTrends] = useState<CategoriaTendencia[] | null>(null);
  const [apiMessage, setApiMessage] = useState('');
  const apiConfigured = Boolean(import.meta.env.VITE_API_URL?.trim());
  const start = monthIndex(period.startYear, period.startMonth);
  const end = monthIndex(period.endYear, period.endMonth);
  const valid = start <= end;
  const span = end - start + 1;
  const previousStart = start - span;
  const previousEnd = start - 1;
  useEffect(() => {
    if (!apiConfigured || !valid) { setRemoteTrends(null); setApiMessage(''); return; }
    const controller = new AbortController();
    const params: IndicadoresParams = {
      mesInicial: period.startMonth, anoInicial: period.startYear,
      mesFinal: period.endMonth, anoFinal: period.endYear,
      ...(period.city ? { cidade: period.city } : {}),
    };
    getTendencias(params, controller.signal)
      .then((data) => { setRemoteTrends(data); setApiMessage(''); })
      .catch((error: unknown) => { if (!controller.signal.aborted) { setRemoteTrends(null); setApiMessage(`${getApiErrorMessage(error)} Exibindo a análise dos registros locais.`); } });
    return () => controller.abort();
  }, [apiConfigured, valid, period.startMonth, period.startYear, period.endMonth, period.endYear, period.city]);
  const current = valid ? sales.filter((sale) => {
    const city = sale.city || defaultCity;
    return dateIndex(sale.date) >= start && dateIndex(sale.date) <= end && (!period.city || city === period.city);
  }) : [];
  const previous = valid ? sales.filter((sale) => {
    const city = sale.city || defaultCity;
    return dateIndex(sale.date) >= previousStart && dateIndex(sale.date) <= previousEnd && (!period.city || city === period.city);
  }) : [];
  const names = Array.from(new Set([...current, ...previous].map((sale) => sale.category)));
  const localRows = names.map((category) => {
    const now = total(current.filter((sale) => sale.category === category));
    const before = total(previous.filter((sale) => sale.category === category));
    const variation = before > 0 ? ((now - before) / before) * 100 : now === 0 ? 0 : null;
    return { category, now, before, variation };
  });
  const rows = (remoteTrends !== null
    ? remoteTrends.map((item) => ({ category: item.categoria, now: item.faturamento, before: item.faturamentoAnterior ?? 0, variation: item.variacaoPercentual }))
    : localRows).sort((a, b) => (b.variation ?? -Infinity) - (a.variation ?? -Infinity));

  return <>
    <section className="trama-filter-panel"><div className="trama-filter-heading"><TrendingUp size={17}/><b>Classificação de tendências</b><span>Comparação com o período imediatamente anterior.</span></div>
      <div className="trama-filter-grid">
        <label>Início<div className="trama-month-fields"><select value={period.startMonth} onChange={(e) => setPeriod({ ...period, startMonth: Number(e.target.value) })}>{monthNames.map((month, i) => <option key={month} value={i + 1}>{month}</option>)}</select><select value={period.startYear} aria-label="Ano inicial" onChange={(e) => setPeriod({ ...period, startYear: Number(e.target.value) })}>{Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 3 + i).map((year) => <option key={year}>{year}</option>)}</select></div></label>
        <label>Fim<div className="trama-month-fields"><select value={period.endMonth} onChange={(e) => setPeriod({ ...period, endMonth: Number(e.target.value) })}>{monthNames.map((month, i) => <option key={month} value={i + 1}>{month}</option>)}</select><select value={period.endYear} aria-label="Ano final" onChange={(e) => setPeriod({ ...period, endYear: Number(e.target.value) })}>{Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 3 + i).map((year) => <option key={year}>{year}</option>)}</select></div></label>
        <label>Cidade<select value={period.city} onChange={(e) => setPeriod({ ...period, city: e.target.value })}><option value="">Todas as cidades</option>{cities.map((city) => <option key={city}>{city}</option>)}</select></label>
      </div>
    </section>
    {!valid && <p className="auth-error" role="alert">O período inicial precisa ser anterior ou igual ao final.</p>}
    <div className="trend-summary-cards">
      <article><span>Em alta</span><strong>{rows.filter((r) => r.variation !== null && r.variation >= 5).length}</strong></article>
      <article><span>Estáveis</span><strong>{rows.filter((r) => r.variation !== null && r.variation > -5 && r.variation < 5).length}</strong></article>
      <article><span>Em queda</span><strong>{rows.filter((r) => r.variation !== null && r.variation <= -5).length}</strong></article>
    </div>
    <section className="panel"><div className="panel-title"><div><span className="eyebrow">ANÁLISE POR CATEGORIA</span><h3>Movimentação do mercado da sua empresa</h3></div><small>Ordenado por crescimento</small></div>
      <div className="table-wrap"><table><thead><tr><th>Categoria</th><th>Faturamento atual</th><th>Faturamento anterior</th><th>Variação</th><th>Classificação</th></tr></thead><tbody>
        {rows.map((row) => {
          const classification = row.variation === null ? 'SEM BASE' : row.variation >= 5 ? 'ALTA' : row.variation <= -5 ? 'QUEDA' : 'ESTÁVEL';
          return <tr key={row.category}><td><b>{row.category}</b></td><td>{money(row.now)}</td><td>{money(row.before)}</td><td>{formatVariation(row.variation)}</td><td><span className={`trend-status ${classification.toLowerCase().replace(' ', '-')}`}>{classification}</span></td></tr>;
        })}
      </tbody></table>{rows.length === 0 && <p>Não há dados para o período selecionado. Registre vendas em Dados de Vendas para iniciar a análise.</p>}</div>
    </section>
    {apiMessage && <p className="auth-error" role="status">{apiMessage}</p>}
    <div className="panel trend-rules"><b>Regras utilizadas</b><p><span className="trend-status alta">ALTA</span> variação maior ou igual a +5% · <span className="trend-status queda">QUEDA</span> variação menor ou igual a -5% · <span className="trend-status estável">ESTÁVEL</span> variação entre -5% e +5%.</p><small>Sem faturamento no período anterior, a categoria aparece como “Sem base” e não recebe classificação automática. {remoteTrends ? 'Fonte: API do backend.' : 'Fonte: vendas cadastradas nesta conta.'}</small></div>
  </>;
}
