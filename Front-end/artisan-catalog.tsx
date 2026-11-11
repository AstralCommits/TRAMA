import { useMemo, useState } from 'react';
import { ArrowUpRight, Brush, Hand, Shapes } from 'lucide-react';
import { QuoteModal } from '@/home/quote-modal';

const techniques = ['Todas', 'Renda renascença', 'Cerâmica', 'Xilogravura'] as const;
type Technique = typeof techniques[number];

const pieces = [
  { id: 1, name: 'Caminho de mesa em renda', master: 'Mestres da renda renascença', technique: 'Renda renascença', place: 'Poção · Pesqueira', description: 'Trabalho manual delicado, feito ponto a ponto.' },
  { id: 2, name: 'Centro de mesa rendado', master: 'Mestres da renda renascença', technique: 'Renda renascença', place: 'Poção · Pesqueira', description: 'Peça artesanal para decoração e composição de mesa.' },
  { id: 3, name: 'Vaso de barro natural', master: 'Mestres ceramistas', technique: 'Cerâmica', place: 'Alto do Moura · Caruaru', description: 'Cerâmica moldada e finalizada artesanalmente.' },
  { id: 4, name: 'Conjunto de potes', master: 'Mestres ceramistas', technique: 'Cerâmica', place: 'Alto do Moura · Caruaru', description: 'Peças utilitárias com identidade regional.' },
  { id: 5, name: 'Prato decorativo', master: 'Mestres ceramistas', technique: 'Cerâmica', place: 'Alto do Moura · Caruaru', description: 'Peça decorativa produzida em barro.' },
  { id: 6, name: 'Gravura Feira do Agreste', master: 'Mestres xilogravuristas', technique: 'Xilogravura', place: 'Bezerros · Pernambuco', description: 'Impressão artesanal com matriz entalhada em madeira.' },
  { id: 7, name: 'Gravura Paisagem Sertaneja', master: 'Mestres xilogravuristas', technique: 'Xilogravura', place: 'Bezerros · Pernambuco', description: 'Composição inspirada nas paisagens do interior.' },
];

const icons = {
  'Renda renascença': Hand,
  Cerâmica: Shapes,
  Xilogravura: Brush,
} as const;

export function ArtisanCatalog() {
  const [selected, setSelected] = useState<Technique>('Todas');
  const [quoteProduct, setQuoteProduct] = useState('');
  const counts = useMemo(() => ({
    'Renda renascença': pieces.filter((piece) => piece.technique === 'Renda renascença').length,
    Cerâmica: pieces.filter((piece) => piece.technique === 'Cerâmica').length,
    Xilogravura: pieces.filter((piece) => piece.technique === 'Xilogravura').length,
  }), []);
  const visiblePieces = useMemo(
    () => selected === 'Todas' ? pieces : pieces.filter((piece) => piece.technique === selected),
    [selected],
  );

  return (
    <section className="artisan-catalog" id="artesanato">
      <div className="artisan-heading">
        <div>
          <span className="eyebrow">07 / POLOS E SABERES DO AGRESTE</span>
          <h2>Feito à mão.<br /><em>Feito daqui.</em></h2>
        </div>
        <p>Explore técnicas que atravessam gerações e conheça peças produzidas por mestres artesãos de Pernambuco.</p>
      </div>
      <div className="artisan-filter" aria-label="Filtrar catálogo por técnica artesanal">
        <div className="artisan-filter-copy">
          <strong>Explore por técnica</strong>
          <span>{visiblePieces.length} {visiblePieces.length === 1 ? 'peça disponível' : 'peças disponíveis'}</span>
        </div>
        <div className="artisan-filter-options">
          {techniques.map((technique) => {
            const count = technique === 'Todas' ? pieces.length : counts[technique];
            return (
              <button
                type="button"
                key={technique}
                className={selected === technique ? 'artisan-filter-button selected' : 'artisan-filter-button'}
                aria-pressed={selected === technique}
                onClick={() => setSelected(technique)}
              >
                {technique}<span>{count}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="artisan-grid" aria-live="polite">
        {visiblePieces.map((piece) => {
          const Icon = icons[piece.technique as keyof typeof icons];
          return (
            <article className="artisan-card" key={piece.id}>
              <div className={`artisan-card-art ${piece.technique === 'Cerâmica' ? 'ceramic-art' : piece.technique === 'Xilogravura' ? 'woodcut-art' : 'lace-art'}`}>
                <Icon size={42} strokeWidth={1.15} />
                <span>{piece.technique}</span>
              </div>
              <div className="artisan-card-copy">
                <small>{piece.place}</small>
                <h3>{piece.name}</h3>
                <p>{piece.description}</p>
                <div className="artisan-card-footer">
                  <span>{piece.master}</span>
                  <button type="button" className="artisan-quote-link" onClick={() => setQuoteProduct(piece.name)}>
                    Solicitar orçamento <ArrowUpRight size={15} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="artisan-b2b">
        <div><span className="eyebrow">PARA EMPRESAS E EVENTOS</span><h3>Seu próximo pedido corporativo começa aqui.</h3><p>Solicite orçamento para brindes, presentes e encomendas artesanais em lote.</p></div>
        <button type="button" onClick={() => setQuoteProduct('Brindes artesanais corporativos')}>Solicitar orçamento em lote <ArrowUpRight size={17} /></button>
      </div>
      {quoteProduct && <QuoteModal initialProduct={quoteProduct} onClose={() => setQuoteProduct('')} />}
    </section>
  );
}
