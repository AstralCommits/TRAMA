import { useState, type FormEvent } from 'react';
import { CheckCircle2, ClipboardCheck, LoaderCircle, X } from 'lucide-react';
import { api, getApiErrorMessage } from '@/services/api';

type QuoteResponse = {
  protocolo?: string | number;
  protocol?: string | number;
  numeroProtocolo?: string | number;
  protocoloAtendimento?: string | number;
  numero_protocolo?: string | number;
  message?: string;
};

type QuoteForm = {
  responsavel: string;
  empresa: string;
  email: string;
  telefone: string;
  produto: string;
  quantidade: string;
  briefing: string;
};

const emptyForm: QuoteForm = {
  responsavel: '',
  empresa: '',
  email: '',
  telefone: '',
  produto: '',
  quantidade: '100',
  briefing: '',
};

export function QuoteModal({ onClose, initialProduct = '' }: { onClose: () => void; initialProduct?: string }) {
  const [form, setForm] = useState<QuoteForm>({ ...emptyForm, produto: initialProduct });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [protocol, setProtocol] = useState('');

  const update = (field: keyof QuoteForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const quantity = Number(form.quantidade);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError('Informe uma quantidade inteira maior que zero.');
      return;
    }

    setSending(true);
    try {
      const response = await api.post<QuoteResponse>('/api/cotacoes', {
        responsavel: form.responsavel.trim(),
        empresa: form.empresa.trim(),
        email: form.email.trim(),
        telefone: form.telefone.trim(),
        produto: form.produto.trim(),
        quantidade: quantity,
        briefing: form.briefing.trim(),
      });
      const returnedProtocol = response.data?.protocolo ?? response.data?.protocol ?? response.data?.numeroProtocolo ?? response.data?.protocoloAtendimento ?? response.data?.numero_protocolo;
      setProtocol(returnedProtocol == null ? '' : String(returnedProtocol));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-backdrop quote-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !sending) onClose();
    }}>
      <section className="modal wide quote-modal" role="dialog" aria-modal="true" aria-labelledby="quote-title">
        <button type="button" className="quote-close text-button" onClick={onClose} aria-label="Fechar formulário" disabled={sending}><X size={20} /></button>
        {protocol ? (
          <div className="quote-success" role="status">
            <CheckCircle2 size={42} />
            <span className="eyebrow">SOLICITAÇÃO REGISTRADA</span>
            <h2 id="quote-title">Recebemos seu pedido.</h2>
            <p>O orçamento foi enviado para nossa equipe. Guarde o protocolo abaixo para acompanhar o atendimento.</p>
            <div className="quote-protocol"><small>PROTOCOLO DE ATENDIMENTO</small><strong>{protocol}</strong></div>
            <div className="quote-summary">
              <span><b>Empresa:</b> {form.empresa}</span>
              <span><b>Produto:</b> {form.produto}</span>
              <span><b>Quantidade:</b> {Number(form.quantidade).toLocaleString('pt-BR')} unidades</span>
            </div>
            <button type="button" onClick={onClose}>Concluir</button>
          </div>
        ) : (
          <>
            <span className="eyebrow"><ClipboardCheck size={14} /> COMPRAS CORPORATIVAS</span>
            <h2 id="quote-title">Vamos conversar sobre seu pedido?</h2>
            <p>Conte um pouco sobre sua empresa e o que você precisa. Nossa equipe receberá sua solicitação de orçamento.</p>
            <form onSubmit={submit} className="quote-form">
              <div className="quote-fields">
                <label>Nome do responsável<input required autoComplete="name" value={form.responsavel} onChange={(event) => update('responsavel', event.target.value)} placeholder="Seu nome" /></label>
                <label>Empresa<input required autoComplete="organization" value={form.empresa} onChange={(event) => update('empresa', event.target.value)} placeholder="Nome da empresa" /></label>
                <label>E-mail<input required type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="voce@empresa.com" /></label>
                <label>Telefone<input required type="tel" autoComplete="tel" value={form.telefone} onChange={(event) => update('telefone', event.target.value)} placeholder="(00) 00000-0000" /></label>
                <label className="quote-field-wide">Produto ou tipo de produto<input required value={form.produto} onChange={(event) => update('produto', event.target.value)} placeholder="Ex.: peças de cerâmica personalizadas" /></label>
                <label>Quantidade<input required type="number" min="1" step="1" value={form.quantidade} onChange={(event) => update('quantidade', event.target.value)} /></label>
                <label className="quote-field-wide">Briefing da encomenda<textarea required rows={4} value={form.briefing} onChange={(event) => update('briefing', event.target.value)} placeholder="Descreva personalizações, prazo desejado, faixa de orçamento e outras necessidades." /></label>
              </div>
              {error && <p className="quote-error" role="alert">{error}</p>}
              <div className="actions">
                <button type="submit" disabled={sending}>{sending ? <><LoaderCircle className="quote-spinner" size={16} /> Enviando...</> : 'Enviar solicitação'}</button>
                <button type="button" className="outline-button" onClick={onClose} disabled={sending}>Cancelar</button>
              </div>
              <small className="quote-privacy">Seus dados serão utilizados para dar andamento a esta solicitação de orçamento.</small>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
