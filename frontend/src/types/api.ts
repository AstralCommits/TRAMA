import type { components } from './api.gen';

export type Porte = 'MICRO' | 'PEQUENA' | 'MEDIA';
export type TipoConfeccao = 'CONFECCAO' | 'FACCAO';
export type OrigemDado = 'ENTREVISTA' | 'QUESTIONARIO' | 'FONTE_SECUNDARIA';

export type Categoria = { idCategoria: number; nome: string };

export type Confeccao = {
  idConfeccao: number;
  nome: string;
  cnpj?: string;
  porte: Porte;
  tipo: TipoConfeccao;
  cidade: string;
  uf: string;
};

export type ConfeccaoInput = {
  nome: string;
  cnpj?: string;
  porte: Porte;
  tipo: TipoConfeccao;
  cidade: string;
};

export type Venda = {
  idLancamento: number;
  mesAno: string;
  quantidade: number;
  faturamento: number;
  origem: 'MANUAL' | 'IMPORTACAO';
  origemDado: OrigemDado;
  nomeFonte: string;
  status: 'ATIVO' | 'CANCELADO';
  idConfeccao: number;
  confeccao: string;
  idCategoria: number;
  categoria: string;
};

export type VendaInput = {
  idConfeccao: number;
  idCategoria: number;
  mesAno: string;
  quantidade: number;
  faturamento: number;
  origemDado: OrigemDado;
  nomeFonte: string;
};

export type Importacao = {
  idImportacao: number;
  nomeArquivo: string;
  dataImportacao: string;
  qtdLinhas?: number;
  status: 'CONCLUIDA' | 'ERRO';
};

export type Cenario = {
  idCenario: number;
  nome: string;
  descricao?: string;
  categoriaId?: number;
  percentualImpacto: number;
};

export type Simulacao = {
  faturamentoReal: number;
  faturamentoHipotetico: number;
  diferencaReais: number;
  diferencaPercentual: number;
};

export type UsuarioLogado = components['schemas']['UsuarioLogadoResponse'];
