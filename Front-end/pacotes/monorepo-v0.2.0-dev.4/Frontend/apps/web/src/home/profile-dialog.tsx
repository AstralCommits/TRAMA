import { useEffect, useState, type FormEvent } from 'react';
import { Building2, Mail, MapPin, UserRound } from 'lucide-react';
import { api, getApiErrorMessage } from '@/services/api';
import { updateAccountProfile, type TramaUser } from '@/lib/auth.client';
import { useDialogAccessibility } from '@/hooks/use-dialog-accessibility';

const cities = ['Santa Cruz do Capibaribe', 'Toritama', 'Caruaru'];
type Company = { idConfeccao: number; nome: string; cnpj: string | null; porte: 'MICRO' | 'PEQUENA' | 'MEDIA'; tipo: 'CONFECCAO' | 'FACCAO'; cidade: string };
type Props = { user: TramaUser; onClose: () => void; onSaved: (user: TramaUser) => void };

export function ProfileDialog({ user, onClose, onSaved }: Props) {
  const [name, setName] = useState(user.name); const [email, setEmail] = useState(user.email);
  const [company, setCompany] = useState(user.company); const [city, setCity] = useState(user.city);
  const [cnpj, setCnpj] = useState(''); const [porte, setPorte] = useState<Company['porte']>('MICRO'); const [tipo, setTipo] = useState<Company['tipo']>('CONFECCAO');
  const [loading, setLoading] = useState(!user.isDemo); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const dialogRef = useDialogAccessibility<HTMLElement>(true, onClose, { closeOnEscape: !busy });
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'TR';
  useEffect(() => { if (user.isDemo || !user.idConfeccao) { setLoading(false); return; } let active = true; api.get<Company>(`/api/confeccoes/${user.idConfeccao}`).then(({ data }) => { if (!active) return; setCompany(data.nome); setCity(data.cidade); setCnpj(data.cnpj || ''); setPorte(data.porte); setTipo(data.tipo); }).catch((caught) => { if (active) setError(getApiErrorMessage(caught)); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [user.idConfeccao, user.isDemo]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('');
    if (user.isDemo) { try { onSaved(updateAccountProfile(user, { name, email, company, city })); onClose(); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Não foi possível atualizar o perfil.'); } return; }
    if (user.role !== 'Empresário' || !user.idConfeccao) { setError('Somente o responsável pela confecção pode alterar seus dados cadastrais.'); return; }
    setBusy(true);
    try { const response = await api.put<Company>('/api/confeccoes/minha', { nome: company.trim(), cnpj: cnpj.trim() || null, porte, tipo, cidade }); onSaved({ ...user, company: response.data.nome, city: response.data.cidade }); onClose(); }
    catch (caught) { setError(getApiErrorMessage(caught)); }
    finally { setBusy(false); }
  };
  const canEditCompany = user.isDemo || user.role === 'Empresário';
  return <div className="modal-backdrop profile-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <section ref={dialogRef} tabIndex={-1} className="modal profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
      <div className="profile-modal-top"><div><span className="eyebrow">TRAMA / MINHA CONTA</span><h2 id="profile-title">Perfil do usuário</h2><p>Consulte seus dados e atualize as informações da confecção.</p></div><div className="profile-large-avatar" aria-label={`Iniciais ${initials}`}>{initials}</div></div>
      <div className="profile-account-strip"><span className="profile-status-dot"/><span><strong>{user.isDemo ? 'Conta de demonstração' : 'Conta conectada ao servidor'}</strong><small>{user.isDemo ? 'Dados de exemplo neste navegador' : 'Dados cadastrais autenticados pela API'}</small></span></div>
      {loading ? <p>Carregando dados da confecção…</p> : <form onSubmit={submit} className="profile-form">
        <label><span><UserRound size={14}/> Nome completo</span><input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} readOnly={!user.isDemo}/></label>
        <label><span><Mail size={14}/> E-mail de acesso</span><input required type="email" autoComplete="email" value={email} readOnly/></label>
        <label><span><Building2 size={14}/> Empresa / confecção</span><input required maxLength={120} value={company} onChange={(e) => setCompany(e.target.value)} readOnly={!canEditCompany}/></label>
        <label><span><MapPin size={14}/> Cidade</span><select value={city} onChange={(e) => setCity(e.target.value)} disabled={!canEditCompany}>{cities.map((item) => <option key={item}>{item}</option>)}</select></label>
        {!user.isDemo && <><label>CNPJ<input inputMode="numeric" value={cnpj} onChange={(e) => setCnpj(e.target.value)} readOnly={!canEditCompany} placeholder="Opcional"/></label><label>Porte<select value={porte} onChange={(e) => setPorte(e.target.value as Company['porte'])} disabled={!canEditCompany}><option value="MICRO">Micro</option><option value="PEQUENA">Pequena</option><option value="MEDIA">Média</option></select></label><label>Atividade<select value={tipo} onChange={(e) => setTipo(e.target.value as Company['tipo'])} disabled={!canEditCompany}><option value="CONFECCAO">Confecção</option><option value="FACCAO">Facção</option></select></label></>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <div className="actions profile-actions"><button type="button" className="outline-button" onClick={onClose} disabled={busy}>Fechar</button>{canEditCompany && <button type="submit" disabled={busy}>{busy ? 'Salvando…' : 'Salvar alterações'}</button>}</div>
      </form>}
      <p className="profile-footnote">{user.isDemo ? 'As alterações da demonstração ficam neste navegador.' : user.role === 'Empresário' ? 'O cadastro da confecção é atualizado no servidor. Nome e e-mail de acesso não são alterados por esta tela.' : 'Seu acesso é gerenciado pelo responsável da confecção.'}</p>
    </section>
  </div>;
}
