import { useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, ClipboardList, GitCompare, Home, LayoutDashboard, Menu, Receipt, Scissors, ShieldCheck, TrendingUp, UserRound, Users, LogOut, type LucideIcon } from 'lucide-react';
import { modules, initialSalesForCity, filtered, type Sale, type Filters } from '@/data/demo';
import { Analytics } from '@/home/analytics';
import { Sales } from '@/home/sales';
import { MonthlySales } from '@/home/monthly-sales';
import { MonthlyScenarios } from '@/home/monthly-scenarios';
import { MonthlyReports } from '@/home/monthly-reports';
import { Operations } from '@/home/operations';
import { CategoryComparison } from '@/home/category-comparison';
import { DashboardIndicators, TrendAnalysis } from '@/components/dashboard/dashboard-indicators';
import { usePersistentState } from '@/hooks/use-persistent-state';
import type { TramaUser } from '@/lib/auth.client';
import { ProfileDialog } from '@/home/profile-dialog';
import { CategoryManagement } from '@/home/category-management';
import { TeamManagement } from '@/home/team-management';

const moduleIcons: Record<string, LucideIcon> = {
  'Visão Geral': Home,
  'Dados de Vendas': Receipt,
  'Tendências': TrendingUp,
  'Comparação de Categorias': GitCompare,
  'Cenário da Concorrência': ShieldCheck,
  'Relatórios': LayoutDashboard,
  'Cadastros': ClipboardList,
  'Equipe e Permissões': Users,
};

const sectionLabels: Record<number, string> = {
  0: 'INTELIGÊNCIA COMERCIAL',
  1: 'DADOS DE VENDAS',
  4: 'SIMULAÇÃO E RELATÓRIOS',
};

function currentPeriodLabel() {
  const now = new Date();
  return `${['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][now.getMonth()]} de ${now.getFullYear()}`;
}

export function Workspace({ user, exit, onUserUpdated }: { user: TramaUser; exit: () => void; onUserUpdated: (user: TramaUser) => void }) {
  const [mode, setMode] = useState('Visão Geral');
  const visibleModules = user.isDemo
    ? modules
    : [...modules, ...(user.role === 'Administrador' ? ['Cadastros'] : []), ...(user.role === 'Empresário' ? ['Equipe e Permissões'] : [])];
  const [sales, setSales, salesReady] = usePersistentState<Sale[]>(
    `trama:${user.id}:monthly-sales:v2`, user.isDemo ? initialSalesForCity(user.city) : [],
  );
  const [menu, setMenu] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [updated, setUpdated] = useState('');
  const [filters, setFilters] = useState<Filters>({
    period: user.isDemo ? 'Outubro de 2026' : currentPeriodLabel(),
    category: 'Todas',
  });

  const availablePeriods = useMemo(() => {
    const values = new Set(sales.map((sale) => {
      const [year, month] = sale.mesAno.split('-').map(Number);
      return `${['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][month - 1]} de ${year}`;
    }));
    values.add(currentPeriodLabel());
    const names = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const order = (label: string) => {
      const [month, year] = label.split(' de ');
      return Number(year) * 12 + names.indexOf(month);
    };
    return [...values].sort((a, b) => order(b) - order(a));
  }, [sales]);

  const current = filtered(sales, filters);
  const previous = filtered(sales, filters, true);

  const save = (row: Sale) => {
    const withCity = { ...row, city: user.city };
    setSales((existing) => existing.some((item) => item.id === withCity.id)
      ? existing.map((item) => item.id === withCity.id ? withCity : item)
      : [...existing, withCity]);
    setNotice('Lançamento mensal salvo. Os indicadores foram atualizados.');
    setUpdated(new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date()));
  };
  const removeSale = (id: number) => {
    setSales((existing) => existing.filter((sale) => sale.id !== id));
    setNotice('Lançamento mensal excluído.');
    setUpdated(new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date()));
  };

  const activeDescription: Record<string, string> = {
    'Visão Geral': 'Veja faturamento, peças vendidas e categoria de maior resultado no período.',
    'Dados de Vendas': 'Cadastre, consulte e importe totais mensais de peças e faturamento por categoria.',
    'Tendências': 'Observe categorias em alta, estáveis ou em queda a partir dos lançamentos registrados.',
    'Comparação de Categorias': 'Compare faturamento e quantidade entre categorias no mesmo período.',
    'Cenário da Concorrência': 'Simule uma hipótese de impacto usando o faturamento histórico da própria confecção.',
    'Relatórios': 'Filtre, exporte e imprima os lançamentos mensais da confecção.',
    'Cadastros': 'Administre categorias e cadastros de confecções.',
    'Equipe e Permissões': 'Gerencie convites, acessos e atividades da equipe da confecção.',
  };

  return <div className="workspace">
    <aside className={menu ? 'sidebar open' : 'sidebar'}>
      <button className="workspace-logo" type="button" onClick={() => { setMode('Visão Geral'); setMenu(false); }} aria-label="Abrir visão geral da TRAMA">
        <img src="/images/trama-logo.png" alt="TRAMA — Tecendo relações no mercado do Agreste" />
      </button>
      <span className="workspace-label">{user.company.toLocaleUpperCase('pt-BR')}</span>
      <nav aria-label="Módulos da plataforma">
        {visibleModules.map((item, index) => {
          const Icon = moduleIcons[item] || LayoutDashboard;
          return <div className="workspace-nav-item" key={item}>
            {sectionLabels[index] && <span className="workspace-label">{sectionLabels[index]}</span>}
            <button className={item === mode ? 'active' : ''} aria-current={item === mode ? 'page' : undefined} onClick={() => { setMode(item); setMenu(false); setNotice(''); }}>
              <span className="nav-icon"><Icon size={16} strokeWidth={1.8} /></span>
              <span className="nav-label">{item}</span>
            </button>
          </div>;
        })}
      </nav>
      <button className="sidebar-exit" onClick={exit}><ArrowLeft size={15} /> Sair da conta</button>
    </aside>

    <div className="workspace-main">
      <header className="workspace-header">
        <div className="workspace-header-company">
          <button className="mobile-toggle" aria-label="Abrir módulos" aria-expanded={menu} onClick={() => setMenu(!menu)}><Menu /></button>
          <span className="workspace-company-icon"><Scissors size={17} /></span>
          <span className="workspace-company-name">{user.company}</span>
          <span className="badge">{user.isDemo ? 'DEMONSTRAÇÃO' : 'CONTA CONECTADA'}</span>
        </div>
        <div className="profile-menu-wrap">
          <button
            type="button"
            className="profile-trigger"
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            onClick={() => setProfileMenuOpen((open) => !open)}
          >
            <span className="profile-trigger-copy"><strong>{user.name}</strong><small>{user.role || 'Administrador'}</small></span>
            <span className="avatar">{user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span>
            <ChevronDown size={15} className={profileMenuOpen ? 'profile-chevron is-open' : 'profile-chevron'} />
          </button>
          {profileMenuOpen && <div className="profile-dropdown" role="menu">
            <div className="profile-dropdown-heading"><strong>{user.name}</strong><span>{user.email}</span><small>{user.company}</small></div>
            <button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); setProfileOpen(true); }}><UserRound size={16} /> Meu perfil</button>
            <button type="button" role="menuitem" className="profile-dropdown-exit" onClick={() => { setProfileMenuOpen(false); exit(); }}><LogOut size={16} /> Sair da conta</button>
          </div>}
        </div>
      </header>

      <div className="dashboard-body">
        <div className="eyebrow"><LayoutDashboard size={14} /> GESTÃO COM OS PÉS NO CHÃO</div>
        <div className="page-heading"><div><h1>{mode === 'Visão Geral' ? `Olá, ${user.name.split(' ')[0]}.` : mode}</h1><p>{activeDescription[mode] || 'Organize as informações e acompanhe a rotina da sua empresa.'}</p></div><span className="date-label">{currentPeriodLabel().toLocaleUpperCase('pt-BR')}</span></div>

        <div className={user.isDemo ? 'demo-notice' : 'demo-notice account-notice'}>
          {user.isDemo
            ? <><b>Ambiente de demonstração.</b> A Confecção Fio do Agreste e os registros iniciais são fictícios. Teste lançamentos mensais, indicadores, tendências, comparação de categorias, cenários hipotéticos e relatórios; as alterações ficam salvas neste navegador.</>
            : <><b>Conta conectada: {user.company}.</b> O acesso é autenticado pelo Back-end. Lançamentos, importações, indicadores, cenários e relatórios usam dados do servidor, limitados à sua confecção.</>}
        </div>

        {!salesReady ? <section className="panel">Carregando os dados salvos desta conta…</section> : <>
          {notice && <p role="status" className="notice">{notice}</p>}
          {mode === 'Visão Geral' ? <>
            {user.isDemo && <div className="filters filter-panel">
              <label>Período<select value={filters.period} onChange={(e) => setFilters({ ...filters, period: e.target.value })}>{availablePeriods.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label>Categoria<select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>{['Todas', ...Array.from(new Set(sales.map((sale) => sale.category)))].map((value) => <option key={value}>{value}</option>)}</select></label>
              <span className="updated">Última atualização<br /><b>{updated || 'Dados salvos localmente'}</b></span>
            </div>}
            {user.isDemo ? <Analytics current={current} previous={previous} filters={filters} /> : <DashboardIndicators sales={sales} defaultCity={user.city} isDemo={false} userId={user.id} />}
          </> : null}

          {mode === 'Dados de Vendas' && (user.isDemo
            ? <Sales sales={sales} save={save} remove={removeSale} defaultCity={user.city} />
            : <MonthlySales idConfeccao={user.idConfeccao} nomeConfeccao={user.company} />)}
          {mode === 'Tendências' && <TrendAnalysis sales={sales} defaultCity={user.city} isDemo={user.isDemo} userId={user.id} />}
          {mode === 'Comparação de Categorias' && <CategoryComparison sales={sales} defaultCity={user.city} isDemo={user.isDemo} />}
          {mode === 'Cenário da Concorrência' && (user.isDemo
            ? <Operations mode="Cenário da Concorrência" sales={sales} />
            : <MonthlyScenarios nomeConfeccao={user.company} />)}
          {mode === 'Relatórios' && (user.isDemo
            ? <Operations mode="Relatórios" sales={sales} />
            : <MonthlyReports nomeConfeccao={user.company} />)}
          {mode === 'Cadastros' && !user.isDemo && user.role === 'Administrador' && <CategoryManagement />}
          {mode === 'Equipe e Permissões' && !user.isDemo && user.role === 'Empresário' && <TeamManagement />}
        </>}
        <div className="dashboard-foot"><span>TRAMA · Feita para quem faz.</span><span>{user.isDemo ? 'Dados de demonstração, editáveis neste navegador.' : 'Dados reais: servidor · filtros e preferências: navegador.'}</span></div>
      </div>
    </div>
    {profileOpen && <ProfileDialog user={user} onClose={() => setProfileOpen(false)} onSaved={onUserUpdated} />}
  </div>;
}
