import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import { total } from '@/data/demo';
import { getApiToken, hasValidApiToken, readApiClaims, SESSION_EXPIRED_EVENT, setApiToken } from '@/services/apiToken';
import { authenticateAccount, getSession, saveSession, type TramaUser } from '@/services/auth.client';
import { api, getApiErrorMessage } from '@/services/api';
import { importCsv } from '@/services/importacoesService';
import { createVenda, toSale, updateVenda } from '@/services/vendasService';
import type { Confeccao, Venda } from '@/types/api';

function fakeStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() { return data.size; },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => Array.from(data.keys())[index] ?? null,
    removeItem: (key) => { data.delete(key); },
    setItem: (key, value) => { data.set(key, String(value)); },
  };
}

function token(claims: Record<string, unknown>) {
  const part = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${part({ alg: 'HS256' })}.${part(claims)}.assinatura`;
}

function respond(handler: (config: InternalAxiosRequestConfig) => { status?: number; data: unknown }): AxiosAdapter {
  return async (config) => {
    const { status = 200, data } = handler(config);
    const response = { data, status, statusText: '', headers: {}, config };
    if (status >= 400) throw Object.assign(new Error(String(status)), { isAxiosError: true, config, response });
    return response;
  };
}

const future = Math.floor(Date.now() / 1000) + 3600;
const past = Math.floor(Date.now() / 1000) - 3600;
const originalAdapter = api.defaults.adapter;
let events: string[];

const venda: Venda = {
  idLancamento: 7, mesAno: '2026-03', quantidade: 3, faturamento: 100, origem: 'IMPORTACAO', origemDado: 'ENTREVISTA',
  nomeFonte: 'Coleta', status: 'ATIVO', idConfeccao: 2, confeccao: 'Estilo Agreste', idCategoria: 1, categoria: 'Moda Feminina',
};
const confeccao: Confeccao = { idConfeccao: 2, nome: 'Estilo Agreste', porte: 'PEQUENA', tipo: 'CONFECCAO', cidade: 'Caruaru', uf: 'PE' };
const apiUser: TramaUser = {
  id: 'api-ana@x.com', name: 'Ana', email: 'ana@x.com', company: 'Estilo Agreste', city: 'Caruaru',
  role: 'Empresário', isDemo: false, createdAt: '2026-11-24', source: 'api',
};

beforeEach(() => {
  events = [];
  import.meta.env.VITE_API_URL = 'http://api.test';
  (globalThis as { window?: unknown }).window = {
    sessionStorage: fakeStorage(),
    localStorage: fakeStorage(),
    dispatchEvent: (event: Event) => { events.push(event.type); return true; },
  };
});

afterEach(() => {
  api.defaults.adapter = originalAdapter;
  delete (globalThis as { window?: unknown }).window;
});

describe('token e sessão', () => {
  it('lê perfil e confecção do token, inclusive com acentos', () => {
    setApiToken(token({ sub: 'joão@x.com', perfil: 'EMPRESARIO', idConfeccao: 2, exp: future }));
    expect(readApiClaims()).toMatchObject({ sub: 'joão@x.com', perfil: 'EMPRESARIO', idConfeccao: 2 });
    expect(hasValidApiToken()).toBe(true);
  });

  it('recusa token vencido ou ilegível', () => {
    setApiToken(token({ sub: 'a@x.com', perfil: 'ADMIN', exp: past }));
    expect(hasValidApiToken()).toBe(false);
    setApiToken('abc.def.ghi');
    expect(readApiClaims()).toBeNull();
  });

  it('encerra a sessão da API quando o token não vale mais', () => {
    saveSession(apiUser);
    setApiToken(token({ sub: 'ana@x.com', perfil: 'EMPRESARIO', exp: future }));
    expect(getSession()?.email).toBe('ana@x.com');
    setApiToken(token({ sub: 'ana@x.com', perfil: 'EMPRESARIO', exp: past }));
    expect(getSession()).toBeNull();
    expect(getApiToken()).toBeNull();
  });

  it('mantém a sessão local sem token', () => {
    saveSession({ ...apiUser, id: 'local-1', source: undefined });
    expect(getSession()?.id).toBe('local-1');
  });

  it('avisa a página quando a API responde 401', async () => {
    api.defaults.adapter = respond(() => ({ status: 401, data: {} }));
    await expect(api.get('/api/vendas')).rejects.toThrow();
    expect(events).toEqual([SESSION_EXPIRED_EVENT]);
  });
});

describe('login pela API', () => {
  it('ADMIN entra como Administrador com o nome vindo da API', async () => {
    api.defaults.adapter = respond((config) => config.url === '/api/auth/login'
      ? { data: { token: token({ sub: 'admin@x.com', perfil: 'ADMIN', exp: future }) } }
      : { data: { idUsuario: 1, nome: 'Admin Geral', email: 'admin@x.com', perfil: 'ADMIN', confeccao: null } });
    expect(await authenticateAccount('Admin@x.com', 's')).toMatchObject({ role: 'Administrador', source: 'api', name: 'Admin Geral', id: 'api-1' });
  });

  it('EMPRESARIO entra com a confecção informada pela API', async () => {
    const urls: string[] = [];
    api.defaults.adapter = respond((config) => {
      urls.push(String(config.url));
      return config.url === '/api/auth/login'
        ? { data: { token: token({ sub: 'ana@x.com', perfil: 'EMPRESARIO', idConfeccao: 2, exp: future }) } }
        : { data: { idUsuario: 5, nome: 'Ana', email: 'ana@x.com', perfil: 'EMPRESARIO', confeccao: { idConfeccao: 2, nome: 'Estilo Agreste', cidade: 'Caruaru', uf: 'PE' } } };
    });
    expect(await authenticateAccount('ana@x.com', 's')).toMatchObject({ role: 'Empresário', company: 'Estilo Agreste', city: 'Caruaru' });
    expect(urls).toEqual(['/api/auth/login', '/api/auth/me']);
  });

  it('mostra a mensagem da API quando o login é bloqueado', async () => {
    api.defaults.adapter = respond(() => ({ status: 429, data: { detail: 'Muitas tentativas de login sem sucesso.' } }));
    await expect(authenticateAccount('ana@x.com', 'x')).rejects.toThrow('Muitas tentativas de login sem sucesso.');
    expect(getApiToken()).toBeNull();
  });

  it('sem a API configurada, procura só as contas deste navegador', async () => {
    import.meta.env.VITE_API_URL = '';
    await expect(authenticateAccount('ana@x.com', 'x')).rejects.toThrow('E-mail ou senha incorretos.');
  });

  it('separa senha errada de API fora do ar', async () => {
    api.defaults.adapter = respond(() => ({ status: 401, data: {} }));
    await expect(authenticateAccount('ana@x.com', 'x')).rejects.toThrow('E-mail ou senha incorretos.');
    api.defaults.adapter = async (config) => { throw Object.assign(new Error('rede'), { isAxiosError: true, config }); };
    await expect(authenticateAccount('ana@x.com', 'x')).rejects.toThrow('Não foi possível conectar à API');
  });
});

describe('vendas e importação', () => {
  it('converte o lançamento sem perder centavos', () => {
    const sale = toSale(venda, [confeccao]);
    expect(sale).toMatchObject({ date: '2026-03-01', city: 'Caruaru', category: 'Moda Feminina', quantity: 3 });
    expect(total([sale])).toBe(100);
  });

  it('mantém o faturamento quando a quantidade é zero', () => {
    expect(total([toSale({ ...venda, quantidade: 0, faturamento: 50 }, [])])).toBe(50);
  });

  it('cadastro envia origem MANUAL e edição preserva a origem', async () => {
    const enviados: Array<Record<string, unknown>> = [];
    api.defaults.adapter = respond((config) => { enviados.push(JSON.parse(config.data as string)); return { data: venda }; });
    const input = { idConfeccao: 2, idCategoria: 1, mesAno: '2026-03', quantidade: 3, faturamento: 100, origemDado: 'ENTREVISTA' as const, nomeFonte: 'Coleta' };
    await createVenda(input);
    await updateVenda(venda, input);
    expect(enviados.map((item) => item.origem)).toEqual(['MANUAL', 'IMPORTACAO']);
  });

  it('envia o CSV como arquivo, e não como JSON', async () => {
    let corpo: unknown;
    api.defaults.adapter = respond((config) => { corpo = config.data; return { data: { qtdLinhas: 1 } }; });
    await importCsv(new File(['mesAno'], 'vendas.csv'));
    expect(corpo).toBeInstanceOf(FormData);
    expect(((corpo as FormData).get('arquivo') as File).name).toBe('vendas.csv');
  });

  it('mostra as mensagens de validação de cada campo', () => {
    const error = { isAxiosError: true, response: { status: 400, data: { detail: 'Existem campos inválidos.', errors: { nome: 'Informe o nome.' } } } };
    expect(getApiErrorMessage(error)).toBe('Informe o nome.');
  });
});
