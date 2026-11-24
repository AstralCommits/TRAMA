import { ArrowLeft, MapPin, Scissors } from 'lucide-react';
import { Link } from 'react-router';
import { demoCraft } from '../data/demoCraft';
import { CraftGallery } from './CraftGallery';

export function CraftDetailPage() {
  const craft = demoCraft;

  return (
    <main className="craft-detail-page">
      <header className="craft-detail-header">
        <Link to="/" className="craft-back-link"><ArrowLeft size={17} /> Voltar à TRAMA</Link>
        <a href="/" className="craft-detail-brand" aria-label="TRAMA — início">
          <img src="/images/trama-logo.png" alt="TRAMA" />
        </a>
        <Link to="/apoio/cadastro" className="craft-support-link">Seja uma empresa apoiadora</Link>
      </header>

      <div className="craft-detail-container">
        <nav className="craft-breadcrumb" aria-label="Navegação estrutural">
          <Link to="/">Início</Link><span aria-hidden="true">/</span><span>Artesanato</span>
        </nav>

        <div className="craft-detail-grid">
          <div>
            <CraftGallery images={craft.images} productName={craft.title} />
            <p className="craft-image-disclaimer">{craft.imageNotice}</p>
          </div>

          <article className="craft-detail-copy">
            <span className="eyebrow">{craft.category.toLocaleUpperCase('pt-BR')}</span>
            <h1>{craft.title}</h1>
            <p className="craft-detail-description">{craft.description}</p>

            <div className="craft-detail-meta">
              <div><Scissors size={18} /><span><small>Técnica artesanal</small><strong>{craft.technique}</strong></span></div>
              <div><MapPin size={18} /><span><small>Região</small><strong>Agreste pernambucano</strong></span></div>
            </div>

            <div className="craft-zoom-info">
              <strong>Observe cada detalhe</strong>
              <p>No computador, mova o cursor sobre a fotografia para ampliar a região em 2,5×. No celular, deslize a imagem para navegar ou escolha uma miniatura.</p>
            </div>

            <a className="craft-contact-cta" href="/apoio/cadastro">Conheça a rede de empresas apoiadoras</a>
          </article>
        </div>
      </div>
    </main>
  );
}
