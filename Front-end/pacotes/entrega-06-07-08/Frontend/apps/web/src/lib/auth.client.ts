import {
  atualizarPerfil as atualizarPerfilApi,
  buscarSessaoAtual,
  entrar,
  registrar,
  sair,
  type AuthUserDto,
} from '@/services/authService';

export type TramaUser = {
  id: string;
  idConfeccao?: number;
  name: string;
  email: string;
  company: string;
  city: string;
  role: string;
  isDemo: boolean;
};

const SESSION_KEY = 'trama:session:v2';

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  company: string;
  city: string;
  cnpj?: string;
  porte: 'MICRO' | 'PEQUENA' | 'MEDIA';
  tipo: 'CONFECCAO' | 'FACCAO';
};

function mapApiUser(user: AuthUserDto): TramaUser {
  return {
    id: String(user.idUsuario),
    ...(user.idConfeccao ? { idConfeccao: user.idConfeccao } : {}),
    name: user.nome,
    email: user.email,
    company: user.nomeConfeccao || 'Administração TRAMA',
    city: user.cidade || 'Caruaru',
    role: user.perfil === 'ADMIN' ? 'Administrador da plataforma' : 'Usuário da confecção',
    isDemo: false,
  };
}

function saveSession(user: TramaUser): TramaUser {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function getSession(): TramaUser | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TramaUser;
    return parsed?.id && parsed?.email ? parsed : null;
  } catch {
    return null;
  }
}

export async function restoreSession(): Promise<TramaUser | null> {

  window.localStorage.removeItem('trama:accounts:v1');
  const cached = getSession();
  if (cached?.isDemo) return cached;
  try {
    return saveSession(mapApiUser(await buscarSessaoAtual()));
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_KEY);

  window.localStorage.removeItem('trama:session:v1');
  window.localStorage.removeItem('trama:accounts:v1');
}

export async function registerAccount(input: RegisterInput): Promise<TramaUser> {
  const user = await registrar({
    nome: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    senha: input.password,
    nomeConfeccao: input.company.trim(),
    cnpj: input.cnpj?.replace(/\D/g, '') || undefined,
    porte: input.porte,
    tipo: input.tipo,
    cidade: input.city,
  });
  return saveSession(mapApiUser(user));
}

export async function authenticateAccount(email: string, password: string): Promise<TramaUser> {
  return saveSession(mapApiUser(await entrar(email, password)));
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
  };
  return saveSession(user);
}

export async function updateAccountProfile(
  currentUser: TramaUser,
  input: { name: string; email: string; company: string; city: string },
): Promise<TramaUser> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const company = input.company.trim();
  if (!name || !email || !company || !input.city) {
    throw new Error('Preencha seu nome, e-mail, empresa e cidade.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Informe um endereço de e-mail válido.');
  }
  if (currentUser.isDemo) {
    return saveSession({ ...currentUser, name, email, company, city: input.city });
  }
  const user = await atualizarPerfilApi({ nome: name, email, nomeConfeccao: company, cidade: input.city });
  return saveSession(mapApiUser(user));
}

export async function logoutAccount(currentUser: TramaUser | null): Promise<void> {
  if (currentUser && !currentUser.isDemo) await sair();
  clearSession();
}
