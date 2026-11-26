# Changelog

As mudanças do repositório TRAMA ficam registradas aqui, no formato do [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). O histórico de cada parte antes da junção continua em [`backend/CHANGELOG.md`](backend/CHANGELOG.md) e [`database/CHANGELOG.md`](database/CHANGELOG.md).

## [Não lançado]

### Segurança

- Login só pela API: as contas criadas no navegador saíram, e as senhas que tinham ficado no `localStorage` são apagadas.
- O login fica bloqueado por 15 minutos depois de 5 senhas erradas seguidas para o mesmo e-mail (`429` com `Retry-After`).
- A API não sobe mais com um segredo de JWT padrão: fora do perfil `local`, `TRAMA_JWT_SECRET` é obrigatório.
- Erros inesperados passam a ser registrados no log da API.

### Integração

- `GET /api/auth/me` devolve nome, perfil e confecção do usuário logado; o front deixou de deduzir a confecção pela primeira da lista.
- Contrato da API versionado em `docs/api/openapi.json`, com teste no back e tipos gerados no front (`npm run api:types`), conferidos no CI.
- Quem entra pela API vê só os módulos da SRS, todos ligados ao banco; os módulos locais ficam só na demonstração.

### Alterado

- Pastas renomeadas para o padrão em minúsculas: `Back-end/` virou `backend/`, `Front-end/` virou `frontend/` e `Banco-de-Dados/` virou `database/`.
- O front deixou de usar npm workspaces: o app que ficava em `Front-end/apps/web/` agora é a própria pasta `frontend/`, e os comandos rodam sem `--prefix apps/web`.
- Os scripts SQL que ficavam em `Banco-de-Dados/database/` agora ficam em `database/`, separados por finalidade: `schema/`, `seeds/`, `migrations/` (antes `migracoes/`), `tests/`, `queries/` e `sqlite/`. O minimundo foi para `docs/database/`.
- Um só `docker-compose.yml`, na raiz. O CI do banco sobe o serviço `banco` dele e também roda os 12 casos de teste da massa de demonstração.
- Workflows renomeados para `backend.yml`, `frontend.yml` e `database.yml`.
- `@types/node` do front passou para a versão 22, a mesma do Node.js exigido.
- O guia de instalação (ISO/IEC/IEEE 26514) passou a usar o repositório único.

### Adicionado

- `LICENSE` (MIT), `SECURITY.md`, `CHANGELOG.md` e `.github/CODEOWNERS`.
- READMEs do back-end e do front-end e `.env.example` na raiz.

### Removido

- Cópias antigas das entregas do front (`Front-end/pacotes/`) e a pasta `Novas-Funcionalidades/`, que já estavam no código atual. Como recuperar: [docs/frontend/pacotes-de-entrega.md](docs/frontend/pacotes-de-entrega.md).
- `concurrently` e `knip`, que só existiam no `package.json` do workspace.
