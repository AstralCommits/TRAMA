import { useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { formatCnpj, getCnpjValidationMessage, isValidCnpj, normalizeCnpj } from '@/lib/cnpj';
import { getApiErrorMessage } from '@/services/api';
import { cadastrarEmpresa, type CadastroEmpresaPayload } from '@/services/empresasService';

type Props = {
  onCancel?: () => void;
  onSuccess?: () => void;
};

type FormValues = {
  razaoSocial: string;
  nomeFantasia: string;
  emailCorporativo: string;
  telefone: string;
  cnpj: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  razaoSocial: '',
  nomeFantasia: '',
  emailCorporativo: '',
  telefone: '',
  cnpj: '',
};

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (values.razaoSocial.trim().length < 2) errors.razaoSocial = 'Informe a razão social.';
  if (values.nomeFantasia.trim().length < 2) errors.nomeFantasia = 'Informe o nome fantasia.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.emailCorporativo.trim())) {
    errors.emailCorporativo = 'Informe um e-mail corporativo válido.';
  }
  const phoneDigits = values.telefone.replace(/\D/g, '');
  if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
    errors.telefone = 'Informe um telefone com DDD e 8 ou 9 dígitos.';
  }
  if (!isValidCnpj(values.cnpj)) {
    errors.cnpj = getCnpjValidationMessage(values.cnpj) ?? 'Informe um CNPJ válido.';
  }
  return errors;
}

export function CadastroEmpresaComponent({ onCancel, onSuccess }: Props) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const errors = useMemo(() => validate(values), [values]);
  const normalizedCnpj = normalizeCnpj(values.cnpj);
  const cnpjIsComplete = normalizedCnpj.length === 14;
  const cnpjIsInvalid = cnpjIsComplete && !isValidCnpj(values.cnpj);
  const canSubmit = Object.keys(errors).length === 0 && !submitting;

  const updateField = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFeedback(null);
  };

  const showError = (field: keyof FormValues) => touched[field] || (field === 'cnpj' && cnpjIsComplete);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ razaoSocial: true, nomeFantasia: true, emailCorporativo: true, telefone: true, cnpj: true });
    if (!canSubmit) return;

    setSubmitting(true);
    setFeedback(null);
    const payload: CadastroEmpresaPayload = {
      razaoSocial: values.razaoSocial.trim(),
      nomeFantasia: values.nomeFantasia.trim(),
      emailCorporativo: values.emailCorporativo.trim().toLowerCase(),
      telefone: values.telefone.replace(/\D/g, ''),
      cnpj: normalizedCnpj,
    };

    try {
      await cadastrarEmpresa(payload);
      setFeedback({ type: 'success', message: 'Empresa cadastrada com sucesso.' });
      setValues(initialValues);
      setTouched({});
      onSuccess?.();
    } catch (error) {
      setFeedback({ type: 'error', message: getApiErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (invalid: boolean) => [
    'mt-1 block w-full rounded-md border bg-white px-3 py-2.5 text-sm text-stone-900 shadow-sm outline-none transition',
    'placeholder:text-stone-400 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20',
    invalid ? 'border-red-500 focus:border-red-600 focus:ring-red-500/20' : 'border-stone-300',
  ].join(' ');

  return (
    <section className="w-full rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="cadastro-empresa-title">
      <div className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">Cadastro corporativo / US02</span>
        <h2 id="cadastro-empresa-title" className="mt-2 text-2xl font-semibold text-stone-900">Dados da empresa</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">Preencha as informações para cadastrar sua empresa como cliente ou compradora corporativa.</p>
      </div>

      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`mb-5 rounded-md border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}
        >
          {feedback.type === 'success' && <CheckCircle2 className="mr-2 inline-block h-4 w-4" aria-hidden="true" />}
          {feedback.message}
        </div>
      )}

      <form className="space-y-4" onSubmit={submit} noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-stone-700 sm:col-span-2">
            Razão Social
            <input
              autoComplete="organization"
              className={inputClass(Boolean(showError('razaoSocial') && errors.razaoSocial))}
              value={values.razaoSocial}
              onBlur={() => setTouched((current) => ({ ...current, razaoSocial: true }))}
              onChange={(event) => updateField('razaoSocial', event.target.value)}
              aria-invalid={Boolean(showError('razaoSocial') && errors.razaoSocial)}
              aria-describedby={showError('razaoSocial') && errors.razaoSocial ? 'razao-social-error' : undefined}
              placeholder="Ex.: Confecções do Agreste Ltda."
              required
            />
            {showError('razaoSocial') && errors.razaoSocial && <span id="razao-social-error" className="mt-1 block text-xs text-red-700">{errors.razaoSocial}</span>}
          </label>

          <label className="block text-sm font-medium text-stone-700 sm:col-span-2">
            Nome Fantasia
            <input
              autoComplete="organization-title"
              className={inputClass(Boolean(showError('nomeFantasia') && errors.nomeFantasia))}
              value={values.nomeFantasia}
              onBlur={() => setTouched((current) => ({ ...current, nomeFantasia: true }))}
              onChange={(event) => updateField('nomeFantasia', event.target.value)}
              aria-invalid={Boolean(showError('nomeFantasia') && errors.nomeFantasia)}
              aria-describedby={showError('nomeFantasia') && errors.nomeFantasia ? 'nome-fantasia-error' : undefined}
              placeholder="Ex.: Moda Fio a Fio"
              required
            />
            {showError('nomeFantasia') && errors.nomeFantasia && <span id="nome-fantasia-error" className="mt-1 block text-xs text-red-700">{errors.nomeFantasia}</span>}
          </label>

          <label className="block text-sm font-medium text-stone-700 sm:col-span-2">
            E-mail Corporativo
            <input
              autoComplete="email"
              className={inputClass(Boolean(showError('emailCorporativo') && errors.emailCorporativo))}
              value={values.emailCorporativo}
              onBlur={() => setTouched((current) => ({ ...current, emailCorporativo: true }))}
              onChange={(event) => updateField('emailCorporativo', event.target.value)}
              aria-invalid={Boolean(showError('emailCorporativo') && errors.emailCorporativo)}
              aria-describedby={showError('emailCorporativo') && errors.emailCorporativo ? 'email-error' : undefined}
              placeholder="compras@empresa.com.br"
              type="email"
              required
            />
            {showError('emailCorporativo') && errors.emailCorporativo && <span id="email-error" className="mt-1 block text-xs text-red-700">{errors.emailCorporativo}</span>}
          </label>

          <label className="block text-sm font-medium text-stone-700">
            Telefone
            <input
              autoComplete="tel"
              className={inputClass(Boolean(showError('telefone') && errors.telefone))}
              inputMode="tel"
              value={values.telefone}
              onBlur={() => setTouched((current) => ({ ...current, telefone: true }))}
              onChange={(event) => updateField('telefone', formatPhone(event.target.value))}
              aria-invalid={Boolean(showError('telefone') && errors.telefone)}
              aria-describedby={showError('telefone') && errors.telefone ? 'telefone-error' : undefined}
              placeholder="(00) 00000-0000"
              required
            />
            {showError('telefone') && errors.telefone && <span id="telefone-error" className="mt-1 block text-xs text-red-700">{errors.telefone}</span>}
          </label>

          <label className="block text-sm font-medium text-stone-700">
            CNPJ
            <input
              autoComplete="off"
              className={inputClass(Boolean(showError('cnpj') && errors.cnpj))}
              inputMode="text"
              maxLength={18}
              value={values.cnpj}
              onBlur={() => setTouched((current) => ({ ...current, cnpj: true }))}
              onChange={(event) => updateField('cnpj', formatCnpj(event.target.value))}
              aria-invalid={Boolean(showError('cnpj') && errors.cnpj)}
              aria-describedby={showError('cnpj') && errors.cnpj ? 'cnpj-error' : 'cnpj-help'}
              placeholder="00.000.000/0000-00"
              autoCapitalize="characters"
              spellCheck={false}
              required
            />
            {showError('cnpj') && errors.cnpj ? (
              <span id="cnpj-error" className="mt-1 block text-xs font-medium text-red-700" role="alert">{errors.cnpj}</span>
            ) : (
              <span id="cnpj-help" className="mt-1 block text-xs text-stone-500">Aceita CNPJ numérico ou alfanumérico.</span>
            )}
            {cnpjIsInvalid && <span className="sr-only">O botão de cadastro está desabilitado porque o CNPJ é inválido.</span>}
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end">
          {onCancel && (
            <button type="button" onClick={onCancel} className="rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50">
              Voltar
            </button>
          )}
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
          >
            {submitting && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {submitting ? 'Enviando cadastro…' : 'Cadastrar empresa'}
          </button>
        </div>
      </form>
    </section>
  );
}
