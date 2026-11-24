# Contrato de dados esperado — Marketplace FRONT-05/FRONT-06

Este documento registra os formatos utilizados pelos mocks atuais. Não afirma que estes endpoints já existam.

## Produto do catálogo

Arquivo atual: `apps/web/src/features/catalog/data/mockProducts.ts`.

```ts
{
  id: string;
  name: string;
  collection: string;
  category: string;
  price: number;
  image?: string;
  imageAlt?: string;
}
```

A fonte real pode ser conectada à `CatalogPage` por um serviço do catálogo quando houver contrato definido. Valores, nomes e imagens do mock não representam ofertas reais.

## Pedido do artesão

Arquivo atual: `apps/web/src/features/artisan/data/mockOrders.ts`.

```ts
{
  id: string;
  clientName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  repassPercentage: number; // percentual entre 85 e 100
  productionStatus: 'Recebido' | 'Em produção' | 'Pronto' | 'Enviado' | 'Entregue';
  payoutStatus: 'A receber' | 'Repassado';
  createdAt: string; // YYYY-MM-DD
}
```

## Contrato do adaptador

A tela recebe um objeto compatível com `ArtisanOrdersApi`:

```ts
{
  listOrders({ month: 'YYYY-MM' }): Promise<ArtisanOrder[]>;
  updateProductionStatus(orderId, status): Promise<ArtisanOrder>;
}
```

A implementação demonstrativa usa `mockArtisanOrdersApi`. Para conectar o servidor, criar outro adaptador usando o cliente HTTP do projeto e substituir a propriedade `api` da tela. Antes disso, a equipe backend precisa informar a URL, método HTTP, autorização, payload, resposta e formato de erro. Não criar endpoint por suposição.

## Regras de propriedade e acesso

- O servidor deve associar cada pedido ao artesão autenticado.
- O servidor deve validar que a pessoa só consulta e atualiza pedidos sob sua própria responsabilidade.
- Não confiar no perfil local, no `sessionStorage`, em parâmetros enviados pelo navegador ou em links ocultos como controle de acesso.
- O `payoutStatus` deve vir da fonte financeira; não inferir repasse realizado a partir do status de produção.
- Confirmar com o responsável financeiro a regra oficial que explica a diferença entre valor bruto e repasse. O front-end não atribui essa diferença a comissão ou taxa.
