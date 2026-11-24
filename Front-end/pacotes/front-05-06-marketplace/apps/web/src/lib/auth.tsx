import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { clearAccessToken, setAccessToken } from '@/lib/api.client';

type AuthUser = { id?: string; name?: string; email?: string; role?: string };
type AuthContextValue = {
  user: AuthUser | null;
  authenticated: boolean;
  establishSession: (token: string, user: AuthUser) => void;
  logout: () => void;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ token: string; user: AuthUser } | null>(null);
  const logout = () => { clearAccessToken(); setSession(null); };
  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener('trama:unauthorized', onUnauthorized);
    return () => window.removeEventListener('trama:unauthorized', onUnauthorized);
  }, []);
  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    authenticated: Boolean(session?.token),
    establishSession: (token, user) => { setAccessToken(token); setSession({ token, user }); },
    logout,
  }), [session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth deve ser utilizado dentro de AuthProvider.');
  return value;
}

export function RequireAuth({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const { authenticated, user } = useAuth();
  if (!authenticated) return <section className="auth-guard"><h2>Entre para continuar</h2><p>Esta área exige uma sessão autenticada. O fluxo de login depende do endpoint JWT do Back-end.</p></section>;
  if (roles?.length && !roles.includes(user?.role ?? '')) return <section className="auth-guard"><h2>Acesso não autorizado</h2><p>Seu perfil não possui permissão para acessar esta área.</p></section>;
  return <>{children}</>;
}
