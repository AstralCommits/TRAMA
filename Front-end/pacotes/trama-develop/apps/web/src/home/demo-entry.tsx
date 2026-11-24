import { useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2, LockKeyhole, Scissors, X } from 'lucide-react';
import {
  authenticateAccount,
  joinOrganizationByCode,
  registerAccount,
  startDemoSession,
  type TramaUser,
} from '@/lib/auth.client';

type EntryView = 'login' | 'register' | 'demo' | 'join';
type Props = { mode: string; close: () => void; onSuccess: (user: TramaUser) => void };
const cities = ['Santa Cruz do Capibaribe', 'Toritama', 'Caruaru', 'Outra cidade do Agreste'];

export function DemoEntry({ mode, close, onSuccess }: Props) {
  const initialView: EntryView = mode === 'Cadastrar-se' ? 'register' : mode === 'Entrar na demonstração' ? 'demo' : 'login';
  const [view, setView] = useState<EntryView>(initialView);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [company, setCompany] = useState('');
  const [city, setCity] = useState('Santa Cruz do Capibaribe');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const changeView = (nextView: EntryView) => {
    setView(nextView);
    setError('');
    setStep(1);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (view === 'register') {
        if (password !== confirmPassword) throw new Error('As senhas não conferem.');
        onSuccess(await registerAccount({ name, email, password, company, city }));
      } else if (view === 'join') {
        onSuccess(await joinOrganizationByCode({ name, email, password, code: inviteCode }));
      } else if (view === 'login') {
        onSuccess(await authenticateAccount(email, password));
      } else if (step === 1) {
        setStep(2);
      } else {
        onSuccess(startDemoSession({ name, city }));
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível concluir o acesso.');
    } finally {
      setBusy(false);
    }
  };

  const title = view === 'register'
    ? 'Crie o espaço da sua confecção.'
    : view === 'join'
      ? 'Entre no espaço da sua empresa.'
      : view === 'login'
        ? 'Que bom ter você de volta.'
        : step === 1 ? 'Conheça a TRAMA por dentro.' : 'Vamos preparar sua demonstração.';
  const intro = view === 'register'
    ? 'Crie uma conta para começar a organizar as informações da sua empresa.'
    : view === 'join'
      ? 'Informe o código recebido da pessoa responsável pela organização.'
      : view === 'login'
        ? 'Acesse seu espaço de trabalho com os dados da sua conta.'
        : 'Explore os recursos com dados fictícios, sem precisar cadastrar informações reais.';

  return <div className="modal-backdrop auth-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <section className="modal auth-modal auth-modal-redesigned" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <aside className="auth-visual-panel">
        <div className="auth-brand"><span className="auth-brand-mark"><Scissors size={23} /></span><span>TRAMA<small>TECENDO RELAÇÕES NO MERCADO DO AGRESTE</small></span></div>
        <div className="auth-visual-copy"><span className="eyebrow">GESTÃO COM OS PÉS NO CHÃO</span><h2>Suas vendas contam histórias. <em>A TRAMA ajuda a entender.</em></h2><p>Organize informações, acompanhe resultados e tome decisões com mais clareza.</p></div>
        <div className="auth-benefits"><span><CheckCircle2 size={16} /> Indicadores fáceis de entender</span><span><CheckCircle2 size={16} /> Dados da sua própria confecção</span><span><CheckCircle2 size={16} /> Acesso por perfil de equipe</span></div>
        <small className="auth-visual-note">Plataforma demonstrativa para o setor têxtil do Agreste pernambucano.</small>
      </aside>

      <div className="auth-form-panel">
        <button type="button" className="auth-close" aria-label="Fechar" onClick={close}><X size={18} /></button>
        <span className="eyebrow">TRAMA / {view === 'demo' ? 'DEMONSTRAÇÃO' : 'ÁREA DA PLATAFORMA'}</span>
        <h2 id="auth-title">{title}</h2>
        <p className="auth-intro">{intro}</p>

        {view !== 'demo' && <div className="auth-switch auth-switch-three" role="group" aria-label="Tipo de acesso">
          <button type="button" className={view === 'login' ? 'selected' : ''} onClick={() => changeView('login')}>Entrar</button>
          <button type="button" className={view === 'register' ? 'selected' : ''} onClick={() => changeView('register')}>Criar conta</button>
          <button type="button" className={view === 'join' ? 'selected' : ''} onClick={() => changeView('join')}>Código da empresa</button>
        </div>}

        <form onSubmit={submit}>
          {view === 'register' && <>
            <label>Seu nome<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome completo" /></label>
            <label>Nome da confecção<input required value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Ex.: Confecção Boa Trama" /></label>
            <label>E-mail de acesso<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@empresa.com" /></label>
            <label>Cidade<select value={city} onChange={(event) => setCity(event.target.value)}>{cities.map((item) => <option key={item}>{item}</option>)}</select></label>
            <div className="auth-two-fields"><label>Senha<input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 8 caracteres" /></label><label>Confirmar senha<input required type="password" minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repita a senha" /></label></div>
          </>}

          {view === 'join' && <>
            <label>Código da organização<input required value={inviteCode} onChange={(event) => setInviteCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))} placeholder="Ex.: TR8M4ABC" autoCapitalize="characters" autoComplete="off" maxLength={8} /></label>
            <label>Seu nome<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome completo" /></label>
            <label>E-mail de acesso<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@empresa.com" /></label>
            <label>Crie uma senha<input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 8 caracteres" /></label>
            <div className="auth-info"><b>Como funciona:</b> com o código válido, sua conta será vinculada à organização como Funcionário. O responsável poderá ajustar seus acessos. Nesta versão, o convite funciona apenas no mesmo navegador em que a organização foi criada.</div>
          </>}

          {view === 'login' && <>
            <label>E-mail<input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@empresa.com" /></label>
            <label>Senha<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" /></label>
          </>}

          {view === 'demo' && (step === 1
            ? <label>Como podemos chamar você?<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" /></label>
            : <><label>Cidade<select value={city} onChange={(event) => setCity(event.target.value)}>{cities.map((item) => <option key={item}>{item}</option>)}</select></label><div className="auth-info"><b>Espaço demonstrativo:</b> Confecção Fio do Agreste. Os dados iniciais são fictícios e podem ser alterados sem afetar empresas reais.</div></>)}

          {error && <p className="auth-error" role="alert">{error}</p>}
          <div className="actions auth-actions">
            <button type="button" className="outline-button" onClick={close}>Cancelar</button>
            <button type="submit" disabled={busy}>{busy ? 'Aguarde…' : view === 'register' ? 'Criar conta' : view === 'join' ? 'Entrar na organização' : view === 'login' ? 'Entrar na TRAMA' : step === 1 ? 'Continuar' : 'Abrir demonstração'} <ArrowRight size={15} /></button>
          </div>
        </form>

        {view !== 'demo' && <p className="auth-footnote"><LockKeyhole size={12} /> {view === 'join' ? 'O código e a conta são validados no armazenamento local deste navegador. Convites entre dispositivos dependem do Back-end.' : 'Nesta versão local, a conta é armazenada neste navegador. O login de funcionários também funciona neste mesmo navegador. A sincronização entre dispositivos depende da API.'}</p>}
        {view === 'demo' && <button type="button" className="text-button auth-demo-switch" onClick={() => changeView('register')}>Prefiro criar uma conta</button>}
      </div>
    </section>
  </div>;
}
