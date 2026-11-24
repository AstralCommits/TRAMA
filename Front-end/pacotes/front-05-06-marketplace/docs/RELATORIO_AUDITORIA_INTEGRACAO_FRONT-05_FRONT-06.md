# Relatório de auditoria e integração — Marketplace FRONT-05 e FRONT-06

## 1. Base consolidada

O pacote foi montado sobre `TRAMA-FRONT-06-07-08-REVISADO.zip`, que já continha o projeto completo da entrega anterior e as implementações documentadas para FRONT-04/05 e FRONT-06/07/08 do projeto TRAMA. A estrutura foi mantida em uma única pasta `TRAMA/`.

Os arquivos desta nova solicitação foram integrados como funcionalidades separadas em `apps/web/src/features/catalog/` e `apps/web/src/features/artisan/`. Não foram substituídos os módulos existentes de gestão, vendas, tendências, concorrência, autenticação preparada, administração ou gráficos.

## 2. Atenção: IDs iguais em escopos diferentes

A solicitação recebida aponta para `AstralCommits/Front-end` e descreve FRONT-06 (#16, catálogo mobile) e FRONT-05 (#15, painel do artesão). A entrega anterior do TRAMA já documentava um lote chamado FRONT-06/07/08, pertencente ao outro projeto/escopo de gestão e análise comercial.

Para não apagar nem renomear as entregas antigas, este pacote preserva os documentos e arquivos prévios e identifica as duas novas funcionalidades como **Marketplace FRONT-06 (#16)** e **Marketplace FRONT-05 (#15)**.

## 3. Matriz de conformidade — Marketplace FRONT-06

| Requisito solicitado | Resultado nesta entrega |
|---|---|
| Breakpoint `xs: 360px` | Integrado ao `theme.extend.screens` do Tailwind principal. |
| Drawer mobile | Integrado em `ResponsiveDrawer.tsx`, compartilhado com o painel. |
| Botão hambúrguer e ARIA | `aria-expanded`, `aria-controls`, `role="dialog"`, `aria-modal` e título associado. |
| Overlay e clique fora | Implementados. |
| Fechamento com Escape | Implementado. |
| Scroll do body bloqueado | Implementado enquanto a gaveta está aberta e restaurado no fechamento. |
| Foco gerenciado | Foco inicial, contenção com Tab/Shift+Tab e retorno ao gatilho. |
| Toque de 44x44 px | Controles principais e itens de navegação com altura mínima de 44 px. |
| Grid de catálogo fluido | Uma coluna em telas estreitas, duas colunas a partir de 420 px e mais colunas em telas maiores. |
| Imagens responsivas | Quando houver URL de imagem, usa largura total, proporção definida e `object-cover`; os mocks atuais exibem placeholder identificado. |
| Sem overflow horizontal | Layout com largura mínima zero, conteúdo fluido e clipping horizontal na página. |
| Meta viewport | Já estava em `src/root.tsx`; confirmada e preservada. |
| Inputs com fonte mínima de 16 px | Regra mobile adicionada ao CSS global; filtro de mês também usa `text-base`. |
| Acesso navegável | Rota `/catalogo` adicionada e linkada na navegação institucional. |

## 4. Matriz de conformidade — Marketplace FRONT-05

| Requisito solicitado | Resultado nesta entrega |
|---|---|
| Cards de resumo | Vendas do mês, valor a receber e valor total repassado. |
| Repasse mínimo de 85% | Exibido no resumo e no cálculo de cada pedido. |
| Repasse por pedido | Percentual, valor em R$ e referência mínima de 85%. |
| Tabela de pedidos | Cliente, produto, valor, repasse, situação financeira, produção e data. |
| Cards empilhados no mobile | Implementados para larguras abaixo de `md`. |
| Seletor de status | Recebido → Em produção → Pronto → Enviado → Entregue. |
| Loading e erro | Estados de carregamento, salvamento, erro, confirmação e nova tentativa. |
| Filtro mensal | `input type="month"`, fonte de 16 px e filtro sobre pedidos. |
| Mock JSON separado | `mockOrders.ts` isolado da tela. |
| Troca futura para API | Adaptador `ArtisanOrdersApi` permite injetar implementação; endpoint não foi presumido. |
| Drawer compartilhado | O painel e o catálogo importam o mesmo `ResponsiveDrawer.tsx`. |
| Perfil demonstrativo | A opção “Artesão” foi incluída na entrada de demonstração e a rota verifica esse perfil no navegador. |

## 5. Revisão dos outros issues já existentes

Foram preservados no projeto consolidado os documentos e módulos do lote anterior, incluindo:

- FRONT-04/05 de gestão TRAMA: `competition-scenario.tsx` e `admin-management.tsx`.
- FRONT-06/07/08 de gestão TRAMA: organização do projeto, cliente/contexto JWT preparado e gráficos conectáveis.
- Fluxo institucional, entrada de demonstração, workspace, vendas, estoque, operações, dados demo e imagens originais.

Os IDs acima pertencem ao conjunto de issues da entrega TRAMA anterior. Não foram sobrescritos pelas novas issues de marketplace, que têm outra descrição e outro repositório.

## 6. Limitações que continuam abertas

1. O catálogo usa produtos fictícios, pois não foi fornecida API nem catálogo real.
2. O painel usa pedidos fictícios; mudanças de status ficam em memória e somem ao recarregar.
3. O perfil “Artesão” é uma seleção local de demonstração. Não é autenticação e não protege dados reais. O backend precisa validar a identidade e garantir que cada artesão veja e altere apenas os próprios pedidos.
4. A API real precisa fornecer contratos para listar pedidos do mês e atualizar status de produção. Nenhum endpoint foi inventado.
5. Fotografias reais de produtos ainda precisam ser fornecidas pelo catálogo/API.
6. Testes em aparelhos físicos ou navegador real nas larguras 360, 390 e 480 px continuam pendentes.

## 7. Verificações executadas nesta integração

- Comparação das árvores de arquivos do projeto-base e do ZIP revisado anterior.
- Conferência de que o ZIP revisado contém os 112 arquivos do projeto-base e acrescenta os arquivos da entrega anterior; nenhum arquivo do projeto-base ficou ausente.
- Confirmação estática da meta viewport em `src/root.tsx`.
- Confirmação de `xs: 360px` no Tailwind principal.
- Execução dos testes puros de cálculo com Node.js: **7 testes aprovados**.
- Conferência estática das rotas e pontos de navegação adicionados.
- Build, typecheck, lint e teste visual no navegador **não executados**: não há `node_modules` no pacote, e o Node disponível no ambiente é 22.16.0, abaixo do requisito documentado de 22.22.0 ou superior.

## 8. Conclusão

Os arquivos de FRONT-05 e FRONT-06 do marketplace foram integrados à árvore completa do TRAMA e os requisitos funcionais listados foram implementados no código do protótipo. A entrega está pronta para instalação e validação no ambiente local, mas não deve ser considerada produção nem aceite final enquanto não forem executados build, typecheck, lint e testes visuais, e enquanto a API/autorização reais não estiverem disponíveis.
