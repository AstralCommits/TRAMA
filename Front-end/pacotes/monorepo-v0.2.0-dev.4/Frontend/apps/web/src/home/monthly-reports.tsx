import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Printer, RefreshCw } from 'lucide-react';
import { getApiErrorMessage } from '@/services/api';
import { listCategories, listMonthlySales, type CategoryOption, type MonthlySale } from '@/services/vendasService';
import { money } from '@/data/demo';

type Props = { nomeConfeccao: string };
function monthNow() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
function csvCell(value: string | number) { return `"${String(value).replaceAll('"', '""')}"`; }

export function MonthlyReports({ nomeConfeccao }: Props) {
  const [rows, setRows] = useState<MonthlySale[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [start, setStart] = useState(monthNow());
  const [end, setEnd] = useState(monthNow());
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sales, categoryRows] = await Promise.all([listMonthlySales(), listCategories()]);
      setRows(sales);
      setCategories(categoryRows);
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const validPeriod = start <= end;
  const filtered = useMemo(() => rows.filter((row) => row.status === 'ATIVO'
    && row.mesAno >= start && row.mesAno <= end
    && (!category || String(row.idCategoria) === category)), [rows, start, end, category]);
  const totalPieces = filtered.reduce((sum, row) => sum + row.quantidade, 0);
  const totalRevenue = filtered.reduce((sum, row) => sum + Number(row.faturamento), 0);

  const exportCsv = () => {
    const header = ['Confecção', 'Mês', 'Categoria', 'Quantidade', 'Faturamento', 'Origem do lançamento', 'Procedência', 'Nome da fonte'];
    const lines = filtered.map((row) => [nomeConfeccao, row.mesAno, row.categoria, row.quantidade,
      Number(row.faturamento).toFixed(2), row.origem, row.origemDado, row.nomeFonte].map(csvCell).join(';'));
    const metadata = [`Relatório TRAMA — ${nomeConfeccao}`, `Período: ${start} a ${end}`, `Gerado em: ${new Date().toLocaleString('pt-BR')}`];
    const content = '\uFEFF' + [...metadata.map(csvCell), header.map(csvCell).join(';'), ...lines].join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `trama-relatorio-mensal-${start}-${end}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage('CSV exportado com período, origem e procedência dos dados.');
  };

  return <>
    <section className="panel report-print-header">
      <span className="eyebrow">RELATÓRIO DE VENDAS MENSAIS</span>
      <h3>{nomeConfeccao}</h3>
      <p>Relatório gerado a partir dos lançamentos ativos retornados pelo Back-end. O arquivo é produzido no navegador e não fica armazenado como relatório no servidor.</p>
      <div className="trama-filter-grid no-print">
        <label>De<input type="month" value={start} onChange={(event) => setStart(event.target.value)} /></label>
        <label>Até<input type="month" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
        <label>Categoria<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Todas</option>{categories.map((item) => <option key={item.idCategoria} value={item.idCategoria}>{item.nome}</option>)}</select></label>
        <button type="button" className="outline-button" onClick={() => void refresh()} disabled={loading}><RefreshCw size={15} /> Atualizar</button>
      </div>
      {!validPeriod && <p role="alert" className="auth-error">O mês inicial deve ser anterior ou igual ao mês final.</p>}
      <div className="actions no-print"><button type="button" onClick={exportCsv} disabled={loading || !validPeriod}><Download size={15} /> Exportar CSV</button><button type="button" className="outline-button" onClick={() => window.print()} disabled={loading || !validPeriod}><Printer size={15} /> Imprimir / salvar PDF</button></div>
    </section>

    <section className="panel report-print-content">
      <div className="panel-title"><div><span className="eyebrow">RESUMO DO PERÍODO</span><h3>{start} a {end}</h3></div><small>{filtered.length} lançamento(s)</small></div>
      <div className="metrics trama-kpis"><article><span>Peças</span><strong>{totalPieces.toLocaleString('pt-BR')}</strong></article><article><span>Faturamento</span><strong>{money(totalRevenue)}</strong></article><article><span>Ticket médio por peça</span><strong>{money(totalPieces ? totalRevenue / totalPieces : 0)}</strong></article></div>
      {loading ? <p>Carregando os dados do servidor…</p> : error ? <p role="alert" className="auth-error">{error}</p> : !validPeriod ? null : <div className="table-wrap"><table><thead><tr><th>Mês</th><th>Categoria</th><th>Peças</th><th>Faturamento</th><th>Origem</th><th>Procedência</th><th>Fonte</th></tr></thead><tbody>{filtered.map((row) => <tr key={row.idLancamento}><td>{row.mesAno}</td><td>{row.categoria}</td><td>{row.quantidade.toLocaleString('pt-BR')}</td><td>{money(Number(row.faturamento))}</td><td>{row.origem === 'MANUAL' ? 'Manual' : 'Importação'}</td><td>{row.origemDado}</td><td>{row.nomeFonte}</td></tr>)}</tbody></table>{filtered.length === 0 && <p>Não há lançamentos ativos para os filtros selecionados.</p>}</div>}
      <p className="data-source-note">Fonte: API do Back-end · filtro por período e categoria · gerado em {new Date().toLocaleString('pt-BR')}.</p>
    </section>
  </>;
}
