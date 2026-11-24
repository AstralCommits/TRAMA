# Registro técnico e orientações de atualização — TRAMA Front-end

**Data de revisão:** 22/11/2026  
**Repositório:** `AstralCommits/Front-end`  
**Branch de trabalho informada:** `develop`

## Objetivo

Registrar o que foi incluído na documentação de acompanhamento do Front-end e orientar a equipe a conferir o projeto e organizar o backlog. Este documento não representa uma publicação no GitHub e não altera issues, branches ou código remotamente.

## Documentação incluída/atualizada

- `docs/MAPA-COMPLETO-ISSUES-TRAMA.md`: descrição resumida das 20 issues anteriores, classificação (totalmente alinhada, parcialmente alinhada ou fora do escopo), justificativas, decisões de reformulação/encerramento, 19 novas propostas FE-13 a FE-31, duplicidades, dependências, ordem de execução e ideias futuras.
- `docs/BACKLOG-ISSUES-TRAMA-REVISADO.md`: índice rápido das issues antigas e novas.
- `docs/PLANO-GITHUB-DECISOES-EVOLUCAO-TRAMA.md`: plano de evolução e decisões de escopo.
- `docs/github-issues/`: 19 descrições individuais preparadas para criar ou atualizar issues, com orientação específica para não duplicar #18, #19 e #22.
- `docs/VALIDACAO-E-CORRECOES-TIPAGEM-2026-11-20.md`: registro anterior de correções de tipagem.

## O que as novas issues representam

As propostas FE-13 a FE-31 são tarefas futuras. Elas não indicam que as funcionalidades já estejam implementadas. O pacote documenta as necessidades e critérios para que a equipe possa planejar o desenvolvimento.

Algumas propostas substituem ou atualizam issues abertas existentes:

- FE-14 pode substituir a #18 (cadastro de confecção).
- FE-20 pode substituir a #19 (filtros analíticos).
- FE-22 deve atualizar a #22 (acessibilidade), não duplicá-la.
- FE-19 só deve ser aberta se a #9 não cobrir os gráficos previstos.
- FE-29 corresponde a trabalho de Back-end ou coordenado com o repositório Back-end.

## Alterações no código

Esta atualização é documental. Os arquivos funcionais da aplicação foram preservados; não foram implementadas as novas funcionalidades FE-13 a FE-31 dentro desta atualização.

## Evidências de validação informadas pela equipe em 22/11/2026

- `npm run typecheck`: finalizou sem apresentar erros.
- `npm run lint`: `Found 0 warnings and 0 errors`.
- `npm run build`: compilação Client e Server concluída.

Esses resultados comprovam os verificadores estáticos e a compilação informados, não substituem testes de navegador, integração com Back-end, acessibilidade ou segurança.

## Conferência local antes de publicar alterações

Na pasta raiz do projeto (onde está o `package.json`):

```powershell
npm install
npm run typecheck
npm run lint
npm run build
npm run dev
```

Execute os comandos individualmente. Confirme que o Back-end está ativo e que `VITE_API_URL` aponta para o ambiente correto antes de testar integração.

## Orientação de Git

Antes de publicar qualquer alteração, confira o estado local e compare os arquivos com o repositório para não sobrescrever trabalho de outras pessoas:

```bash
git status
git branch --show-current
```

Depois da revisão e da autorização da equipe, inclua somente os arquivos aprovados, faça commit com mensagem clara e publique pelo fluxo adotado pelo repositório. Não faça atualização direta de branch protegida, não inclua `.env`, tokens ou dados comerciais reais e não marque issues como concluídas apenas porque foram documentadas.

## Cuidados

- Confirmar novamente no GitHub o status e o texto das issues antes de alterá-las.
- Não fechar as issues fora de escopo sem aprovação da equipe/professor.
- Não criar issues duplicadas para os casos descritos no mapa completo.
- Não considerar permissões locais como segurança de produção; a API deve autorizar as operações.
- Não apresentar dados sintéticos como dados reais do Polo Têxtil.
