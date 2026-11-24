import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { demoCategories, money, type Sale } from '@/data/demo';
import { useDialogAccessibility } from '@/hooks/use-dialog-accessibility';

type Props = {
  sales: Sale[];
  save: (row: Sale) => void;
  remove: (id: number) => void;
  defaultCity: string;
};

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(value: string) {
  const [year, month] = value.split('-').map(Number);
  if (!year || !month) return value;
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
}

export function Sales({ sales, save, remove, defaultCity }: Props) {
  const [editing, setEditing] = useState<Sale | null>(null);
  const [error, setError] = useState('');
  const dialogRef = useDialogAccessibility<HTMLElement>(editing !== null, () => setEditing(null));
  const rows = [...sales].sort((a, b) => b.mesAno.localeCompare(a.mesAno) || a.category.localeCompare(b.category, 'pt-BR'));

  const openCreate = () => {
    setError('');
    setEditing({
      id: 0,
      mesAno: currentMonth(),
      category: demoCategories[0],
      quantity: 0,
      revenue: 0,
      city: defaultCity,
      sourceName: 'Lançamento manual demonstrativo',
    });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(editing.mesAno)) {
      setError('Selecione um mês de referência válido.');
      return;
    }
    if (!Number.isInteger(editing.quantity) || editing.quantity < 0 || !Number.isFinite(editing.revenue) || editing.revenue < 0) {
      setError('A quantidade e o faturamento precisam ser números iguais ou maiores que zero.');
      return;
    }
    const duplicate = sales.some((row) => row.id !== editing.id && row.mesAno === editing.mesAno && row.category === editing.category);
    if (duplicate) {
      setError('Já existe um lançamento para esta categoria e este mês. Edite o registro existente.');
      return;
    }
    save({ ...editing, id: editing.id || Date.now(), revenue: Number(editing.revenue.toFixed(2)) });
    setEditing(null);
  };

  const exportCsv = () => {
    const header = 'mesAno;categoria;quantidade;faturamento;cidade;nomeFonte';
    const lines = rows.map((row) => [row.mesAno, row.category, row.quantity, row.revenue.toFixed(2), row.city, row.sourceName]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`).join(';'));
    const content = '\uFEFF' + [header, ...lines].join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'trama-lancamentos-mensais-demonstracao.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const pieces = sales.reduce((sum, row) => sum + row.quantity, 0);
  const revenue = sales.reduce((sum, row) => sum + row.revenue, 0);

  return <>
    <section className="panel">
      <div className="panel-title">
        <div><span className="eyebrow">DADOS DE VENDAS · DEMONSTRAÇÃO</span><h3>Lançamentos mensais</h3></div>
        <span className="badge">Dados fictícios</span>
      </div>
      <p>Cada registro reúne a quantidade total de peças e o faturamento de uma categoria em um mês. A demonstração não utiliza vendas individuais por produto ou por dia.</p>
      <div className="metrics trama-kpis">
        <article><span>Lançamentos</span><strong>{sales.length}</strong><small>categoria × mês</small></article>
        <article><span>Peças no conjunto</span><strong>{pieces.toLocaleString('pt-BR')}</strong><small>valores demonstrativos</small></article>
        <article><span>Faturamento no conjunto</span><strong>{money(revenue)}</strong><small>valores demonstrativos</small></article>
      </div>
    </section>

    <section className="panel">
      <div className="section-toolbar">
        <p>Os dados ficam salvos somente neste navegador e não são enviados ao Back-end.</p>
        <div>
          <button type="button" className="outline-button" onClick={exportCsv} disabled={!rows.length}>Exportar CSV</button>
          <button type="button" onClick={openCreate}><Plus size={15} /> Novo lançamento</button>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Mês</th><th>Categoria</th><th>Peças</th><th>Faturamento</th><th>Média por peça</th><th>Fonte</th><th>Ações</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.id}>
            <td>{formatMonth(row.mesAno)}</td>
            <td><b>{row.category}</b></td>
            <td>{row.quantity.toLocaleString('pt-BR')}</td>
            <td>{money(row.revenue)}</td>
            <td>{money(row.quantity ? row.revenue / row.quantity : 0)}</td>
            <td>{row.sourceName}</td>
            <td><div className="actions">
              <button type="button" className="text-button" onClick={() => { setError(''); setEditing(row); }} aria-label={`Editar ${row.category}, ${row.mesAno}`}><Pencil size={14} /> Editar</button>
              <button type="button" className="text-button" onClick={() => { if (window.confirm(`Excluir o lançamento de ${row.category} em ${row.mesAno}?`)) remove(row.id); }} aria-label={`Excluir ${row.category}, ${row.mesAno}`}><Trash2 size={14} /> Excluir</button>
            </div></td>
          </tr>)}</tbody>
        </table>
        {!rows.length && <p>Nenhum lançamento mensal cadastrado.</p>}
      </div>
    </section>

    {editing && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
      <section ref={dialogRef} tabIndex={-1} className="modal" role="dialog" aria-modal="true" aria-labelledby="demo-monthly-sale-title">
        <span className="eyebrow">TRAMA / DADOS DE VENDAS</span>
        <h2 id="demo-monthly-sale-title">{editing.id ? 'Editar lançamento mensal' : 'Novo lançamento mensal'}</h2>
        <p>Informe os totais da categoria para o mês de referência.</p>
        <form onSubmit={submit}>
          <label>Mês de referência<input type="month" required value={editing.mesAno} onChange={(event) => setEditing({ ...editing, mesAno: event.target.value })} /></label>
          <label>Categoria<select required value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value })}>{demoCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label>Quantidade total de peças<input type="number" min="0" step="1" required value={editing.quantity} onChange={(event) => setEditing({ ...editing, quantity: Number(event.target.value) })} /></label>
          <label>Faturamento total do mês (R$)<input type="number" min="0" step="0.01" required value={editing.revenue} onChange={(event) => setEditing({ ...editing, revenue: Number(event.target.value) })} /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <div className="actions"><button type="button" className="outline-button" onClick={() => setEditing(null)}>Cancelar</button><button type="submit">Salvar lançamento</button></div>
        </form>
      </section>
    </div>}
  </>;
}
