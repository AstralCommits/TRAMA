import { useState, type FormEvent } from 'react';

type DemoEntryProps = {
  mode: string;
  close: () => void;
  start: (profile: string) => void;
};

export function DemoEntry({ mode, close, start }: DemoEntryProps) {
  const [profile, setProfile] = useState('Administrador');
  const [step, setStep] = useState(1);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 1) setStep(2);
    else start(profile);
  }

  return (
    <div className="modal-backdrop">
      <section className="modal" role="dialog" aria-modal="true" aria-label={mode}>
        <span className="eyebrow">TRAMA / DEMONSTRAÇÃO</span>
        <h2>{step === 1 ? mode : 'Seu primeiro ponto.'}</h2>
        <p>
          Não é um login real. Não informe senha ou dados pessoais. O perfil identifica apenas a experiência simulada; os dados continuam fictícios.
        </p>
        <form onSubmit={handleSubmit}>
          {step === 1 ? (
            <>
              <label>Como podemos chamar você? (apelido fictício)<input required placeholder="Ex.: pessoa artesã" /></label>
              <label>
                Selecione seu perfil simulado
                <select value={profile} onChange={(event) => setProfile(event.target.value)}>
                  <option>Administrador</option>
                  <option>Funcionário</option>
                  <option>Responsável por setor</option>
                  <option>Artesão</option>
                </select>
              </label>
            </>
          ) : (
            <>
              <label>Cidade<select defaultValue="Santa Cruz do Capibaribe"><option>Santa Cruz do Capibaribe</option><option>Toritama</option><option>Caruaru</option><option>Outra cidade do Agreste</option></select></label>
              <p>Vamos abrir uma área de demonstração com dados fictícios. Experimente os módulos e seus filtros.</p>
            </>
          )}
          <div className="actions">
            <button type="button" className="outline-button" onClick={close}>Cancelar</button>
            <button type="submit">{step === 1 ? 'Continuar' : 'Abrir demonstração'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
