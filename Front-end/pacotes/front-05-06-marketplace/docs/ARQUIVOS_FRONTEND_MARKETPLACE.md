# Arquivos da integração — Marketplace FRONT-05 e FRONT-06

## Arquivos novos

| Caminho | Conteúdo |
|---|---|
| `apps/web/src/features/shared/ResponsiveDrawer.tsx` | Drawer responsivo e acessível reutilizado pelas duas telas. |
| `apps/web/src/features/catalog/CatalogPage.tsx` | Página do catálogo, filtro de coleções e cards de produto. |
| `apps/web/src/features/catalog/data/mockProducts.ts` | Produtos fictícios e tipo do catálogo. |
| `apps/web/src/routes/catalog.tsx` | Rota `/catalogo`. |
| `apps/web/src/features/artisan/ArtisanSalesDashboard.tsx` | Painel do artesão com resumo mensal, pedidos, repasses, filtro e produção. |
| `apps/web/src/features/artisan/data/mockOrders.ts` | Tipo dos pedidos, statuses e registros fictícios. |
| `apps/web/src/features/artisan/services/artisanOrdersApi.ts` | Contrato de serviço e adaptador demonstrativo em memória. |
| `apps/web/src/features/artisan/utils/orderFinancials.mjs` | Cálculos financeiros independentes de React. |
| `apps/web/src/features/artisan/utils/orderFinancials.d.mts` | Tipos TypeScript do módulo de cálculo. |
| `apps/web/src/routes/artisan.tsx` | Rota `/painel-artesao` e verificação do perfil demonstrativo. |
| `apps/web/tests/orderFinancials.test.mjs` | Sete testes unitários dos cálculos de repasse. |
| `docs/FRONT-06-CATALOGO-RESPONSIVO.md` | Requisitos, abordagem e checklist manual da FRONT-06. |
| `docs/FRONT-05-PAINEL-ARTESAO.md` | Regras, abordagem e checklist manual da FRONT-05. |
| `docs/CONTRATO_DE_DADOS_MARKETPLACE.md` | Formato dos dados e do adaptador esperado. |
| `docs/RELATORIO_AUDITORIA_INTEGRACAO_FRONT-05_FRONT-06.md` | Comparação requisito a requisito e pendências da integração. |

## Arquivos existentes ajustados

| Caminho | Alteração |
|---|---|
| `apps/web/tailwind.config.js` | Adicionado `xs: "360px"` em `theme.extend.screens`. |
| `apps/web/src/index.css` | Inputs, selects e textareas recebem fonte de 16 px até 480 px. |
| `apps/web/src/routes.ts` | Registradas as duas rotas novas, mantendo todas as anteriores. |
| `apps/web/src/routes/home.tsx` | Perfil de demonstração mantido em `sessionStorage` para navegação e removido ao sair. |
| `apps/web/src/home/demo-entry.tsx` | Acrescentada a escolha de perfil simulado “Artesão”. |
| `apps/web/src/home/institutional.tsx` | Link público para o catálogo. |
| `apps/web/src/home/workspace.tsx` | Links para o catálogo e para o painel quando o perfil demonstrativo é “Artesão”. |
| `README.md` | Instruções de acesso e limites das novas telas. |

## Arquivos anteriores mantidos

A árvore do projeto consolidado preserva os 120 arquivos presentes em `TRAMA-FRONT-06-07-08-REVISADO.zip`, incluindo imagens, site institucional, workspace, vendas, estoque, operações, módulos de análise, gestão administrativa, camada JWT preparada e gráficos conectáveis.
