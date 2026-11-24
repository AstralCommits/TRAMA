import { api } from '@/services/api';
import { clearAccessToken, getAccessToken, saveAccessToken } from '@/lib/auth-token.client';
import { workspaceModules, type WorkspaceModule } from '@/lib/workspace-modules';

export { workspaceModules } from '@/lib/workspace-modules';
export type { WorkspaceModule } from '@/lib/workspace-modules';
export type TramaRole = 'Administrador principal' | 'Administrador' | 'Funcionário';

export type TramaUser = {
  id: string;
  name: string;
  email: string;
  company: string;
  city: string;
  role: TramaRole | string;
  isDemo: boolean;
  isLocal?: boolean;
  isPrimaryAdmin?: boolean;
  organizationId?: string;
  avatarUrl?: string;
  permissions?: string[];
  createdAt: string;
};

export type TramaOrganization = {
  id: string;
  name: string;
  city: string;
  logoDataUrl?: string;
  inviteCode: string;
  primaryAdmin?: TramaUser;
  currency: 'BRL';
  createdAt: string;
  updatedAt?: string;
};

type StoredAccount = { user: TramaUser; salt: string; passwordHash: string };
const ACCOUNTS_KEY = 'trama:accounts:v1';
const SESSION_KEY = 'trama:session:v1';
const ORGANIZATIONS_KEY = 'trama:organizations:v1';

function readAccounts(): StoredAccount[] {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as StoredAccount[] : [];
  } catch { return []; }
}
function writeAccounts(accounts: StoredAccount[]) { window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); }
function readOrganizations(): TramaOrganization[] {
  try {
    const raw = window.localStorage.getItem(ORGANIZATIONS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as TramaOrganization[] : [];
  } catch { return []; }
}
function writeOrganizations(items: TramaOrganization[]) { window.localStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(items)); }
function createId(prefix = 'trama') { return `${prefix}-${window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`; }
const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function createInviteCode(): string {
  const values = new Uint8Array(8);
  window.crypto.getRandomValues(values);
  return Array.from(values, (value) => INVITE_ALPHABET[value % INVITE_ALPHABET.length]).join('');
}
function createUniqueInviteCode(): string {
  const existing = new Set(readOrganizations().map((organization) => organization.inviteCode).filter(Boolean));
  let code = createInviteCode();
  while (existing.has(code)) code = createInviteCode();
  return code;
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
  if (!window.crypto?.subtle) throw new Error('Seu navegador não oferece criptografia segura. Abra a TRAMA em localhost ou HTTPS.');
  const key = await window.crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);

  const saltBuffer = new ArrayBuffer(salt.byteLength);
  new Uint8Array(saltBuffer).set(salt);
  const bits = await window.crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBuffer, iterations: 120_000, hash: 'SHA-256' }, key, 256);
  return bytesToBase64(new Uint8Array(bits));
}
function defaultPermissions(role: TramaRole): string[] {
  if (role !== 'Funcionário') return [...workspaceModules];
  return ['Início', 'Minhas vendas', 'Meus produtos', 'Indicadores'];
}
function storeOrganization(organization: TramaOrganization) {
  const organizations = readOrganizations();
  const index = organizations.findIndex((item) => item.id === organization.id);
  if (index < 0) organizations.push(organization);
  else organizations[index] = organization;
  writeOrganizations(organizations);
}

export function saveSession(user: TramaUser) { window.localStorage.setItem(SESSION_KEY, JSON.stringify(user)); }
export function getSession(): TramaUser | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as TramaUser;
    return user?.id && user?.email && (user.isDemo || user.isLocal || getAccessToken()) ? user : null;
  } catch { return null; }
}
export function clearSession() { window.localStorage.removeItem(SESSION_KEY); clearAccessToken(); }

export async function registerAccount(input: { name: string; email: string; password: string; company: string; city: string }): Promise<TramaUser> {
  const email = input.email.trim().toLowerCase();
  const accounts = readAccounts();
  if (accounts.some((account) => account.user.email === email)) throw new Error('Já existe uma conta cadastrada com este e-mail. Entre ou utilize outro endereço.');
  if (input.password.length < 8) throw new Error('A senha precisa ter pelo menos 8 caracteres.');
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const organizationId = createId('org');
  const user: TramaUser = {
    id: createId('user'), name: input.name.trim(), email, company: input.company.trim(), city: input.city,
    role: 'Administrador principal', isPrimaryAdmin: true, organizationId, permissions: [...workspaceModules],
    isDemo: false, isLocal: true, createdAt: new Date().toISOString(),
  };
  const record: StoredAccount = { user, salt: bytesToBase64(salt), passwordHash: await hashPassword(input.password, salt) };
  writeAccounts([...accounts, record]);
  storeOrganization({ id: organizationId, name: user.company, city: user.city, inviteCode: createUniqueInviteCode(), primaryAdmin: user, currency: 'BRL', createdAt: user.createdAt });
  saveSession(user);
  return user;
}

export async function joinOrganizationByCode(input: { name: string; email: string; password: string; code: string }): Promise<TramaUser> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const code = input.code.toUpperCase().replace(/[\s-]/g, '');
  if (!name || !email || !code) throw new Error('Preencha seu nome, e-mail e código da organização.');
  if (code.length !== 8) throw new Error('O código da organização precisa ter 8 caracteres.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Informe um endereço de e-mail válido.');
  if (input.password.length < 8) throw new Error('A senha precisa ter pelo menos 8 caracteres.');
  const organization = readOrganizations().find((item) => item.inviteCode?.toUpperCase() === code);
  if (!organization) throw new Error('Código não encontrado. Confira com o administrador da organização.');
  const accounts = readAccounts();
  if (accounts.some((account) => account.user.email === email)) {
    throw new Error('Já existe uma conta com este e-mail neste navegador. Entre com ela ou use outro endereço.');
  }
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const now = new Date().toISOString();
  const user: TramaUser = {
    id: createId('member'), name, email, company: organization.name, city: organization.city,
    role: 'Funcionário', isPrimaryAdmin: false, organizationId: organization.id,
    permissions: defaultPermissions('Funcionário'), isDemo: false, isLocal: true, createdAt: now,
  };
  const record: StoredAccount = { user, salt: bytesToBase64(salt), passwordHash: await hashPassword(input.password, salt) };
  writeAccounts([...accounts, record]);
  saveSession(user);
  return user;
}

export async function authenticateAccount(emailValue: string, password: string): Promise<TramaUser> {
  const email = emailValue.trim().toLowerCase();
  const localAccount = readAccounts().find((account) => account.user.email === email);
  if (localAccount) {
    const passwordHash = await hashPassword(password, base64ToBytes(localAccount.salt));
    if (passwordHash !== localAccount.passwordHash) throw new Error('E-mail ou senha incorretos.');
    saveSession(localAccount.user);
    return localAccount.user;
  }
  try {
    const response = await api.post<{ token: string }>('/api/auth/login', { email, senha: password });
    if (!response.data?.token) throw new Error('O servidor não retornou o token de acesso esperado.');
    saveAccessToken(response.data.token);
    const user: TramaUser = {
      id: `api-${email}`, name: email.split('@')[0], email, company: 'Minha confecção', city: '',
      role: 'Usuário', isDemo: false, isLocal: false, createdAt: new Date().toISOString(),
    };
    saveSession(user);
    return user;
  } catch (error) {
    if (error instanceof Error && error.message.includes('token de acesso')) throw error;
    const message = (error as { response?: { status?: number } })?.response?.status === 401
      ? 'E-mail ou senha incorretos.'
      : 'Não foi possível entrar. Verifique seus dados e se o Back-end está disponível.';
    throw new Error(message);
  }
}

export function startDemoSession(input: { name: string; city: string }): TramaUser {
  const now = new Date().toISOString();
  const organizationId = createId('org-demo');
  const user: TramaUser = {
    id: createId('demo-user'), name: input.name.trim() || 'Pessoa visitante', email: 'demo@trama.local',
    company: 'Confecção Fio do Agreste', city: input.city, role: 'Administrador principal', isPrimaryAdmin: true,
    organizationId, permissions: [...workspaceModules], isDemo: true, isLocal: true, createdAt: now,
  };
  storeOrganization({ id: organizationId, name: user.company, city: user.city, inviteCode: createUniqueInviteCode(), primaryAdmin: user, currency: 'BRL', createdAt: now });
  saveSession(user);
  return user;
}

export function getOrganization(organizationId?: string): TramaOrganization | null {
  if (!organizationId) return null;
  const organization = readOrganizations().find((item) => item.id === organizationId);
  if (!organization) return null;

  if (!organization.inviteCode) {
    const migrated = { ...organization, inviteCode: createUniqueInviteCode() };
    storeOrganization(migrated);
    return migrated;
  }
  return organization;
}

export function getOrganizationInviteCode(organizationId?: string): string {
  return getOrganization(organizationId)?.inviteCode ?? '';
}

export function rotateOrganizationInviteCode(actor: TramaUser): string {
  if (!actor.isPrimaryAdmin || !actor.organizationId) {
    throw new Error('Somente o administrador principal pode gerar um novo código.');
  }
  const organization = getOrganization(actor.organizationId);
  if (!organization) throw new Error('Organização não encontrada neste navegador.');
  const inviteCode = createUniqueInviteCode();
  storeOrganization({ ...organization, inviteCode, updatedAt: new Date().toISOString() });
  return inviteCode;
}
export function createOrganization(user: TramaUser, input: { name: string; city: string; logoDataUrl?: string }): TramaUser {
  if (user.organizationId) throw new Error('Esta conta já pertence a uma organização.');
  if (!input.name.trim() || !input.city) throw new Error('Informe o nome e a cidade da organização.');
  const organizationId = createId('org');
  const now = new Date().toISOString();
  const updated: TramaUser = { ...user, company: input.name.trim(), city: input.city, organizationId, role: 'Administrador principal', isPrimaryAdmin: true, permissions: [...workspaceModules] };
  storeOrganization({ id: organizationId, name: input.name.trim(), city: input.city, logoDataUrl: input.logoDataUrl, inviteCode: createUniqueInviteCode(), primaryAdmin: updated, currency: 'BRL', createdAt: now });
  const accounts = readAccounts();
  const index = accounts.findIndex((account) => account.user.id === user.id);
  if (index >= 0) { accounts[index] = { ...accounts[index], user: updated }; writeAccounts(accounts); }
  saveSession(updated);
  return updated;
}

export function updateOrganization(user: TramaUser, input: { name: string; city: string; logoDataUrl?: string }): TramaOrganization {
  if (!user.organizationId) throw new Error('Esta conta ainda não possui uma organização vinculada pelo servidor.');
  if (!user.isPrimaryAdmin) throw new Error('Somente o administrador principal pode alterar os dados da organização.');
  const current = getOrganization(user.organizationId);
  const updatedUser = { ...user, company: input.name.trim(), city: input.city };
  const organization: TramaOrganization = {
    id: user.organizationId, name: input.name.trim(), city: input.city,
    logoDataUrl: input.logoDataUrl, inviteCode: current?.inviteCode || createUniqueInviteCode(),
    primaryAdmin: user.isPrimaryAdmin ? updatedUser : current?.primaryAdmin,
    currency: 'BRL', createdAt: current?.createdAt ?? user.createdAt, updatedAt: new Date().toISOString(),
  };
  storeOrganization(organization);
  saveSession(updatedUser);
  const accounts = readAccounts().map((account) => account.user.id === user.id ? { ...account, user: updatedUser } : account);
  writeAccounts(accounts);
  return organization;
}

export function updateAccountProfile(currentUser: TramaUser, input: { name: string; email: string; company: string; city: string; avatarUrl?: string }): TramaUser {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const company = input.company.trim();
  if (!name || !email || !company || !input.city) throw new Error('Preencha seu nome, e-mail, empresa e cidade.');
  if (currentUser.organizationId && !currentUser.isPrimaryAdmin && (company !== currentUser.company || input.city !== currentUser.city)) throw new Error('Somente o administrador principal pode alterar os dados da organização.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Informe um endereço de e-mail válido.');
  const accounts = readAccounts();
  const index = accounts.findIndex((account) => account.user.id === currentUser.id);
  if (index >= 0 && accounts.some((account, itemIndex) => itemIndex !== index && account.user.email === email)) throw new Error('Este e-mail já está associado a outra conta.');
  const updated: TramaUser = { ...currentUser, name, email, company, city: input.city, avatarUrl: input.avatarUrl };
  if (index >= 0) { accounts[index] = { ...accounts[index], user: updated }; writeAccounts(accounts); }
  if (currentUser.organizationId) {
    const organization = getOrganization(currentUser.organizationId);
    if (organization) storeOrganization({
      ...organization,
      name: currentUser.isPrimaryAdmin ? company : organization.name,
      city: currentUser.isPrimaryAdmin ? input.city : organization.city,
      primaryAdmin: currentUser.isPrimaryAdmin ? updated : organization.primaryAdmin,
      updatedAt: new Date().toISOString(),
    });
  }
  saveSession(updated);
  return updated;
}

export type OrganizationMember = { user: TramaUser; createdAt: string };
export function getOrganizationMembers(organizationId?: string, currentUser?: TramaUser): OrganizationMember[] {
  if (!organizationId) return currentUser ? [{ user: currentUser, createdAt: currentUser.createdAt }] : [];
  const members = readAccounts().filter((account) => account.user.organizationId === organizationId).map((account) => ({ user: account.user, createdAt: account.user.createdAt }));
  const organizationOwner = getOrganization(organizationId)?.primaryAdmin;
  for (const candidate of [organizationOwner, currentUser?.organizationId === organizationId ? currentUser : undefined]) {
    if (candidate && !members.some((member) => member.user.id === candidate.id)) members.push({ user: candidate, createdAt: candidate.createdAt });
  }
  return members.sort((a, b) => Number(Boolean(b.user.isPrimaryAdmin)) - Number(Boolean(a.user.isPrimaryAdmin)) || a.user.name.localeCompare(b.user.name, 'pt-BR'));
}

export async function addOrganizationMember(actor: TramaUser, input: { name: string; email: string; password: string; role: 'Administrador' | 'Funcionário'; permissions: string[] }): Promise<TramaUser> {
  if (!actor.isPrimaryAdmin) throw new Error('Somente o administrador principal pode adicionar pessoas à organização.');
  if (!actor.organizationId) throw new Error('Esta conta não possui uma organização vinculada.');
  const email = input.email.trim().toLowerCase();
  if (!input.name.trim() || !email) throw new Error('Informe nome e e-mail do funcionário.');
  if (input.password.length < 8) throw new Error('A senha inicial precisa ter pelo menos 8 caracteres.');
  if (readAccounts().some((account) => account.user.email === email)) throw new Error('Já existe uma conta com este e-mail neste navegador.');
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const now = new Date().toISOString();
  const role = input.role;
  const user: TramaUser = {
    id: createId('member'), name: input.name.trim(), email, company: actor.company, city: actor.city,
    role, isPrimaryAdmin: false, organizationId: actor.organizationId,
    permissions: role === 'Administrador' ? [...workspaceModules] : input.permissions.filter((item) => workspaceModules.includes(item as WorkspaceModule)),
    isDemo: actor.isDemo, isLocal: true, createdAt: now,
  };
  const account: StoredAccount = { user, salt: bytesToBase64(salt), passwordHash: await hashPassword(input.password, salt) };
  writeAccounts([...readAccounts(), account]);
  return user;
}

export function updateOrganizationMember(actor: TramaUser, memberId: string, input: { role: 'Administrador' | 'Funcionário'; permissions: string[] }): TramaUser {
  if (!actor.isPrimaryAdmin) throw new Error('Somente o administrador principal pode alterar cargos e permissões.');
  const accounts = readAccounts();
  const index = accounts.findIndex((account) => account.user.id === memberId && account.user.organizationId === actor.organizationId);
  if (index < 0) throw new Error('Funcionário não encontrado nesta organização.');
  if (accounts[index].user.isPrimaryAdmin) throw new Error('O administrador principal não pode ser rebaixado por esta tela.');
  const role = input.role;
  const updatedUser: TramaUser = {
    ...accounts[index].user, role,
    permissions: role === 'Administrador' ? [...workspaceModules] : input.permissions.filter((item) => workspaceModules.includes(item as WorkspaceModule)),
  };
  accounts[index] = { ...accounts[index], user: updatedUser };
  writeAccounts(accounts);
  return updatedUser;
}

export function removeOrganizationMember(actor: TramaUser, memberId: string) {
  if (!actor.isPrimaryAdmin) throw new Error('Somente o administrador principal pode remover pessoas da organização.');
  const accounts = readAccounts();
  const member = accounts.find((account) => account.user.id === memberId && account.user.organizationId === actor.organizationId);
  if (!member) throw new Error('Funcionário não encontrado nesta organização.');
  if (member.user.isPrimaryAdmin) throw new Error('O administrador principal não pode ser removido.');
  writeAccounts(accounts.filter((account) => account.user.id !== memberId));
}
