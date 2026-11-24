import { api, clearAccessToken, hasAccessToken, saveAccessToken, getApiErrorMessage } from '@/services/api';

const SESSION_KEY = 'trama:session:v2';

export type TramaUser = {
  id: string;
  name: string;
  email: string;
  company: string;
  city: string;
  role: string;
  isDemo: boolean;
  createdAt: string;
  idConfeccao: number | null;
};

type BackendUser = {
  idUsuario: number;
  nome: string;
  email: string;
  perfil: string;
  idConfeccao: number | null;
  nomeConfeccao: string | null;
  cidade: string | null;
};

type AuthResponse = { token: string; usuario: BackendUser };

function mapBackendUser(user: BackendUser): TramaUser {
  return {
    id: String(user.idUsuario),
    name: user.nome,
    email: user.email,
    company: user.nomeConfeccao || 'Confecção não vinculada',
    city: user.cidade || '',
    role: user.perfil === 'ADMIN' ? 'Administrador' : user.perfil === 'FUNCIONARIO' ? 'Funcionário' : 'Empresário',
    isDemo: false,
    createdAt: new Date().toISOString(),
    idConfeccao: user.idConfeccao,
  };
}

function storeSession(user: TramaUser) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function readStoredSession(): TramaUser | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as TramaUser;
    return user?.id && user?.email ? user : null;
  } catch {
    return null;
  }
}

export function getSession(): TramaUser | null {
  if (typeof window === 'undefined') return null;
  const user = readStoredSession();
  if (!user) return null;
  if (user.isDemo) return user;
  if (!hasAccessToken()) {
    clearSession();
    return null;
  }
  return user;
}

export async function restoreSession(): Promise<TramaUser | null> {
  const stored = getSession();
  if (!stored || stored.isDemo) return stored;
  try {
    const response = await api.get<BackendUser>('/api/auth/me');
    const user = mapBackendUser(response.data);
    storeSession(user);
    return user;
  } catch {
    clearSession();
    return null;
  }
}

export function saveSession(user: TramaUser) {
  if (user.isDemo) clearAccessToken();
  storeSession(user);
}

export function clearSession() {
  if (typeof window !== 'undefined') window.sessionStorage.removeItem(SESSION_KEY);
  clearAccessToken();
}

export async function registerAccount(input: {
  name: string;
  email: string;
  password: string;
  company: string;
  city: string;
}): Promise<TramaUser> {
  try {
    const response = await api.post<AuthResponse>('/api/auth/register', {
      nome: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      senha: input.password,
      nomeConfeccao: input.company.trim(),
      cidade: input.city,
    });
    saveAccessToken(response.data.token);
    const user = mapBackendUser(response.data.usuario);
    storeSession(user);
    return user;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function authenticateAccount(emailValue: string, password: string): Promise<TramaUser> {
  try {
    const response = await api.post<AuthResponse>('/api/auth/login', {
      email: emailValue.trim().toLowerCase(),
      senha: password,
    });
    saveAccessToken(response.data.token);
    const user = mapBackendUser(response.data.usuario);
    storeSession(user);
    return user;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export function startDemoSession(input: { name: string; role: string; city: string }): TramaUser {
  const user: TramaUser = {
    id: `demo-${window.crypto?.randomUUID?.() ?? Date.now()}`,
    name: input.name.trim() || 'Pessoa visitante',
    email: 'demo@trama.local',
    company: 'Confecção Fio do Agreste',
    city: input.city,
    role: input.role,
    isDemo: true,
    createdAt: new Date().toISOString(),
    idConfeccao: null,
  };
  saveSession(user);
  return user;
}

export function updateAccountProfile(
  currentUser: TramaUser,
  input: { name: string; email: string; company: string; city: string },
): TramaUser {
  if (!currentUser.isDemo) {
    throw new Error('A edição de perfil de contas reais ainda não está disponível no Back-end. Seus dados não foram alterados.');
  }
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const company = input.company.trim();
  if (!name || !email || !company || !input.city) throw new Error('Preencha seu nome, e-mail, empresa e cidade.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Informe um endereço de e-mail válido.');
  const updated = { ...currentUser, name, email, company, city: input.city };
  storeSession(updated);
  return updated;
}

export async function acceptTeamInvite(input: { name: string; password: string; token: string }): Promise<TramaUser> {
  try {
    const response = await api.post<{ idUsuario: number; nome: string; email: string; perfil: string }>('/api/equipe/convites/aceitar', {
      nome: input.name.trim(), senha: input.password, token: input.token.trim(),
    });
    return authenticateAccount(response.data.email, input.password);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
