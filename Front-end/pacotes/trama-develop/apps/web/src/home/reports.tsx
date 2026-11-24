import { useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { money, quantity, total, type Sale } from '@/data/demo';

function localDate(date: string) { return date.split('-').reverse().join('/'); }
function csvCell(value: string | number) { return `"${String(value).replaceAll('"', '""')}"`; }

export function Reports({ sales }: { sales: Sale[] }) {
  const months = Array.from(new Set(sales.map((sale) => sale.date.slice(0, 7)))).sort().reverse();
  const [period, setPeriod] = useState('Todos');
  const [category, setCategory] = useState('Todas');
  const [format, setFormat] = useState<'completo' | 'resumo'>('completo');
  const filtered = useMemo(() => sales.filter((sale) => (period === 'Todos' || sale.date.startsWith(period)) && (category === 'Todas' || sale.category === category)), [sales, period, category]);
  const revenue = total(filtered);
  const pieces = quantity(filtered);
  const groups = useMemo(() => {
    const map = new Map<string, { name: string; pieces: number; revenue: number; rows: number }>();
    filtered.forEach((sale) => {
      const current = map.get(sale.product) || { name: sale.product, pieces: 0, revenue: 0, rows: 0 };
      current.pieces += sale.quantity; current.revenue += sale.quantity * sale.price; current.rows += 1;
      map.set(sale.product, current);
    });
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, [filtered]);
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((sale) => map.set(sale.category, (map.get(sale.category) || 0) + sale.quantity * sale.price));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [filtered]);
  const exportCsv = () => {
    const header = ['Produto', 'Categoria', 'Quantidade', 'Valor unitário (R$)', 'Faturamento (R$)', 'Data', 'Cidade'];
    const rows = format === 'resumo'
      ? groups.map((row) => [row.name, 'Resumo por produto', row.pieces, '', row.revenue.toFixed(2), '', ''])
      : filtered.map((sale) => [sale.product, sale.category, sale.quantity, sale.price.toFixed(2), (sale.quantity * sale.price).toFixed(2), sale.date, sale.city || '']);
    const csv = '\uFEFF' + [header, ...rows].map((row) => row.map((cell) => csvCell(cell ?? '')).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `trama-relatorio-${period.toLowerCase()}.csv`; anchor.click(); URL.revokeObjectURL(url);
  };

  return <div className="reports-layout">
    <section className="panel report-filter-panel">
      <div><span className="eyebrow">CENTRAL DE RELATÓRIOS</span><h3>Um resumo claro para acompanhar seu negócio</h3><p>Escolha o período e a categoria. Os resultados são calculados a partir das vendas registradas na sua conta.</p></div>
      <div className="report-filters">
        <label>Período<select value={period} onChange={(event) => setPeriod(event.target.value)}><option value="Todos">Todo o histórico</option>{months.map((month) => <option key={month} value={month}>{month.split('-').reverse().join('/')}</option>)}</select></label>
        <label>Categoria<select value={category} onChange={(event) => setCategory(event.target.value)}><option>Todas</option>{[...new Set(sales.map((sale) => sale.category))].sort().map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Tipo de arquivo<select value={format} onChange={(event) => setFormat(event.target.value as 'completo' | 'resumo')}><option value="completo">Detalhado por venda</option><option value="resumo">Resumo por produto</option></select></label>
      </div>
      <div className="report-actions"><button type="button" onClick={exportCsv}><Download size={15} /> Exportar CSV</button><button type="button" className="outline-button" onClick={() => window.print()}><Printer size={15} /> Imprimir / salvar PDF</button></div>
    </section>

    <div className="metrics report-metrics">
      <article><span>Faturamento total</span><strong>{money(revenue)}</strong><small>Quantidade × valor unitário</small></article>
      <article><span>Peças vendidas</span><strong>{pieces.toLocaleString('pt-BR')}</strong><small>{filtered.length} registros de venda</small></article>
      <article><span>Valor médio por peça</span><strong>{money(pieces ? revenue / pieces : 0)}</strong><small>Faturamento ÷ peças vendidas</small></article>
      <article><span>Produto de maior faturamento</span><strong className="report-leader-value">{groups[0]?.name || '—'}</strong><small>{groups[0] ? money(groups[0].revenue) : 'Sem dados no filtro'}</small></article>
    </div>

    <div className="report-two-columns">
      <section className="panel"><div className="panel-title"><div><span className="eyebrow">CATEGORIAS</span><h3>Onde está o faturamento</h3></div></div>
        {categories.length ? categories.map(([name, amount]) => <div className="report-bar" key={name}><div><b>{name}</b><span>{money(amount)}</span></div><i><span style={{ width: `${(amount / Math.max(...categories.map((item) => item[1]), 1)) * 100}%` }} /></i></div>) : <p>Não há vendas para os filtros escolhidos.</p>}
      </section>
      <section className="panel"><div className="panel-title"><div><span className="eyebrow">PRODUTOS</span><h3>Mais vendidos em faturamento</h3></div></div>
        {groups.slice(0, 6).map((item, index) => <div className="report-rank" key={item.name}><span>{index + 1}</span><div><b>{item.name}</b><small>{item.pieces.toLocaleString('pt-BR')} peças</small></div><strong>{money(item.revenue)}</strong></div>)}
        {!groups.length && <p>Cadastre vendas para montar este ranking.</p>}
      </section>
    </div>

    <section className="panel report-table-panel"><div className="panel-title"><div><span className="eyebrow">MOVIMENTAÇÃO</span><h3>Vendas consideradas no relatório</h3></div><span>{filtered.length} registro(s)</span></div>
      <div className="table-wrap"><table><thead><tr><th>Data</th><th>Produto</th><th>Categoria</th><th>Peças</th><th>Valor unitário</th><th>Faturamento</th></tr></thead><tbody>{filtered.slice().sort((a, b) => b.date.localeCompare(a.date)).map((sale) => <tr key={sale.id}><td>{localDate(sale.date)}</td><td><b>{sale.product}</b></td><td>{sale.category}</td><td>{sale.quantity}</td><td>{money(sale.price)}</td><td>{money(sale.price * sale.quantity)}</td></tr>)}</tbody></table>{!filtered.length && <p>Não há registros para apresentar. Altere os filtros ou cadastre uma venda.</p>}</div>
    </section>
    <div className="report-footnote"><Download size={14} /><span>O CSV contém os registros filtrados. A opção “Imprimir / salvar PDF” utiliza a função de impressão do navegador. Os valores refletem apenas as vendas cadastradas, não pagamentos ou estoque.</span></div>
  </div>;
}
