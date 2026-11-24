# FRONT-06 — Responsividade mobile do catálogo

## Suposições adotadas

- O projeto recebido usa React 19, TypeScript, React Router e Tailwind CSS 3.4.
- O catálogo da issue não veio acompanhado de contrato de API nem de uma lista real de produtos. Foi criado um conjunto de produtos fictícios em JSON TypeScript, sinalizado na interface como demonstração.
- A configuração de Tailwind existente foi preservada. Foi acrescentado apenas `xs: "360px"` em `theme.extend.screens`.
- Não foi adicionada biblioteca de menu, ícones ou roteamento. O projeto já possui `lucide-react` e `react-router`.

## Abordagem e arquivos

| Arquivo | Responsabilidade |
|---|---|
| `apps/web/tailwind.config.js` | Acrescenta o breakpoint `xs: 360px` sem substituir `sm`, `md`, `lg`, `xl` ou o restante da configuração. |
| `apps/web/src/features/shared/ResponsiveDrawer.tsx` | Drawer compartilhado com navegação desktop, overlay, bloqueio do scroll, ESC, clique fora, ARIA e gestão de foco. |
| `apps/web/src/features/catalog/CatalogPage.tsx` | Catálogo mobile-first, filtro por coleção, cards flexíveis e imagens responsivas quando fornecidas. |
| `apps/web/src/features/catalog/data/mockProducts.ts` | Dados fictícios independentes da interface, substituíveis pelo serviço real. |
| `apps/web/src/routes/catalog.tsx` | Rota `/catalogo`. |
| `apps/web/src/routes.ts` | Registra as novas rotas sem remover as rotas existentes. |
| `apps/web/src/index.css` | Inputs com fonte mínima de 16 px em telas de até 480 px para evitar zoom automático do navegador. |
| `apps/web/src/root.tsx` | Já continha a meta viewport `width=device-width, initial-scale=1`; mantida sem duplicação. |

## Comportamento responsivo

- Layout começa em uma coluna e pode passar a duas colunas a partir de 420 px.
- Cards, imagens, títulos e filtros usam largura fluida e `min-w-0`; a página limita o overflow horizontal.
- A imagem usa `w-full`, `object-cover`, proporção fixa e lazy loading quando o produto fornece uma URL. Como os dados de exemplo não têm fotografias reais, o protótipo mostra um espaço reservado identificado como prévia.
- Filtros de coleção, links da navegação e controles do drawer têm altura mínima de 44 px.
- `xs` é aplicado a partir de 360 px para ajustar espaçamento horizontal.

## Drawer e acessibilidade

A implementação busca atender aos critérios de teclado, foco, semântica e alvos de toque associados à WCAG 2.1 AA. Isso não representa certificação: a avaliação com leitor de tela e navegador real ainda depende da checklist manual.

- Botão hambúrguer com `aria-expanded` e `aria-controls` (o elemento de destino permanece no DOM também quando a gaveta está fechada).
- Gaveta com `role="dialog"`, `aria-modal="true"` e título associado.
- Overlay fecha com clique fora; tecla Escape fecha a gaveta.
- O scroll do `body` é bloqueado enquanto a gaveta está aberta e restaurado ao fechar.
- O foco entra na gaveta, fica contido com Tab/Shift+Tab e retorna ao botão ao fechar.
- Estado da coleção usa `aria-pressed`; contagem de produtos usa `aria-live`.

## Checklist de teste manual

- [ ] **360 px:** abrir catálogo; conferir uma coluna, filtros quebrando linha sem sobreposição e ausência de rolagem horizontal.
- [ ] **390 px:** abrir e fechar drawer; conferir que o conteúdo permanece legível e botões têm pelo menos 44 px.
- [ ] **480 px:** confirmar grid fluido de duas colunas e que preço/título não ultrapassam o card.
- [ ] Selecionar cada coleção; confirmar atualização da contagem e dos produtos apresentados.
- [ ] Abrir drawer pelo botão hambúrguer; conferir `aria-expanded=true` e `aria-controls` (o elemento de destino permanece no DOM também quando a gaveta está fechada) apontando para o painel.
- [ ] Fechar drawer clicando no overlay e pressionando Escape.
- [ ] Com teclado, conferir foco inicial, contenção de Tab/Shift+Tab e retorno do foco ao botão.
- [ ] Conferir que a página não rola por trás da gaveta e volta a rolar depois do fechamento.
- [ ] Conferir meta viewport no HTML renderizado e inputs de 16 px nas telas pequenas.
- [ ] Validar a leitura com zoom padrão do navegador e sem precisar ampliar manualmente.

> A checklist é roteiro para validação no navegador. Ela não deve ser marcada como executada antes de testar a interface em runtime.
