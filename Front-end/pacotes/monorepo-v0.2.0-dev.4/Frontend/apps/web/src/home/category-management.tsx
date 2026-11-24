import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { api, getApiErrorMessage } from '@/services/api';

type Category = { idCategoria: number; nome: string };
type Company = { idConfeccao: number; nome: string; cnpj: string | null; porte: 'MICRO' | 'PEQUENA' | 'MEDIA'; tipo: 'CONFECCAO' | 'FACCAO'; cidade: string };
type CompanyForm = { nome: string; cnpj: string; porte: Company['porte']; tipo: Company['tipo']; cidade: string };

export function CategoryManagement() {
  const [rows, setRows] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyForm, setCompanyForm] = useState<CompanyForm>({ nome: '', cnpj: '', porte: 'MICRO', tipo: 'CONFECCAO', cidade: 'Santa Cruz do Capibaribe' });
  const [editingCompany, setEditingCompany] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { const [response, companyResponse] = await Promise.all([api.get<Category[]>('/api/categorias'), api.get<Company[]>('/api/confeccoes')]); setRows(response.data); setCompanies(companyResponse.data); }
    catch (caught) { setError(getApiErrorMessage(caught)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = name.trim().replace(/\s+/g, ' ');
    if (!normalized) { setError('Informe o nome da categoria.'); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      if (editing === null) await api.post('/api/categorias', { nome: normalized });
      else await api.put(`/api/categorias/${editing}`, { nome: normalized });
      setName(''); setEditing(null); setMessage(editing === null ? 'Categoria cadastrada.' : 'Categoria atualizada.'); await refresh();
    } catch (caught) { setError(getApiErrorMessage(caught)); }
    finally { setBusy(false); }
  };
  const remove = async (category: Category) => {
    if (!window.confirm(`Excluir a categoria “${category.nome}”? Se houver lançamentos relacionados, o servidor impedirá a exclusão.`)) return;
    setBusy(true); setError(''); setMessage('');
    try { await api.delete(`/api/categorias/${category.idCategoria}`); setMessage('Categoria excluída.'); await refresh(); }
    catch (caught) { setError(getApiErrorMessage(caught)); }
    finally { setBusy(false); }
  };
  const submitCompany = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const payload = { ...companyForm, nome: companyForm.nome.trim(), cnpj: companyForm.cnpj.trim() || null };
      if (editingCompany === null) await api.post('/api/confeccoes', payload);
      else await api.put(`/api/confeccoes/${editingCompany}`, payload);
      setCompanyForm({ nome: '', cnpj: '', porte: 'MICRO', tipo: 'CONFECCAO', cidade: 'Santa Cruz do Capibaribe' }); setEditingCompany(null);
      setMessage(editingCompany === null ? 'Confecção cadastrada.' : 'Confecção atualizada.'); await refresh();
    } catch (caught) { setError(getApiErrorMessage(caught)); } finally { setBusy(false); }
  };
  const removeCompany = async (company: Company) => {
    if (!window.confirm(`Excluir a confecção “${company.nome}”? O servidor impedirá a exclusão se houver usuários ou lançamentos vinculados.`)) return;
    setBusy(true); setError('');
    try { await api.delete(`/api/confeccoes/${company.idConfeccao}`); setMessage('Confecção excluída.'); await refresh(); }
    catch (caught) { setError(getApiErrorMessage(caught)); } finally { setBusy(false); }
  };
  return <section className="panel">
    <div className="panel-title"><div><span className="eyebrow">CADASTROS / CATEGORIAS</span><h3>Gerenciar categorias</h3></div><button type="button" className="outline-button" onClick={() => void refresh()} disabled={loading || busy}><RefreshCw size={15}/> Atualizar</button></div>
    <p>O catálogo de categorias é compartilhado pela plataforma. Somente contas administrativas podem cadastrar, alterar ou excluir categorias.</p>
    <form onSubmit={submit} className="section-toolbar"><label>Nome da categoria<input required maxLength={60} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Moda praia" /></label><div className="actions"><button type="submit" disabled={busy}>{editing === null ? <><Plus size={15}/> Cadastrar</> : 'Salvar alteração'}</button>{editing !== null && <button type="button" className="outline-button" onClick={() => { setEditing(null); setName(''); }} disabled={busy}>Cancelar edição</button>}</div></form>
    {error && <p role="alert" className="auth-error">{error}</p>}{message && <p role="status" className="notice">{message}</p>}
    {loading ? <p>Carregando categorias…</p> : <div className="table-wrap"><table><thead><tr><th>Categoria</th><th>ID</th><th>Ações</th></tr></thead><tbody>{rows.map((row) => <tr key={row.idCategoria}><td>{row.nome}</td><td>{row.idCategoria}</td><td><div className="actions"><button type="button" className="text-button" onClick={() => { setEditing(row.idCategoria); setName(row.nome); }} disabled={busy}><Pencil size={14}/> Editar</button><button type="button" className="text-button" onClick={() => void remove(row)} disabled={busy}><Trash2 size={14}/> Excluir</button></div></td></tr>)}</tbody></table>{!rows.length && <p>Nenhuma categoria cadastrada.</p>}</div>}
    <div className="panel-title"><div><span className="eyebrow">CADASTROS / CONFECÇÕES</span><h3>Gerenciar confecções</h3></div></div>
    <form onSubmit={submitCompany} className="company-admin-form"><label>Nome<input required maxLength={120} value={companyForm.nome} onChange={(e) => setCompanyForm({ ...companyForm, nome: e.target.value })}/></label><label>CNPJ (opcional)<input inputMode="numeric" value={companyForm.cnpj} onChange={(e) => setCompanyForm({ ...companyForm, cnpj: e.target.value })}/></label><label>Porte<select value={companyForm.porte} onChange={(e) => setCompanyForm({ ...companyForm, porte: e.target.value as Company['porte'] })}><option value="MICRO">Micro</option><option value="PEQUENA">Pequena</option><option value="MEDIA">Média</option></select></label><label>Atividade<select value={companyForm.tipo} onChange={(e) => setCompanyForm({ ...companyForm, tipo: e.target.value as Company['tipo'] })}><option value="CONFECCAO">Confecção</option><option value="FACCAO">Facção</option></select></label><label>Cidade<select value={companyForm.cidade} onChange={(e) => setCompanyForm({ ...companyForm, cidade: e.target.value })}><option>Santa Cruz do Capibaribe</option><option>Toritama</option><option>Caruaru</option></select></label><div className="actions"><button type="submit" disabled={busy}>{editingCompany === null ? 'Cadastrar confecção' : 'Salvar confecção'}</button>{editingCompany !== null && <button type="button" className="outline-button" onClick={() => { setEditingCompany(null); setCompanyForm({ nome: '', cnpj: '', porte: 'MICRO', tipo: 'CONFECCAO', cidade: 'Santa Cruz do Capibaribe' }); }}>Cancelar</button>}</div></form>
    <div className="table-wrap"><table><thead><tr><th>Confecção</th><th>Cidade</th><th>Porte</th><th>Atividade</th><th>Ações</th></tr></thead><tbody>{companies.map((company) => <tr key={company.idConfeccao}><td>{company.nome}</td><td>{company.cidade}</td><td>{company.porte}</td><td>{company.tipo}</td><td><div className="actions"><button type="button" className="text-button" onClick={() => { setEditingCompany(company.idConfeccao); setCompanyForm({ nome: company.nome, cnpj: company.cnpj || '', porte: company.porte, tipo: company.tipo, cidade: company.cidade }); }} disabled={busy}><Pencil size={14}/> Editar</button><button type="button" className="text-button" onClick={() => void removeCompany(company)} disabled={busy}><Trash2 size={14}/> Excluir</button></div></td></tr>)}</tbody></table>{!companies.length && <p>Nenhuma confecção cadastrada.</p>}</div>
  </section>;
}
