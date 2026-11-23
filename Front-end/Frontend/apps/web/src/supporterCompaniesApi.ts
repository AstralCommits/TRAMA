import { api, getApiErrorMessage } from '@/services/api';

export type SupporterCompanyPayload = {
  razaoSocial: string;
  cnpj: string;
};

export type SupporterRegistrationResult =
  | { submitted: true }
  | { submitted: false; reason: 'endpoint-not-configured' };

/**
 * O endpoint deve ser definido pelo backend responsável pelo cadastro US02.
 * Não se presume uma rota REST que ainda não foi acordada entre as equipes.
 */
export async function registerSupporterCompany(
  payload: SupporterCompanyPayload,
): Promise<SupporterRegistrationResult> {
  const endpoint = import.meta.env.VITE_SUPPORTER_COMPANY_API_PATH?.trim();
  if (!endpoint) {
    return { submitted: false, reason: 'endpoint-not-configured' };
  }

  try {
    await api.post(endpoint, payload);
    return { submitted: true };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export type BrasilApiCompany = {
  razao_social?: string;
  nome_fantasia?: string;
  descricao_situacao_cadastral?: string;
};

/** Consulta opcional à BrasilAPI. A validação matemática continua local e obrigatória. */
export async function lookupCompanyByCnpj(cnpj: string): Promise<BrasilApiCompany> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(
      `https://brasilapi.com.br/api/cnpj/v1/${encodeURIComponent(cnpj)}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      if (response.status === 404 || response.status === 400) {
        throw new Error('A BrasilAPI não encontrou uma empresa para este CNPJ.');
      }
      throw new Error('A consulta externa está indisponível no momento. Tente novamente.');
    }

    return (await response.json()) as BrasilApiCompany;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('A consulta à BrasilAPI excedeu o tempo limite.');
    }
    throw error instanceof Error
      ? error
      : new Error('Não foi possível consultar este CNPJ na BrasilAPI.');
  } finally {
    window.clearTimeout(timeoutId);
  }
}
