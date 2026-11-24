import { mockOrders, type ArtisanOrder, type ProductionStatus } from '../data/mockOrders';

export type ArtisanOrdersApi = {
  listOrders: (input: { month: string }) => Promise<ArtisanOrder[]>;
  updateProductionStatus: (orderId: string, status: ProductionStatus) => Promise<ArtisanOrder>;
};

let inMemoryOrders: ArtisanOrder[] = mockOrders.map((order) => ({ ...order }));

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export const mockArtisanOrdersApi: ArtisanOrdersApi = {
  async listOrders({ month }) {
    await wait(180);
    return inMemoryOrders
      .filter((order) => !month || order.createdAt.startsWith(month))
      .map((order) => ({ ...order }));
  },

  async updateProductionStatus(orderId, productionStatus) {
    await wait(250);
    const index = inMemoryOrders.findIndex((order) => order.id === orderId);
    if (index < 0) throw new Error('Pedido não encontrado nos dados demonstrativos.');

    inMemoryOrders[index] = { ...inMemoryOrders[index], productionStatus };
    return { ...inMemoryOrders[index] };
  },
};
