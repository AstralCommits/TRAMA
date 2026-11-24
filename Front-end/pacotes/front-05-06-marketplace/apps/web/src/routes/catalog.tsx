import { CatalogPage } from '@/features/catalog/CatalogPage';

export function meta() {
  return [
    { title: 'Catálogo têxtil — TRAMA' },
    { name: 'description', content: 'Catálogo demonstrativo de produtos e coleções do Agreste pernambucano.' },
  ];
}

export default function CatalogRoute() {
  return <CatalogPage />;
}
