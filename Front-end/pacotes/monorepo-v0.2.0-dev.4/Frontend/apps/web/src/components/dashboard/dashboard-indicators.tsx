import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, Boxes, CalendarRange, MapPin, TrendingUp } from 'lucide-react';
import { money, quantity, total, type Sale } from '@/data/demo';
import type { IndicadoresResponse, CategoriaTendencia, IndicadoresParams } from '@/types/indicadores';
import { getIndicadores } from '@/services/indicadoresService';
import { getTendencias } from '@/services/tendenciasService';
import { api, getApiErrorMessage } from '@/services/api';
import { listCategories, type CategoryOption } from '@/services/vendasService';

type Props = { sales: Sale[]; defaultCity: string; isDemo?: boolean; userId?: string };
type Period = { startMonth: number; startYear: number; endMonth: number; endYear: number; city: string; category: string };

const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
function monthIndex(year: number, month: number) { return year * 12 + month - 1; }
function dateIndex(date: string) {
  const [year, month] = date.split('-').map(Number);
  return monthIndex(year, month);
}
function defaultPeriod(sales: Sale[] = []): Period {
  const latestSale = [...sales].sort((a, b) => b.mesAno.localeCompare(a.mesAno))[0];
  const now = latestSale ? new Date(`${latestSale.mesAno}-01T12:00:00`) : new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  const start = new Date(end.getFullYear(), end.getMonth(), 1);
  return { startMonth: start.getMonth() + 1, startYear: start.getFullYear(), endMonth: end.getMonth() + 1, endYear: end.getFullYear(), city: '', category: '' };
}
function formatVariation(value: number | null) {
  if (value === null) return 'Sem base anterior';
  return `${value > 0 ? '+' : ''}${value.toFixed(1).replace('.', ',')}%`;
}

type SavedPreset<T> = { id: string; name: string; value: T };
function SavedFilterControls<T>({ storageKey, context, isDemo, value, onApply }: { storageKey: string; context: 'dashboard' | 'tendencias'; isDemo: boolean; value: T; onApply: (value: T) => void }) {
  const [items, setItems] = useState<SavedPreset<T>[]>([]);
  const [name, setName] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    if (isDemo) {
      try { const raw = window.localStorage.getItem(storageKey); setItems(raw ? JSON.parse(raw) as SavedPreset<T>[] : []); }
      catch { setItems([]); }
      return;
    }
    try {
      const response = await api.get<Array<{ idFiltro: number; nome: string; configuracaoJson: string }>>('/api/filtros-salvos', { params: { contexto: context } });
      setItems(response.data.map((item) => ({ id: String(item.idFiltro), name: item.nome, value: JSON.parse(item.configuracaoJson) as T })));
    } catch (caught) { setError(getApiErrorMessage(caught)); }
  }, [storageKey, context, isDemo]);
  useEffect(() => { void refresh(); }, [refresh]);
  const persistLocal = (next: SavedPreset<T>[]) => { setItems(next); window.localStorage.setItem(storageKey, JSON.stringify(next)); };
  const save = async () => {
    const normalized = name.trim(); if (!normalized) return;
    setBusy(true); setError('');
    try {
      if (isDemo) {
        const next = [...items.filter((item) => item.name.toLocaleLowerCase() !== normalized.toLocaleLowerCase()), { id: window.crypto?.randomUUID?.() || String(Date.now()), name: normalized, value }];
        persistLocal(next);
      } else {
        await api.post('/api/filtros-salvos', { nome: normalized, contexto: context, configuracaoJson: JSON.stringify(value) });
        await refresh();
      }
      setName('');
    } catch (caught) { setError(getApiErrorMessage(caught)); }
    finally { setBusy(false); }
  };
  const removeSelected = async () => {
    if (!selectedId || !window.confirm('Excluir o filtro salvo selecionado?')) return;
    setBusy(true); setError('');
    try {
      if (isDemo) persistLocal(items.filter((item) => item.id !== selectedId));
      else { await api.delete(`/api/filtros-salvos/${selectedId}`); await refresh(); }
      setSelectedId('');
    } catch (caught) { setError(getApiErrorMessage(caught)); }
    finally { setBusy(false); }
  };
  return <div className="saved-filter-controls"><label>Filtros salvos<select value={selectedId} onChange={(event) => { setSelectedId(event.target.value); const selected = items.find((item) => item.id === event.target.value); if (selected) onApply(selected.value); }}><option value="">Selecionar filtro salvo</option>{items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Nome para salvar<input maxLength={60} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Últimos meses" /></label><button type="button" className="outline-button" onClick={() => void save()} disabled={!name.trim() || busy}>Salvar filtros</button><button type="button" className="text-button" onClick={() => void removeSelected()} disabled={!selectedId || busy}>Excluir selecionado</button>{error && <p role="alert" className="auth-error">{error}</p>}</div>;
}

export function DashboardIndicators({ sales, defaultCity, isDemo = true, userId = 'anonymous' }: Props) {
  const [period, setPeriod] = useState<Period>(() => defaultPeriod(sales));
  const [showPrevious, setShowPrevious] = useState(true);
  const [remoteData, setRemoteData] = useState<IndicadoresResponse | null>(null);
  const [apiMessage, setApiMessage] = useState('');
  const [remoteLoading, setRemoteLoading] = useState(!isDemo);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const apiConfigured = !isDemo;
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
      const saleMonth = dateIndex(sale.mesAno);
      const city = sale.city || defaultCity;
      if (period.city && city !== period.city) continue;
      if (period.category && sale.category !== period.category) continue;
      if (saleMonth >= start && saleMonth <= end) current.push(sale);
      if (saleMonth >= previousStart && saleMonth <= previousEnd) previous.push(sale);
    }
    return { current, previous };
  }, [sales, period.city, period.category, start, end, previousStart, previousEnd, validPeriod, defaultCity]);

  useEffect(() => {
    if (isDemo) { setCategoryOptions([]); return; }
    let active = true;
    listCategories().then((items) => { if (active) setCategoryOptions(items); })
      .catch((error: unknown) => { if (active) setApiMessage(getApiErrorMessage(error)); });
    return () => { active = false; };
  }, [isDemo]);

  useEffect(() => {
    if (!apiConfigured || !validPeriod) {
      setRemoteData(null);
      setApiMessage('');
      setRemoteLoading(false);
      return;
    }
    const controller = new AbortController();
    setRemoteLoading(true);
    setApiMessage('');
    const params: IndicadoresParams = {
      inicio: `${period.startYear}-${String(period.startMonth).padStart(2, '0')}`,
      fim: `${period.endYear}-${String(period.endMonth).padStart(2, '0')}`,
      ...(period.category && !isDemo ? { categoriaId: Number(period.category) } : {}),
      ...(isDemo ? (period.city ? { cidade: period.city } : {}) : (defaultCity ? { cidade: defaultCity } : {})),
    };
    getIndicadores(params, controller.signal)
      .then((data) => { setRemoteData(data); setApiMessage(''); })
      .catch((error: unknown) => { if (!controller.signal.aborted) { setRemoteData(null); setApiMessage(`${getApiErrorMessage(error)} Os indicadores do servidor não foram carregados.`); } })
      .finally(() => { if (!controller.signal.aborted) setRemoteLoading(false); });
    return () => controller.abort();
  }, [apiConfigured, isDemo, defaultCity, validPeriod, period.startMonth, period.startYear, period.endMonth, period.endYear, period.city, period.category]);

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
    : isDemo ? localGroups : []).sort((a, b) => b.revenue - a.revenue);
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
          <label><span><MapPin size={13} /> Cidade da confecção</span><input value={defaultCity} readOnly /></label>
          <label>Categoria
            <select value={period.category} onChange={(e) => setPeriod({ ...period, category: e.target.value })}>
              <option value="">Todas as categorias</option>
              {isDemo
                ? Array.from(new Set(sales.map((sale) => sale.category))).sort().map((category) => <option key={category} value={category}>{category}</option>)
                : categoryOptions.map((category) => <option key={category.idCategoria} value={category.idCategoria}>{category.nome}</option>)}
            </select>
          </label>
          <label className="trama-compare-toggle"><input type="checkbox" checked={showPrevious} onChange={(e) => setShowPrevious(e.target.checked)} /> Comparar com período anterior</label>
        </div>
        <SavedFilterControls storageKey={`trama:${userId}:saved-filters:dashboard:v2:v2`} context="dashboard" isDemo={isDemo} value={{ period, showPrevious }} onApply={(saved) => { setPeriod(saved.period); setShowPrevious(saved.showPrevious); }} />
        {!validPeriod && <p className="auth-error" role="alert">O período inicial precisa ser anterior ou igual ao período final.</p>}
      </section>

      <div className="metrics trama-kpis">
        <article><span><TrendingUp size={15} /> Faturamento total</span><strong>{!isDemo && !remoteData ? '—' : money(revenue)}</strong><small>{!remoteData && !isDemo ? (remoteLoading ? 'Carregando do servidor…' : 'Não disponível') : !showPrevious ? 'Comparação com período anterior desativada' : revenueChange === null ? 'Sem base anterior para comparação' : `${formatVariation(revenueChange)} em relação ao período anterior`}</small></article>
        <article><span><Boxes size={15} /> Peças vendidas</span><strong>{!isDemo && !remoteData ? '—' : pieces.toLocaleString('pt-BR')}</strong><small>{remoteData ? 'Valor retornado pela API' : isDemo ? `${filtered.current.length} registros de demonstração` : 'Não disponível'}</small></article>
        <article><span><BarChart3 size={15} /> Categoria líder</span><strong>{!isDemo && !remoteData ? '—' : leader?.category || '—'}</strong><small>{leader ? `${money(leader.revenue)} em faturamento` : 'Sem categoria no período'}</small></article>
        <article><span>Ticket médio por peça</span><strong>{!isDemo && !remoteData ? '—' : remoteData ? money(remoteData.ticketMedioPorPeca) : money(pieces > 0 ? revenue / pieces : 0)}</strong><small>Faturamento dividido pela quantidade de peças</small></article>
      </div>

      <section className="panel trama-chart-panel">
        <div className="panel-title"><div><span className="eyebrow">DESEMPENHO COMERCIAL</span><h3>Faturamento por categoria</h3></div><span className="trama-chart-legend"><i /> Atual {showPrevious && <><i className="previous-dot" /> Anterior</>}</span></div>
        {!validPeriod ? null : groups.length === 0 ? <p>{!isDemo && remoteLoading ? 'Carregando indicadores do servidor…' : !isDemo && apiMessage ? 'Não foi possível carregar os indicadores. Confira a conexão e atualize a página.' : 'Não há dados para o período selecionado. Cadastre lançamentos para visualizar os indicadores.'}</p> : <div className="trama-category-bars">
          {groups.map((group) => <div className="trama-category-bar" key={group.category}>
            <div className="trama-category-bar-label"><b>{group.category}</b><span>{money(group.revenue)}</span></div>
            <div className="trama-bar-track"><i style={{ width: `${(group.revenue / maxBar) * 100}%` }} /></div>
            {showPrevious && <div className="trama-bar-track previous"><i style={{ width: `${(group.previousRevenue / maxBar) * 100}%` }} /></div>}
          </div>)}
        </div>}
      </section>

      <section className="panel">
        <div className="panel-title"><div><span className="eyebrow">DETALHAMENTO</span><h3>Indicadores por categoria</h3></div><small>{isDemo ? (period.city || 'Todas as cidades demonstrativas') : defaultCity}</small></div>
        <div className="table-wrap"><table><thead><tr><th>Categoria</th><th>Peças</th><th>Faturamento</th><th>Período anterior</th><th>Variação</th></tr></thead><tbody>
          {groups.map((group) => <tr key={group.category}><td><b>{group.category}</b></td><td>{group.pieces.toLocaleString('pt-BR')}</td><td>{money(group.revenue)}</td><td>{showPrevious ? money(group.previousRevenue) : '—'}</td><td>{showPrevious ? formatVariation(group.variation) : '—'}</td></tr>)}
        </tbody></table>{groups.length === 0 && <p>{!isDemo && remoteLoading ? 'Carregando dados do servidor…' : !isDemo && apiMessage ? 'Os dados não puderam ser carregados.' : 'Não há dados para o período selecionado.'}</p>}</div>
      </section>
      {apiMessage && <p className="auth-error" role="status">{apiMessage}</p>}
      <p className="data-source-note">Fonte: {remoteData ? 'API do Back-end (GET /api/indicadores).' : isDemo ? 'lançamentos mensais fictícios editados nesta sessão do navegador.' : 'aguardando resposta do Back-end.'}</p>
    </>
  );
}

export function TrendAnalysis({ sales, defaultCity, isDemo = true, userId = 'anonymous' }: Props) {
  const [period, setPeriod] = useState<Period>(() => defaultPeriod(sales));
  const [remoteTrends, setRemoteTrends] = useState<CategoriaTendencia[] | null>(null);
  const [apiMessage, setApiMessage] = useState('');
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const apiConfigured = !isDemo;
  const start = monthIndex(period.startYear, period.startMonth);
  const end = monthIndex(period.endYear, period.endMonth);
  const valid = start <= end;
  const span = end - start + 1;
  const previousStart = start - span;
  const previousEnd = start - 1;
  useEffect(() => {
    if (isDemo) { setCategoryOptions([]); return; }
    let active = true;
    listCategories().then((items) => { if (active) setCategoryOptions(items); })
      .catch((error: unknown) => { if (active) setApiMessage(getApiErrorMessage(error)); });
    return () => { active = false; };
  }, [isDemo]);

  useEffect(() => {
    if (!apiConfigured || !valid) { setRemoteTrends(null); setApiMessage(''); return; }
    const controller = new AbortController();
    const params: IndicadoresParams = {
      inicio: `${period.startYear}-${String(period.startMonth).padStart(2, '0')}`,
      fim: `${period.endYear}-${String(period.endMonth).padStart(2, '0')}`,
      ...(period.category && !isDemo ? { categoriaId: Number(period.category) } : {}),
      ...(isDemo ? (period.city ? { cidade: period.city } : {}) : (defaultCity ? { cidade: defaultCity } : {})),
    };
    getTendencias(params, controller.signal)
      .then((data) => { setRemoteTrends(data); setApiMessage(''); })
      .catch((error: unknown) => { if (!controller.signal.aborted) { setRemoteTrends(null); setApiMessage(`${getApiErrorMessage(error)} A análise do servidor não foi carregada.`); } });
    return () => controller.abort();
  }, [apiConfigured, isDemo, defaultCity, valid, period.startMonth, period.startYear, period.endMonth, period.endYear, period.city, period.category]);
  const current = valid ? sales.filter((sale) => {
    const city = sale.city || defaultCity;
    return dateIndex(sale.mesAno) >= start && dateIndex(sale.mesAno) <= end && (!period.city || city === period.city) && (!period.category || sale.category === period.category);
  }) : [];
  const previous = valid ? sales.filter((sale) => {
    const city = sale.city || defaultCity;
    return dateIndex(sale.mesAno) >= previousStart && dateIndex(sale.mesAno) <= previousEnd && (!period.city || city === period.city) && (!period.category || sale.category === period.category);
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
    : isDemo ? localRows : []).sort((a, b) => (b.variation ?? -Infinity) - (a.variation ?? -Infinity));

  return <>
    <section className="trama-filter-panel"><div className="trama-filter-heading"><TrendingUp size={17}/><b>Classificação de tendências</b><span>Comparação com o período imediatamente anterior.</span></div>
      <div className="trama-filter-grid">
        <label>Início<div className="trama-month-fields"><select value={period.startMonth} onChange={(e) => setPeriod({ ...period, startMonth: Number(e.target.value) })}>{monthNames.map((month, i) => <option key={month} value={i + 1}>{month}</option>)}</select><select value={period.startYear} aria-label="Ano inicial" onChange={(e) => setPeriod({ ...period, startYear: Number(e.target.value) })}>{Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 3 + i).map((year) => <option key={year}>{year}</option>)}</select></div></label>
        <label>Fim<div className="trama-month-fields"><select value={period.endMonth} onChange={(e) => setPeriod({ ...period, endMonth: Number(e.target.value) })}>{monthNames.map((month, i) => <option key={month} value={i + 1}>{month}</option>)}</select><select value={period.endYear} aria-label="Ano final" onChange={(e) => setPeriod({ ...period, endYear: Number(e.target.value) })}>{Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 3 + i).map((year) => <option key={year}>{year}</option>)}</select></div></label>
        <label>Cidade da confecção<input value={defaultCity} readOnly /></label>
        <label>Categoria<select value={period.category} onChange={(e) => setPeriod({ ...period, category: e.target.value })}><option value="">Todas as categorias</option>{isDemo ? Array.from(new Set(sales.map((sale) => sale.category))).sort().map((item) => <option key={item} value={item}>{item}</option>) : categoryOptions.map((item) => <option key={item.idCategoria} value={item.idCategoria}>{item.nome}</option>)}</select></label>
      </div>
      <SavedFilterControls storageKey={`trama:${userId}:saved-filters:trends:v2`} context="tendencias" isDemo={isDemo} value={period} onApply={setPeriod} />
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
      </tbody></table>{rows.length === 0 && <p>{!isDemo && apiMessage ? 'Não foi possível carregar a análise do servidor.' : !isDemo ? 'Carregando análise do servidor ou sem dados disponíveis.' : 'Não há dados para o período selecionado. Registre vendas para iniciar a análise.'}</p>}</div>
    </section>
    {apiMessage && <p className="auth-error" role="status">{apiMessage}</p>}
    <div className="panel trend-rules"><b>Regras utilizadas</b><p><span className="trend-status alta">ALTA</span> variação maior ou igual a +5% · <span className="trend-status queda">QUEDA</span> variação menor ou igual a -5% · <span className="trend-status estável">ESTÁVEL</span> variação entre -5% e +5%.</p><small>Sem faturamento no período anterior, a categoria aparece como “Sem base” e não recebe classificação automática. {remoteTrends ? 'Fonte: API do Back-end.' : isDemo ? 'Fonte: vendas demonstrativas do navegador.' : 'Aguardando dados do Back-end.'}</small></div>
  </>;
}
