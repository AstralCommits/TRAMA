import { useEffect, useState } from 'react';
import { ImageOff, LoaderCircle, Package, RefreshCw } from 'lucide-react';
import { getProdutos, type Produto } from '@/services/produtosService';
import { getApiErrorMessage } from '@/services/api';

function formatPrice(price?: number): string | null {
  if (price === undefined || !Number.isFinite(price)) return null;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
}

export function ProductCatalog() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    getProdutos(controller.signal)
      .then((data) => setProdutos(data))
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setProdutos([]);
          setError(getApiErrorMessage(caught));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  return (
    <section id="produtos" className="bg-[#f6f1e7] px-5 py-16 sm:px-8 lg:px-[7%]" aria-labelledby="product-catalog-title">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-9 max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">Catálogo / Produtos</span>
          <h2 id="product-catalog-title" className="mt-4 text-3xl font-semibold leading-tight text-stone-900 sm:text-4xl">Produtos disponíveis na TRAMA.</h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">Explore os produtos cadastrados pelos fornecedores e confecções da plataforma.</p>
        </div>

        {loading && (
          <div className="flex min-h-40 items-center justify-center gap-3 rounded-lg border border-stone-200 bg-white text-sm text-stone-600" role="status" aria-live="polite">
            <LoaderCircle className="h-5 w-5 animate-spin text-amber-800" aria-hidden="true" />
            Carregando produtos…
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto flex max-w-2xl flex-col items-center rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center" role="alert">
            <p className="font-semibold text-red-900">Não foi possível carregar o catálogo.</p>
            <p className="mt-2 text-sm text-red-800">{error}</p>
            <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="mt-5 inline-flex items-center gap-2 rounded-md bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900">
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && produtos.length === 0 && (
          <div className="rounded-lg border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
            <Package className="mx-auto h-8 w-8 text-stone-400" aria-hidden="true" />
            <p className="mt-3 font-semibold text-stone-800">Nenhum produto cadastrado ainda.</p>
            <p className="mt-1 text-sm text-stone-500">Quando houver produtos disponíveis, eles aparecerão aqui.</p>
          </div>
        )}

        {!loading && !error && produtos.length > 0 && (
          <>
            <p className="mb-4 text-sm text-stone-600" aria-live="polite">{produtos.length} {produtos.length === 1 ? 'produto encontrado' : 'produtos encontrados'}</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {produtos.map((produto) => (
                <article key={produto.id} className="flex min-h-[250px] flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  {produto.imagemUrl ? (
                    <img src={produto.imagemUrl} alt={produto.nome} loading="lazy" className="h-40 w-full bg-stone-100 object-cover" />
                  ) : (
                    <div role="img" className="flex h-40 items-center justify-center bg-stone-100 text-stone-400" aria-label="Produto sem imagem">
                      <ImageOff className="h-8 w-8" aria-hidden="true" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    {produto.categoria && <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">{produto.categoria}</span>}
                    <h3 className="mt-2 text-lg font-semibold text-stone-900">{produto.nome}</h3>
                    {produto.descricao && <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">{produto.descricao}</p>}
                    <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                      {formatPrice(produto.preco) ? <strong className="text-base text-stone-900">{formatPrice(produto.preco)}</strong> : <span className="text-xs text-stone-500">Consulte o fornecedor</span>}
                      {produto.estoque !== undefined && <span className="text-xs text-stone-500">Estoque: {produto.estoque}</span>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
