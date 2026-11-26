import { describe, expect, it } from 'vitest';
import { API_MODULES, sectionOf, visibleModules } from '@/lib/modules';

describe('módulos visíveis', () => {
  it('administrador da API vê só os módulos ligados à API', () => {
    expect(visibleModules(true, true)).toEqual(API_MODULES);
  });

  it('empresário da API não vê os cadastros, mas lança as próprias vendas', () => {
    const lista = visibleModules(true, false);
    expect(lista).not.toContain('Gerenciamento de Categorias');
    expect(lista).not.toContain('Gerenciamento de Confecções');
    expect(lista).toContain('Lançamento de Vendas');
    expect(lista).not.toContain('Estoque');
  });

  it('a demonstração continua com os módulos locais', () => {
    const lista = visibleModules(false, true);
    expect(lista).toContain('Estoque');
    expect(lista).toContain('Financeiro');
    expect(lista).toContain('Gerenciamento de Categorias');
  });

  it('agrupa cada módulo na seção certa pelo nome, não pela posição', () => {
    expect(sectionOf('Visão Geral')).toBe('VISÃO DO NEGÓCIO');
    expect(sectionOf('Análise de Tendências')).toBe('INDICADORES');
    expect(sectionOf('Tendências por Categoria')).toBe('ANÁLISE COMERCIAL');
    expect(sectionOf('Estoque')).toBe('GESTÃO DA OPERAÇÃO');
    expect(sectionOf('Gerenciamento de Categorias')).toBe('ADMINISTRAÇÃO');
  });
});
