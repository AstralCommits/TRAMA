export type CatalogProduct = {
  id: string;
  name: string;
  collection: string;
  category: string;
  price: number;
  image?: string;
  imageAlt?: string;
};

export const mockCatalogProducts: CatalogProduct[] = [
  { id: 'CAT-001', name: 'Bolsa de tecido estampado', collection: 'Coleção Feira', category: 'Acessórios', price: 89.9 },
  { id: 'CAT-002', name: 'Blusa de algodão', collection: 'Coleção Essencial', category: 'Moda feminina', price: 69.9 },
  { id: 'CAT-003', name: 'Camisa casual', collection: 'Coleção Sertão', category: 'Moda masculina', price: 99.9 },
  { id: 'CAT-004', name: 'Vestido leve', collection: 'Coleção Feira', category: 'Moda feminina', price: 139.9 },
  { id: 'CAT-005', name: 'Conjunto infantil', collection: 'Coleção Essencial', category: 'Moda infantil', price: 79.9 },
  { id: 'CAT-006', name: 'Short de sarja', collection: 'Coleção Sertão', category: 'Moda casual', price: 74.9 },
];
