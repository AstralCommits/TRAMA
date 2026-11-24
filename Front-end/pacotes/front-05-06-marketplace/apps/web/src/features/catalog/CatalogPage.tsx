import { useMemo, useState } from 'react';
import { Package } from 'lucide-react';
import { marketplaceNavigation, ResponsiveDrawer } from '@/features/shared/ResponsiveDrawer';
import { mockCatalogProducts, type CatalogProduct } from './data/mockProducts';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#D7C1A2] bg-white shadow-sm">
      <div className="aspect-[4/3] w-full overflow-hidden bg-[#E3CEAD]">
        {product.image ? (
          <img
            src={product.image}
            alt={product.imageAlt || product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-[#594638]">
            <Package aria-hidden="true" size={32} />
            <span className="text-sm font-semibold">Imagem do produto</span>
            <span className="text-xs">Prévia demonstrativa</span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#747A51]">
          {product.category}
        </p>
        <h2 className="break-words text-lg font-bold leading-snug text-[#352219]">
          {product.name}
        </h2>
        <p className="mt-1 break-words text-sm text-[#594638]">
          {product.collection}
        </p>
        <p className="mt-3 text-lg font-bold text-[#8E3D25]">
          {formatCurrency(product.price)}
        </p>
        <p className="mt-3 rounded-md bg-[#F7F0E4] px-3 py-2 text-xs text-[#594638]">
          Produto de demonstração
        </p>
      </div>
    </article>
  );
}

export function CatalogPage() {
  const [selectedCollection, setSelectedCollection] = useState('Todas');

  const collections = useMemo(() => [
    'Todas',
    ...new Set(mockCatalogProducts.map((product) => product.collection)),
  ], []);

  const visibleProducts = useMemo(() => (
    selectedCollection === 'Todas'
      ? mockCatalogProducts
      : mockCatalogProducts.filter((product) => product.collection === selectedCollection)
  ), [selectedCollection]);

  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-[#FAF3E7] text-[#352219]">
      <ResponsiveDrawer items={marketplaceNavigation} activeItem="catalogo" />

      <main className="mx-auto w-full max-w-7xl px-4 py-7 xs:px-5 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-7 max-w-3xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8E3D25] sm:text-sm">
            Marketplace têxtil · Agreste pernambucano
          </p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            Catálogo de produtos
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#594638]">
            Explore produtos organizados por coleção e conheça peças de quem produz no Agreste.
          </p>
          <p className="mt-4 rounded-lg border border-[#D7C1A2] bg-[#F2E5D0] p-3 text-sm leading-relaxed text-[#594638]">
            Esta é uma prévia demonstrativa. Os nomes, preços e coleções exibidos são dados fictícios, não ofertas reais.
          </p>
        </header>

        <section aria-labelledby="catalog-collections-title">
          <h2 id="catalog-collections-title" className="mb-4 text-xl font-bold">
            Coleções
          </h2>

          <div
            className="mb-6 flex flex-wrap gap-2"
            role="group"
            aria-label="Filtrar produtos por coleção"
          >
            {collections.map((collection) => {
              const selected = selectedCollection === collection;
              return (
                <button
                  key={collection}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedCollection(collection)}
                  className={[
                    'inline-flex min-h-[44px] max-w-full items-center justify-center rounded-full border px-4 py-2',
                    'text-sm font-semibold focus-visible:outline focus-visible:outline-2',
                    'focus-visible:outline-offset-2 focus-visible:outline-[#B84E2C]',
                    selected
                      ? 'border-[#8E3D25] bg-[#8E3D25] text-white'
                      : 'border-[#D7C1A2] bg-white text-[#352219] hover:bg-[#E3CEAD]',
                  ].join(' ')}
                >
                  <span className="break-words">{collection}</span>
                </button>
              );
            })}
          </div>

          <p className="mb-4 text-sm text-[#594638]" aria-live="polite" aria-atomic="true">
            {visibleProducts.length} {visibleProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>

          {visibleProducts.length === 0 ? (
            <div className="rounded-xl border border-[#D7C1A2] bg-white p-6 text-center">
              <p className="font-semibold">Nenhum produto nesta coleção.</p>
            </div>
          ) : (
            <div className="grid min-w-0 grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
