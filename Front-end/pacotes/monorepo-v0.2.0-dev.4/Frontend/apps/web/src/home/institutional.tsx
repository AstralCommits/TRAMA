import { useState } from 'react';
import {
  ArrowUpRight,
  ChartNoAxesCombined,
  Layers,
  Menu,
  Scissors,
  Sprout,
  X,
} from 'lucide-react';
import { banner } from '@/data/demo';
import { ArtisanCatalog } from './artisan-catalog';

const navigation = [
  ['Início', 'inicio'],
  ['Sobre nós', 'sobre'],
  ['Conheça a TRAMA', 'plataforma'],
  ['Método', 'metodo'],
  ['Como funciona', 'como'],
  ['Benefícios', 'beneficios'],
  ['Cultura local', 'artesanato'],
];

const features = [
  {
    icon: ChartNoAxesCombined,
    title: 'Enxergue suas vendas',
    description: 'Acompanhe faturamento, peças vendidas e categorias com indicadores que ajudam a entender o ritmo da sua confecção.',
  },
  {
    icon: Layers,
    title: 'Organize seus dados de vendas',
    description: 'Registre totais mensais de peças e faturamento por categoria, identificando a origem e a procedência das informações.',
  },
  {
    icon: Sprout,
    title: 'Decida com mais clareza',
    description: 'Compare categorias e períodos, observe tendências e simule hipóteses com base nos dados históricos da própria confecção.',
  },
];

export function Institutional({ enter }: { enter: (mode: string) => void }) {
  const [menu, setMenu] = useState(false);
  const closeMenu = () => setMenu(false);

  return (
    <>
      <img className="regional-banner" src={banner} alt="" aria-hidden="true" />
      <header className="site-nav">
        <a className="site-logo-link" href="#inicio" aria-label="TRAMA — início" onClick={closeMenu}>
          <img src="/images/trama-logo.png" alt="TRAMA — Tecendo relações no mercado do Agreste" />
        </a>
        <button
          className="mobile-toggle site-mobile-toggle"
          aria-label={menu ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
          type="button"
        >
          {menu ? <X /> : <Menu />}
        </button>
        <nav className={menu ? 'open' : ''} aria-label="Navegação principal">
          {navigation.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={closeMenu}>{label}</a>
          ))}
          <button className="text-button site-login" type="button" onClick={() => { closeMenu(); enter('Entrar'); }}>
            Entrar
          </button>
          <button className="site-signup" type="button" onClick={() => { closeMenu(); enter('Cadastrar-se'); }}>
            Cadastrar-se <ArrowUpRight size={16} />
          </button>
        </nav>
      </header>

      <main className="site-main">

        <section id="inicio" className="hero">
          <div className="eyebrow"><span /> FEITA NO AGRESTE. PENSADA PARA VOCÊ.</div>
          <h1>Entenda suas vendas.<br /><em>Descubra novas possibilidades.</em></h1>
          <p>
            Informação clara para quem faz a moda acontecer.<br />
            Inteligência comercial para confecções do Agreste.
          </p>
          <div className="hero-actions">
            <button type="button" onClick={() => enter('Cadastrar-se')}>
              Começar agora <ArrowUpRight size={18} />
            </button>
            <a className="outline-button" href="#plataforma">Conhecer a plataforma</a>
          </div>
          <button className="demo-link" type="button" onClick={() => enter('Entrar na demonstração')}>
            Entrar na demonstração <span>→</span>
          </button>
          <div className="hero-bottom">
            <span>SANTA CRUZ DO CAPIBARIBE</span>
            <span className="star">✳</span>
            <span>TORITAMA</span>
            <span className="star">✳</span>
            <span>CARUARU</span>
          </div>
          <div className="stitch-tag">
            <Scissors size={24} />
            <span>Raízes locais.<br /><strong>Novas possibilidades.</strong></span>
          </div>
        </section>

        <section id="sobre" className="story story-origin">
          <div>
            <span className="eyebrow">01 / NOSSA ORIGEM</span>
            <h2>A força é daqui.<br />O futuro também.</h2>
          </div>
          <div className="story-copy">
            <p>O Agreste sabe transformar trabalho em oportunidade. A TRAMA nasce desse jeito de fazer: com os pés no chão, respeito por quem produz e informação que ajuda a decidir.</p>
            <p>Uma plataforma pensada para confecções e facções do Polo Têxtil do Agreste — para organizar dados de vendas e apoiar decisões com mais clareza.</p>
            <a href="#como" className="inline-link">Conheça nosso jeito de trabalhar <ArrowUpRight size={15} /></a>
          </div>
        </section>

        <section id="plataforma" className="platform">
          <div className="platform-heading">
            <div>
              <span className="eyebrow">02 / CONHEÇA A TRAMA</span>
              <h2>Seus dados de vendas.<br />Sem perder o fio.</h2>
            </div>
            <p>Uma leitura simples dos lançamentos mensais, do faturamento e do desempenho por categoria — sem prometer previsões nem substituir sua experiência.</p>
          </div>
          <div className="offers">
            {features.map(({ icon: Icon, title, description }, index) => (
              <article key={title}>
                <div className="offer-index">0{index + 1}</div>
                <Icon size={30} strokeWidth={1.6} />
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="metodo" className="method">
          <div className="method-heading">
            <span className="eyebrow">03 / NOSSO MÉTODO</span>
            <h2>Conhecer. Conectar.<br /><em>Crescer.</em></h2>
            <p>Primeiro, entendemos sua rotina. Depois, conectamos as informações. Assim, cada decisão ganha contexto — sem prometer resultados ou substituir sua experiência.</p>
          </div>
          <div className="method-steps">
            <article><span>01</span><h3>Crie seu espaço</h3><p>Cadastre sua conta e informe os dados da sua confecção.</p></article>
            <article><span>02</span><h3>Registre suas vendas</h3><p>Informe os totais mensais de peças e faturamento por categoria, com fonte e procedência dos dados.</p></article>
            <article><span>03</span><h3>Acompanhe e decida</h3><p>Use indicadores, tendências e simulações para apoiar suas escolhas.</p></article>
          </div>
        </section>

        <section id="como" className="story how-it-works">
          <div>
            <span className="eyebrow">04 / COMO FUNCIONA</span>
            <h2>Do seu jeito,<br />passo a passo.</h2>
          </div>
          <ol>
            <li>Crie sua conta ou entre na demonstração.</li>
            <li>Cadastre e consulte os lançamentos mensais de vendas da sua confecção.</li>
            <li>Acompanhe indicadores e use as análises para apoiar suas decisões.</li>
          </ol>
        </section>

        <ArtisanCatalog />

        <section id="beneficios" className="closing">
          <div className="closing-content">
            <span className="eyebrow">MAIS CLAREZA. MENOS PONTAS SOLTAS.</span>
            <h2>O próximo capítulo do seu negócio começa aqui.</h2>
            <p>Uma plataforma feita para acompanhar a força de quem movimenta o mercado têxtil do Agreste.</p>
            <div className="closing-actions">
              <button type="button" onClick={() => enter('Cadastrar-se')}>Criar minha conta <ArrowUpRight size={18} /></button>
              <button type="button" className="outline-button" onClick={() => enter('Entrar na demonstração')}>Conhecer a demonstração</button>
            </div>
          </div>
          <div className="closing-seal" aria-hidden="true">
            <Scissors size={34} /><span>TRAMA</span>
            <small>TECENDO RELAÇÕES<br />NO MERCADO DO AGRESTE</small>
          </div>
        </section>
      </main>
    </>
  );
}
