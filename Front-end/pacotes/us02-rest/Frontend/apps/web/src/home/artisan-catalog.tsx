import { useEffect, useMemo, useState } from 'react';
import { MapPin, SlidersHorizontal, X } from 'lucide-react';
import { getArtesaos, type Artesao } from '@/services/artesaosService';
import { getApiErrorMessage } from '@/services/api';

type ArtisanPiece = {
  id: string;
  name: string;
  technique: string;
  municipality: string;
  description: string;
};

const demoPieces: ArtisanPiece[] = [
  { id: 'demo-1', name: 'Caminho de mesa em renascença', technique: 'Renda Renascença', municipality: 'Pesqueira', description: 'Peça artesanal com trabalho delicado em renda.' },
  { id: 'demo-2', name: 'Blusa em renda renascença', technique: 'Renda Renascença', municipality: 'Caruaru', description: 'Criação têxtil com acabamento manual.' },
  { id: 'demo-3', name: 'Vaso de barro', technique: 'Cerâmica/Barro', municipality: 'Caruaru', description: 'Cerâmica artesanal inspirada na cultura pernambucana.' },
  { id: 'demo-4', name: 'Escultura em barro', technique: 'Cerâmica/Barro', municipality: 'Olinda', description: 'Peça modelada e finalizada manualmente.' },
  { id: 'demo-5', name: 'Bordado floral', technique: 'Bordado de Passira', municipality: 'Passira', description: 'Bordado manual com motivos florais.' },
  { id: 'demo-6', name: 'Almofada de fuxico', technique: 'Fuxico', municipality: 'Recife', description: 'Composição artesanal feita com retalhos.' },
  { id: 'demo-7', name: 'Colcha de fuxico', technique: 'Fuxico', municipality: 'Santa Cruz do Capibaribe', description: 'Peça têxtil composta por pequenos módulos.' },
  { id: 'demo-8', name: 'Tecido manual', technique: 'Tecelagem Manual', municipality: 'Toritama', description: 'Tecido produzido em processo artesanal.' },
  { id: 'demo-9', name: 'Bolsa em tear', technique: 'Tecelagem Manual', municipality: 'Recife', description: 'Acessório produzido com trama manual.' },
];

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function toCatalogItem(artisan: Artesao): ArtisanPiece {
  return {
    id: artisan.id,
    name: artisan.produtoDestaque || artisan.nome,
    technique: artisan.especialidade || 'Produção artesanal',
    municipality: artisan.municipio || 'Localidade não informada',
    description: artisan.descricao || `Cadastro de ${artisan.nome} na rede de artesãos da TRAMA.`,
  };
}

export function ArtisanCatalog() {
  const [pieces, setPieces] = useState<ArtisanPiece[]>(demoPieces);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    getArtesaos(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setPieces(data.map(toCatalogItem));
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setApiError(getApiErrorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const techniques = useMemo(() => Array.from(new Set(pieces.map((piece) => piece.technique))).sort(), [pieces]);
  const municipalities = useMemo(() => Array.from(new Set(pieces.map((piece) => piece.municipality))).sort(), [pieces]);
  const filteredPieces = useMemo(() => pieces.filter((piece) => {
    const matchesTechnique = selectedTechniques.length === 0 || selectedTechniques.includes(piece.technique);
    const matchesMunicipality = selectedMunicipalities.length === 0 || selectedMunicipalities.includes(piece.municipality);
    return matchesTechnique && matchesMunicipality;
  }), [pieces, selectedTechniques, selectedMunicipalities]);
  const clearFilters = () => { setSelectedTechniques([]); setSelectedMunicipalities([]); };

  return (
    <section id="artesanato" className="artisan-catalog" aria-labelledby="artisan-catalog-title">
      <div className="artisan-catalog-heading">
        <span className="eyebrow">05 / IDENTIDADE CULTURAL PERNAMBUCANA</span>
        <h2 id="artisan-catalog-title">Saberes que se transformam em peças.</h2>
        <p>Explore os artesãos cadastrados por técnica e localidade.</p>
      </div>
      <div className="artisan-catalog-layout">
        <aside className="artisan-filter-panel" aria-label="Filtros do catálogo">
          <div className="artisan-filter-title"><SlidersHorizontal size={18} /><h3>Filtrar catálogo</h3></div>
          <fieldset>
            <legend>Técnicas artesanais</legend>
            {techniques.map((technique) => (
              <label className="artisan-filter-option" key={technique}>
                <input type="checkbox" checked={selectedTechniques.includes(technique)}
                  onChange={() => setSelectedTechniques((current) => toggleValue(current, technique))} />
                <span>{technique}</span>
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Municípios e polos</legend>
            {municipalities.map((municipality) => (
              <label className="artisan-filter-option" key={municipality}>
                <input type="checkbox" checked={selectedMunicipalities.includes(municipality)}
                  onChange={() => setSelectedMunicipalities((current) => toggleValue(current, municipality))} />
                <span>{municipality}</span>
              </label>
            ))}
          </fieldset>
          <button className="artisan-clear-button" type="button" onClick={clearFilters}><X size={15} /> Limpar filtros</button>
        </aside>
        <div className="artisan-results" aria-live="polite">
          <div className="artisan-results-summary">
            <strong>{filteredPieces.length}</strong>
            <span>{filteredPieces.length === 1 ? 'cadastro encontrado' : 'cadastros encontrados'}</span>
            {loading && <span className="ml-auto text-xs">Sincronizando com a API…</span>}
            {!loading && apiError && <span className="ml-auto text-xs text-amber-800">API indisponível; exibindo dados locais.</span>}
            {(selectedTechniques.length > 0 || selectedMunicipalities.length > 0) && (
              <button type="button" onClick={clearFilters}>Limpar seleção</button>
            )}
          </div>
          {apiError && <p className="mb-3 text-xs text-amber-800" role="status">{apiError}</p>}
          {filteredPieces.length > 0 ? (
            <div className="artisan-product-grid">
              {filteredPieces.map((piece) => (
                <article className="artisan-product-card" key={piece.id}>
                  <span className="artisan-product-technique">{piece.technique}</span>
                  <h3>{piece.name}</h3><p>{piece.description}</p>
                  <div className="artisan-product-location"><MapPin size={15} /> {piece.municipality} - PE</div>
                </article>
              ))}
            </div>
          ) : (
            <div className="artisan-empty-state">
              <h3>Nenhum cadastro encontrado</h3>
              <p>Não há artesãos cadastrados que correspondam à combinação selecionada.</p>
              <button type="button" onClick={clearFilters}>Ver todos os cadastros</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
