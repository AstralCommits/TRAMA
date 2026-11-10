import { useState, type FormEvent } from 'react';
import {
  authenticateAccount,
  registerAccount,
  startDemoSession,
  type TramaUser,
} from '@/lib/auth.client';

type Props = {
  mode: string;
  close: () => void;
  onSuccess: (user: TramaUser) => void;
};

const cities = ['Santa Cruz do Capibaribe', 'Toritama', 'Caruaru', 'Outra cidade do Agreste'];

export function DemoEntry({ mode, close, onSuccess }: Props) {
  const initialView = mode === 'Cadastrar-se' ? 'register' : mode === 'Entrar na demonstração' ? 'demo' : 'login';
  const [view, setView] = useState<'login' | 'register' | 'demo'>(initialView);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [company, setCompany] = useState('');
  const [city, setCity] = useState('Santa Cruz do Capibaribe');
  const [role, setRole] = useState('Administrador');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (view === 'register') {
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
    : view === 'login'
      ? 'Bem-vindo de volta.'
      : step === 1 ? 'Vamos começar pela sua rotina.' : 'Configure seu espaço de trabalho.';

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section className="modal auth-modal" role="dialog" aria-modal="true" aria-label="Acesso à TRAMA">
        <span className="eyebrow">TRAMA / {view === 'demo' ? 'DEMONSTRAÇÃO' : 'ÁREA DA PLATAFORMA'}</span>
        <h2>{title}</h2>
        {view === 'register' && <p>Cadastre sua empresa para entrar na área de gestão. Seus registros ficarão salvos neste navegador.</p>}
        {view === 'login' && <p>Entre com o e-mail e a senha que você cadastrou neste navegador.</p>}
        {view === 'demo' && <p>Experimente todos os módulos com uma confecção e dados demonstrativos, sem usar informações comerciais reais.</p>}

        {view !== 'demo' && (
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
            <label>Senha<input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" /></label>
            <label>Confirme sua senha<input required type="password" minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Digite a senha novamente" /></label>
          </>}

          {view === 'login' && <>
            <label>E-mail<input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@empresa.com" /></label>
            <label>Senha<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" /></label>
          </>}

          {view === 'demo' && (step === 1 ? <>
            <label>Como podemos chamar você?<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Maria da confecção" /></label>
            <label>Perfil de demonstração<select value={role} onChange={(event) => setRole(event.target.value)}><option>Administrador</option><option>Funcionário</option><option>Responsável por setor</option></select></label>
          </> : <>
            <label>Cidade<select value={city} onChange={(event) => setCity(event.target.value)}>{cities.map((item) => <option key={item}>{item}</option>)}</select></label>
            <div className="auth-info"><b>Espaço demonstrativo:</b> Confecção Fio do Agreste. Você poderá testar vendas, estoque, produção, financeiro, indicadores, tendências, cadastros e simulações.</div>
          </>)}

          {error && <p className="auth-error" role="alert">{error}</p>}
          <div className="actions">
            <button type="button" className="outline-button" onClick={close}>Cancelar</button>
            <button type="submit" disabled={busy}>{busy ? 'Aguarde…' : view === 'register' ? 'Criar conta e entrar' : view === 'login' ? 'Entrar na TRAMA' : step === 1 ? 'Continuar' : 'Abrir área de gestão'}</button>
          </div>
        </form>

        {view !== 'demo' && <p className="auth-footnote">A conta desta versão é armazenada localmente neste navegador. Para usar entre dispositivos e em produção, será necessária uma API de autenticação.</p>}
        {view === 'demo' && <button type="button" className="text-button auth-demo-switch" onClick={() => { setView('register'); setStep(1); setError(''); }}>Prefiro cadastrar minha empresa</button>}
      </section>
    </div>
  );
}
