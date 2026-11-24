# Guia de consolidação dos três projetos em um único repositório

## Objetivo

Este pacote organiza Front-end, Back-end e Banco de Dados sob uma mesma raiz de monorepositório, para que os integrantes consigam revisar e integrar os contratos em conjunto. A estrutura interna dos três componentes continua separada.

## Estrutura

```text
TRAMA-v0.2.0-dev.4/
├── Frontend/       # aplicação React + TypeScript (pasta já existente no repo Front-end)
├── Back-end/       # API Java + Spring Boot
├── Banco-de-Dados/ # schema e scripts MySQL
├── docs/           # issue catalog, auditoria, testes, integração e histórico
├── scripts/        # verificações do pacote
├── package.json    # atalhos de execução do monorepo
├── README.md
└── ISSUE-RF03-PROMPT.txt
```

## Atualizar o repositório `AstralCommits/Front-end` na branch existente `develop`

1. Faça backup/clonagem do estado atual. Não use o pacote para substituir a branch inteira sem inspecionar o diff.
2. Selecione a branch `develop` existente. Não crie outra branch.
3. Copie/atualize `Frontend/` para a raiz mantendo a mesma estrutura interna. O pacote já preserva a pasta `Frontend/` existente no `develop` e inclui o catálogo da issue #19 presente no último estado consultado.
4. Adicione `Back-end/`, `Banco-de-Dados/`, `docs/`, `scripts/`, `package.json`, `README.md` e `ISSUE-RF03-PROMPT.txt` na raiz.
5. Preserve qualquer arquivo de trabalho do grupo que não esteja contemplado neste pacote. Não copie pastas `.git`, `.env`, `node_modules`, `target` nem backups com dados reais.
6. Revise `git status`, `git diff --stat` e `git diff`. Confirme que arquivos de segredo não aparecem.
7. Execute os testes do guia de validação.
8. Faça o commit diretamente em `develop`, se as regras do repositório permitirem. Não há PR nem nova branch previstos neste fluxo.

## Atalhos do monorepo

Na raiz do pacote, `npm run install:frontend`, `npm run dev:frontend`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run qa:contracts` e `npm run test:backend` encaminham para os componentes. Para o banco, siga `Banco-de-Dados/README.md` e `Back-end/database/README.md`.

## Como iniciar localmente

Terminal 1 (Back-end local/H2):

```powershell
cd .\Back-end
.\mvnw.cmd spring-boot:run
```

Terminal 2 (Front-end):

```powershell
cd .\Frontend
npm ci
npm run dev
```

Configure `Frontend/apps/web/.env` com `VITE_API_URL=http://localhost:8080` conforme `.env.example`. H2 local é temporário; MySQL requer schema/migrações.

## Regra de integração

- O modelo oficial de vendas da API é lançamento mensal agregado por confecção/categoria/mês. Não converter vendas diárias locais automaticamente.
- Módulos sem endpoint real devem continuar claramente identificados como locais/demonstrativos.
- Catálogo de artesanato da issue #19 usa dados demonstrativos locais. Não afirmar que existe API de produtos/artesãos/cotações.
- A existência de arquivos de issue no ZIP não fecha as issues no GitHub.
