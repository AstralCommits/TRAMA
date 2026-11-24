import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Download, FileUp, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { getApiErrorMessage } from '@/services/api';
import {
  cancelMonthlySale,
  createMonthlySale,
  importMonthlyCsv,
  listCategories,
  listImportHistory,
  listMonthlySales,
  updateMonthlySale,
  type CategoryOption,
  type ImportHistoryItem,
  type MonthlySale,
  type MonthlySalePayload,
} from '@/services/vendasService';
import { money } from '@/data/demo';
import { useDialogAccessibility } from '@/hooks/use-dialog-accessibility';

type Props = { idConfeccao: number | null; nomeConfeccao: string };
type SourceType = MonthlySalePayload['origemDado'];

const sourceLabels: Record<SourceType, string> = {
  ENTREVISTA: 'Entrevista',
  QUESTIONARIO: 'Questionário',
  FONTE_SECUNDARIA: 'Registros próprios / outra fonte',
};

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatDate(value: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

type CsvPreview = { total: number; valid: number; errors: string[]; sample: string[][] };
function splitCsvLine(line: string, delimiter: string): string[] {
  const values: string[] = []; let value = ''; let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && quoted && line[index + 1] === '"') { value += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === delimiter && !quoted) { values.push(value.trim()); value = ''; }
    else value += char;
  }
  values.push(value.trim()); return values;
}
function normalizeHeader(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
async function inspectCsv(file: File, idConfeccao: number, categories: CategoryOption[], existingRows: MonthlySale[]): Promise<CsvPreview> {
  if (!file.name.toLowerCase().endsWith('.csv')) return { total: 0, valid: 0, errors: ['Selecione um arquivo com extensão .csv.'], sample: [] };
  if (file.size > 10 * 1024 * 1024) return { total: 0, valid: 0, errors: ['O arquivo ultrapassa o limite de 10 MB.'], sample: [] };
  const content = (await file.text()).replace(/^\uFEFF/, '');
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return { total: 0, valid: 0, errors: ['O CSV precisa conter cabeçalho e pelo menos uma linha.'], sample: [] };
  const delimiter = (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length ? ';' : ',';
  const headers = splitCsvLine(lines[0], delimiter).map(normalizeHeader);
  const find = (...aliases: string[]) => headers.findIndex((header) => aliases.includes(header));
  const indexes = { month: find('mesano', 'mesreferencia'), quantity: find('quantidade'), revenue: find('faturamento', 'valor'), company: find('idconfeccao'), category: find('idcategoria'), source: find('origemdado'), sourceName: find('nomefonte') };
  const errors: string[] = [];
  for (const [key, index] of Object.entries(indexes)) if (index < 0) errors.push(`Coluna obrigatória ausente: ${key}.`);
  if (errors.length) return { total: lines.length - 1, valid: 0, errors, sample: [] };
  const categoryIds = new Set(categories.map((category) => category.idCategoria));
  const keys = new Set<string>(existingRows.filter((row) => row.status === 'ATIVO').map((row) => `${row.mesAno}:${row.idCategoria}`)); let valid = 0;
  for (let rowIndex = 1; rowIndex < lines.length; rowIndex += 1) {
    const cells = splitCsvLine(lines[rowIndex], delimiter); const lineNo = rowIndex + 1;
    const get = (index: number) => cells[index] || '';
    const month = get(indexes.month); const quantity = Number(get(indexes.quantity));
    const revenue = Number(get(indexes.revenue).replace(',', '.')); const company = Number(get(indexes.company));
    const category = Number(get(indexes.category)); const source = get(indexes.source).toUpperCase(); const sourceName = get(indexes.sourceName);
    const problems: string[] = [];
    if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) problems.push('mês inválido');
    if (!get(indexes.quantity) || !Number.isInteger(quantity) || quantity < 0) problems.push('quantidade inválida');
    if (!get(indexes.revenue) || !Number.isFinite(revenue) || revenue < 0) problems.push('faturamento inválido');
    if (company !== idConfeccao) problems.push('confecção diferente da conta');
    if (!Number.isInteger(category) || !categoryIds.has(category)) problems.push('categoria desconhecida');
    if (!['ENTREVISTA', 'QUESTIONARIO', 'FONTE_SECUNDARIA', 'DEMONSTRACAO'].includes(source)) problems.push('procedência inválida');
    if (!sourceName.trim() || sourceName.length > 200) problems.push('nome da fonte inválido');
    const key = `${month}:${category}`; if (keys.has(key)) problems.push('linha duplicada no arquivo'); else keys.add(key);
    if (problems.length) { if (errors.length < 20) errors.push(`Linha ${lineNo}: ${problems.join(', ')}.`); }
    else valid += 1;
  }
  return { total: lines.length - 1, valid, errors, sample: lines.slice(1, 6).map((line) => splitCsvLine(line, delimiter)) };
}

function downloadTemplate(idConfeccao: number, categories: CategoryOption[]) {
  const header = 'mesAno;quantidade;faturamento;idConfeccao;idCategoria;origemDado;nomeFonte';
  const rows = categories.map((category) => [currentMonth(), '0', '0.00', String(idConfeccao), String(category.idCategoria), 'FONTE_SECUNDARIA', 'Controle próprio da confecção'].join(';'));
  const content = '\uFEFF' + [header, ...rows].join('\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'modelo-lancamentos-mensais-trama.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

export function MonthlySales({ idConfeccao, nomeConfeccao }: Props) {
  const [rows, setRows] = useState<MonthlySale[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MonthlySale | null>(null);
  const [month, setMonth] = useState(currentMonth());
  const [categoryId, setCategoryId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [revenue, setRevenue] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('FONTE_SECUNDARIA');
  const [sourceName, setSourceName] = useState('Controle próprio da confecção');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<CsvPreview | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const dialogRef = useDialogAccessibility<HTMLElement>(modalOpen, () => setModalOpen(false), { closeOnEscape: !busy });

  const refresh = useCallback(async () => {
    if (!idConfeccao) {
      setError('Esta conta não possui uma confecção vinculada. Entre em contato com a administração.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [salesData, categoryData, historyData] = await Promise.all([
        listMonthlySales(), listCategories(), listImportHistory(),
      ]);
      setRows(salesData);
      setCategories(categoryData);
      setHistory(historyData);
      if (!categoryId && categoryData.length) setCategoryId(String(categoryData[0].idCategoria));
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [idConfeccao, categoryId]);

  useEffect(() => { void refresh(); }, [refresh]);

  const totals = useMemo(() => rows.reduce((acc, row) => ({
    quantity: acc.quantity + row.quantidade,
    revenue: acc.revenue + Number(row.faturamento),
  }), { quantity: 0, revenue: 0 }), [rows]);

  const openCreate = () => {
    setEditing(null);
    setMonth(currentMonth());
    setCategoryId(categories[0] ? String(categories[0].idCategoria) : '');
    setQuantity('');
    setRevenue('');
    setSourceType('FONTE_SECUNDARIA');
    setSourceName('Controle próprio da confecção');
    setError('');
    setModalOpen(true);
  };

  const openEdit = (row: MonthlySale) => {
    setEditing(row);
    setMonth(row.mesAno);
    setCategoryId(String(row.idCategoria));
    setQuantity(String(row.quantidade));
    setRevenue(String(row.faturamento));
    setSourceType(row.origemDado === 'DEMONSTRACAO' ? 'FONTE_SECUNDARIA' : row.origemDado);
    setSourceName(row.nomeFonte);
    setError('');
    setModalOpen(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!idConfeccao) { setError('Confecção não vinculada à conta.'); return; }
    const amount = Number(quantity);
    const total = Number(revenue.replace(',', '.'));
    if (!month || !categoryId || !Number.isInteger(amount) || amount < 0 || !Number.isFinite(total) || total < 0 || !sourceName.trim()) {
      setError('Confira o mês, a categoria, a quantidade, o faturamento e a identificação da fonte.');
      return;
    }
    const payload: MonthlySalePayload = {
      idConfeccao,
      idCategoria: Number(categoryId),
      mesAno: month,
      quantidade: amount,
      faturamento: Number(total.toFixed(2)),
      origem: 'MANUAL',
      origemDado: sourceType,
      nomeFonte: sourceName.trim(),
    };
    setBusy(true);
    setError('');
    try {
      if (editing) await updateMonthlySale(editing.idLancamento, payload);
      else await createMonthlySale(payload);
      setModalOpen(false);
      setMessage(editing ? 'Lançamento mensal atualizado no servidor.' : 'Lançamento mensal salvo no servidor.');
      await refresh();
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (row: MonthlySale) => {
    if (!window.confirm(`Cancelar o lançamento de ${row.categoria} referente a ${row.mesAno}?`)) return;
    setBusy(true);
    setError('');
    try {
      await cancelMonthlySale(row.idLancamento);
      setMessage('Lançamento cancelado. O histórico é mantido no servidor.');
      await refresh();
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const upload = async () => {
    if (!selectedFile) { setError('Selecione um arquivo CSV antes de importar.'); return; }
    if (!csvPreview || csvPreview.errors.length || csvPreview.valid !== csvPreview.total) { setError('Corrija os problemas apontados na pré-visualização antes de importar.'); return; }
    setBusy(true);
    setError('');
    try {
      const result = await importMonthlyCsv(selectedFile);
      setMessage(`Importação ${result.status === 'CONCLUIDA' ? 'concluída' : 'registrada com erro'}: ${result.qtdLinhas ?? 0} linha(s).`);
      setSelectedFile(null);
      setCsvPreview(null);
      const input = document.getElementById('monthly-sales-csv') as HTMLInputElement | null;
      if (input) input.value = '';
      await refresh();
    } catch (caught) {
      setError(getApiErrorMessage(caught));
      try { setHistory(await listImportHistory()); } catch {  }
    } finally {
      setBusy(false);
    }
  };

  return <>
    <section className="panel">
      <div className="panel-title">
        <div><span className="eyebrow">DADOS DA EMPRESA</span><h3>Lançamentos mensais</h3><small>{nomeConfeccao} · dados armazenados no servidor</small></div>
        <button type="button" onClick={() => void refresh()} className="outline-button" disabled={loading || busy}><RefreshCw size={15} /> Atualizar</button>
      </div>
      <p>Registre a quantidade total de peças e o faturamento de cada categoria em um mês. O sistema mantém um lançamento por categoria e mês de referência.</p>
      <div className="metrics trama-kpis">
        <article><span>Meses / categorias registrados</span><strong>{rows.length}</strong><small>lançamentos ativos</small></article>
        <article><span>Peças registradas</span><strong>{totals.quantity.toLocaleString('pt-BR')}</strong><small>soma dos lançamentos listados</small></article>
        <article><span>Faturamento registrado</span><strong>{money(totals.revenue)}</strong><small>soma dos lançamentos listados</small></article>
      </div>
    </section>

    <section className="panel">
      <div className="section-toolbar">
        <p>Os valores são mensais, não vendas individuais por produto ou dia.</p>
        <div><button type="button" className="outline-button" onClick={() => downloadTemplate(idConfeccao || 0, categories)} disabled={!idConfeccao || !categories.length}><Download size={15} /> Baixar modelo CSV</button><button type="button" onClick={openCreate} disabled={!categories.length}><Plus size={15} /> Novo lançamento</button></div>
      </div>
      {loading ? <p>Carregando lançamentos e categorias do servidor…</p> : <div className="table-wrap">
        <table><thead><tr><th>Mês</th><th>Categoria</th><th>Peças</th><th>Faturamento</th><th>Inclusão</th><th>Procedência</th><th>Fonte</th><th>Ações</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.idLancamento}>
            <td>{row.mesAno}</td><td><b>{row.categoria}</b></td><td>{row.quantidade.toLocaleString('pt-BR')}</td><td>{money(Number(row.faturamento))}</td>
            <td>{row.origem === 'MANUAL' ? 'Manual' : 'Importação'}</td><td>{sourceLabels[row.origemDado as SourceType] || 'Demonstração'}</td><td>{row.nomeFonte}</td>
            <td><div className="actions"><button type="button" className="text-button" aria-label={`Editar ${row.categoria} ${row.mesAno}`} onClick={() => openEdit(row)} disabled={busy}><Pencil size={14} /> Editar</button><button type="button" className="text-button" aria-label={`Cancelar ${row.categoria} ${row.mesAno}`} onClick={() => void cancel(row)} disabled={busy}><Trash2 size={14} /> Cancelar</button></div></td>
          </tr>)}</tbody>
        </table>
        {!rows.length && <p>Nenhum lançamento mensal cadastrado ainda.</p>}
      </div>}
    </section>

    <section className="panel">
      <div className="panel-title"><div><span className="eyebrow">IMPORTAÇÃO</span><h3>Enviar arquivo CSV</h3></div><FileUp size={19} /></div>
      <p>Use o modelo TRAMA. O arquivo precisa conter: <b>mesAno, quantidade, faturamento, idConfeccao, idCategoria, origemDado e nomeFonte</b>. O servidor valida se os lançamentos pertencem à sua confecção.</p>
      <div className="section-toolbar"><label className="file-label" htmlFor="monthly-sales-csv">Arquivo CSV<input id="monthly-sales-csv" type="file" accept=".csv,text/csv" onChange={async (event) => { const file = event.target.files?.[0] || null; setSelectedFile(file); setCsvPreview(null); setError(''); if (file && idConfeccao) { setBusy(true); try { setCsvPreview(await inspectCsv(file, idConfeccao, categories, rows)); } catch { setError('Não foi possível ler o CSV selecionado.'); } finally { setBusy(false); } } }} /></label><button type="button" onClick={() => void upload()} disabled={!selectedFile || !csvPreview || csvPreview.errors.length > 0 || csvPreview.valid !== csvPreview.total || busy}>{busy ? 'Processando…' : 'Importar CSV'}</button></div>
      {selectedFile && <p>Arquivo selecionado: {selectedFile.name}</p>}
      {csvPreview && <div className="csv-preview" aria-live="polite"><h4>Pré-visualização e validação</h4><p>{csvPreview.valid} de {csvPreview.total} linha(s) válida(s).</p>{csvPreview.errors.length > 0 && <div role="alert" className="auth-error"><b>Corrija antes de importar:</b><ul>{csvPreview.errors.map((item) => <li key={item}>{item}</li>)}</ul></div>}{csvPreview.errors.length === 0 && <p role="status" className="notice">Arquivo aprovado na validação local. O servidor fará uma segunda validação antes de gravar.</p>}<small>Prévia limitada às primeiras cinco linhas. A validação definitiva é feita pelo Back-end.</small></div>}
      <div className="table-wrap"><table><thead><tr><th>Arquivo</th><th>Data</th><th>Linhas</th><th>Status</th></tr></thead><tbody>{history.map((item) => <tr key={item.idImportacao}><td>{item.nomeArquivo}</td><td>{formatDate(item.dataImportacao)}</td><td>{item.qtdLinhas ?? '—'}</td><td>{item.status === 'CONCLUIDA' ? 'Concluída' : 'Com erro'}</td></tr>)}</tbody></table>{!history.length && <p>Nenhuma importação registrada.</p>}</div>
    </section>

    {message && <p role="status" className="notice">{message}</p>}
    {error && !modalOpen && <p role="alert" className="auth-error">{error}</p>}

    {modalOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setModalOpen(false); }}><section ref={dialogRef} tabIndex={-1} className="modal" role="dialog" aria-modal="true" aria-labelledby="monthly-sale-title">
      <span className="eyebrow">TRAMA / DADOS DE VENDAS</span><h2 id="monthly-sale-title">{editing ? 'Editar lançamento mensal' : 'Novo lançamento mensal'}</h2>
      <p>Informe os totais de uma categoria para o mês selecionado.</p>
      <form onSubmit={submit}>
        <label>Mês de referência<input type="month" required value={month} onChange={(event) => setMonth(event.target.value)} /></label>
        <label>Categoria<select required value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{categories.map((category) => <option key={category.idCategoria} value={category.idCategoria}>{category.nome}</option>)}</select></label>
        <label>Quantidade de peças<input type="number" min="0" step="1" required value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
        <label>Faturamento do mês (R$)<input type="number" min="0" step="0.01" required value={revenue} onChange={(event) => setRevenue(event.target.value)} /></label>
        <label>Procedência da informação<select value={sourceType} onChange={(event) => setSourceType(event.target.value as SourceType)}>{Object.entries(sourceLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label>Nome da fonte / controle<input required maxLength={200} value={sourceName} onChange={(event) => setSourceName(event.target.value)} placeholder="Ex.: Controle de vendas da empresa" /></label>
        <p className="auth-footnote">A origem do lançamento será registrada como MANUAL. A procedência acima identifica de onde veio a informação.</p>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <div className="actions"><button type="button" className="outline-button" onClick={() => setModalOpen(false)} disabled={busy}>Cancelar</button><button type="submit" disabled={busy}>{busy ? 'Salvando…' : 'Salvar no servidor'}</button></div>
      </form>
    </section></div>}
  </>;
}
