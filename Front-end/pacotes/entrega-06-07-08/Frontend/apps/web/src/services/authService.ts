import { api, setApiCsrfToken } from './api';

export interface AuthUserDto {
  idUsuario: number;
  nome: string;
  email: string;
  perfil: 'ADMIN' | 'CONFECCAO';
  idConfeccao: number | null;
  nomeConfeccao: string | null;
  cidade: string | null;
  uf: string | null;
}

export interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
  nomeConfeccao: string;
  cnpj?: string;
  porte: 'MICRO' | 'PEQUENA' | 'MEDIA';
  tipo: 'CONFECCAO' | 'FACCAO';
  cidade: string;
}

export async function prepararCsrf(): Promise<void> {
  const response = await api.get<{ csrfToken: string }>('/api/auth/csrf');
  if (!response.data?.csrfToken) throw new Error('O servidor não forneceu o token de proteção da sessão.');
  setApiCsrfToken(response.data.csrfToken);
}

export async function registrar(payload: RegisterPayload): Promise<AuthUserDto> {
  await prepararCsrf();
  const response = await api.post<AuthUserDto>('/api/auth/register', payload);
  return response.data;
}

export async function entrar(email: string, senha: string): Promise<AuthUserDto> {
  await prepararCsrf();
  const response = await api.post<AuthUserDto>('/api/auth/login', { email, senha });
  return response.data;
}

export async function buscarSessaoAtual(): Promise<AuthUserDto> {
  const response = await api.get<AuthUserDto>('/api/auth/me');
  return response.data;
}

export async function sair(): Promise<void> {

  await prepararCsrf();
  await api.post('/api/auth/logout');
}

export async function atualizarPerfil(payload: {
  nome: string;
  email: string;
  nomeConfeccao: string;
  cidade: string;
}): Promise<AuthUserDto> {
  await prepararCsrf();
  const response = await api.put<AuthUserDto>('/api/auth/profile', payload);
  return response.data;
}

export async function registrarFuncionario(payload: {
  nome: string;
  email: string;
  senha: string;
  idConfeccao: number;
}): Promise<AuthUserDto> {
  await prepararCsrf();
  const response = await api.post<AuthUserDto>('/api/auth/admin/users', payload);
  return response.data;
}
