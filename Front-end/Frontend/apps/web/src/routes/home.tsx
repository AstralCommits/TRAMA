import { useEffect, useState } from 'react';
import type { Route } from './+types/home';
import { seo } from '@/lib/seo';
import { banner } from '@/data/demo';
import { Institutional } from '@/home/institutional';
import { DemoEntry } from '@/home/demo-entry';
import { Workspace } from '@/home/workspace';
import { clearSession, getSession, type TramaUser } from '@/lib/auth.client';

export function meta({ matches, location }: Route.MetaArgs) {
  return seo({ matches, location }, {
    title: 'TRAMA — Gestão que conecta o Agreste',
    description: 'Gestão e inteligência comercial para confecções do Agreste pernambucano: vendas, estoque, produção, indicadores e tendências.',
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
    setSession(getSession());
    setReady(true);
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
