# Resumo da entrega — TRAMA v0.2.0-dev.4

## Entrega

Um ZIP único em estrutura monorepo, com `Frontend/`, `Back-end/`, `Banco-de-Dados/`, `docs/` e scripts de integração. O pacote foi planejado para atualização da branch já existente `develop` no repositório `AstralCommits/Front-end`, sem criar novas branches, Pull Requests ou Releases.

## Principais alterações

1. Alinhamento do contrato real de vendas: lançamentos mensais agregados por confecção, categoria e mês.
2. Integração de autenticação, JWT, vendas, CSV, indicadores, cenários, relatórios e equipe/filtros salvos segundo as rotas existentes no Back-end.
3. Inclusão dos projetos Back-end e Banco de Dados como pastas irmãs de `Frontend/`.
4. Preservação do catálogo demonstrativo e arquivos da issue oficial #19 já existentes na branch `develop` remota.
5. Inclusão das 19 issue sheets FE-13 a FE-31 e inventário das issues oficiais #1 a #22.
6. Documentação específica de merge de componentes e execução a partir de uma única raiz.

## O que não foi feito

- Nenhuma modificação remota, commit, push, PR ou Release foi publicada.
- Nenhuma issue GitHub foi fechada/reaberta.
- Não foram criados endpoints fictícios para produtos, artesãos ou cotações.
- Não foi declarada conclusão de QA que dependa de Node 22.22+, Maven, MySQL real, navegador ou leitor de tela.

## Próximo passo

A equipe deve revisar o diff contra o `develop` atual, executar o guia de validação e então integrar diretamente na branch existente, se as regras do repositório permitirem.


## Inventário de issues incluído

O pacote contém as 19 descrições internas FE-13 a FE-31 e um registro individual das 22 issues oficiais #1 a #22 do repositório `AstralCommits/Front-end`. As partes de marketplace das issues oficiais #17 e #18 estão formalmente fora do escopo confirmado do TRAMA; os estados continuam abertos no GitHub e não são considerados entregues. As issues #20 e #21 estão fechadas no GitHub com motivo `not_planned`. Consulte `docs/ISSUES-GITHUB-OFICIAIS-2026-11-23.md` e `docs/issues-github/`.
