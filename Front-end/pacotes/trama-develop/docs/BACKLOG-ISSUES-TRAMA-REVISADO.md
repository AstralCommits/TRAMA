# Backlog revisado — TRAMA Front-end

**Repositório:** [AstralCommits/Front-end](https://github.com/AstralCommits/Front-end)  
**Revisão:** 22/11/2026

Este arquivo funciona como índice do backlog. A descrição individual das 20 issues antigas, a classificação de aderência, as decisões de manter/reformular/retirar e o detalhamento das novas propostas estão em [`MAPA-COMPLETO-ISSUES-TRAMA.md`](MAPA-COMPLETO-ISSUES-TRAMA.md).

## Documentos principais

- [`MAPA-COMPLETO-ISSUES-TRAMA.md`](MAPA-COMPLETO-ISSUES-TRAMA.md) — histórico e análise das 20 issues anteriores, 19 novas propostas, duplicidades, dependências, prioridades e ideias futuras.
- [`PLANO-GITHUB-DECISOES-EVOLUCAO-TRAMA.md`](PLANO-GITHUB-DECISOES-EVOLUCAO-TRAMA.md) — resumo estratégico de escopo e evolução.
- [`github-issues/README-ISSUES.md`](github-issues/README-ISSUES.md) — índice das descrições prontas para cadastro/atualização no GitHub.

## Issues antigas — visão rápida

Na consulta de 22/11/2026: 14 fechadas e 6 abertas.

- **Totalmente alinhadas:** #1, #2, #3, #4, #5, #7, #8, #9 e #22.
- **Parcialmente alinhadas:** #12, #13, #16, #17, #18 e #19.
- **Fora do escopo atual:** #11, #14, #15, #20 e #21.

Consulte o mapa completo antes de editar ou encerrar qualquer issue. Os status podem mudar no GitHub.

## Novas propostas prontas — FE-13 a FE-31

Cada arquivo abaixo contém título sugerido, objetivo, escopo, critérios de aceite, dependências e limites:

| Código | Arquivo | Tema |
|---|---|---|
| FE-13 | [`FE-13-crud-categorias.md`](github-issues/FE-13-crud-categorias.md) | CRUD de categorias |
| FE-14 | [`FE-14-cadastro-confeccoes.md`](github-issues/FE-14-cadastro-confeccoes.md) | Cadastro de confecções; pode substituir #18 |
| FE-15 | [`FE-15-lancamento-mensal-vendas.md`](github-issues/FE-15-lancamento-mensal-vendas.md) | DTO mensal de vendas |
| FE-16 | [`FE-16-origem-procedencia.md`](github-issues/FE-16-origem-procedencia.md) | Origem e procedência |
| FE-17 | [`FE-17-importacao-csv-api.md`](github-issues/FE-17-importacao-csv-api.md) | Importação CSV pela API |
| FE-18 | [`FE-18-cenarios-persistencia.md`](github-issues/FE-18-cenarios-persistencia.md) | Simulação 0–100% e cenários salvos |
| FE-19 | [`FE-19-graficos-recharts.md`](github-issues/FE-19-graficos-recharts.md) | Padronização de gráficos; auditar #9 antes |
| FE-20 | [`FE-20-filtros-analiticos.md`](github-issues/FE-20-filtros-analiticos.md) | Filtros por período, categoria e cidade; pode substituir #19 |
| FE-21 | [`FE-21-estados-api.md`](github-issues/FE-21-estados-api.md) | Estados de API e sessão |
| FE-22 | [`FE-22-acessibilidade-wcag.md`](github-issues/FE-22-acessibilidade-wcag.md) | WCAG 2.1 AA; atualizar #22 |
| FE-23 | [`FE-23-relatorios-rastreaveis.md`](github-issues/FE-23-relatorios-rastreaveis.md) | Relatórios e exportação rastreáveis |
| FE-24 | [`FE-24-testes-integracao.md`](github-issues/FE-24-testes-integracao.md) | Testes de integração |
| FE-25 | [`FE-25-qa-responsividade-desempenho.md`](github-issues/FE-25-qa-responsividade-desempenho.md) | QA global, responsividade e desempenho |
| FE-26 | [`FE-26-historico-importacoes.md`](github-issues/FE-26-historico-importacoes.md) | Histórico de importações |
| FE-27 | [`FE-27-dicionario-indicadores.md`](github-issues/FE-27-dicionario-indicadores.md) | Explicação de indicadores |
| FE-28 | [`FE-28-periodos-salvos.md`](github-issues/FE-28-periodos-salvos.md) | Filtros/períodos salvos |
| FE-29 | [`FE-29-organizacao-rbac-backend.md`](github-issues/FE-29-organizacao-rbac-backend.md) | RBAC no Back-end; criar no repositório adequado |
| FE-30 | [`FE-30-relatorios-responsivos.md`](github-issues/FE-30-relatorios-responsivos.md) | Responsividade dos relatórios |
| FE-31 | [`FE-31-permissoes-por-usuario.md`](github-issues/FE-31-permissoes-por-usuario.md) | Permissões individuais no Front-end, dependentes do Back-end |

## Atenção: não criar duplicidades

- #18 e FE-14: escolher uma só issue para cadastro de confecções.
- #19 e FE-20: escolher uma só issue para filtros analíticos.
- #22 e FE-22: atualizar a #22 em vez de duplicar.
- #9 e FE-19: auditar a #9 antes de criar tarefa complementar.
- #8 e #17: separar infraestrutura HTTP de integração dos endpoints de domínio.

**Importante:** FE-13 a FE-31 são rascunhos internos. Não são números oficiais, e nenhuma issue é criada/fechada automaticamente por este pacote.
