import { useState, type FormEvent } from 'react';
import type { ApiData } from '@/hooks/use-api-data';
import { getApiErrorMessage } from '@/services/api';
import { createCategoria, createConfeccao, deleteCategoria, deleteConfeccao } from '@/services/cadastrosService';
import type { Porte, TipoConfeccao } from '@/types/api';

const CITIES = ['Toritama', 'Caruaru', 'Santa Cruz do Capibaribe'];
const PORTES: Record<Porte, string> = { MICRO: 'Micro', PEQUENA: 'Pequena', MEDIA: 'Média' };
const TIPOS: Record<TipoConfeccao, string> = { CONFECCAO: 'Confecção', FACCAO: 'Facção' };

function useAction(data: ApiData) {
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<unknown>, message: string) => {
    setNotice('');
    setError('');
    setBusy(true);
    try {
      await action();
      await data.reload();
      setNotice(message);
      return true;
    } catch (caught) {
      setError(getApiErrorMessage(caught));
      return false;
    } finally {
      setBusy(false);
    }
  };
  const feedback = <>
    {notice && <p role="status" className="notice">{notice}</p>}
    {error && <p className="auth-error" role="alert">{error}</p>}
  </>;
  return { run, busy, feedback };
}

export function ApiCategories({ data }: { data: ApiData }) {
  const [nome, setNome] = useState('');
  const { run, busy, feedback } = useAction(data);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (await run(() => createCategoria(nome.trim()), 'Categoria gravada no banco de dados.')) setNome('');
  };

  return (
    <section className="panel">
      <span className="eyebrow">ADMINISTRAÇÃO</span>
      <h3>Gerenciamento de categorias</h3>
      <form onSubmit={submit}>
        <label>Nome da categoria<input required maxLength={50} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Jeans" /></label>
        <small>{nome.length}/50 caracteres</small>
        <button disabled={busy || !nome.trim()}>Cadastrar categoria</button>
      </form>
      {feedback}
      <div className="table-wrap"><table>
        <thead><tr><th>Código</th><th>Categoria</th><th>Ação</th></tr></thead>
        <tbody>{data.categorias.map((c) => (
          <tr key={c.idCategoria}>
            <td>{c.idCategoria}</td>
            <td>{c.nome}</td>
            <td><button className="text-button" disabled={busy} onClick={() => { if (window.confirm(`Excluir a categoria ${c.nome}?`)) void run(() => deleteCategoria(c.idCategoria), 'Categoria excluída do banco de dados.'); }}>Excluir</button></td>
          </tr>
        ))}</tbody>
      </table>{!data.categorias.length && <p>Nenhuma categoria cadastrada.</p>}</div>
    </section>
  );
}

export function ApiConfections({ data }: { data: ApiData }) {
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [porte, setPorte] = useState<Porte>('MICRO');
  const [tipo, setTipo] = useState<TipoConfeccao>('CONFECCAO');
  const [cidade, setCidade] = useState(CITIES[0]);
  const { run, busy, feedback } = useAction(data);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const input = { nome: nome.trim(), cnpj: cnpj.trim() || undefined, porte, tipo, cidade };
    if (await run(() => createConfeccao(input), 'Confecção gravada no banco de dados.')) {
      setNome('');
      setCnpj('');
    }
  };

  return (
    <section className="panel">
      <span className="eyebrow">ADMINISTRAÇÃO</span>
      <h3>Gerenciamento de confecções</h3>
      <form onSubmit={submit}>
        <label>Nome da confecção<input required maxLength={120} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da confecção" /></label>
        <label>CNPJ (opcional)<input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="14 dígitos, com ou sem pontuação" /></label>
        <label>Porte<select value={porte} onChange={(e) => setPorte(e.target.value as Porte)}>{Object.entries(PORTES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Tipo<select value={tipo} onChange={(e) => setTipo(e.target.value as TipoConfeccao)}>{Object.entries(TIPOS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Cidade<select required value={cidade} onChange={(e) => setCidade(e.target.value)}>{CITIES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <button disabled={busy || !nome.trim()}>Cadastrar confecção</button>
      </form>
      {feedback}
      <div className="table-wrap"><table>
        <thead><tr><th>Código</th><th>Confecção</th><th>Porte</th><th>Tipo</th><th>Cidade</th><th>Ação</th></tr></thead>
        <tbody>{data.confeccoes.map((c) => (
          <tr key={c.idConfeccao}>
            <td>{c.idConfeccao}</td>
            <td>{c.nome}</td>
            <td>{PORTES[c.porte]}</td>
            <td>{TIPOS[c.tipo]}</td>
            <td>{c.cidade}</td>
            <td><button className="text-button" disabled={busy} onClick={() => { if (window.confirm(`Excluir ${c.nome}?`)) void run(() => deleteConfeccao(c.idConfeccao), 'Confecção excluída do banco de dados.'); }}>Excluir</button></td>
          </tr>
        ))}</tbody>
      </table>{!data.confeccoes.length && <p>Nenhuma confecção cadastrada.</p>}</div>
    </section>
  );
}
