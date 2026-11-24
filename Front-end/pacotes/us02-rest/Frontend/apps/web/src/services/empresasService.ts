import { api } from './api';

export type CadastroEmpresaPayload = {
  razaoSocial: string;
  nomeFantasia: string;
  emailCorporativo: string;
  telefone: string;

  cnpj: string;
};

export type EmpresaResponse = CadastroEmpresaPayload & {
  id?: string | number;
  createdAt?: string;
};

export async function cadastrarEmpresa(payload: CadastroEmpresaPayload): Promise<EmpresaResponse> {
  const response = await api.post<EmpresaResponse>('/api/empresas', payload);
  return response.data;
}
