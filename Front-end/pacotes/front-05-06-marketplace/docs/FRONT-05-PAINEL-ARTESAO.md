# FRONT-05 — Painel do artesão com histórico de vendas

## Suposições adotadas

- O projeto existente usa React 19, TypeScript, React Router e Tailwind CSS 3.4.
- Como não foi fornecida API de pedidos, os registros estão em `mockOrders.ts` e o acesso a eles passa pelo adaptador `artisanOrdersApi.ts`.
- O percentual de repasse permitido no protótipo é de 85% a 100%. Percentuais fora desse intervalo geram alerta; o cálculo demonstrativo usa o piso de 85% sem esconder a inconsistência.
- A issue não define a destinação dos 15% restantes. A interface não os chama de taxa, comissão ou custo.
- Situação financeira (`A receber` / `Repassado`) é independente do status de produção.

## Abordagem e arquivos

| Arquivo | Responsabilidade |
|---|---|
| `apps/web/src/features/artisan/ArtisanSalesDashboard.tsx` | Cards de resumo, filtro por mês, transparência do repasse, histórico em tabela desktop e cards mobile, estados de carregamento/erro e atualização da produção. |
| `apps/web/src/features/artisan/data/mockOrders.ts` | Modelo tipado e pedidos fictícios em separado. |
| `apps/web/src/features/artisan/services/artisanOrdersApi.ts` | Adaptador de demonstração e contrato substituível por uma API real. |
| `apps/web/src/features/artisan/utils/orderFinancials.mjs` | Cálculos puros de valores e percentuais. |
| `apps/web/src/features/artisan/utils/orderFinancials.d.mts` | Tipos TypeScript do módulo de cálculo JavaScript, permitindo teste direto com Node. |
| `apps/web/src/routes/artisan.tsx` | Rota `/painel-artesao`; exige o perfil demonstrativo “Artesão” salvo no navegador. |
| `apps/web/src/home/demo-entry.tsx` | Inclui o perfil demonstrativo “Artesão” no fluxo já existente. |
| `apps/web/src/routes/home.tsx` | Mantém o perfil selecionado ao navegar entre as rotas e remove-o ao sair da demonstração. |
| `apps/web/src/features/shared/ResponsiveDrawer.tsx` | Mesmo componente de navegação usado na FRONT-06. |
| `apps/web/tests/orderFinancials.test.mjs` | Testes dos cálculos em Node.js, sem instalar biblioteca adicional. |

## Regras de cálculo

Para cada pedido:

- `valorBruto = quantidade × valorUnitario`.
- `repasse = valorBruto × percentualRepasse / 100`.
- O repasse não pode ser inferior a 85% do valor bruto.
- `valorAReceber` soma os pedidos com situação financeira `A receber`.
- `valorRepassado` soma os pedidos com situação financeira `Repassado`.
- `vendasDoMês` soma o valor bruto de todos os pedidos filtrados pelo mês selecionado.

A interface apresenta o mínimo de 85%, o repasse por pedido e o total previsto no mês, além do valor já repassado. A situação de produção não altera automaticamente o pagamento.

## Estados da interface

- Carregamento de pedidos com indicador visual e `role="status"`.
- Falha no carregamento ou na atualização com mensagem de erro e ação para tentar novamente.
- Atualização de produção com seletor desabilitado durante o envio e texto “Salvando…”.
- Confirmação de alteração com mensagem acessível `role="status"`.
- Histórico em cards empilhados no mobile e tabela com rolagem horizontal controlada em desktop.

## Checklist de teste manual

- [ ] **360 px:** conferir cards empilhados, filtro mensal sem corte e seletor de produção com área de toque mínima de 44 px.
- [ ] **390 px:** conferir os valores em R$ sem quebrar a largura do card e sem overflow horizontal da página.
- [ ] **480 px:** conferir distribuição do resumo em duas colunas e leitura de todas as informações do pedido.
- [ ] Alterar o mês e confirmar que a lista, os totais e a contagem mudam juntos.
- [ ] Conferir os três cards: vendas do mês, valor a receber e total repassado.
- [ ] Conferir o repasse por pedido em percentual e valor em reais; verificar a referência mínima de 85%.
- [ ] Alterar o status por todos os estágios: Recebido, Em produção, Pronto, Enviado e Entregue.
- [ ] Durante a atualização, conferir estado de loading e desabilitação do seletor.
- [ ] Simular falha no adaptador injetado e conferir mensagem de erro e nova tentativa.
- [ ] Confirmar que mudar status de produção não muda automaticamente a situação financeira.
- [ ] Atualizar a página e confirmar que os mocks voltam ao estado inicial, conforme a natureza demonstrativa.

> A checklist é roteiro para validação no navegador. Ela não deve ser marcada como executada antes de testar a interface em runtime.
