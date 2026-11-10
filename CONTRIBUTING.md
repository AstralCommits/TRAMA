# Como contribuir com o TRAMA

Guia de trabalho da equipe AstralCommits. Vale para todas as pastas do repositório (`Back-end/`, `Front-end/`, `Banco-de-Dados/` e `Novas-Funcionalidades/`).

## Fluxo de trabalho (GitFlow)

A `main` é protegida: nada entra nela sem Pull Request e sem a aprovação de pelo menos uma pessoa da equipe.

1. Atualize a `main` local: `git checkout main && git pull`.
2. Crie uma branch para a issue, seguindo o padrão abaixo.
3. Faça commits pequenos e com mensagem no padrão da equipe.
4. Envie a branch e abra um Pull Request para a `main`, preenchendo o modelo.
5. Peça a revisão de alguém da sua frente (ou de outra frente, se a mudança afetar as duas).
6. Depois da aprovação e com o CI passando, faça o merge com **Create a merge commit** e apague a branch.

## Nome das branches

| Tipo | Padrão | Exemplo |
|---|---|---|
| Funcionalidade | `feature/<frente>-<assunto>` | `feature/db-01-db-03-pedidos-produtos` |
| Correção | `fix/<frente>-<assunto>` | `fix/back-validacao-cnpj` |
| Documentação | `docs/<assunto>` | `docs/normas-iso` |
| Manutenção | `chore/<assunto>` | `chore/organizacao-repositorio` |

As branches com prefixo `banco-de-dados/`, `back-end/`, `front-end/` e `novas-funcionalidades/` vieram dos repositórios antigos e ficam só como histórico. Não abra Pull Request a partir delas.

## Mensagens de commit

Comece com o código da issue (o mesmo do quadro do professor) ou com o tipo da mudança, seguido de uma descrição curta no imperativo:

```
DB-01: cria constraints de integridade para pedidos corporativos em lote (#11)
BACK-02: adiciona claim de perfil no token JWT (#20)
FRONT-04: cria modal de solicitação de orçamento (#28)
docs: atualiza o guia de instalação
fix: corrige o filtro por cidade no dashboard
chore: atualiza dependências do front-end
```

- Um commit por mudança lógica; não misture assuntos diferentes.
- Use o nome e o e-mail cadastrados no seu GitHub (`git config user.name` e `git config user.email`), para que o commit conte na sua participação.
- Não suba arquivos `.zip`, `node_modules/`, `target/`, `.env` nem backups do banco.

## Issues

- Use os modelos **Funcionalidade** ou **Problema** ao abrir uma issue.
- Toda issue deve ter as labels de tipo (`type:`), frente (`stack:`) e prioridade (`priority:`), um responsável e a milestone da semana.
- Ao abrir o Pull Request, escreva `Closes #<número>` na descrição para a issue fechar sozinha no merge.

## Revisão de Pull Request

Quem revisa confere:

- se a mudança atende os critérios de aceitação da issue;
- se o CI passou;
- se o README e o CHANGELOG da frente foram atualizados quando necessário;
- se não há credenciais, senhas ou arquivos gerados no commit.

## Como rodar o projeto

Veja a seção [Como rodar o projeto completo](README.md#como-rodar-o-projeto-completo) do README.
