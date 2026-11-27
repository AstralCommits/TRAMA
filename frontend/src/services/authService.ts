import { setApiToken } from '@/services/apiToken';
import type { CadastroInput, UsuarioLogado } from '@/types/api';
import { api } from './api';

export async function loginApi(email: string, senha: string): Promise<string> {
  const response = await api.post<{ token: string }>('/api/auth/login', { email, senha });
  const token = response.data?.token;
  if (!token) throw new Error('A API não retornou o token de acesso.');
  setApiToken(token);
  return token;
}

export async function getUsuarioLogado(): Promise<UsuarioLogado> {
  const response = await api.get<UsuarioLogado>('/api/auth/me');
  return response.data;
}

export async function cadastroApi(input: CadastroInput): Promise<string> {
  const response = await api.post<{ token: string }>('/api/auth/cadastro', input);
  const token = response.data?.token;
  if (!token) throw new Error('A API não retornou o token de acesso.');
  setApiToken(token);
  return token;
}
