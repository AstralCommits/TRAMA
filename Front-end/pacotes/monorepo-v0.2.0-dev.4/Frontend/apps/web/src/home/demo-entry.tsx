import { useState, type FormEvent } from 'react';
import { useDialogAccessibility } from '@/hooks/use-dialog-accessibility';
import {
  authenticateAccount,
  acceptTeamInvite,
  registerAccount,
  startDemoSession,
  type TramaUser,
} from '@/lib/auth.client';

type Props = {
  mode: string;
  close: () => void;
  onSuccess: (user: TramaUser) => void;
};

const cities = ['Santa Cruz do Capibaribe', 'Toritama', 'Caruaru'];

function passwordFitsBcryptLimit(value: string) {
  return new TextEncoder().encode(value).length <= 72;
}

export function DemoEntry({ mode, close, onSuccess }: Props) {
  const initialView = mode === 'Cadastrar-se' ? 'register' : mode === 'Entrar na demonstração' ? 'demo' : 'login';
  const [view, setView] = useState<'login' | 'register' | 'demo' | 'invite'>(initialView);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [company, setCompany] = useState('');
  const [city, setCity] = useState('Santa Cruz do Capibaribe');
  const [role, setRole] = useState('Administrador');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const dialogRef = useDialogAccessibility<HTMLElement>(true, close, { closeOnEscape: !busy });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if ((view === 'invite' || view === 'register' || view === 'login') && !passwordFitsBcryptLimit(password)) {
        throw new Error('A senha deve ocupar no máximo 72 bytes em UTF-8.');
      }
      if (view === 'invite') {
        const user = await acceptTeamInvite({ name, password, token: inviteToken });
        onSuccess(user);
      } else if (view === 'register') {
        if (password !== confirmPassword) throw new Error('As senhas não conferem.');
        const user = await registerAccount({ name, email, password, company, city });
        onSuccess(user);
      } else if (view === 'login') {
        const user = await authenticateAccount(email, password);
        onSuccess(user);
      } else if (step === 1) {
        setStep(2);
      } else {
        onSuccess(startDemoSession({ name, role, city }));
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível concluir o acesso.');
    } finally {
      setBusy(false);
    }
  };

  const title = view === 'register'
    ? 'Crie sua conta na TRAMA.'
    : view === 'invite'
      ? 'Aceite seu convite para a equipe.'
      : view === 'login'
      ? 'Bem-vindo de volta.'
      : step === 1 ? 'Vamos começar pela sua rotina.' : 'Configure seu espaço de trabalho.';

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) close(); }}>
      <section ref={dialogRef} tabIndex={-1} className="modal auth-modal" role="dialog" aria-modal="true" aria-labelledby="entry-dialog-title">
        <span className="eyebrow">TRAMA / {view === 'demo' ? 'DEMONSTRAÇÃO' : 'ÁREA DA PLATAFORMA'}</span>
        <h2 id="entry-dialog-title">{title}</h2>
        {view === 'register' && <p>Cadastre sua empresa para acessar a área de gestão. Seus dados de conta e lançamentos serão enviados ao servidor.</p>}
        {view === 'login' && <p>Entre com o e-mail e a senha cadastrados na TRAMA.</p>}
        {view === 'invite' && <p>Use o token recebido do responsável pela confecção. O convite é individual, expira em 72 horas e só pode ser usado uma vez.</p>}
        {view === 'demo' && <p>Experimente todos os módulos com uma confecção e dados demonstrativos, sem usar informações comerciais reais.</p>}

        {(view === 'login' || view === 'register') && (
          <div className="auth-switch" role="group" aria-label="Tipo de acesso">
            <button type="button" className={view === 'login' ? 'selected' : 'outline-button'} onClick={() => { setView('login'); setError(''); }}>Entrar</button>
            <button type="button" className={view === 'register' ? 'selected' : 'outline-button'} onClick={() => { setView('register'); setError(''); }}>Criar conta</button>
          </div>
        )}

        <form onSubmit={submit}>
          {view === 'register' && <>
            <label>Seu nome<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome completo" /></label>
            <label>Nome da confecção / empresa<input required value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Ex.: Confecção Boa Trama" /></label>
            <label>E-mail<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@empresa.com" /></label>
            <label>Cidade<select value={city} onChange={(event) => setCity(event.target.value)}>{cities.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Senha (8 a 72 bytes em UTF-8)<input required type="password" minLength={8} maxLength={72} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" /></label>
            <label>Confirme sua senha<input required type="password" minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Digite a senha novamente" /></label>
          </>}

          {view === 'invite' && <>
            <label>Seu nome<input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome completo" /></label>
            <label>Token do convite<input required value={inviteToken} onChange={(event) => setInviteToken(event.target.value)} placeholder="Cole o token recebido" /></label>
            <label>Crie sua senha<input required type="password" minLength={8} maxLength={72} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" /></label>
          </>}

          {view === 'login' && <>
            <label>E-mail<input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@empresa.com" /></label>
            <label>Senha<input required type="password" maxLength={72} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" /></label>
          </>}

          {view === 'demo' && (step === 1 ? <>
            <label>Como podemos chamar você?<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Maria da confecção" /></label>
            <label>Perfil de demonstração<select value={role} onChange={(event) => setRole(event.target.value)}><option>Administrador</option><option>Funcionário</option><option>Responsável por setor</option></select></label>
          </> : <>
            <label>Cidade<select value={city} onChange={(event) => setCity(event.target.value)}>{cities.map((item) => <option key={item}>{item}</option>)}</select></label>
            <div className="auth-info"><b>Espaço demonstrativo:</b> Confecção Fio do Agreste. Você poderá testar lançamentos mensais de vendas, indicadores, tendências por categoria, comparação de produtos, cenários hipotéticos e relatórios.</div>
          </>)}

          {error && <p className="auth-error" role="alert">{error}</p>}
          <div className="actions">
            <button type="button" className="outline-button" onClick={close}>Cancelar</button>
            <button type="submit" disabled={busy}>{busy ? 'Aguarde…' : view === 'invite' ? 'Aceitar convite e entrar' : view === 'register' ? 'Criar conta e entrar' : view === 'login' ? 'Entrar na TRAMA' : step === 1 ? 'Continuar' : 'Abrir área de gestão'}</button>
          </div>
        </form>

        {view === 'login' && <button type="button" className="text-button auth-demo-switch" onClick={() => { setView('invite'); setError(''); }}>Tenho um convite da equipe</button>}
        {view === 'invite' && <button type="button" className="text-button auth-demo-switch" onClick={() => { setView('login'); setError(''); }}>Voltar ao login</button>}
        {(view === 'login' || view === 'register') && <p className="auth-footnote">O acesso de contas reais utiliza autenticação do Back-end. A demonstração continua isolada e usa dados fictícios armazenados neste navegador.</p>}
        {view === 'demo' && <button type="button" className="text-button auth-demo-switch" onClick={() => { setView('register'); setStep(1); setError(''); }}>Prefiro cadastrar minha empresa</button>}
      </section>
    </div>
  );
}
