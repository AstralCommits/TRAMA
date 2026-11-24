import { useEffect, useState } from 'react';
import type { Route } from './+types/home';
import { seo } from '@/lib/seo';
import { banner } from '@/data/demo';
import { Institutional } from '@/home/institutional';
import { DemoEntry } from '@/home/demo-entry';
import { Workspace } from '@/home/workspace';
import { clearSession, restoreSession, type TramaUser } from '@/lib/auth.client';

export function meta({ matches, location }: Route.MetaArgs) {
  return seo({ matches, location }, {
    title: 'TRAMA — Inteligência de vendas para o Agreste',
    description: 'Organize lançamentos mensais de vendas, acompanhe indicadores e compare categorias para apoiar decisões de confecções do Agreste pernambucano.',
    image: banner,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'TRAMA',
      description: 'Plataforma de gestão para a cadeia têxtil do Agreste.',
    },
  });
}

export default function HomePage() {
  const [session, setSession] = useState<TramaUser | null>(null);
  const [ready, setReady] = useState(false);
  const [entryMode, setEntryMode] = useState('');

  useEffect(() => {
    let active = true;
    const handleExpiredSession = () => {
      clearSession();
      setSession(null);
      setEntryMode('Entrar');
    };
    window.addEventListener('trama:auth-expired', handleExpiredSession);
    restoreSession().then((user) => {
      if (!active) return;
      setSession(user);
      setReady(true);
    });
    return () => {
      active = false;
      window.removeEventListener('trama:auth-expired', handleExpiredSession);
    };
  }, []);

  const signOut = () => {
    clearSession();
    setSession(null);
    setEntryMode('');
  };

  if (!ready) return <main className="auth-loading"><span className="brand">TRAMA</span><p>Preparando seu espaço de trabalho…</p></main>;

  return session ? (
    <Workspace key={session.id} user={session} exit={signOut} onUserUpdated={setSession} />
  ) : (
    <>
      <Institutional enter={setEntryMode} />
      {entryMode && <DemoEntry mode={entryMode} close={() => setEntryMode('')} onSuccess={setSession} />}
    </>
  );
}
