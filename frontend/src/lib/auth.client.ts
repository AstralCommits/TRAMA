import axios from 'axios';
import { clearApiToken, hasValidApiToken } from '@/lib/apiToken';
import { getApiErrorMessage, isApiConfigured } from '@/services/api';
import { getUsuarioLogado, loginApi } from '@/services/authService';

export type TramaUser = {
  id: string;
  name: string;
  email: string;
  company: string;
  city: string;
  role: string;
  isDemo: boolean;
  createdAt: string;
  source?: 'api';
};

export function isApiUser(user: TramaUser | null): boolean {
  return user?.source === 'api';
}

const SESSION_KEY = 'trama:session:v1';
const LEGACY_ACCOUNTS_KEY = 'trama:accounts:v1';

function createId(): string {
  return window.crypto?.randomUUID?.() ?? `trama-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function removeLegacyAccounts() {
  try {
    window.localStorage.removeItem(LEGACY_ACCOUNTS_KEY);
  } catch {
    return;
  }
}

export function saveSession(user: TramaUser) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): TramaUser | null {
  removeLegacyAccounts();
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as TramaUser;
    if (!user?.id || !user.email) return null;
    const apiSessionValid = isApiUser(user) && isApiConfigured() && hasValidApiToken();
    if (!user.isDemo && !apiSessionValid) {
      clearSession();
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
  clearApiToken();
}

export async function authenticateAccount(emailValue: string, password: string): Promise<TramaUser> {
  if (!isApiConfigured()) {
    throw new Error('O login precisa da API do TRAMA. Configure VITE_API_URL ou use a demonstração.');
  }
  const email = emailValue.trim().toLowerCase();
  try {
    await loginApi(email, password);
    const usuario = await getUsuarioLogado();
    const user: TramaUser = {
      id: `api-${usuario.idUsuario}`,
      name: usuario.nome,
      email: usuario.email,
      company: usuario.confeccao?.nome ?? 'Polo Têxtil do Agreste',
      city: usuario.confeccao?.cidade ?? '',
      role: usuario.perfil === 'ADMIN' ? 'Administrador' : 'Empresário',
      isDemo: false,
      createdAt: new Date().toISOString(),
      source: 'api',
    };
    saveSession(user);
    return user;
  } catch (error) {
    clearApiToken();
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error('E-mail ou senha incorretos.');
    }
    throw new Error(axios.isAxiosError(error) ? getApiErrorMessage(error) : 'Não foi possível entrar. Tente novamente.');
  }
}

export function startDemoSession(input: { name: string; role: string; city: string }): TramaUser {
  const user: TramaUser = {
    id: 'demo-' + createId(),
    name: input.name.trim() || 'Pessoa visitante',
    email: 'demo@trama.local',
    company: 'Confecção Fio do Agreste',
    city: input.city,
    role: input.role,
    isDemo: true,
    createdAt: new Date().toISOString(),
  };
  saveSession(user);
  return user;
}

export function updateAccountProfile(
  currentUser: TramaUser,
  input: { name: string; email: string; company: string; city: string },
): TramaUser {
  if (!currentUser.isDemo) {
    throw new Error('Os dados do usuário são mantidos pelo administrador do TRAMA.');
  }
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const company = input.company.trim();
  if (!name || !email || !company || !input.city) {
    throw new Error('Preencha seu nome, e-mail, empresa e cidade.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Informe um endereço de e-mail válido.');
  }
  const updated: TramaUser = { ...currentUser, name, email, company, city: input.city };
  saveSession(updated);
  return updated;
}
