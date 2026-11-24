import { useMemo, useState, type FormEvent } from 'react';
import { FileSpreadsheet, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { money, products, quantity, total, type Sale } from '@/data/demo';

function localDateInput() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === delimiter && !quoted) {
      values.push(value.trim());
      value = '';
    } else {
      value += character;
    }
  }
  values.push(value.trim());
  return values;
}

function parseCsvNumber(value: string): number {
  const cleaned = value.replace(/R\$\s?/gi, '').replace(/\s/g, '');
  const normalized = cleaned.includes(',')
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned;
  return Number(normalized);
}

type CsvPreview = { row: Omit<Sale, 'id'>; valid: boolean; reason: string };
function parseCsvContent(content: string): CsvPreview[] {
  const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0];
  const delimiter = (header.match(/;/g)?.length ?? 0) > (header.match(/,/g)?.length ?? 0) ? ';' : ',';

  return lines.slice(1).map((line) => {
    const [rawProduct = '', rawCategory = '', rawQuantity = '', rawPrice = '', rawDate = ''] = splitCsvLine(line, delimiter);
    const product = rawProduct.trim();
    const category = rawCategory.trim();
    const amount = Number(rawQuantity.trim());
    const price = parseCsvNumber(rawPrice);
    const date = rawDate.trim();
    const row = { product, category, quantity: amount, price, date };
    let reason = '';
    if (!product) reason = 'Informe o produto.';
    else if (!category) reason = 'Informe a categoria.';
    else if (!Number.isInteger(amount) || amount <= 0) reason = 'A quantidade precisa ser um número inteiro maior que zero.';
    else if (!Number.isFinite(price) || price <= 0) reason = 'O valor por peça precisa ser maior que zero.';
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T12:00:00`))) reason = 'A data deve usar o formato AAAA-MM-DD.';
    return { row, valid: !reason, reason };
  });
}

export function Sales({ sales, save, remove }: { sales: Sale[]; save: (rows: Sale[]) => void; remove: (id: number) => void }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [csv, setCsv] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [amount, setAmount] = useState(1);
  const [price, setPrice] = useState(products[0]?.price ?? 1);
  const [product, setProduct] = useState(products[0]?.name ?? '');
  const [customProduct, setCustomProduct] = useState('');
  const [category, setCategory] = useState(products[0]?.category ?? '');
  const [formError, setFormError] = useState('');
  const [csvError, setCsvError] = useState('');

  const categories = useMemo(() => [...new Set(sales.map((sale) => sale.category))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [sales]);
  const visibleSales = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return [...sales]
      .filter((sale) => categoryFilter === 'Todas' || sale.category === categoryFilter)
      .filter((sale) => !term || `${sale.product} ${sale.category}`.toLocaleLowerCase('pt-BR').includes(term))
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  }, [sales, search, categoryFilter]);
  const preview = useMemo(() => csv === null ? [] : parseCsvContent(csv), [csv]);
  const validPreview = preview.filter((item) => item.valid);
  const piecesSold = quantity(sales);
  const revenue = total(sales);

  const openForm = () => {
    setFormError('');
    setIsFormOpen(true);
  };

  const changeProduct = (value: string) => {
    setProduct(value);
    const selected = products.find((item) => item.name === value);
    if (selected) {
      setCategory(selected.category);
      setPrice(selected.price);
    } else if (value === '__custom__') {
      setCategory('');
      setPrice(0.01);
    }
  };

  const submitSale = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    const finalProduct = product === '__custom__' ? customProduct.trim() : product;
    if (!finalProduct) {
      setFormError('Informe o nome do produto.');
      return;
    }
    if (!category.trim()) {
      setFormError('Informe a categoria do produto.');
      return;
    }
    if (!Number.isInteger(amount) || amount <= 0 || !Number.isFinite(price) || price <= 0) {
      setFormError('Informe uma quantidade e um valor maiores que zero.');
      return;
    }
    const data = new FormData(event.currentTarget);
    const date = String(data.get('date') ?? '');
    if (!date) {
      setFormError('Informe a data da venda.');
      return;
    }
    save([{ id: Date.now(), product: finalProduct, category: category.trim(), quantity: amount, price, date }]);
    setIsFormOpen(false);
    setAmount(1);
    setCustomProduct('');
  };

  const importCsv = () => {
    if (!validPreview.length) {
      setCsvError('Não há linhas válidas para importar. Confira as colunas e os valores.');
      return;
    }
    const now = Date.now();
    save(validPreview.map(({ row }, index) => ({ ...row, id: now + index })));
    setCsv(null);
    setCsvError('');
  };

  return <div className="sales-page">
    <section className="sales-toolbar" aria-label="Ações de vendas">
      <div><strong>Registros de venda</strong><p>Consulte o que foi vendido ou adicione uma nova venda.</p></div>
      <div className="sales-actions">
        <button type="button" className="outline-button" onClick={() => { setCsv('produto,categoria,quantidade,valor_unitario,data\nCalça jeans,Jeans,12,65.00,2026-10-25'); setCsvError(''); }}><Upload size={15} /> Importar CSV</button>
        <button type="button" onClick={openForm}><Plus size={16} /> Cadastrar venda</button>
      </div>
    </section>

    <section className="sales-summary" aria-label="Resumo das vendas">
      <article><span>Vendas registradas</span><strong>{sales.length.toLocaleString('pt-BR')}</strong></article>
      <article><span>Peças vendidas</span><strong>{piecesSold.toLocaleString('pt-BR')}</strong></article>
      <article><span>Faturamento registrado</span><strong>{money(revenue)}</strong></article>
    </section>

    <section className="sales-list-panel panel">
      <div className="sales-list-heading"><div><span className="eyebrow">SEUS REGISTROS</span><h3>Vendas cadastradas</h3></div><span>{visibleSales.length} de {sales.length}</span></div>
      <div className="sales-filters">
        <label className="sales-search"><span>Buscar produto</span><div><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Digite o nome do produto" /></div></label>
        <label className="sales-category-filter">Categoria<select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option>Todas</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>

      {visibleSales.length > 0 ? <div className="sales-table-wrap">
        <table className="sales-table">
          <thead><tr><th>Produto</th><th>Data</th><th>Quantidade</th><th>Valor da venda</th><th><span className="sr-only">Ações</span></th></tr></thead>
          <tbody>{visibleSales.map((sale) => <tr key={sale.id}>
            <td><b>{sale.product}</b><small>{sale.category} · {money(sale.price)} por peça</small></td>
            <td>{sale.date.split('-').reverse().join('/')}</td>
            <td>{sale.quantity.toLocaleString('pt-BR')} peças</td>
            <td><strong>{money(sale.quantity * sale.price)}</strong></td>
            <td><button type="button" className="sales-delete-button" aria-label={`Excluir venda de ${sale.product}`} onClick={() => { if (window.confirm(`Excluir a venda de ${sale.product}?`)) remove(sale.id); }}><Trash2 size={15} /><span>Excluir</span></button></td>
          </tr>)}</tbody>
        </table>
      </div> : <div className="sales-empty-state">
        <FileSpreadsheet size={25} />
        <b>{sales.length ? 'Nenhuma venda encontrada' : 'Ainda não há vendas cadastradas'}</b>
        <p>{sales.length ? 'Experimente mudar a busca ou selecionar outra categoria.' : 'Cadastre a primeira venda para começar a acompanhar os resultados.'}</p>
        {!sales.length && <button type="button" onClick={openForm}><Plus size={15} /> Cadastrar primeira venda</button>}
      </div>}
    </section>

    {isFormOpen && <div className="modal-backdrop sales-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsFormOpen(false); }}>
      <section className="modal sales-dialog" role="dialog" aria-modal="true" aria-labelledby="sale-dialog-title">
        <div className="sales-dialog-heading"><div><span className="eyebrow">NOVO REGISTRO</span><h2 id="sale-dialog-title">Cadastrar venda</h2><p>Preencha os dados desta venda. O total será calculado automaticamente.</p></div><button type="button" className="auth-close" aria-label="Fechar" onClick={() => setIsFormOpen(false)}><X size={18} /></button></div>
        <form onSubmit={submitSale}>
          <label>Produto<select value={product} onChange={(event) => changeProduct(event.target.value)}>{products.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}<option value="__custom__">Outro produto / digitar nome</option></select></label>
          {product === '__custom__' && <label>Nome do produto<input required value={customProduct} onChange={(event) => setCustomProduct(event.target.value)} placeholder="Nome do produto" /></label>}
          <label>Categoria<input required value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Ex.: Jeans, Malha, Moda praia" /></label>
          <div className="sales-form-two-fields">
            <label>Quantidade de peças<input type="number" min="1" step="1" required value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></label>
            <label>Valor por peça (R$)<input type="number" min="0.01" step="0.01" required value={price} onChange={(event) => setPrice(Number(event.target.value))} /></label>
          </div>
          <label>Data da venda<input type="date" name="date" required defaultValue={localDateInput()} /></label>
          <div className="sales-total-preview"><span>Total desta venda</span><strong>{money(amount * price)}</strong></div>
          {formError && <p className="auth-error" role="alert">{formError}</p>}
          <div className="actions"><button type="button" className="outline-button" onClick={() => setIsFormOpen(false)}>Cancelar</button><button type="submit">Salvar venda</button></div>
        </form>
        <small className="sales-local-note">Registro demonstrativo: nesta versão, a venda fica salva neste navegador.</small>
      </section>
    </div>}

    {csv !== null && <div className="modal-backdrop sales-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCsv(null); }}>
      <section className="modal wide sales-dialog" role="dialog" aria-modal="true" aria-labelledby="csv-dialog-title">
        <div className="sales-dialog-heading"><div><span className="eyebrow">IMPORTAÇÃO LOCAL</span><h2 id="csv-dialog-title">Importar vendas por CSV</h2><p>Use as colunas: produto, categoria, quantidade, valor_unitario e data (AAAA-MM-DD).</p></div><button type="button" className="auth-close" aria-label="Fechar" onClick={() => setCsv(null)}><X size={18} /></button></div>
        <label>Selecionar arquivo CSV<input type="file" accept=".csv,text/csv" onChange={async (event) => { const file = event.target.files?.[0]; if (file) { setCsv(await file.text()); setCsvError(''); } event.target.value = ''; }} /></label>
        <label>Ou revise o conteúdo do arquivo<textarea aria-label="Conteúdo CSV" rows={6} value={csv} onChange={(event) => { setCsv(event.target.value); setCsvError(''); }} /></label>
        <div className="csv-preview-summary"><b>{validPreview.length} linha(s) válida(s)</b><span>{preview.length - validPreview.length} linha(s) com problema</span></div>
        {preview.length > 0 && <div className="csv-preview-list">{preview.slice(0, 6).map((item, index) => <div className={item.valid ? 'csv-preview-row valid' : 'csv-preview-row invalid'} key={`${item.row.product}-${index}`}><span>{item.valid ? 'Válida' : item.reason}</span><b>{item.row.product || 'Produto não informado'}</b><small>{item.row.quantity || 0} peças · {money(Number.isFinite(item.row.price) ? item.row.price : 0)} por peça</small></div>)}</div>}
        {preview.length > 6 && <small>Mostrando 6 de {preview.length} linhas da prévia.</small>}
        {csvError && <p className="auth-error" role="alert">{csvError}</p>}
        <div className="actions"><button type="button" className="outline-button" onClick={() => setCsv(null)}>Cancelar</button><button type="button" onClick={importCsv} disabled={!validPreview.length}>Importar {validPreview.length} linha(s) válida(s)</button></div>
        <small className="sales-local-note">A importação desta tela é local. O envio para o Back-end ainda depende da adaptação do modelo mensal de vendas.</small>
      </section>
    </div>}
  </div>;
}
