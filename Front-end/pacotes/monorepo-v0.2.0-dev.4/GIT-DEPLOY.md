# Atualizar o monorepositório TRAMA na branch existente `develop`

1. Faça backup do repositório atual.
2. Entre em `AstralCommits/Front-end` e selecione a branch existente `develop`.
3. Copie os itens da raiz deste pacote para a raiz do repositório, preservando a árvore: `Frontend/`, `Back-end/`, `Banco-de-Dados/`, `docs/`, `scripts/`, `README.md`, `package.json`, `GIT-DEPLOY.md` e `ISSUE-RF03-PROMPT.txt`.
4. Não copie `.git`, `.env`, `node_modules`, `target`, dumps de produção ou arquivos com credenciais.
5. Revise no GitHub Desktop ou terminal quais arquivos foram adicionados, modificados e removidos. Não confirme uma remoção sem verificar com os integrantes.
6. Execute os testes do README e da validação local.
7. Faça o commit diretamente na `develop` existente, se as regras do repositório permitirem. Este pacote não exige nova branch nem Pull Request.

Mensagem de commit sugerida: `feat(trama): consolida frontend backend e banco na develop (dev.4)`

Este pacote não altera o GitHub sozinho: nenhum commit, push ou fechamento de issue foi realizado durante a preparação.
