import { useState, type FormEvent } from 'react';
import {
  authenticateAccount,
  startDemoSession,
  type TramaUser,
} from '@/lib/auth.client';
import { isApiConfigured } from '@/services/api';

type Props = {
  mode: string;
  close: () => void;
  onSuccess: (user: TramaUser) => void;
};

const cities = ['Santa Cruz do Capibaribe', 'Toritama', 'Caruaru', 'Outra cidade do Agreste'];

export function DemoEntry({ mode, close, onSuccess }: Props) {
  const initialView = mode === 'Entrar na demonstração' ? 'demo' : 'login';
  const [view, setView] = useState<'login' | 'demo'>(initialView);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Santa Cruz do Capibaribe');
  const [role, setRole] = useState('Administrador');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (view === 'login') {
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

  const title = view === 'login'
    ? 'Bem-vindo de volta.'
    : step === 1 ? 'Vamos começar pela sua rotina.' : 'Configure seu espaço de trabalho.';

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section className="modal auth-modal" role="dialog" aria-modal="true" aria-label="Acesso à TRAMA">
        <span className="eyebrow">TRAMA / {view === 'demo' ? 'DEMONSTRAÇÃO' : 'ÁREA DA PLATAFORMA'}</span>
        <h2>{title}</h2>
        {view === 'login' && <p>{isApiConfigured() ? 'Entre com o usuário cadastrado no TRAMA.' : 'O login precisa da API do TRAMA. Enquanto isso, use a demonstração.'}</p>}
        {view === 'demo' && <p>Experimente todos os módulos com uma confecção e dados demonstrativos, sem usar informações comerciais reais.</p>}

        <form onSubmit={submit}>
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
            <button type="submit" disabled={busy}>{busy ? 'Aguarde…' : view === 'login' ? 'Entrar na TRAMA' : step === 1 ? 'Continuar' : 'Abrir área de gestão'}</button>
          </div>
        </form>

        {view === 'login' && <p className="auth-footnote">Ainda não tem acesso? O administrador do TRAMA cria o usuário da sua confecção.</p>}
        {view === 'login' && <button type="button" className="text-button auth-demo-switch" onClick={() => { setView('demo'); setStep(1); setError(''); }}>Conhecer a demonstração</button>}
        {view === 'demo' && <button type="button" className="text-button auth-demo-switch" onClick={() => { setView('login'); setStep(1); setError(''); }}>Já tenho acesso ao TRAMA</button>}
      </section>
    </div>
  );
}
