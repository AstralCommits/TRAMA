import { useEffect, useMemo, useState } from 'react';
import { GitCompare, RefreshCw } from 'lucide-react';
import { money, total, quantity, type Sale } from '@/data/demo';
import { getIndicadores } from '@/services/indicadoresService';
import { getApiErrorMessage } from '@/services/api';
import type { IndicadoresResponse } from '@/types/indicadores';

type Props = { sales: Sale[]; defaultCity: string; isDemo: boolean };
type CategoryRow = {
  category: string;
  revenue: number;
  pieces: number;
  previousRevenue: number;
  previousPieces: number;
  variation: number | null;
};

function monthIndex(value: string) {
  const [year, month] = value.split('-').map(Number);
  return year * 12 + month - 1;
}
function formatVariation(value: number | null) {
  if (value === null) return 'Sem base anterior';
  return `${value > 0 ? '+' : ''}${value.toFixed(1).replace('.', ',')}%`;
}
function totalsFor(sales: Sale[], category: string, from: number, to: number) {
  const rows = sales.filter((sale) => sale.category === category && monthIndex(sale.mesAno) >= from && monthIndex(sale.mesAno) <= to);
  return { revenue: total(rows), pieces: quantity(rows) };
}

export function CategoryComparison({ sales, defaultCity, isDemo }: Props) {
  const latestMonth = useMemo(() => sales.map((sale) => sale.mesAno).sort().at(-1)
    || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`, [sales]);
  const [start, setStart] = useState(latestMonth);
  const [end, setEnd] = useState(latestMonth);
  const [remoteData, setRemoteData] = useState<IndicadoresResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!isDemo);
  const [firstCategory, setFirstCategory] = useState('');
  const [secondCategory, setSecondCategory] = useState('');
  const validPeriod = Boolean(start && end && start <= end);
  const span = validPeriod ? monthIndex(end) - monthIndex(start) + 1 : 0;
  const previousStart = validPeriod ? monthIndex(start) - span : 0;
  const previousEnd = validPeriod ? monthIndex(start) - 1 : -1;

  useEffect(() => {
    if (isDemo || !validPeriod) {
      setRemoteData(null);
      setLoading(false);
      setError('');
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getIndicadores({ inicio: start, fim: end, ...(defaultCity ? { cidade: defaultCity } : {}) }, controller.signal)
      .then((data) => { setRemoteData(data); })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setRemoteData(null);
          setError(getApiErrorMessage(caught));
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [isDemo, validPeriod, start, end, defaultCity]);

  const rows = useMemo<CategoryRow[]>(() => {
    if (!validPeriod) return [];
    if (!isDemo && remoteData) {
      return remoteData.categorias.map((item) => ({
        category: item.categoria,
        revenue: item.faturamento,
        pieces: item.pecasVendidas,
        previousRevenue: item.faturamentoAnterior ?? 0,
        previousPieces: item.pecasVendidasAnterior ?? 0,
        variation: item.variacaoPercentual ?? null,
      }));
    }
    if (!isDemo) return [];
    const currentStart = monthIndex(start);
    const currentEnd = monthIndex(end);
    const names = [...new Set(sales.map((sale) => sale.category))].sort();
    return names.map((category) => {
      const current = totalsFor(sales, category, currentStart, currentEnd);
      const previous = totalsFor(sales, category, previousStart, previousEnd);
      const variation = previous.revenue > 0
        ? ((current.revenue - previous.revenue) / previous.revenue) * 100
        : current.revenue === 0 ? 0 : null;
      return {
        category,
        revenue: current.revenue,
        pieces: current.pieces,
        previousRevenue: previous.revenue,
        previousPieces: previous.pieces,
        variation,
      };
    });
  }, [validPeriod, isDemo, remoteData, sales, start, end, previousStart, previousEnd]);

  const categories = rows.map((row) => row.category);
  const selectedFirstCategory = categories.includes(firstCategory) ? firstCategory : categories[0] || '';
  const selectedSecondCategory = categories.includes(secondCategory) && secondCategory !== selectedFirstCategory
    ? secondCategory
    : categories.find((item) => item !== selectedFirstCategory) || '';
  const selectedRows = rows.filter((row) => row.category === selectedFirstCategory || row.category === selectedSecondCategory);
  const maximumRevenue = Math.max(1, ...selectedRows.map((row) => row.revenue));

  return <>
    <section className="trama-filter-panel">
      <div className="trama-filter-heading"><GitCompare size={17} /><b>Comparação de categorias</b><span>Compare faturamento e quantidade no mesmo período.</span></div>
      <div className="trama-filter-grid">
        <label>De<input type="month" value={start} onChange={(event) => setStart(event.target.value)} /></label>
        <label>Até<input type="month" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
        <label>Primeira categoria<select value={selectedFirstCategory} onChange={(event) => setFirstCategory(event.target.value)}><option value="">Selecione</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Segunda categoria<select value={selectedSecondCategory} onChange={(event) => setSecondCategory(event.target.value)} disabled={categories.length < 2}><option value="">Selecione</option>{categories.filter((item) => item !== selectedFirstCategory).map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
    </section>
    {!validPeriod && <p role="alert" className="auth-error">O mês inicial deve ser anterior ou igual ao mês final.</p>}
    {!isDemo && error && <p role="alert" className="auth-error">{error}</p>}
    {!isDemo && loading && <section className="panel"><RefreshCw size={16} /> Carregando comparação do servidor…</section>}
    {validPeriod && !loading && !error && rows.length === 0 && <section className="panel"><p>Não há dados para comparar nesse período. Cadastre lançamentos mensais de vendas.</p></section>}
    {validPeriod && !loading && !error && selectedRows.length > 0 && <>
      <section className="panel">
        <div className="panel-title"><div><span className="eyebrow">FATURAMENTO POR CATEGORIA</span><h3>Resultado no período selecionado</h3></div><small>{start} a {end}</small></div>
        <div className="trama-category-bars">
          {selectedRows.map((row) => <div className="trama-category-bar" key={row.category}>
            <div className="trama-category-bar-label"><b>{row.category}</b><span>{money(row.revenue)}</span></div>
            <div className="trama-bar-track"><i style={{ width: `${(row.revenue / maximumRevenue) * 100}%` }} /></div>
          </div>)}
        </div>
      </section>
      <section className="panel">
        <div className="panel-title"><div><span className="eyebrow">COMPARAÇÃO DETALHADA</span><h3>Quantidade e faturamento</h3></div></div>
        <div className="table-wrap"><table><thead><tr><th>Categoria</th><th>Peças vendidas</th><th>Faturamento</th><th>Período anterior</th><th>Variação</th></tr></thead><tbody>
          {selectedRows.map((row) => <tr key={row.category}><td><b>{row.category}</b></td><td>{row.pieces.toLocaleString('pt-BR')}</td><td>{money(row.revenue)}</td><td>{money(row.previousRevenue)}</td><td>{formatVariation(row.variation)}</td></tr>)}
        </tbody></table></div>
        <p className="data-source-note">Fonte: {isDemo ? 'dados demonstrativos guardados neste navegador.' : 'API do Back-end (GET /api/indicadores).'} {defaultCity ? `Cidade da confecção: ${defaultCity}.` : ''}</p>
      </section>
    </>}
    <p className="data-source-note">A base atual registra totais mensais por categoria. Por isso, esta tela compara categorias; não calcula desempenho de produtos individuais que não foram cadastrados separadamente.</p>
  </>;
}
