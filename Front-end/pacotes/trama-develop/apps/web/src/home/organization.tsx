import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Building2, Check, Copy, Crown, ImagePlus, LockKeyhole, RefreshCw, ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react';
import {
  addOrganizationMember, createOrganization, getOrganization, getOrganizationInviteCode, getOrganizationMembers, getSession,
  removeOrganizationMember, rotateOrganizationInviteCode, updateOrganization, updateOrganizationMember, type TramaUser,
} from '@/lib/auth.client';
import { workspaceModules } from '@/lib/workspace-modules';
import { compressImageFile } from '@/lib/image.client';

const assignableModules = workspaceModules.filter((item) => !['Organização e equipe', 'Configurações'].includes(item));
type Props = { user: TramaUser; onUserUpdated: (user: TramaUser) => void };
type MemberDraft = { role: 'Administrador' | 'Funcionário'; permissions: string[] };

export function OrganizationPanel({ user, onUserUpdated }: Props) {
  const organization = getOrganization(user.organizationId);
  const [name, setName] = useState(organization?.name || user.company);
  const [city, setCity] = useState(organization?.city || user.city);
  const [logo, setLogo] = useState(organization?.logoDataUrl || '');
  const [members, setMembers] = useState(() => getOrganizationMembers(user.organizationId, user));
  const [inviteCode, setInviteCode] = useState(() => getOrganizationInviteCode(user.organizationId));
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [newRole, setNewRole] = useState<'Administrador' | 'Funcionário'>('Funcionário');
  const [newPermissions, setNewPermissions] = useState<string[]>(['Início', 'Minhas vendas', 'Meus produtos', 'Indicadores']);
  const [drafts, setDrafts] = useState<Record<string, MemberDraft>>({});
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const canManage = Boolean(user.isPrimaryAdmin);

  useEffect(() => {
    if (user.organizationId) {
      setMembers(getOrganizationMembers(user.organizationId, user));
      setInviteCode(getOrganizationInviteCode(user.organizationId));
    } else {
      setMembers([]);
      setInviteCode('');
    }
  }, [user.organizationId, user.id]);

  const refreshMembers = () => setMembers(getOrganizationMembers(user.organizationId, getSession() || user));
  const copyInviteCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setNotice('Código copiado. Compartilhe somente com pessoas autorizadas.');
      setError('');
    } catch {
      setNotice('Não foi possível copiar automaticamente. Selecione o código e copie manualmente.');
    }
  };
  const renewInviteCode = () => {
    if (!window.confirm('Gerar outro código? O código atual deixará de funcionar.')) return;
    try {
      setInviteCode(rotateOrganizationInviteCode(user));
      setNotice('Novo código criado. O anterior foi desativado.');
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível gerar outro código.');
    }
  };
  const initials = useMemo(() => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'TR', [name]);

  const saveOrganization = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setNotice(''); setError('');
    try {
      if (!user.organizationId) {
        onUserUpdated(createOrganization(user, { name, city, logoDataUrl: logo || undefined }));
        setNotice('Organização criada. Agora você é o administrador principal deste espaço.');
      } else {
        updateOrganization(user, { name, city, logoDataUrl: logo || undefined });
        const updated = getSession(); if (updated) onUserUpdated(updated);
        setNotice('Dados da organização atualizados neste navegador.');
      }
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Não foi possível salvar a organização.'); }
  };

  const addMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setNotice(''); setBusy(true);
    try {
      await addOrganizationMember(user, { name: memberName, email: memberEmail, password: memberPassword, role: newRole, permissions: newPermissions });
      setMemberName(''); setMemberEmail(''); setMemberPassword('');
      setNewRole('Funcionário'); setNewPermissions(['Início', 'Minhas vendas', 'Meus produtos', 'Indicadores']);
      refreshMembers(); setNotice('Pessoa adicionada. Ela já pode entrar usando o e-mail e a senha inicial informada.');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Não foi possível adicionar a pessoa.'); }
    finally { setBusy(false); }
  };

  const draftFor = (member: TramaUser): MemberDraft => drafts[member.id] || {
    role: member.role === 'Administrador' ? 'Administrador' : 'Funcionário',
    permissions: member.permissions || ['Início', 'Minhas vendas', 'Meus produtos', 'Indicadores'],
  };
  const updateDraft = (memberId: string, patch: Partial<MemberDraft>) => {
    const member = members.find((item) => item.user.id === memberId)?.user;
    if (!member) return;
    setDrafts((current) => ({ ...current, [memberId]: { ...draftFor(member), ...patch } }));
  };
  const saveMember = (member: TramaUser) => {
    const draft = draftFor(member);
    try {
      updateOrganizationMember(user, member.id, draft);
      refreshMembers(); setDrafts((current) => { const next = { ...current }; delete next[member.id]; return next; });
      setNotice(`${member.name}: cargo e permissões atualizados.`); setError('');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Não foi possível salvar as permissões.'); }
  };
  const deleteMember = (member: TramaUser) => {
    if (!window.confirm(`Remover ${member.name} da organização? A conta local dela deixará de acessar este espaço.`)) return;
    try { removeOrganizationMember(user, member.id); refreshMembers(); setNotice(`${member.name} foi removido da organização.`); setError(''); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Não foi possível remover a pessoa.'); }
  };

  return <div className="organization-layout">
    <section className="panel organization-intro">
      <div className="organization-intro-icon"><Building2 size={23} /></div>
      <div><span className="eyebrow">ESPAÇO DA EMPRESA</span><h3>Organização e equipe</h3><p>Atualize a identificação da confecção e defina o que cada pessoa pode consultar na TRAMA.</p></div>
    </section>

    <section className="panel organization-panel">
      <div className="panel-title"><div><span className="eyebrow">IDENTIDADE DA EMPRESA</span><h3>{user.organizationId ? 'Perfil da organização' : 'Criar organização'}</h3></div><span className="organization-local-tag">Salvo neste navegador</span></div>
      <form className="organization-form" onSubmit={saveOrganization}>
        <div className="organization-logo-column">
          <div className="organization-logo-preview">{logo ? <img src={logo} alt="Logo da organização" /> : initials}</div>
          <label className="photo-upload-button"><ImagePlus size={14} /> {logo ? 'Trocar imagem' : 'Adicionar imagem'}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { setLogo(await compressImageFile(file, 520)); setError(''); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Não foi possível carregar a imagem.'); } finally { event.target.value = ''; } }} /></label>
          {logo && <button type="button" className="text-button" onClick={() => setLogo('')}>Remover imagem</button>}
        </div>
        <div className="organization-fields">
          <label>Nome da organização<input required value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label>Cidade<select required value={city} onChange={(event) => setCity(event.target.value)}><option value="" disabled>Selecione uma cidade</option>{['Santa Cruz do Capibaribe', 'Toritama', 'Caruaru', 'Outra cidade do Agreste'].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Moeda utilizada<input value="Real brasileiro (R$)" readOnly /></label>
          <button type="submit" disabled={Boolean(user.organizationId) && !canManage}><Check size={15} /> {user.organizationId ? 'Salvar organização' : 'Criar organização'}</button>
          {user.organizationId && !canManage && <small>Somente o administrador principal pode editar os dados da organização.</small>}
          {!user.organizationId && <small>Ao criar, esta conta será definida como administradora principal.</small>}
        </div>
      </form>
    </section>

    {user.organizationId && canManage && <section className="panel organization-invite-panel">
      <div className="panel-title"><div><span className="eyebrow">CONVITE PARA A EQUIPE</span><h3>Código para entrar na organização</h3></div><Users size={19} /></div>
      <p>Compartilhe este código com quem deve entrar na sua organização. A pessoa criará a própria conta e começará como funcionária; você poderá ajustar as permissões depois.</p>
      <div className="organization-invite-code-row">
        <code aria-label="Código de convite">{inviteCode || 'Gerando código…'}</code>
        <button type="button" onClick={copyInviteCode} disabled={!inviteCode}><Copy size={15} /> Copiar código</button>
        <button type="button" className="outline-button" onClick={renewInviteCode}><RefreshCw size={15} /> Gerar outro</button>
      </div>
      <small>Limitação desta versão: o código é armazenado neste navegador. O convite entre computadores ou celulares diferentes depende de uma API de organizações e convites no Back-end.</small>
    </section>}

    {user.organizationId && <section className="panel team-panel">
      <div className="panel-title"><div><span className="eyebrow">PESSOAS E ACESSOS</span><h3>Equipe da organização</h3></div><span className="team-count"><Users size={14} /> {members.length} pessoa(s)</span></div>
      <div className="permission-explainer"><ShieldCheck size={18} /><p><b>Administrador principal:</b> controla a organização e pode promover funcionários a administrador. <b>Administrador:</b> acessa os módulos liberados pela TRAMA. <b>Funcionário:</b> só vê os módulos autorizados pelo responsável.</p></div>
      <div className="team-list">
        {members.map(({ user: member }) => {
          const draft = draftFor(member);
          return <article className="team-member" key={member.id}>
            <div className="team-member-heading">
              <span className="team-avatar">{member.avatarUrl ? <img src={member.avatarUrl} alt="" /> : member.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span>
              <span className="team-member-name"><b>{member.name}</b><small>{member.email}</small></span>
              <span className={`role-chip ${member.isPrimaryAdmin ? 'owner' : ''}`}>{member.isPrimaryAdmin ? <><Crown size={12} /> Administrador principal</> : member.role}</span>
            </div>
            {member.isPrimaryAdmin ? <p className="member-locked"><LockKeyhole size={13} /> Conta principal protegida. Não pode ser rebaixada nem removida por esta tela.</p> : <>
              <div className="team-permission-controls">
                <label>Cargo<select value={draft.role} disabled={!canManage} onChange={(event) => updateDraft(member.id, { role: event.target.value === 'Administrador' ? 'Administrador' : 'Funcionário' })}><option value="Funcionário">Funcionário</option><option value="Administrador">Administrador (acesso amplo)</option></select></label>
                {draft.role === 'Funcionário' && <div className="permission-checks"><span>Módulos liberados</span><div>{assignableModules.map((module) => <label key={module}><input type="checkbox" checked={draft.permissions.includes(module)} disabled={!canManage} onChange={(event) => updateDraft(member.id, { permissions: event.target.checked ? [...draft.permissions, module] : draft.permissions.filter((item) => item !== module) })} />{module}</label>)}</div></div>}
                {draft.role === 'Administrador' && <p className="admin-access-note"><ShieldCheck size={14} /> Acesso a todos os módulos de trabalho. A gestão de cargos continua exclusiva do administrador principal.</p>}
              </div>
              <div className="team-member-actions"><button type="button" disabled={!canManage} onClick={() => saveMember(member)}>Salvar acesso</button><button type="button" className="text-button danger-text" disabled={!canManage} onClick={() => deleteMember(member)}><Trash2 size={14} /> Remover</button></div>
            </>}
          </article>;
        })}
      </div>
      {canManage ? <form className="add-member-form" onSubmit={addMember}>
        <div><span className="eyebrow">NOVO ACESSO</span><h3><UserPlus size={18} /> Adicionar funcionário ou administrador</h3><p>Cadastre uma conta local para a pessoa entrar com o próprio e-mail e senha.</p></div>
        <div className="add-member-fields">
          <label>Nome completo<input required value={memberName} onChange={(event) => setMemberName(event.target.value)} placeholder="Nome da pessoa" /></label>
          <label>E-mail de acesso<input required type="email" value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} placeholder="pessoa@empresa.com" /></label>
          <label>Senha inicial<input required minLength={8} type="password" value={memberPassword} onChange={(event) => setMemberPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" /></label>
          <label>Cargo inicial<select value={newRole} onChange={(event) => setNewRole(event.target.value as 'Administrador' | 'Funcionário')}><option value="Funcionário">Funcionário</option><option value="Administrador">Administrador</option></select></label>
        </div>
        {newRole === 'Funcionário' && <div className="permission-checks add-permission-checks"><span>O que essa pessoa poderá acessar?</span><div>{assignableModules.map((module) => <label key={module}><input type="checkbox" checked={newPermissions.includes(module)} onChange={(event) => setNewPermissions(event.target.checked ? [...newPermissions, module] : newPermissions.filter((item) => item !== module))} />{module}</label>)}</div></div>}
        <button type="submit" disabled={busy}><UserPlus size={15} /> {busy ? 'Adicionando…' : 'Adicionar à organização'}</button>
      </form> : <p className="member-locked"><LockKeyhole size={14} /> A gestão da equipe e a promoção de funcionários são exclusivas do administrador principal.</p>}
    </section>}

    {(notice || error) && <p className={error ? 'auth-error' : 'notice'} role="status">{error || notice}</p>}
    <p className="profile-footnote">Limite desta versão: organizações, fotos, contas da equipe e permissões ficam no localStorage deste navegador. Ainda não são sincronizadas nem protegidas pelo Back-end; antes de uso real, as mesmas regras precisam existir na API e no banco de dados.</p>
  </div>;
}
