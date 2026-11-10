export type TramaUser = {
  id: string;
  name: string;
  email: string;
  company: string;
  city: string;
  role: string;
  isDemo: boolean;
  createdAt: string;
};

type StoredAccount = {
  user: TramaUser;
  salt: string;
  passwordHash: string;
};

const ACCOUNTS_KEY = 'trama:accounts:v1';
const SESSION_KEY = 'trama:session:v1';

function readAccounts(): StoredAccount[] {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as StoredAccount[] : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return window.btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = window.atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  if (!window.crypto?.subtle) {
    throw new Error('Seu navegador não oferece criptografia segura. Abra o TRAMA em http://localhost:3000 ou em HTTPS.');
  }
  const key = await window.crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'],
  );
  const bits = await window.crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 120_000, hash: 'SHA-256' }, key, 256,
  );
  return bytesToBase64(new Uint8Array(bits));
}

function createId(): string {
  return window.crypto?.randomUUID?.() ?? `trama-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function saveSession(user: TramaUser) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): TramaUser | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as TramaUser;
    return user?.id && user?.email ? user : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export async function registerAccount(input: {
  name: string;
  email: string;
  password: string;
  company: string;
  city: string;
}): Promise<TramaUser> {
  const email = input.email.trim().toLowerCase();
  const accounts = readAccounts();
  if (accounts.some((account) => account.user.email === email)) {
    throw new Error('Já existe uma conta cadastrada com este e-mail. Entre ou utilize outro endereço.');
  }
  if (input.password.length < 8) {
    throw new Error('A senha precisa ter pelo menos 8 caracteres.');
  }

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const user: TramaUser = {
    id: createId(),
    name: input.name.trim(),
    email,
    company: input.company.trim(),
    city: input.city,
    role: 'Administrador',
    isDemo: false,
    createdAt: new Date().toISOString(),
  };
  const record: StoredAccount = {
    user,
    salt: bytesToBase64(salt),
    passwordHash: await hashPassword(input.password, salt),
  };
  writeAccounts([...accounts, record]);
  saveSession(user);
  return user;
}

export async function authenticateAccount(emailValue: string, password: string): Promise<TramaUser> {
  const email = emailValue.trim().toLowerCase();
  const account = readAccounts().find((item) => item.user.email === email);
  if (!account) throw new Error('E-mail ou senha incorretos.');
  const candidate = await hashPassword(password, base64ToBytes(account.salt));
  if (candidate !== account.passwordHash) throw new Error('E-mail ou senha incorretos.');
  saveSession(account.user);
  return account.user;
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
  if (!currentUser.isDemo) {
    const accounts = readAccounts();
    const index = accounts.findIndex((account) => account.user.id === currentUser.id);
    if (index < 0) throw new Error('Não foi possível localizar esta conta neste navegador.');
    if (accounts.some((account, itemIndex) => itemIndex !== index && account.user.email === email)) {
      throw new Error('Este e-mail já está associado a outra conta.');
    }
    accounts[index] = { ...accounts[index], user: updated };
    writeAccounts(accounts);
  }
  saveSession(updated);
  return updated;
}
