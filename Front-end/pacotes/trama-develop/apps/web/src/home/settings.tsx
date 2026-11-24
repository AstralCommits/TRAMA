import { useState } from 'react';
import { Bell, Download, Settings2, ShieldCheck } from 'lucide-react';
import { usePersistentState } from '@/hooks/use-persistent-state';
import { getOrganization, getOrganizationMembers, type TramaUser } from '@/lib/auth.client';

type Preferences = { weeklySummary: boolean; lowStockNotice: boolean; showHelpText: boolean; startPage: string };
const defaults: Preferences = { weeklySummary: true, lowStockNotice: true, showHelpText: true, startPage: 'Início' };

export function SettingsPanel({ user }: { user: TramaUser }) {
  const [preferences, setPreferences] = usePersistentState<Preferences>(`trama:${user.id}:preferences`, defaults);
  const [notice, setNotice] = useState('');
  const update = (patch: Partial<Preferences>) => { setPreferences((current) => ({ ...current, ...patch })); setNotice('Preferências salvas neste navegador.'); };
  const exportBackup = () => {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith(`trama:${user.id}:`));
    const data = Object.fromEntries(keys.map((key) => [key, localStorage.getItem(key)]));
    const team = getOrganizationMembers(user.organizationId, user).map(({ user: member }) => ({ name: member.name, email: member.email, role: member.role, permissions: member.permissions || [], isPrimaryAdmin: Boolean(member.isPrimaryAdmin) }));
    const backup = { exportedAt: new Date().toISOString(), account: { name: user.name, email: user.email, company: user.company, city: user.city }, organization: getOrganization(user.organizationId), team, data };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'trama-backup-local.json'; anchor.click(); URL.revokeObjectURL(url); setNotice('Arquivo de cópia local preparado.');
  };
  return <div className="settings-layout">
    <section className="panel settings-heading"><span className="eyebrow">PREFERÊNCIAS DA PLATAFORMA</span><h3>Deixe a TRAMA mais adequada à rotina da sua equipe</h3><p>As escolhas abaixo são aplicadas neste navegador. Algumas notificações dependem de integração com o servidor para funcionar automaticamente.</p></section>
    <section className="panel settings-section"><div className="settings-section-title"><Bell size={19} /><div><h3>Avisos e lembretes</h3><p>Escolha quais avisos demonstrativos devem aparecer.</p></div></div>
      <label className="setting-toggle"><span><b>Resumo semanal</b><small>Mostrar um resumo das vendas recentes na área inicial.</small></span><input type="checkbox" checked={preferences.weeklySummary} onChange={(event) => update({ weeklySummary: event.target.checked })} /></label>
      <label className="setting-toggle"><span><b>Aviso de estoque baixo</b><small>Exibir lembrete quando o módulo de estoque tiver itens abaixo do mínimo.</small></span><input type="checkbox" checked={preferences.lowStockNotice} onChange={(event) => update({ lowStockNotice: event.target.checked })} /></label>
      <label className="setting-toggle"><span><b>Ajuda nas telas</b><small>Manter textos curtos que explicam para que serve cada recurso.</small></span><input type="checkbox" checked={preferences.showHelpText} onChange={(event) => update({ showHelpText: event.target.checked })} /></label>
    </section>
    <section className="panel settings-section"><div className="settings-section-title"><Settings2 size={19} /><div><h3>Como a plataforma abre</h3><p>Escolha a tela inicial depois de entrar.</p></div></div>
      <label className="settings-select">Tela inicial<select value={preferences.startPage} onChange={(event) => update({ startPage: event.target.value })}>{['Início', 'Minhas vendas', 'Indicadores', 'Relatórios'].map((item) => <option key={item}>{item}</option>)}</select></label>
      <div className="settings-readonly"><span>Moeda</span><b>Real brasileiro (R$)</b></div>
      <div className="settings-readonly"><span>Conta conectada</span><b>{user.email}</b></div>
    </section>
    <section className="panel settings-section"><div className="settings-section-title"><ShieldCheck size={19} /><div><h3>Dados e segurança</h3><p>Veja onde as informações desta versão ficam armazenadas.</p></div></div>
      <div className="settings-local-notice">Nesta versão de demonstração, vendas, equipe, permissões e fotos podem estar salvas apenas no armazenamento local deste navegador. As permissões de tela não substituem a validação de acesso no Back-end.</div>
      <button type="button" className="outline-button settings-export" onClick={exportBackup}><Download size={15} /> Exportar cópia local dos dados</button>
    </section>
    {notice && <p className="notice" role="status">{notice}</p>}
  </div>;
}
