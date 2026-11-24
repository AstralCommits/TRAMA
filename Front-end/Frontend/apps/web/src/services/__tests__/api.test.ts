import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AxiosAdapter } from 'axios';
import { api } from '@/services/api';
import { clearApiToken, getApiToken, setApiToken } from '@/lib/apiToken';
import { toApiParams, toMesAno } from '@/services/indicadoresService';
import { fromApi } from '@/services/tendenciasService';

function fakeSessionStorage(): Storage {
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

const originalAdapter = api.defaults.adapter;

beforeEach(() => {
  (globalThis as { window?: unknown }).window = { sessionStorage: fakeSessionStorage() };
});

afterEach(() => {
  api.defaults.adapter = originalAdapter;
  delete (globalThis as { window?: unknown }).window;
});

describe('cliente HTTP (FRONT-07)', () => {
  it('envia o token JWT no cabeçalho Authorization', async () => {
    setApiToken('abc.def.ghi');
    let header: unknown;
    const adapter: AxiosAdapter = async (config) => {
      header = config.headers.get('Authorization');
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
    };
    api.defaults.adapter = adapter;
    await api.get('/api/vendas');
    expect(header).toBe('Bearer abc.def.ghi');
  });

  it('não envia Authorization sem token', async () => {
    clearApiToken();
    let header: unknown = 'não chamado';
    api.defaults.adapter = (async (config) => {
      header = config.headers.get('Authorization');
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
    }) as AxiosAdapter;
    await api.get('/api/health');
    expect(header).toBeUndefined();
  });

  it('apaga o token quando a API responde 401', async () => {
    setApiToken('expirado');
    api.defaults.adapter = (async (config) => {
      const error = Object.assign(new Error('401'), {
        isAxiosError: true, config, response: { status: 401, data: {}, headers: {}, config, statusText: '' },
      });
      throw error;
    }) as AxiosAdapter;
    await expect(api.get('/api/vendas')).rejects.toThrow();
    expect(getApiToken()).toBeNull();
  });
});

describe('parâmetros dos indicadores', () => {
  it('converte mês e ano para AAAA-MM', () => {
    expect(toMesAno(2026, 3)).toBe('2026-03');
    expect(toApiParams({ mesInicial: 1, anoInicial: 2026, mesFinal: 11, anoFinal: 2026, cidade: 'Caruaru' }))
      .toEqual({ inicio: '2026-01', fim: '2026-11', cidade: 'Caruaru' });
  });

  it('omite a cidade quando não há filtro', () => {
    expect(toApiParams({ mesInicial: 2, anoInicial: 2025, mesFinal: 2, anoFinal: 2025 }))
      .toEqual({ inicio: '2025-02', fim: '2025-02' });
  });
});

describe('tendências da API', () => {
  it('traduz a classificação do back-end', () => {
    expect(fromApi({ categoria: 'Jeans', faturamento: 1200, variacaoPercentual: 20, classificacao: 'ALTA' }).classificacao).toBe('ALTA');
    expect(fromApi({ categoria: 'Infantil', faturamento: 510, variacaoPercentual: 2, classificacao: 'ESTAVEL' }).classificacao).toBe('ESTÁVEL');
  });

  it('categoria sem base fica com variação nula', () => {
    const item = fromApi({ categoria: 'Nova', faturamento: 300, variacaoPercentual: null, classificacao: 'SEM_BASE' });
    expect(item.variacaoPercentual).toBeNull();
    expect(item.classificacao).toBe('SEM BASE');
  });
});
