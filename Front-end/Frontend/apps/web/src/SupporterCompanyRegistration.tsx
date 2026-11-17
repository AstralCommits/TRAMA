import { useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, Building2, CheckCircle2, Search, ShieldCheck } from 'lucide-react';
import {
  formatCnpj,
  isValidCnpj,
  normalizeCnpj,
} from '../utils/cnpj';
import {
  lookupCompanyByCnpj,
  registerSupporterCompany,
} from '../services/supporterCompaniesApi';

type Feedback = { tone: 'success' | 'info' | 'error'; message: string } | null;

export function SupporterCompanyRegistration() {
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cnpjTouched, setCnpjTouched] = useState(false);
  const [razaoSocialTouched, setRazaoSocialTouched] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const cnpjInputRef = useRef<HTMLInputElement>(null);
  const razaoSocialInputRef = useRef<HTMLInputElement>(null);

  const normalizedCnpj = normalizeCnpj(cnpj);
  const cnpjIsValid = isValidCnpj(normalizedCnpj);
  const razaoSocialError = razaoSocialTouched && !razaoSocial.trim()
    ? 'Informe a Razão Social da empresa.'
    : '';
  const cnpjError = cnpjTouched
    ? !normalizedCnpj
      ? 'Informe o CNPJ da empresa.'
      : !cnpjIsValid
        ? 'CNPJ inválido. Confira os 14 caracteres e os dígitos verificadores.'
        : ''
    : '';

  function handleCnpjChange(value: string) {
    setCnpj(formatCnpj(value));
    setFeedback(null);
  }

  async function handleLookup() {
    setCnpjTouched(true);
    setFeedback(null);

    if (!cnpjIsValid) {
      cnpjInputRef.current?.focus();
      return;
    }

    const requestedCnpj = normalizedCnpj;
    setIsLookingUp(true);
    try {
      const company = await lookupCompanyByCnpj(requestedCnpj);
      if (normalizeCnpj(cnpj) !== requestedCnpj) return;

      if (company.razao_social?.trim()) {
        setRazaoSocial(company.razao_social.trim());
        setFeedback({
          tone: 'success',
          message: 'Razão Social preenchida com os dados retornados pela BrasilAPI. Confira antes de continuar.',
        });
      } else {
        setFeedback({ tone: 'info', message: 'A consulta foi concluída, mas não retornou uma Razão Social.' });
      }
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível consultar a BrasilAPI.',
      });
    } finally {
      setIsLookingUp(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCnpjTouched(true);
    setRazaoSocialTouched(true);
    setFeedback(null);

    if (!razaoSocial.trim()) {
      razaoSocialInputRef.current?.focus();
      return;
    }
    if (!cnpjIsValid) {
      cnpjInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerSupporterCompany({
        razaoSocial: razaoSocial.trim(),
        cnpj: normalizedCnpj,
      });

      setFeedback(result.submitted
        ? { tone: 'success', message: 'Cadastro enviado com sucesso. A empresa foi registrada para análise.' }
        : {
            tone: 'info',
            message: 'CNPJ e Razão Social validados. O envio ainda não foi realizado: configure VITE_SUPPORTER_COMPANY_API_PATH após definir o endpoint com o backend.',
          });
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível enviar o cadastro.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="supporter-page">
      <header className="supporter-topbar">
        <a href="/" className="supporter-back-link"><ArrowLeft size={17} /> Voltar para a TRAMA</a>
        <a href="/" className="supporter-brand" aria-label="TRAMA — início">
          <img src="/images/trama-logo.png" alt="TRAMA" />
        </a>
      </header>

      <section className="supporter-layout">
        <div className="supporter-intro">
          <span className="eyebrow">TRAMA / REDE DE APOIO</span>
          <h1>Empresas que fortalecem o fazer local.</h1>
          <p>
            Cadastre sua empresa para iniciar uma parceria com a rede de artesãos e produtores
            do Agreste pernambucano.
          </p>
          <div className="supporter-trust-note">
            <ShieldCheck size={20} />
            <span>Os dados empresariais são usados para identificar e validar a organização apoiadora.</span>
          </div>
        </div>

        <section className="supporter-form-card" aria-labelledby="supporter-form-title">
          <div className="supporter-form-heading">
            <span className="supporter-icon"><Building2 size={22} /></span>
            <div>
              <span className="eyebrow">CADASTRO CORPORATIVO</span>
              <h2 id="supporter-form-title">Dados da empresa</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="supporter-legal-name">Razão Social</label>
            <input
              ref={razaoSocialInputRef}
              id="supporter-legal-name"
              name="razaoSocial"
              autoComplete="organization"
              required
              value={razaoSocial}
              onChange={(event) => {
                setRazaoSocial(event.target.value);
                setFeedback(null);
              }}
              onBlur={() => setRazaoSocialTouched(true)}
              placeholder="Nome empresarial conforme registro"
              maxLength={180}
              aria-invalid={Boolean(razaoSocialError)}
              aria-describedby={razaoSocialError ? 'supporter-legal-name-error' : undefined}
              className={razaoSocialError ? 'has-error' : ''}
            />
            {razaoSocialError && (
              <p id="supporter-legal-name-error" className="supporter-field-error" role="alert">
                {razaoSocialError}
              </p>
            )}

            <div className="supporter-cnpj-label-row">
              <label htmlFor="supporter-cnpj">CNPJ</label>
              <span>14 caracteres</span>
            </div>
            <input
              ref={cnpjInputRef}
              id="supporter-cnpj"
              name="cnpj"
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              required
              value={cnpj}
              onChange={(event) => handleCnpjChange(event.target.value)}
              onBlur={() => setCnpjTouched(true)}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              aria-invalid={Boolean(cnpjError)}
              aria-describedby={cnpjError ? 'supporter-cnpj-error' : 'supporter-cnpj-help'}
              className={cnpjError ? 'has-error' : ''}
            />
            {cnpjError
              ? <p id="supporter-cnpj-error" className="supporter-field-error" role="alert">{cnpjError}</p>
              : <p id="supporter-cnpj-help" className="supporter-field-help">Aceita CNPJ numérico e o novo formato alfanumérico.</p>}

            <button
              type="button"
              className="supporter-lookup-button"
              onClick={handleLookup}
              disabled={isLookingUp || !cnpjIsValid}
            >
              <Search size={16} />
              {isLookingUp ? 'Consultando BrasilAPI…' : 'Consultar CNPJ e preencher Razão Social'}
            </button>

            {feedback && (
              <div className={`supporter-feedback is-${feedback.tone}`} role={feedback.tone === 'error' ? 'alert' : 'status'}>
                {feedback.tone === 'success' && <CheckCircle2 size={17} />}
                <span>{feedback.message}</span>
              </div>
            )}

            <button className="supporter-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando cadastro…' : 'Validar e enviar cadastro'}
            </button>
          </form>

          <p className="supporter-privacy-note">
            A validação dos dígitos verificadores é feita no navegador. A consulta à BrasilAPI é opcional
            e não substitui a validação local.
          </p>
        </section>
      </section>
    </main>
  );
}
