import { useState, type FormEvent } from 'react';
import { Building2, Mail, MapPin, UserRound } from 'lucide-react';
import { updateAccountProfile, type TramaUser } from '@/lib/auth.client';

const cities = ['Santa Cruz do Capibaribe', 'Toritama', 'Caruaru', 'Outra cidade do Agreste'];

type Props = {
  user: TramaUser;
  onClose: () => void;
  onSaved: (user: TramaUser) => void;
};

export function ProfileDialog({ user, onClose, onSaved }: Props) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [company, setCompany] = useState(user.company);
  const [city, setCity] = useState(user.city);
  const [error, setError] = useState('');

  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'TR';

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      const updated = updateAccountProfile(user, { name, email, company, city });
      onSaved(updated);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível atualizar o perfil.');
    }
  };

  return (
    <div className="modal-backdrop profile-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div className="profile-modal-top">
          <div>
            <span className="eyebrow">TRAMA / MINHA CONTA</span>
            <h2 id="profile-title">Perfil do usuário</h2>
            <p>Atualize os dados pessoais e as informações da sua empresa.</p>
          </div>
          <div className="profile-large-avatar" aria-label={`Iniciais ${initials}`}>{initials}</div>
        </div>

        <div className="profile-account-strip">
          <span className="profile-status-dot" />
          <span><strong>{user.isDemo ? 'Conta de demonstração' : 'Conta local ativa'}</strong><small>{user.isDemo ? 'Dados de exemplo para explorar a plataforma' : 'Perfil salvo neste navegador'}</small></span>
        </div>

        <form onSubmit={submit} className="profile-form">
          <label><span><UserRound size={14} /> Nome completo</span><input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label><span><Mail size={14} /> E-mail de acesso</span><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label><span><Building2 size={14} /> Empresa / confecção</span><input required value={company} onChange={(event) => setCompany(event.target.value)} /></label>
          <label><span><MapPin size={14} /> Cidade</span><select value={city} onChange={(event) => setCity(event.target.value)}>{cities.map((item) => <option key={item}>{item}</option>)}</select></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <div className="actions profile-actions">
            <button type="button" className="outline-button" onClick={onClose}>Cancelar</button>
            <button type="submit">Salvar alterações</button>
          </div>
        </form>
        <p className="profile-footnote">Nesta versão, os dados da conta ficam armazenados localmente neste navegador. A sincronização entre dispositivos depende da integração com o servidor.</p>
      </section>
    </div>
  );
}
