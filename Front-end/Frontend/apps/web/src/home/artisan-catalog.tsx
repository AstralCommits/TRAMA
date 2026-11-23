import { useMemo, useState } from 'react';
import { MapPin, SlidersHorizontal, X } from 'lucide-react';

type Technique = 'Renda Renascença' | 'Cerâmica/Barro' | 'Bordado de Passira' | 'Fuxico' | 'Tecelagem Manual';
type Municipality = 'Caruaru' | 'Toritama' | 'Santa Cruz do Capibaribe' | 'Olinda' | 'Recife' | 'Pesqueira' | 'Passira';
type ArtisanPiece = { id: number; name: string; technique: Technique; municipality: Municipality; description: string };

const techniques: Technique[] = ['Renda Renascença', 'Cerâmica/Barro', 'Bordado de Passira', 'Fuxico', 'Tecelagem Manual'];
const municipalities: Municipality[] = ['Caruaru', 'Toritama', 'Santa Cruz do Capibaribe', 'Olinda', 'Recife', 'Pesqueira', 'Passira'];

// Dados demonstrativos locais; podem ser substituídos por dados reais da API.
const artisanPieces: ArtisanPiece[] = [
  { id: 1, name: 'Caminho de mesa em renascença', technique: 'Renda Renascença', municipality: 'Pesqueira', description: 'Peça artesanal com trabalho delicado em renda.' },
  { id: 2, name: 'Blusa em renda renascença', technique: 'Renda Renascença', municipality: 'Caruaru', description: 'Criação têxtil com acabamento manual.' },
  { id: 3, name: 'Vaso de barro', technique: 'Cerâmica/Barro', municipality: 'Caruaru', description: 'Cerâmica artesanal inspirada na cultura pernambucana.' },
  { id: 4, name: 'Escultura em barro', technique: 'Cerâmica/Barro', municipality: 'Olinda', description: 'Peça modelada e finalizada manualmente.' },
  { id: 5, name: 'Bordado floral', technique: 'Bordado de Passira', municipality: 'Passira', description: 'Bordado manual com motivos florais.' },
  { id: 6, name: 'Almofada de fuxico', technique: 'Fuxico', municipality: 'Recife', description: 'Composição artesanal feita com retalhos.' },
  { id: 7, name: 'Colcha de fuxico', technique: 'Fuxico', municipality: 'Santa Cruz do Capibaribe', description: 'Peça têxtil composta por pequenos módulos.' },
  { id: 8, name: 'Tecido manual', technique: 'Tecelagem Manual', municipality: 'Toritama', description: 'Tecido produzido em processo artesanal.' },
  { id: 9, name: 'Bolsa em tear', technique: 'Tecelagem Manual', municipality: 'Recife', description: 'Acessório produzido com trama manual.' },
];

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function ArtisanCatalog() {
  const [selectedTechniques, setSelectedTechniques] = useState<Technique[]>([]);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState<Municipality[]>([]);
  const filteredPieces = useMemo(() => artisanPieces.filter((piece) => {
    const matchesTechnique = selectedTechniques.length === 0 || selectedTechniques.includes(piece.technique);
    const matchesMunicipality = selectedMunicipalities.length === 0 || selectedMunicipalities.includes(piece.municipality);
    return matchesTechnique && matchesMunicipality;
  }), [selectedTechniques, selectedMunicipalities]);
  const clearFilters = () => { setSelectedTechniques([]); setSelectedMunicipalities([]); };

  return (
    <section id="artesanato" className="artisan-catalog" aria-labelledby="artisan-catalog-title">
      <div className="artisan-catalog-heading">
        <span className="eyebrow">05 / IDENTIDADE CULTURAL PERNAMBUCANA</span>
        <h2 id="artisan-catalog-title">Saberes que se transformam em peças.</h2>
        <p>Explore a produção artesanal por técnica e localidade.</p>
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
            <span>{filteredPieces.length === 1 ? 'produto encontrado' : 'produtos encontrados'}</span>
            {(selectedTechniques.length > 0 || selectedMunicipalities.length > 0) && (
              <button type="button" onClick={clearFilters}>Limpar seleção</button>
            )}
          </div>
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
              <h3>Nenhum produto encontrado</h3>
              <p>Não há peças demonstrativas que correspondam à combinação selecionada.</p>
              <button type="button" onClick={clearFilters}>Ver todos os produtos</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
