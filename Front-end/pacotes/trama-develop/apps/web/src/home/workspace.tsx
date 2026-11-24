import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3, Building2, ChartNoAxesCombined, ChevronDown, FileText, GitCompare, Home,
  LayoutDashboard, LogOut, Menu, Package, Receipt, Settings2, ShieldCheck, TrendingUp,
  UserRound, type LucideIcon,
} from 'lucide-react';
import { products, initialSales, filtered, type Sale, type Filters } from '@/data/demo';
import { Analytics } from '@/home/analytics';
import { Sales } from '@/home/sales';
import { DashboardIndicators, TrendAnalysis } from '@/components/dashboard/dashboard-indicators';
import { usePersistentState } from '@/hooks/use-persistent-state';
import type { TramaUser } from '@/lib/auth.client';
import { getOrganization } from '@/lib/auth.client';
import { ProfileDialog } from '@/home/profile-dialog';
import { OrganizationPanel } from '@/home/organization';
import { Reports } from '@/home/reports';
import { MarketComparison } from '@/home/market-comparison';
import { SettingsPanel } from '@/home/settings';

const navGroups: { label: string; items: { label: string; icon: LucideIcon }[] }[] = [
  { label: 'VISÃO GERAL', items: [{ label: 'Início', icon: Home }] },
  { label: 'ROTINA DE VENDAS', items: [{ label: 'Minhas vendas', icon: Receipt }, { label: 'Meus produtos', icon: Package }] },
  { label: 'ANÁLISES E MERCADO', items: [{ label: 'Indicadores', icon: ChartNoAxesCombined }, { label: 'Tendências', icon: TrendingUp }, { label: 'Comparar mercado', icon: GitCompare }] },
  { label: 'ACOMPANHAMENTO', items: [{ label: 'Relatórios', icon: BarChart3 }] },
  { label: 'ADMINISTRAÇÃO', items: [{ label: 'Organização e equipe', icon: ShieldCheck }, { label: 'Configurações', icon: Settings2 }] },
];

function currentPeriodLabel() {
  const now = new Date();
  return `${['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][now.getMonth()]} de ${now.getFullYear()}`;
}

export function Workspace({ user, exit, onUserUpdated }: { user: TramaUser; exit: () => void; onUserUpdated: (user: TramaUser) => void }) {
  const [mode, setMode] = useState('Início');
  const [sales, setSales, salesReady] = usePersistentState<Sale[]>(`trama:${user.id}:sales`, user.isDemo ? initialSales : []);
  const [menu, setMenu] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [updated, setUpdated] = useState('');
  const [organization, setOrganization] = useState(() => getOrganization(user.organizationId));
  const [filters, setFilters] = useState<Filters>({ period: user.isDemo ? 'Outubro de 2026' : currentPeriodLabel(), category: 'Todas', product: 'Todos' });

  const permissions = user.isPrimaryAdmin || user.role === 'Administrador'
    ? navGroups.flatMap((group) => group.items.map((item) => item.label))
    : user.permissions || (user.organizationId ? ['Início', 'Minhas vendas', 'Meus produtos', 'Indicadores'] : ['Início', 'Minhas vendas', 'Meus produtos', 'Indicadores', 'Organização e equipe']);
  const visibleGroups = navGroups.map((group) => ({ ...group, items: group.items.filter((item) => permissions.includes(item.label)) })).filter((group) => group.items.length > 0);
  const visibleItems = visibleGroups.flatMap((group) => group.items.map((item) => item.label));
  const activeMode = visibleItems.includes(mode) ? mode : visibleItems[0] || 'Início';
  useEffect(() => { if (activeMode !== mode) setMode(activeMode); }, [activeMode, mode]);

  const availablePeriods = useMemo(() => {
    const values = new Set(sales.map((sale) => {
      const [year, month] = sale.date.split('-').map(Number);
      return `${['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][month - 1]} de ${year}`;
    }));
    values.add(currentPeriodLabel());
    const names = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const order = (label: string) => { const [month, year] = label.split(' de '); return Number(year) * 12 + names.indexOf(month); };
    return [...values].sort((a, b) => order(b) - order(a));
  }, [sales]);
  const current = filtered(sales, filters);
  const previous = filtered(sales, filters, true);

  const save = (rows: Sale[]) => {
    const withCity = rows.map((row) => ({ ...row, city: row.city || user.city }));
    setSales((existing) => [...existing, ...withCity]);
    setNotice(`${rows.length} venda(s) salva(s). Os indicadores foram atualizados.`);
    setUpdated(new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date()));
  };
  const removeSale = (id: number) => {
    setSales((existing) => existing.filter((sale) => sale.id !== id));
    setNotice('Venda excluída e alteração salva.');
    setUpdated(new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date()));
  };
  const description: Record<string, string> = {
    'Início': 'Um resumo do que está acontecendo na sua confecção.',
    'Minhas vendas': 'Cadastre, importe e consulte os registros de venda.',
    'Meus produtos': 'Compare os produtos registrados nas suas vendas.',
    'Indicadores': 'Acompanhe faturamento, quantidade vendida e categorias.',
    'Tendências': 'Veja o que cresceu, ficou estável ou diminuiu no período.',
    'Comparar mercado': 'Explore referências ilustrativas e cenários hipotéticos.',
    'Relatórios': 'Monte um resumo, filtre os dados e exporte os resultados.',
    'Organização e equipe': 'Gerencie a identificação da empresa e os acessos da equipe.',
    'Configurações': 'Ajuste preferências e faça uma cópia local dos dados.',
  };
  const changeMode = (next: string) => { setMode(next); setMenu(false); setNotice(''); };
  const initials = user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const updateUser = (updatedUser: TramaUser) => {
    onUserUpdated(updatedUser);
    setOrganization(getOrganization(updatedUser.organizationId));
  };

  return <div className="workspace workspace-reorganized">
    <aside className={menu ? 'sidebar open' : 'sidebar'}>
      <button className="workspace-logo" type="button" onClick={() => changeMode('Início')} aria-label="Abrir início da TRAMA"><img src="/images/trama-logo.png" alt="TRAMA" /></button>
      <div className="sidebar-organization"><span className="sidebar-org-avatar">{organization?.logoDataUrl ? <img src={organization.logoDataUrl} alt="" /> : <Building2 size={17} />}</span><span><b>{organization?.name || user.company}</b><small>{organization?.city || user.city || 'Sua organização'}</small></span></div>
      <nav aria-label="Módulos da plataforma">
        {visibleGroups.map((group) => <div className="workspace-nav-group" key={group.label}><span className="workspace-label">{group.label}</span>{group.items.map(({ label, icon: Icon }) => <button key={label} className={activeMode === label ? 'active' : ''} aria-current={activeMode === label ? 'page' : undefined} onClick={() => changeMode(label)}><span className="nav-icon"><Icon size={17} strokeWidth={1.8} /></span><span className="nav-label">{label}</span></button>)}</div>)}
      </nav>
      <div className="sidebar-bottom"><span className="sidebar-role"><ShieldCheck size={13} /> {user.role}</span><button className="sidebar-exit" onClick={exit}><LogOut size={15} /> Sair da conta</button></div>
    </aside>

    <div className="workspace-main">
      <header className="workspace-header">
        <div className="workspace-header-company">
          <button className="mobile-toggle" aria-label="Abrir módulos" aria-expanded={menu} onClick={() => setMenu(!menu)}><Menu /></button>
          <span className="workspace-company-icon">{organization?.logoDataUrl ? <img src={organization.logoDataUrl} alt="" /> : <Building2 size={17} />}</span>
          <span className="workspace-company-name">{organization?.name || user.company}</span>
          <span className="badge">{user.isDemo ? 'DEMONSTRAÇÃO' : user.isLocal ? 'CONTA LOCAL' : 'CONECTADO'}</span>
        </div>
        <div className="profile-menu-wrap">
          <button type="button" className="profile-trigger" aria-haspopup="menu" aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen((open) => !open)}>
            <span className="profile-trigger-copy"><strong>{user.name}</strong><small>{user.role}</small></span>
            <span className="avatar">{user.avatarUrl ? <img src={user.avatarUrl} alt={`Foto de ${user.name}`} /> : initials}</span>
            <ChevronDown size={15} className={profileMenuOpen ? 'profile-chevron is-open' : 'profile-chevron'} />
          </button>
          {profileMenuOpen && <div className="profile-dropdown" role="menu"><div className="profile-dropdown-heading"><strong>{user.name}</strong><span>{user.email}</span><small>{organization?.name || user.company}</small></div><button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); setProfileOpen(true); }}><UserRound size={16} /> Meu perfil</button>{permissions.includes('Configurações') && <button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); changeMode('Configurações'); }}><Settings2 size={16} /> Configurações</button>}<button type="button" role="menuitem" className="profile-dropdown-exit" onClick={() => { setProfileMenuOpen(false); exit(); }}><LogOut size={16} /> Sair da conta</button></div>}
        </div>
      </header>

      <div className="dashboard-body">
        <div className="eyebrow"><LayoutDashboard size={14} /> GESTÃO COM OS PÉS NO CHÃO</div>
        <div className="page-heading"><div><h1>{activeMode === 'Início' ? `Olá, ${user.name.split(' ')[0]}.` : activeMode}</h1><p>{description[activeMode] || 'Organize as informações e acompanhe a rotina da sua empresa.'}</p></div><span className="date-label">{currentPeriodLabel().toLocaleUpperCase('pt-BR')}</span></div>
        <div className={user.isDemo ? 'demo-notice' : 'demo-notice account-notice'}>{user.isDemo ? <><b>Ambiente de demonstração.</b> A Confecção Fio do Agreste e os registros iniciais são fictícios. Você pode testar os recursos; suas alterações ficam salvas neste navegador.</> : user.isLocal ? <><b>Conta local.</b> Dados, fotos e equipe ficam neste navegador e não são enviados ao servidor.</> : <><b>Conta conectada.</b> O acesso foi validado pelo Back-end. Alguns recursos de organização e perfil ainda precisam de rotas específicas na API.</>}</div>
        {!salesReady ? <section className="panel">Carregando os dados salvos desta conta…</section> : <>
          {notice && <p role="status" className="notice">{notice}</p>}
          {activeMode === 'Início' && <>
            <div className="filters filter-panel"><label>Período<select value={filters.period} onChange={(event) => setFilters({ ...filters, period: event.target.value })}>{availablePeriods.map((value) => <option key={value}>{value}</option>)}</select></label><label>Categoria<select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>{['Todas', ...Array.from(new Set(sales.map((sale) => sale.category)))].map((value) => <option key={value}>{value}</option>)}</select></label><label>Produto<select value={filters.product} onChange={(event) => setFilters({ ...filters, product: event.target.value })}>{['Todos', ...Array.from(new Set([...products.map((product) => product.name), ...sales.map((sale) => sale.product)]))].map((value) => <option key={value}>{value}</option>)}</select></label><span className="updated">Última atualização<br /><b>{updated || 'Dados salvos localmente'}</b></span></div>
            <Analytics current={current} previous={previous} mode="Início" filters={filters} />
            <div className="home-shortcuts"><button onClick={() => changeMode('Minhas vendas')}><Receipt size={16} /> Registrar ou consultar vendas</button><button className="outline-button" onClick={() => changeMode('Relatórios')}><FileText size={16} /> Ver relatórios</button><button className="outline-button" onClick={() => changeMode('Tendências')}><TrendingUp size={16} /> Ver tendências</button></div>
          </>}
          {activeMode === 'Indicadores' && <DashboardIndicators sales={sales} defaultCity={user.city} />}
          {activeMode === 'Tendências' && <TrendAnalysis sales={sales} defaultCity={user.city} />}
          {activeMode === 'Meus produtos' && <><div className="filters filter-panel"><label>Período<select value={filters.period} onChange={(event) => setFilters({ ...filters, period: event.target.value })}>{availablePeriods.map((value) => <option key={value}>{value}</option>)}</select></label><label>Categoria<select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>{['Todas', ...Array.from(new Set(sales.map((sale) => sale.category)))].map((value) => <option key={value}>{value}</option>)}</select></label><label>Produto<select value={filters.product} onChange={(event) => setFilters({ ...filters, product: event.target.value })}>{['Todos', ...Array.from(new Set([...products.map((product) => product.name), ...sales.map((sale) => sale.product)]))].map((value) => <option key={value}>{value}</option>)}</select></label></div><Analytics current={current} previous={previous} mode="Comparação de Produtos" filters={filters} /></>}
          {activeMode === 'Minhas vendas' && <Sales sales={sales} save={save} remove={removeSale} />}
          {activeMode === 'Comparar mercado' && <MarketComparison sales={sales} city={user.city} />}
          {activeMode === 'Relatórios' && <Reports sales={sales} />}
          {activeMode === 'Organização e equipe' && <OrganizationPanel user={user} onUserUpdated={updateUser} />}
          {activeMode === 'Configurações' && <SettingsPanel user={user} />}
        </>}
        <div className="dashboard-foot"><span>TRAMA · Feita para quem faz.</span><span>{user.isDemo ? 'Dados demonstrativos, editáveis neste navegador.' : 'Dados desta conta armazenados localmente.'}</span></div>
      </div>
    </div>
    {profileOpen && <ProfileDialog user={user} onClose={() => setProfileOpen(false)} onSaved={updateUser} />}
  </div>;
}
