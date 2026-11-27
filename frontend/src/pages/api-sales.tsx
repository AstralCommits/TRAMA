import { useEffect, useState, type FormEvent } from 'react';
import { money } from '@/data/demo';
import type { ApiData } from '@/hooks/use-api-data';
import { getApiErrorMessage } from '@/services/api';
import { importCsv, listImportacoes } from '@/services/importacoesService';
import { cancelVenda, createVenda, updateVenda } from '@/services/vendasService';
import type { Importacao, OrigemDado, Venda } from '@/types/api';

const ORIGENS: Record<OrigemDado, string> = {
  ENTREVISTA: 'Entrevista',
  QUESTIONARIO: 'Questionário',
  FONTE_SECUNDARIA: 'Fonte secundária',
};

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(mesAno: string) {
  return mesAno.split('-').reverse().join('/');
}

type FormProps = { data: ApiData; venda?: Venda; onSaved: (message: string) => void; onCancel?: () => void };

export function SaleForm({ data, venda, onSaved, onCancel }: FormProps) {
  const unica = data.confeccoes.length === 1 ? String(data.confeccoes[0].idConfeccao) : '';
  const [idConfeccao, setIdConfeccao] = useState(venda ? String(venda.idConfeccao) : unica);
  const [idCategoria, setIdCategoria] = useState(venda ? String(venda.idCategoria) : '');
  const [mesAno, setMesAno] = useState(venda?.mesAno ?? currentMonth());
  const [quantidade, setQuantidade] = useState(venda ? String(venda.quantidade) : '');
  const [faturamento, setFaturamento] = useState(venda ? String(venda.faturamento) : '');
  const [origemDado, setOrigemDado] = useState<OrigemDado>(venda?.origemDado ?? 'QUESTIONARIO');
  const [nomeFonte, setNomeFonte] = useState(venda?.nomeFonte ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    const input = {
      idConfeccao: Number(idConfeccao),
      idCategoria: Number(idCategoria),
      mesAno,
      quantidade: Number(quantidade),
      faturamento: Number(faturamento),
      origemDado,
      nomeFonte: nomeFonte.trim(),
    };
    try {
      if (venda) await updateVenda(venda, input);
      else await createVenda(input);
      await data.reload();
      if (!venda) {
        setQuantidade('');
        setFaturamento('');
      }
      onSaved(venda ? 'Venda atualizada no banco de dados.' : 'Venda gravada no banco de dados.');
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const pecas = Number(quantidade);
  return (
    <form onSubmit={submit}>
      <label>Confecção
        <select required value={idConfeccao} onChange={(e) => setIdConfeccao(e.target.value)}>
          <option value="">Selecione uma confecção</option>
          {data.confeccoes.map((c) => <option key={c.idConfeccao} value={c.idConfeccao}>{c.nome} · {c.cidade}</option>)}
        </select>
      </label>
      <label>Categoria
        <select required value={idCategoria} onChange={(e) => setIdCategoria(e.target.value)}>
          <option value="">Selecione uma categoria</option>
          {data.categorias.map((c) => <option key={c.idCategoria} value={c.idCategoria}>{c.nome}</option>)}
        </select>
      </label>
      <label>Mês de referência<input type="month" required value={mesAno} onChange={(e) => setMesAno(e.target.value)} placeholder="AAAA-MM" /></label>
      <label>Quantidade vendida<input type="number" min="0" step="1" required value={quantidade} onChange={(e) => setQuantidade(e.target.value)} /></label>
      <label>Faturamento do mês (R$)<input type="number" min="0" step="0.01" required value={faturamento} onChange={(e) => setFaturamento(e.target.value)} /></label>
      <label>Procedência do dado
        <select required value={origemDado} onChange={(e) => setOrigemDado(e.target.value as OrigemDado)}>
          {Object.entries(ORIGENS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label>Nome da fonte ou da coleta<input required maxLength={200} value={nomeFonte} onChange={(e) => setNomeFonte(e.target.value)} placeholder="Ex.: Questionário de novembro" /></label>
      {pecas > 0 && Number(faturamento) > 0 && <p><b>Valor médio por peça:</b> {money(Number(faturamento) / pecas)}</p>}
      {error && <p className="auth-error" role="alert">{error}</p>}
      <div className="actions">
        {onCancel && <button type="button" className="outline-button" onClick={onCancel}>Cancelar</button>}
        <button disabled={busy}>{busy ? 'Salvando…' : venda ? 'Salvar alterações' : 'Registrar venda'}</button>
      </div>
    </form>
  );
}

export function ApiSaleEntry({ data }: { data: ApiData }) {
  const [notice, setNotice] = useState('');
  return (
    <section className="panel">
      <span className="eyebrow">LANÇAMENTO MENSAL</span>
      <h3>Lançamento de vendas</h3>
      <p>Informe o total vendido no mês. Cada confecção tem um lançamento por categoria e mês.</p>
      <SaleForm data={data} onSaved={setNotice} />
      <p role="status" className="notice">{notice}</p>
    </section>
  );
}

const PAGE = 50;

export function ApiSales({ data }: { data: ApiData }) {
  const [form, setForm] = useState<{ venda?: Venda } | null>(null);
  const [importing, setImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [importError, setImportError] = useState('');
  const [imports, setImports] = useState<Importacao[]>([]);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(PAGE);

  const loadImports = () => listImportacoes()
    .then((items) => setImports([...items].sort((a, b) => b.idImportacao - a.idImportacao)))
    .catch((caught: unknown) => setError(getApiErrorMessage(caught)));
  useEffect(() => { void loadImports(); }, []);

  const visible = data.vendas
    .filter((v) => `${v.confeccao} ${v.categoria} ${monthLabel(v.mesAno)}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')))
    .sort((a, b) => b.mesAno.localeCompare(a.mesAno) || a.confeccao.localeCompare(b.confeccao));

  const remove = async (venda: Venda) => {
    if (!window.confirm(`Cancelar a venda de ${venda.categoria} em ${monthLabel(venda.mesAno)}?`)) return;
    setNotice('');
    setError('');
    try {
      await cancelVenda(venda.idLancamento);
      await data.reload();
      setNotice('Venda cancelada no banco de dados.');
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    }
  };

  const submitImport = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) return;
    setImportError('');
    setBusy(true);
    try {
      const result = await importCsv(file);
      await data.reload();
      setNotice(`${result.nomeArquivo}: ${result.qtdLinhas ?? 0} linha(s) importada(s).`);
      setImporting(false);
      setFile(null);
    } catch (caught) {
      setImportError(getApiErrorMessage(caught));
    } finally {
      setBusy(false);
      void loadImports();
    }
  };

  return (
    <>
      <div className="section-toolbar">
        <div className="filters"><label>Pesquisar<input value={search} onChange={(e) => { setSearch(e.target.value); setLimit(PAGE); }} placeholder="Confecção, categoria ou mês" /></label></div>
        <div>
          <button className="outline-button" onClick={() => { setNotice(''); setImportError(''); setFile(null); setImporting(true); }}>Importar arquivo CSV</button>
          <button onClick={() => { setNotice(''); setForm({}); }}>+ Cadastrar venda</button>
        </div>
      </div>
      <p>{visible.length} lançamento(s) · cada linha é o total do mês por confecção e categoria.</p>
      {notice && <p role="status" className="notice">{notice}</p>}
      {error && <p className="auth-error" role="alert">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead><tr>{['Confecção', 'Categoria', 'Mês', 'Quantidade', 'Faturamento', 'Procedência', 'Entrada', 'Ações'].map((title) => <th key={title}>{title}</th>)}</tr></thead>
          <tbody>
            {visible.slice(0, limit).map((v) => (
              <tr key={v.idLancamento}>
                <td><b>{v.confeccao}</b></td>
                <td>{v.categoria}</td>
                <td>{monthLabel(v.mesAno)}</td>
                <td>{v.quantidade.toLocaleString('pt-BR')}</td>
                <td>{money(v.faturamento)}</td>
                <td>{ORIGENS[v.origemDado]}<small>{v.nomeFonte}</small></td>
                <td>{v.origem === 'IMPORTACAO' ? 'CSV' : 'Manual'}</td>
                <td>
                  <button className="text-button" onClick={() => { setNotice(''); setForm({ venda: v }); }}>Editar</button>
                  <button className="text-button" onClick={() => void remove(v)}>Cancelar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && <p>Nenhuma venda encontrada.</p>}
      </div>
      {visible.length > limit && <button className="outline-button" onClick={() => setLimit(limit + PAGE)}>Mostrar mais {Math.min(PAGE, visible.length - limit)}</button>}

      <section className="panel">
        <h3>Importações</h3>
        {imports.length ? <div className="table-wrap"><table>
          <thead><tr><th>Arquivo</th><th>Data</th><th>Linhas</th><th>Situação</th></tr></thead>
          <tbody>{imports.slice(0, 10).map((item) => (
            <tr key={item.idImportacao}>
              <td>{item.nomeArquivo}</td>
              <td>{new Date(item.dataImportacao).toLocaleString('pt-BR')}</td>
              <td>{item.qtdLinhas ?? '—'}</td>
              <td><span className="badge">{item.status === 'CONCLUIDA' ? 'Concluída' : 'Erro'}</span></td>
            </tr>
          ))}</tbody>
        </table></div> : <p>Nenhuma importação registrada.</p>}
      </section>

      {form && <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-label={form.venda ? 'Editar venda' : 'Cadastrar venda'}>
        <h2>{form.venda ? 'Editar venda' : 'Cadastrar venda'}</h2>
        <SaleForm data={data} venda={form.venda} onCancel={() => setForm(null)} onSaved={(message) => { setForm(null); setNotice(message); }} />
      </section></div>}

      {importing && <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-label="Importar arquivo CSV">
        <h2>Importar arquivo CSV</h2>
        <p>Colunas: mesAno, quantidade, faturamento, idConfeccao, idCategoria, origemDado e nomeFonte. Se uma linha for inválida, nenhuma é gravada.</p>
        <form onSubmit={submitImport}>
          <label>Arquivo<input type="file" required accept=".csv,text/csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
          {importError && <p className="auth-error" role="alert">{importError}</p>}
          <div className="actions">
            <button type="button" className="outline-button" onClick={() => setImporting(false)}>Cancelar</button>
            <button disabled={!file || busy}>{busy ? 'Importando…' : 'Importar'}</button>
          </div>
        </form>
      </section></div>}
    </>
  );
}
