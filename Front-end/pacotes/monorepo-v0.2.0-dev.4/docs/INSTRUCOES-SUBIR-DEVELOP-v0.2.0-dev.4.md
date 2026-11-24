# Como subir o TRAMA consolidado na branch existente `develop`

Este é o fluxo solicitado para reunir os componentes em **um único repositório**. O destino é `AstralCommits/Front-end`, branch existente `develop`. Não crie branch, não abra Pull Request e não publique Release nesta etapa.

## 1. Preparar o repositório

1. Faça backup/clonagem do repositório atual.
2. Abra a pasta local do repositório `AstralCommits/Front-end`.
3. Atualize a referência remota e selecione a branch já existente:

```powershell
git fetch origin
git switch develop
git pull --ff-only origin develop
git status
```

4. Confira se há alterações locais antes de copiar o pacote. Não sobrescreva trabalho de outro integrante sem revisar.

## 2. Copiar o pacote monorepo

Extraia `TRAMA-MONOREPO-v0.2.0-dev.4-CONSOLIDADO.zip` fora da pasta `.git`. Copie **o conteúdo de dentro** da pasta `TRAMA-v0.2.0-dev.4/` para a raiz do clone `AstralCommits/Front-end`.

A árvore final deve ter, na raiz do mesmo repositório:

```text
Front-end/
├── Frontend/          # a pasta que já existia na develop, atualizada
├── Back-end/          # novo componente Java/Spring Boot
├── Banco-de-Dados/    # novo componente MySQL e scripts
├── docs/              # inventários, issues e guias
├── scripts/           # verificações e atalhos
├── package.json       # comandos do monorepo
├── .gitignore
├── README.md
└── GIT-DEPLOY.md
```

Não crie uma pasta `TRAMA-v0.2.0-dev.4` dentro do repositório. Não copie `.git`, `.env`, `node_modules`, `target`, caches, credenciais ou backups com dados reais. A pasta `Frontend/` deve substituir/atualizar a pasta de mesmo nome já existente, preservando arquivos da equipe que não foram alterados e revisando qualquer conflito.

## 3. Conferir o que será commitado

No terminal, na raiz do repositório:

```powershell
git status
git diff --stat
git diff
```

Revise os arquivos removidos/modificados e verifique que não há segredos. Não apague artefatos históricos já versionados sem uma decisão da equipe.

## 4. Validar o monorepositório

Requisitos: Node.js `22.22.0` ou superior e Java 21. Rode:

```powershell
npm ci --prefix Frontend
npm run qa:package
npm run qa:contracts
npm run typecheck
npm run lint
npm run build
npm run test:backend
```

Para o MySQL, siga `Banco-de-Dados/README.md` e `Back-end/database/README.md`. Faça backup e aplique scripts/migrações primeiro em uma base descartável. O perfil local H2 não substitui o teste MySQL.

## 5. Commit direto na develop

**Situação desta entrega:** as verificações estáticas passaram, mas os gates completos estão pendentes conforme `docs/QA-REVISAO-FINAL-2026-11-23.md`. Como a decisão é fazer uma subida de integração agora, você pode seguir com o commit desde que use a descrição de `docs/DESCRICAO-COMMIT-DEVELOP.md` e não anuncie a entrega como 100% validada ou pronta para produção. Se a equipe exigir todos os gates aprovados antes de qualquer commit, pare e conclua a seção 4 primeiro.

Depois de revisar os arquivos e confirmar que não há segredos ou alterações de outros integrantes, adicione os caminhos do pacote:

```powershell
git add .gitignore README.md package.json GIT-DEPLOY.md ISSUE-RF03-PROMPT.txt Frontend Back-end Banco-de-Dados docs scripts
git diff --cached --stat
git diff --cached
git commit -m "feat(trama): integra frontend backend e banco na develop (dev.4)"
git push origin develop
```

Não use `git push --force`. Se a branch não permitir push direto, pare e siga a regra do repositório com a equipe; este pacote foi preparado para o fluxo direto solicitado, mas não altera as regras/permissões do GitHub.

## Observações

- A branch `develop` consultada tinha a pasta `Frontend/`; o catálogo oficial #19 foi preservado nela.
- Os ZIPs enviados do Back-end e Banco de Dados vieram de branches diferentes (`develop` e `main`). A equipe deve comparar com as versões remotas mais recentes desses repositórios antes de integrar conteúdo de integrantes.
- O pacote inclui 19 tarefas internas FE-13 a FE-31 e 22 issues oficiais #1 a #22. Incluir o registro de uma issue não a fecha no GitHub.
- As partes de marketplace das issues oficiais #17 e #18 estão fora do escopo confirmado do TRAMA. Não as marque como concluídas; consulte `docs/DECISAO-DE-ESCOPO-ISSUES-17-18.md`.
- Não houve commit, push, PR, tag ou Release remoto durante a preparação deste ZIP.
