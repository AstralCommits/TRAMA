import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArtisanSalesDashboard } from '@/features/artisan/ArtisanSalesDashboard';

const DEMO_PROFILE_KEY = 'trama:demo-profile';

export function meta() {
  return [
    { title: 'Painel do artesão — TRAMA' },
    { name: 'description', content: 'Painel demonstrativo de pedidos, produção e repasses para artesãos.' },
  ];
}

export default function ArtisanRoute() {
  const [profile, setProfile] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(window.sessionStorage.getItem(DEMO_PROFILE_KEY));
    setReady(true);
  }, []);

  if (!ready) {
    return <main className="mx-auto max-w-3xl px-4 py-12" role="status">Verificando o perfil demonstrativo…</main>;
  }

  if (profile !== 'Artesão') {
    return (
      <main className="mx-auto min-h-[70vh] max-w-3xl px-4 py-12 xs:px-5 sm:py-16">
        <section className="rounded-xl border border-[#D7C1A2] bg-[#FAF3E7] p-6 text-[#352219] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8E3D25]">Área demonstrativa</p>
          <h1 className="mt-2 text-2xl font-bold">Acesso ao painel do artesão</h1>
          <p className="mt-3 text-base leading-relaxed text-[#594638]">
            Para abrir esta prévia, volte à página inicial e entre na demonstração usando o perfil “Artesão”.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#594638]">
            O projeto ainda utiliza perfis simulados no navegador. Essa verificação serve apenas para separar as telas de demonstração e não substitui autenticação nem autorização no servidor.
          </p>
          <Link to="/" className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#352219] px-5 py-3 text-sm font-bold text-white hover:bg-[#8E3D25] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B84E2C]">
            Voltar à página inicial
          </Link>
        </section>
      </main>
    );
  }

  return <ArtisanSalesDashboard />;
}
