# TRAMA v0.2.0-dev.4 — notas do pacote de desenvolvimento

> Este arquivo descreve o pacote candidato de desenvolvimento. Não é evidência de um GitHub Release publicado.

## Conteúdo

- Monorepositório com Front-end React/TypeScript, Back-end Spring Boot e Banco de Dados MySQL.
- Fluxos de autenticação, lançamentos mensais agregados, importação CSV, indicadores, tendências, comparação de categorias, cenários hipotéticos, relatórios, equipe e administração.
- Regras de isolamento por confecção, origem/procedência de dados, provisionamento administrativo opcional e migrações SQL.
- 19 tarefas internas e 22 registros de issues oficiais; decisão de manter TRAMA fora do marketplace documentada.

## QA desta revisão

- 49/49 verificações estáticas/contratuais aprovadas.
- 104 arquivos TypeScript/TSX, 5 arquivos JS/MJS e 6 YAML passaram nas verificações sintáticas aplicadas.
- Typecheck, lint e build não puderam iniciar por dependências ausentes após falha de DNS na instalação npm.
- Maven/JUnit não puderam executar porque o wrapper não conseguiu baixar Maven 3.9.9 devido à falha de DNS.
- MySQL, browser, responsividade, impressão e WCAG ainda não foram validados.

**Não está liberado para commit/push como 100% pronto.** Consulte o relatório de QA para os critérios obrigatórios de aprovação.
