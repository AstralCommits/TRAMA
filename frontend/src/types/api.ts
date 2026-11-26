import type { components } from './api.gen';

type Schemas = components['schemas'];

export type Categoria = Schemas['CategoriaResponse'];
export type Cidade = Schemas['CidadeResponse'];
export type Confeccao = Schemas['ConfeccaoResponse'];
export type ConfeccaoInput = Schemas['ConfeccaoRequest'];
export type Venda = Schemas['VendaResponse'];
export type VendaInput = Omit<Schemas['VendaRequest'], 'origem'>;
export type Importacao = Schemas['ImportacaoResponse'];
export type Cenario = Schemas['CenarioResponse'];
export type CenarioInput = Schemas['CenarioRequest'];
export type Simulacao = Schemas['SimulacaoCenarioResponse'];
export type UsuarioLogado = Schemas['UsuarioLogadoResponse'];

export type Porte = Confeccao['porte'];
export type TipoConfeccao = Confeccao['tipo'];
export type OrigemDado = Venda['origemDado'];
