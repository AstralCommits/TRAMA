import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { marketplaceNavigation, ResponsiveDrawer } from '@/features/shared/ResponsiveDrawer';
import { mockArtisanOrdersApi, type ArtisanOrdersApi } from './services/artisanOrdersApi';
import { getOrderNumbers } from './utils/orderFinancials.mjs';
import type { ArtisanOrder, ProductionStatus } from './data/mockOrders';

const PRODUCTION_STATUSES: ProductionStatus[] = [
  'Recebido',
  'Em produção',
  'Pronto',
  'Enviado',
  'Entregue',
];

const productionBadgeClass: Record<ProductionStatus, string> = {
  Recebido: 'bg-blue-100 text-blue-900',
  'Em produção': 'bg-amber-100 text-amber-950',
  Pronto: 'bg-emerald-100 text-emerald-950',
  Enviado: 'bg-indigo-100 text-indigo-950',
  Entregue: 'bg-stone-200 text-stone-900',
};

function currentLocalMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(value: string) {

  return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');
}

type OrderStatusControlProps = {
  order: ArtisanOrder;
  saving: boolean;
  onChange: (orderId: string, status: ProductionStatus) => void;
};

function OrderStatusControl({ order, saving, onChange }: OrderStatusControlProps) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-[#352219] sm:flex-row sm:items-center">
      <span>Status da produção</span>
      <select
        value={order.productionStatus}
        disabled={saving}
        onChange={(event) => onChange(order.id, event.target.value as ProductionStatus)}
        className="min-h-[44px] w-full min-w-0 rounded-lg border border-[#CDB694] bg-white px-3 text-base text-[#352219] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      >
        {PRODUCTION_STATUSES.map((status) => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>
      {saving && <span role="status" className="text-xs font-medium text-[#59633D]">Salvando…</span>}
    </label>
  );
}

function OrderCard({
  order,
  saving,
  onStatusChange,
}: {
  order: ArtisanOrder;
  saving: boolean;
  onStatusChange: (orderId: string, status: ProductionStatus) => void;
}) {
  const numbers = getOrderNumbers(order);
  return (
    <article className="min-w-0 rounded-xl border border-[#D7C1A2] bg-white p-4">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[#8E3D25]">{order.id}</p>
          <h3 className="mt-1 break-words text-lg font-bold text-[#352219]">{order.productName}</h3>
          <p className="mt-1 break-words text-sm text-[#594638]">Cliente: {order.clientName}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${productionBadgeClass[order.productionStatus]}`}>
          {order.productionStatus}
        </span>
      </div>

      <dl className="mt-4 grid min-w-0 grid-cols-2 gap-3 border-y border-[#E7D9C4] py-4">
        <div className="min-w-0">
          <dt className="text-xs text-[#594638]">Quantidade</dt>
          <dd className="mt-1 font-semibold">{order.quantity} peça(s)</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-[#594638]">Data do pedido</dt>
          <dd className="mt-1 font-semibold">{formatDate(order.createdAt)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-[#594638]">Valor do pedido</dt>
          <dd className="mt-1 break-words font-bold">{formatCurrency(numbers.gross)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-[#594638]">Repasse ({numbers.percentage}%)</dt>
          <dd className="mt-1 break-words font-bold text-[#59633D]">{formatCurrency(numbers.payout)}</dd>
          <p className="mt-1 text-xs text-[#594638]">Mínimo de 85%: {formatCurrency(numbers.gross * 0.85)}</p>
        </div>
        <div className="col-span-2 min-w-0">
          <dt className="text-xs text-[#594638]">Situação financeira</dt>
          <dd className="mt-1 font-semibold">{order.payoutStatus}</dd>
        </div>
      </dl>

      <div className="pt-4">
        <OrderStatusControl order={order} saving={saving} onChange={onStatusChange} />
      </div>
    </article>
  );
}

export function ArtisanSalesDashboard({ api = mockArtisanOrdersApi }: { api?: ArtisanOrdersApi }) {
  const [month, setMonth] = useState(currentLocalMonth);
  const [orders, setOrders] = useState<ArtisanOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setFeedback('');
      const result = await api.listOrders({ month });
      if (!Array.isArray(result)) throw new TypeError('A fonte de pedidos não retornou uma lista válida.');
      setOrders(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os pedidos.');
    } finally {
      setLoading(false);
    }
  }, [api, month]);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  const monthOrders = useMemo(
    () => orders.filter((order) => String(order.createdAt).startsWith(month)),
    [orders, month],
  );

  const summary = useMemo(() => monthOrders.reduce((totals, order) => {
    const numbers = getOrderNumbers(order);
    totals.sales += numbers.gross;
    totals.expectedPayout += numbers.payout;
    if (order.payoutStatus === 'Repassado') totals.transferred += numbers.payout;
    else totals.receivable += numbers.payout;
    if (!numbers.validPercentage) totals.invalidPercentageOrders += 1;
    return totals;
  }, {
    sales: 0,
    expectedPayout: 0,
    transferred: 0,
    receivable: 0,
    invalidPercentageOrders: 0,
  }), [monthOrders]);

  async function handleStatusChange(orderId: string, newStatus: ProductionStatus) {
    try {
      setSavingOrderId(orderId);
      setError('');
      setFeedback('');
      const updatedOrder = await api.updateProductionStatus(orderId, newStatus);
      setOrders((current) => current.map((order) => (
        order.id === orderId ? { ...order, ...updatedOrder } : order
      )));
      setFeedback(`Status do pedido ${orderId} atualizado.`);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Não foi possível atualizar o status. Tente novamente.');
    } finally {
      setSavingOrderId(null);
    }
  }

  const summaryCards = [
    { title: 'Vendas do mês', value: formatCurrency(summary.sales), description: `${monthOrders.length} pedido(s) no período` },
    { title: 'Valor a receber', value: formatCurrency(summary.receivable), description: 'Pedidos ainda não marcados como repassados' },
    { title: 'Total repassado', value: formatCurrency(summary.transferred), description: 'Pedidos marcados como repassados' },
  ];

  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-[#FAF3E7] text-[#352219]">
      <ResponsiveDrawer items={marketplaceNavigation} activeItem="painel-artesao" />

      <main className="mx-auto w-full max-w-7xl px-4 py-7 xs:px-5 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-7 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8E3D25] sm:text-sm">Área do artesão</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Vendas e encomendas</h1>
          <p className="mt-3 text-base leading-relaxed text-[#594638]">
            Consulte os pedidos do período, acompanhe a produção e confira os valores previstos e já repassados.
          </p>
          <p className="mt-4 rounded-lg border border-[#D7C1A2] bg-[#F2E5D0] p-3 text-sm leading-relaxed text-[#594638]">
            Dados demonstrativos. As atualizações ficam em memória e não são gravadas em um servidor.
          </p>
        </header>

        <section className="mb-7 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label htmlFor="artisan-month-filter" className="font-semibold">Filtrar por mês</label>
          <input
            id="artisan-month-filter"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            className="min-h-[44px] w-full max-w-full rounded-lg border border-[#CDB694] bg-white px-3 text-base text-[#352219] sm:w-auto"
          />
        </section>

        {error && (
          <div role="alert" className="mb-5 flex flex-col gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-start gap-2"><AlertCircle aria-hidden="true" size={18} className="mt-0.5 shrink-0" />{error}</span>
            <button type="button" onClick={() => void loadOrders()} className="min-h-[44px] rounded-lg border border-red-300 px-4 font-semibold hover:bg-red-100">Tentar novamente</button>
          </div>
        )}

        {feedback && (
          <p role="status" className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
            <CheckCircle2 aria-hidden="true" size={18} />{feedback}
          </p>
        )}

        {loading ? (
          <div className="rounded-xl border border-[#D7C1A2] bg-white p-8 text-center" role="status">
            <RefreshCw aria-hidden="true" className="mx-auto animate-spin" size={24} />
            <p className="mt-3 font-semibold">Carregando pedidos…</p>
          </div>
        ) : (
          <>
            <section aria-label="Resumo financeiro do mês" className="mb-8 grid min-w-0 grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3">
              {summaryCards.map((card) => (
                <article key={card.title} className="min-w-0 rounded-xl border border-[#D7C1A2] bg-white p-4 sm:p-5">
                  <h2 className="text-sm font-semibold text-[#594638]">{card.title}</h2>
                  <p className="mt-2 break-words text-2xl font-bold text-[#352219]">{card.value}</p>
                  <p className="mt-2 text-xs leading-relaxed text-[#594638]">{card.description}</p>
                </article>
              ))}
            </section>

            <section aria-labelledby="payout-explanation-title" className="mb-8 rounded-xl border border-[#D7C1A2] bg-[#F2E5D0] p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8E3D25]">Transparência financeira</p>
                  <h2 id="payout-explanation-title" className="mt-1 text-xl font-bold">Repasse social</h2>
                </div>
                <span className="rounded-full bg-[#59633D] px-3 py-1 text-sm font-bold text-white">Mínimo: 85%</span>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#594638]">
                O repasse destinado ao artesão deve corresponder a, no mínimo, 85% do valor bruto das peças. O total previsto mostra a referência dos pedidos; “Total repassado” considera apenas os pedidos marcados como pagos/repassados.
              </p>

              <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3">
                <div className="min-w-0 rounded-lg bg-white p-4">
                  <p className="text-sm text-[#594638]">Percentual mínimo</p>
                  <p className="mt-2 text-3xl font-bold text-[#59633D]">85%</p>
                  <p className="mt-1 text-xs text-[#594638]">Aplicado como piso por pedido</p>
                </div>
                <div className="min-w-0 rounded-lg bg-white p-4">
                  <p className="text-sm text-[#594638]">Repasse previsto no mês</p>
                  <p className="mt-2 break-words text-2xl font-bold text-[#352219]">{formatCurrency(summary.expectedPayout)}</p>
                  <p className="mt-1 text-xs text-[#594638]">Valor calculado para os pedidos do período</p>
                </div>
                <div className="min-w-0 rounded-lg bg-white p-4">
                  <p className="text-sm text-[#594638]">Valor já repassado</p>
                  <p className="mt-2 break-words text-2xl font-bold text-[#8E3D25]">{formatCurrency(summary.transferred)}</p>
                  <p className="mt-1 text-xs text-[#594638]">Conforme a situação financeira dos pedidos</p>
                </div>
              </div>

              {summary.invalidPercentageOrders > 0 && (
                <p role="alert" className="mt-4 rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm text-amber-950">
                  Atenção: {summary.invalidPercentageOrders} pedido(s) possuem percentual fora do intervalo de 85% a 100%. O cálculo de referência usa 85%; confira o dado de origem.
                </p>
              )}
              <p className="mt-4 text-xs leading-relaxed text-[#594638]">
                A diferença entre o valor bruto e o repasse não é chamada de taxa ou comissão, pois essa destinação precisa ser definida pela regra financeira oficial.
              </p>
            </section>

            <section aria-labelledby="artisan-orders-title">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 id="artisan-orders-title" className="text-xl font-bold">Histórico de pedidos</h2>
                  <p className="mt-1 text-sm text-[#594638]" aria-live="polite">{monthOrders.length} pedido(s) no mês selecionado</p>
                </div>
              </div>

              {monthOrders.length === 0 ? (
                <div className="rounded-xl border border-[#D7C1A2] bg-white p-6 text-center">
                  <p className="font-bold">Nenhum pedido encontrado neste mês.</p>
                  <p className="mt-2 text-sm text-[#594638]">Selecione outro período para consultar o histórico.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {monthOrders.map((order) => (
                      <OrderCard key={order.id} order={order} saving={savingOrderId === order.id} onStatusChange={handleStatusChange} />
                    ))}
                  </div>
                  <div className="hidden overflow-x-auto rounded-xl border border-[#D7C1A2] bg-white md:block">
                    <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                      <caption className="sr-only">Pedidos, cliente, produto, valor, repasse, status e data</caption>
                      <thead className="bg-[#F2E5D0] text-[#352219]">
                        <tr>
                          <th scope="col" className="px-4 py-3">Cliente / produto</th>
                          <th scope="col" className="px-4 py-3">Data</th>
                          <th scope="col" className="px-4 py-3">Valor</th>
                          <th scope="col" className="px-4 py-3">Repasse</th>
                          <th scope="col" className="px-4 py-3">Situação financeira</th>
                          <th scope="col" className="px-4 py-3">Produção</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthOrders.map((order) => {
                          const numbers = getOrderNumbers(order);
                          return (
                            <tr key={order.id} className="border-t border-[#E7D9C4] align-top">
                              <td className="px-4 py-4">
                                <p className="font-bold">{order.clientName}</p>
                                <p className="mt-1 text-[#594638]">{order.productName}</p>
                                <p className="mt-1 text-xs text-[#594638]">{order.quantity} peça(s)</p>
                              </td>
                              <td className="whitespace-nowrap px-4 py-4">{formatDate(order.createdAt)}</td>
                              <td className="whitespace-nowrap px-4 py-4 font-semibold">{formatCurrency(numbers.gross)}</td>
                              <td className="px-4 py-4">
                                <p className="font-bold text-[#59633D]">{formatCurrency(numbers.payout)}</p>
                                <p className="mt-1 text-xs text-[#594638]">{numbers.percentage}% · mínimo de 85%: {formatCurrency(numbers.gross * 0.85)}</p>
                              </td>
                              <td className="px-4 py-4">{order.payoutStatus}</td>
                              <td className="min-w-[220px] px-4 py-4">
                                <OrderStatusControl order={order} saving={savingOrderId === order.id} onChange={handleStatusChange} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default ArtisanSalesDashboard;
