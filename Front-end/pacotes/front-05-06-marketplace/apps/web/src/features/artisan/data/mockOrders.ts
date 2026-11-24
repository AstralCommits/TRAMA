export type ProductionStatus = 'Recebido' | 'Em produção' | 'Pronto' | 'Enviado' | 'Entregue';
export type PayoutStatus = 'A receber' | 'Repassado';

export type ArtisanOrder = {
  id: string;
  clientName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  repassPercentage: number;
  productionStatus: ProductionStatus;
  payoutStatus: PayoutStatus;
  createdAt: string;
};

export const mockOrders: ArtisanOrder[] = [
  { id: 'PED-001', clientName: 'Ana Beatriz', productName: 'Bolsa de tecido estampado', quantity: 2, unitPrice: 90, repassPercentage: 85, productionStatus: 'Em produção', payoutStatus: 'A receber', createdAt: '2026-11-05' },
  { id: 'PED-002', clientName: 'Maria Eduarda', productName: 'Blusa de algodão', quantity: 1, unitPrice: 120, repassPercentage: 85, productionStatus: 'Pronto', payoutStatus: 'Repassado', createdAt: '2026-11-08' },
  { id: 'PED-003', clientName: 'João Pedro', productName: 'Carteira artesanal', quantity: 3, unitPrice: 50, repassPercentage: 90, productionStatus: 'Entregue', payoutStatus: 'Repassado', createdAt: '2026-11-10' },
  { id: 'PED-004', clientName: 'Camila Santos', productName: 'Vestido regional', quantity: 1, unitPrice: 160, repassPercentage: 85, productionStatus: 'Recebido', payoutStatus: 'A receber', createdAt: '2026-11-12' },
  { id: 'PED-005', clientName: 'Lucas Ferreira', productName: 'Camisa de algodão', quantity: 2, unitPrice: 75, repassPercentage: 85, productionStatus: 'Enviado', payoutStatus: 'A receber', createdAt: '2026-10-21' },
];
