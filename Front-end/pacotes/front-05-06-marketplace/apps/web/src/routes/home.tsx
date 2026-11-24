import { useEffect, useState } from 'react';
import type { Route } from './+types/home';
import { seo } from '@/lib/seo';
import { banner } from '@/data/demo';
import { Institutional } from '@/home/institutional';
import { DemoEntry } from '@/home/demo-entry';
import { Workspace } from '@/home/workspace';

const DEMO_PROFILE_KEY = 'trama:demo-profile';

export function meta({ matches, location }: Route.MetaArgs) {
  return seo({ matches, location }, {
    title: 'TRAMA — Gestão que conecta o Agreste',
    description: 'Protótipo demonstrativo de gestão e inteligência comercial para confecções do Agreste pernambucano.',
    image: banner,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'TRAMA',
      description: 'Plataforma demonstrativa de gestão para a cadeia têxtil do Agreste.',
    },
  });
}

export default function HomePage() {
  const [entry, setEntry] = useState('');
  const [profile, setProfile] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(window.sessionStorage.getItem(DEMO_PROFILE_KEY) ?? '');
    setReady(true);
  }, []);

  const startDemo = (selectedProfile: string) => {
    window.sessionStorage.setItem(DEMO_PROFILE_KEY, selectedProfile);
    setProfile(selectedProfile);
    setEntry('');
    window.scrollTo(0, 0);
  };

  const exitDemo = () => {
    window.sessionStorage.removeItem(DEMO_PROFILE_KEY);
    setProfile('');
    setEntry('');
  };

  if (!ready) {
    return <main className="auth-loading" role="status"><span className="brand">TRAMA</span><p>Preparando a demonstração…</p></main>;
  }

  return profile
    ? <Workspace profile={profile} exit={exitDemo} />
    : <>
        <Institutional enter={setEntry} />
        {entry && <DemoEntry mode={entry} close={() => setEntry('')} start={startDemo} />}
      </>;
}
