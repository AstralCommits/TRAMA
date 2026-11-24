# TRAMA — monorepositório consolidado v0.2.0-dev.4

Este pacote reúne os três componentes principais do TRAMA em uma só árvore para integração do grupo: **Frontend**, **Back-end** e **Banco de Dados**. A intenção é facilitar o trabalho conjunto e revisar os contratos entre interface, API e schema.

## Estrutura

- `Frontend/`: React, TypeScript e React Router.
- `Back-end/`: Java 21, Spring Boot e API REST.
- `Banco-de-Dados/`: MySQL, schema, inserts, consultas, procedures, transações e triggers.
- `docs/`: inventário das issues, 19 issues internas FE-13..FE-31, auditoria, QA, instruções de execução e histórico dos Releases.

## Histórico do projeto

Este pacote continua as entregas publicadas `v0.1.0`, `v0.2.0-dev.2` e `v0.2.0-dev.3`. Consulte [`docs/HISTORICO-RELEASES.md`](docs/HISTORICO-RELEASES.md) para os links e o resumo de cada versão. Como `dev.3` é o último Release publicado, esta consolidação recebe a identificação de trabalho `v0.2.0-dev.4`. **Não é um Release novo**: é um pacote para atualização da branch existente `develop`.

## Modelo de dados que deve ser preservado

O registro real é um **lançamento mensal agregado por confecção, categoria e mês (`AAAA-MM`)**. Ele guarda quantidade total de peças, faturamento, origem de inclusão (`MANUAL` ou `IMPORTACAO`), procedência (`ENTREVISTA`, `QUESTIONARIO`, `FONTE_SECUNDARIA` ou `DEMONSTRACAO`) e nome da fonte. A API atual não representa vendas unitárias por produto. As categorias de referência são Jeans, Moda Feminina, Moda Masculina, Moda Infantil, Moda Praia e Moletom; categorias históricas adicionais em bases antigas não são apagadas automaticamente. Dados de demonstração devem permanecer claramente identificados.

## Funcionalidades integradas no pacote

- Cadastro e login com API, sessão JWT e chamadas protegidas.
- CRUD de categorias, confecções e vendas mensais.
- Pré-visualização local e envio de CSV com validação definitiva/transacional no servidor.
- Indicadores, filtros, tendências e cenários hipotéticos.
- Relatórios CSV e impressão.
- Filtros salvos no servidor para contas reais.
- Equipe, convites e trilha de auditoria, sujeitos à validação de execução.
- Catálogo demonstrativo da issue oficial #19 preservado a partir do estado atual da `develop`.

## Início rápido (Windows)

Requisitos: Node.js `22.22.0` ou superior e Java 21.

Terminal 1 — Back-end local: 

```powershell
cd .\Back-end
.\mvnw.cmd spring-boot:run
```

O perfil local usa H2 em memória e cria as cidades/categorias de referência quando ausentes. Para MySQL, siga os READMEs do Back-end e Banco de Dados e aplique as migrações em uma base de teste. O usuário ADMIN é opcional e só é provisionado com `TRAMA_ADMIN_EMAIL` e `TRAMA_ADMIN_PASSWORD`; não há credencial padrão. As contas-fixture dos scripts SQL usam hashes marcadores e não permitem login.

Terminal 2 — Front-end:

```powershell
cd .\Frontend
npm ci
Copy-Item .\apps\web\.env.example .\apps\web\.env
npm run dev
```

Configure `VITE_API_URL=http://localhost:8080` em `Frontend/apps/web/.env`. Abra `http://localhost:3000`.

## Integração contínua

O monorepositório inclui `.github/workflows/ci.yml`, com jobs independentes para instalar, verificar, tipar, lintar e compilar o Front-end e executar `clean verify` no Back-end em Java 21. O workflow foi configurado nesta consolidação, mas ainda não foi executado pelo GitHub Actions.

## Validação

Na raiz do pacote:

```powershell
npm run install:frontend
npm run qa:contracts
npm run typecheck
npm run lint
npm run build
npm run verify:backend
```

Use `npm run qa:static` para verificações estruturais/estáticas e `npm run qa` para a suíte completa (typecheck, lint, build e Maven `clean verify`). As verificações estáticas passaram nesta revisão. Esta consolidação pode ser enviada à branch `develop` como etapa de integração, desde que as limitações e validações pendentes descritas em [`docs/DESCRICAO-COMMIT-DEVELOP.md`](docs/DESCRICAO-COMMIT-DEVELOP.md) sejam mantidas explícitas. Ela **não deve ser apresentada como versão 100% validada ou pronta para produção**. Leia [`docs/QA-RESULTADOS-v0.2.0-dev.4.md`](docs/QA-RESULTADOS-v0.2.0-dev.4.md), [`docs/VALIDACAO-LOCAL-v0.2.0-dev.4.md`](docs/VALIDACAO-LOCAL-v0.2.0-dev.4.md), [`docs/INSTRUCOES-SUBIR-DEVELOP-v0.2.0-dev.4.md`](docs/INSTRUCOES-SUBIR-DEVELOP-v0.2.0-dev.4.md) e a [`decisão de escopo #17/#18`](docs/DECISAO-DE-ESCOPO-ISSUES-17-18.md).

## Issues

- [`docs/ISSUES-GITHUB-OFICIAIS-2026-11-23.md`](docs/ISSUES-GITHUB-OFICIAIS-2026-11-23.md): inventário das 22 issues oficiais, com estado consultado. [`docs/issues-github/`](docs/issues-github/) contém um registro individual para cada issue #1–#22. As #17 e #18 foram formalmente classificadas como fora do escopo do TRAMA (marketplace); o estado delas no GitHub não foi alterado. #20 e #21 foram fechadas no GitHub como `not_planned`.
- [`docs/issues-internas/`](docs/issues-internas/): descrições individuais das 19 tarefas FE-13 a FE-31. São IDs internos e não números de issue do GitHub. Consulte também [`docs/MAPA-IDS-ISSUES.md`](docs/MAPA-IDS-ISSUES.md) para a relação temática — não equivalente — entre os dois inventários.
- [`docs/AUDITORIA-FE-13-A-FE-31-v0.2.0-dev.4.md`](docs/AUDITORIA-FE-13-A-FE-31-v0.2.0-dev.4.md): estado técnico e validações pendentes.

## Inventário da entrega

- 19 descrições individuais internas: FE-13 a FE-31.
- 22 issues oficiais do GitHub: #1 a #22, com snapshots individuais e links para as fontes originais.
- Estado observado: 20 issues oficiais fechadas (incluindo duas `not_planned`) e duas abertas (#17 e #18), ambas classificadas como fora do escopo do produto nesta entrega. O fechamento no GitHub não significa que todo critério foi validado nesta consolidação.

## Como integrar em um só repositório

Para a descrição recomendada do commit e a lista objetiva do que ainda falta validar, consulte [`docs/DESCRICAO-COMMIT-DEVELOP.md`](docs/DESCRICAO-COMMIT-DEVELOP.md). Siga [`docs/GUIA-CONSOLIDACAO-MONOREPO.md`](docs/GUIA-CONSOLIDACAO-MONOREPO.md). O pacote não cria branches, PRs, tags nem Releases. Ele foi organizado para ser revisado e copiado para a branch já existente `develop`, preservando `Frontend/` e adicionando `Back-end/` e `Banco-de-Dados/`.

## Limitações conhecidas

- Estoque, produção, pedidos, financeiro, CRM, fornecedores, agenda/notificações e marketplace não fazem parte do escopo desta versão e não devem ser apresentados como funcionalidades disponíveis.
- O catálogo cultural preservado da issue #19 é demonstrativo local, sem ofertas, pedidos, cotações, pagamentos ou transações.
- Não há endpoint de produtos, artesãos ou cotações no Back-end fornecido; essas operações de marketplace foram excluídas do escopo por decisão confirmada.
- Convites de equipe não são enviados automaticamente por e-mail; o token é compartilhado manualmente.
- O catálogo de categorias é compartilhado/global.
- H2 local é temporário; persistência durável depende do MySQL configurado.
- A auditoria WCAG 2.1 AA e os testes reais de dispositivos/navegadores ainda precisam ser concluídos. A comparação de vendas é por categoria (não por produto individual), de acordo com o modelo mensal agregado. A aplicação no perfil MySQL (`dev`) garante as listas de referência ausentes, mas não cria tabelas nem dados de vendas. O bootstrap administrativo exige credenciais explícitas por variáveis de ambiente; veja `Back-end/README.md`.
