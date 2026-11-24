import { useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { money, total, type Sale } from '@/data/demo';

type Props = { mode: 'Cenário da Concorrência' | 'Relatórios'; sales: Sale[] };
function monthNow() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function Operations({ mode, sales }: Props) {
  const categories = useMemo(() => [...new Set(sales.map((sale) => sale.category))].sort(), [sales]);
  const [impact, setImpact] = useState('10');
  const [scenarioCategory, setScenarioCategory] = useState('');
  const [start, setStart] = useState(() => [...sales].map((sale) => sale.mesAno).sort()[0] || monthNow());
  const [end, setEnd] = useState(() => [...sales].map((sale) => sale.mesAno).sort().at(-1) || monthNow());
  const [reportCategory, setReportCategory] = useState('');
  const [notice, setNotice] = useState('');
  const validImpact = impact.trim() !== '' && Number.isFinite(Number(impact)) && Number(impact) >= 0 && Number(impact) <= 100;
  const scenarioSales = sales.filter((sale) => !scenarioCategory || sale.category === scenarioCategory);
  const historicalRevenue = total(scenarioSales);
  const decrease = validImpact ? historicalRevenue * Number(impact) / 100 : 0;
  const hypotheticalRevenue = historicalRevenue - decrease;
  const validPeriod = Boolean(start && end && start <= end);
  const reportRows = sales.filter((sale) => validPeriod && sale.mesAno >= start && sale.mesAno <= end
    && (!reportCategory || sale.category === reportCategory))
    .sort((a, b) => a.mesAno.localeCompare(b.mesAno) || a.category.localeCompare(b.category));
  const reportRevenue = total(reportRows);
  const reportPieces = reportRows.reduce((sum, row) => sum + row.quantity, 0);

  const exportCsv = () => {
    const headers = ['Mês', 'Categoria', 'Quantidade de peças', 'Faturamento (R$)', 'Cidade', 'Procedência'];
    const lines = reportRows.map((row) => [row.mesAno, row.category, row.quantity, row.revenue.toFixed(2), row.city, row.sourceName]
      .map(csvCell).join(';'));
    const content = '\uFEFF' + [headers.map(csvCell).join(';'), ...lines].join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `trama-relatorio-demonstrativo-${start}-${end}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice('Relatório demonstrativo exportado.');
  };

  if (mode === 'Cenário da Concorrência') {
    return <>
      <section className="panel">
        <span className="eyebrow">SIMULAÇÃO HIPOTÉTICA · SEM PREVISÃO</span>
        <h3>Como uma queda percentual afetaria o faturamento?</h3>
        <p>O cálculo utiliza somente o faturamento histórico registrado nesta demonstração. Não representa dados privados de concorrentes, pesquisa de mercado ou previsão futura.</p>
        <div className="trama-filter-grid">
          <label>Categoria<select value={scenarioCategory} onChange={(event) => setScenarioCategory(event.target.value)}><option value="">Todas as categorias</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label>Queda hipotética (%)<input type="number" min="0" max="100" step="0.1" value={impact} onChange={(event) => setImpact(event.target.value)} /></label>
        </div>
        {!validImpact && <p role="alert" className="auth-error">Informe um percentual entre 0 e 100.</p>}
        <div className="metrics trama-kpis">
          <article><span>Faturamento histórico</span><strong>{money(historicalRevenue)}</strong></article>
          <article><span>Queda hipotética</span><strong>{money(decrease)}</strong><small>{validImpact ? `${Number(impact).toLocaleString('pt-BR')}% do histórico` : 'Percentual inválido'}</small></article>
          <article><span>Resultado hipotético</span><strong>{money(hypotheticalRevenue)}</strong><small>Histórico − queda hipotética</small></article>
        </div>
        <p className="data-source-note">Fórmula: faturamento histórico × percentual = queda; faturamento histórico − queda = resultado hipotético. Base: {scenarioSales.length} lançamento(s) demonstrativo(s).</p>
      </section>
    </>;
  }

  return <>
    <section className="panel report-print-header">
      <span className="eyebrow">RELATÓRIO DE VENDAS MENSAIS · DEMONSTRAÇÃO</span>
      <h3>Resumo dos lançamentos demonstrativos</h3>
      <p>Os dados exibidos são fictícios e ficam salvos somente neste navegador. O relatório não representa registros comerciais reais.</p>
      <div className="trama-filter-grid no-print">
        <label>De<input type="month" value={start} onChange={(event) => setStart(event.target.value)} /></label>
        <label>Até<input type="month" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
        <label>Categoria<select value={reportCategory} onChange={(event) => setReportCategory(event.target.value)}><option value="">Todas</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
      </div>
      {!validPeriod && <p role="alert" className="auth-error">O mês inicial deve ser anterior ou igual ao mês final.</p>}
      <div className="actions no-print">
        <button type="button" onClick={exportCsv} disabled={!validPeriod}><Download size={15} /> Exportar CSV</button>
        <button type="button" className="outline-button" onClick={() => window.print()} disabled={!validPeriod}><Printer size={15} /> Imprimir / salvar PDF</button>
      </div>
      {notice && <p role="status" className="notice">{notice}</p>}
    </section>
    <section className="panel report-print-content">
      <div className="panel-title"><div><span className="eyebrow">RESUMO DO PERÍODO</span><h3>{start} a {end}</h3></div><small>{reportRows.length} lançamento(s)</small></div>
      <div className="metrics trama-kpis">
        <article><span>Peças</span><strong>{reportPieces.toLocaleString('pt-BR')}</strong></article>
        <article><span>Faturamento</span><strong>{money(reportRevenue)}</strong></article>
        <article><span>Ticket médio por peça</span><strong>{money(reportPieces ? reportRevenue / reportPieces : 0)}</strong></article>
      </div>
      <div className="table-wrap"><table><thead><tr><th>Mês</th><th>Categoria</th><th>Peças</th><th>Faturamento</th><th>Cidade</th><th>Procedência</th></tr></thead><tbody>
        {reportRows.map((row) => <tr key={`${row.mesAno}-${row.category}`}><td>{row.mesAno}</td><td>{row.category}</td><td>{row.quantity.toLocaleString('pt-BR')}</td><td>{money(row.revenue)}</td><td>{row.city}</td><td>{row.sourceName}</td></tr>)}
      </tbody></table>{validPeriod && reportRows.length === 0 && <p>Não há lançamentos demonstrativos para os filtros selecionados.</p>}</div>
    </section>
  </>;
}
