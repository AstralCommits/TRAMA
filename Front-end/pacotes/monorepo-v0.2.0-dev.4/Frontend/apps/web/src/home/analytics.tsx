import { demoCategories, money, quantity, total, variation, type Sale, type Filters } from '@/data/demo';

type Props = { current: Sale[]; previous: Sale[]; filters: Filters };

export function Analytics({ current, previous, filters }: Props) {
  const revenue = total(current);
  const previousRevenue = total(previous);
  const pieces = quantity(current);
  const previousPieces = quantity(previous);
  const categoryNames = Array.from(new Set([
    ...demoCategories,
    ...current.map((row) => row.category),
    ...previous.map((row) => row.category),
  ]));
  const groups = categoryNames.map((name) => {
    const now = current.filter((row) => row.category === name);
    const before = previous.filter((row) => row.category === name);
    return {
      name,
      revenue: total(now),
      previousRevenue: total(before),
      pieces: quantity(now),
      previousPieces: quantity(before),
    };
  });
  const ranked = [...groups].sort((a, b) => b.revenue - a.revenue);
  const maxValue = Math.max(1, ...groups.flatMap((group) => [group.revenue, group.previousRevenue]));
  const activeCategories = new Set(current.map((row) => row.category)).size;

  return <>
    <div className="metrics">
      <article><span>Faturamento total</span><strong>{money(revenue)}</strong><small>{variation(revenue, previousRevenue)} em relação ao período anterior</small></article>
      <article><span>Peças vendidas</span><strong>{pieces.toLocaleString('pt-BR')}</strong><small>{variation(pieces, previousPieces)} em relação ao período anterior</small></article>
      <article><span>Ticket médio por peça</span><strong>{money(pieces ? revenue / pieces : 0)}</strong><small>Faturamento ÷ quantidade de peças</small></article>
      <article><span>Categorias ativas</span><strong>{activeCategories}</strong><small>No período selecionado</small></article>
    </div>

    <div className="chart-grid">
      <section className="panel">
        <div className="panel-title"><h3>Faturamento por categoria</h3><span>Período atual / anterior</span></div>
        {groups.map((group) => <div className="bar-row" key={group.name}>
          <div><b>{group.name}</b><span>{money(group.revenue)}</span></div>
          <div className="bar-track"><i style={{ width: `${group.revenue / maxValue * 100}%` }} /></div>
          <div className="bar-track previous"><i style={{ width: `${group.previousRevenue / maxValue * 100}%` }} /></div>
        </div>)}
        {!current.length && <p>Não há lançamentos no período selecionado.</p>}
      </section>
      <section className="panel olive">
        <span className="eyebrow">UM OLHAR PARA O SEU NEGÓCIO</span>
        <h3>Os números contam<br />uma história.</h3>
        <p>{revenue ? `${ranked[0]?.name} lidera o faturamento do período com ${money(ranked[0]?.revenue || 0)}.` : 'Cadastre lançamentos mensais para começar a análise.'}</p>
        <hr />
        <p>{pieces.toLocaleString('pt-BR')} peças registradas.<br />{money(pieces ? revenue / pieces : 0)} de valor médio por peça.</p>
        <small>Informação calculada · dados fictícios de demonstração</small>
      </section>
    </div>

    <section className="panel">
      <h3>Resultados e comparação de períodos</h3>
      <p>{filters.period} × mês anterior equivalente · os valores são agregados por categoria.</p>
      <div className="table-wrap"><table>
        <thead><tr>{['Categoria', 'Peças atuais', 'Peças anteriores', 'Faturamento atual', 'Faturamento anterior', 'Variação de peças', 'Variação de faturamento', 'Média por peça', 'Participação', 'Evolução'].map((label) => <th key={label}>{label}</th>)}</tr></thead>
        <tbody>{groups.map((group) => <tr key={group.name}>
          <td><b>{group.name}</b></td>
          <td>{group.pieces.toLocaleString('pt-BR')}</td>
          <td>{group.previousPieces.toLocaleString('pt-BR')}</td>
          <td>{money(group.revenue)}</td>
          <td>{money(group.previousRevenue)}</td>
          <td>{variation(group.pieces, group.previousPieces)}</td>
          <td>{variation(group.revenue, group.previousRevenue)}</td>
          <td>{money(group.pieces ? group.revenue / group.pieces : 0)}</td>
          <td>{revenue ? `${(group.revenue / revenue * 100).toFixed(1).replace('.', ',')}%` : '0%'}</td>
          <td>{group.previousRevenue === 0 ? 'Sem base' : group.revenue > group.previousRevenue ? 'Crescimento' : group.revenue < group.previousRevenue ? 'Queda' : 'Estável'}</td>
        </tr>)}</tbody>
      </table></div>
    </section>

  </>;
}
