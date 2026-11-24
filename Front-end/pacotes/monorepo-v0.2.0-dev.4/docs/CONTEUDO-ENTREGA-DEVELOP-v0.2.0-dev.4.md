# TRAMA 0.2.0-dev.4 — conteúdo candidato para a branch develop

Esta consolidação reúne Front-end, Back-end e Banco de Dados em uma única árvore. É um pacote candidato para revisão; **não é autorização para commit até que todos os gates pendentes sejam executados com sucesso**.

## Principais entregas no código

- Autenticação JWT, cadastro, sessão e rotas protegidas.
- CRUD mensal de vendas e importação CSV transacional, com origem e procedência separadas.
- Indicadores, tendências, comparação de categorias (sem comparação individual por produto), cenários hipotéticos e relatórios CSV/impressão.
- Cadastros administrativos de categorias/confecções, filtros salvos e gestão de equipe/convites com auditoria.
- Controles server-side por confecção e tratamento HTTP 403 para acesso negado.
- Schema, migrações e documentação consolidados.
- Catálogo cultural demonstrativo da issue #19 preservado, sem transações de marketplace.
- Inventário de 19 tarefas internas FE-13 a FE-31 e 22 issues oficiais #1 a #22.

## Escopo

TRAMA permanece uma plataforma de inteligência de vendas para confecções. As funcionalidades de marketplace pedidas nas issues #17 e #18 estão fora do escopo e não foram implementadas nem declaradas concluídas. Estoque, produção, pedidos, financeiro e CRM também não são módulos desta versão.

## Verificações disponíveis

- QA estático/contratual: 49/49 aprovados.
- Parsing TypeScript/TSX: 104 arquivos, sem erros sintáticos.
- Sintaxe JS/MJS: 5 arquivos, sem erros; YAML: 6 arquivos, sem erros.
- Schemas SQL: cópias idênticas por SHA-256.

## Pendências antes do commit

Typecheck, lint, build, Maven/JUnit, MySQL real, testes navegador/dispositivos, impressão e auditoria assistiva WCAG continuam sem aprovação nesta sessão. Consulte `QA-REVISAO-FINAL-2026-11-23.md` e `QA-RESULTADOS-v0.2.0-dev.4.md`.

**Destino pretendido:** atualização direta da branch existente `develop`, sem nova branch, PR ou Release, somente depois da validação completa. Nenhuma alteração remota foi feita nesta preparação.
