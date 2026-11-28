# Changelog

As mudanças do repositório TRAMA ficam registradas aqui, no formato do [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). O histórico de cada parte antes da junção continua em [`backend/CHANGELOG.md`](backend/CHANGELOG.md) e [`database/CHANGELOG.md`](database/CHANGELOG.md).

## [Não lançado]

### Segurança

- O login fica bloqueado por 15 minutos depois de 5 senhas erradas seguidas para o mesmo e-mail (`429` com `Retry-After`).
- A API não sobe mais com um segredo de JWT padrão: fora do perfil `local`, `TRAMA_JWT_SECRET` é obrigatório.
- Erros inesperados passam a ser registrados no log da API.

### Integração

- `GET /api/auth/me` devolve nome, perfil e confecção do usuário logado; o front deixou de deduzir a confecção pela primeira da lista.
- `POST /api/auth/cadastro`: o Cadastrar-se cria a confecção e o usuário EMPRESARIO no banco e já entra logado, com limite de 5 cadastros por hora por conexão; sem a API, a conta continua no navegador. `GET /api/cidades` passou a ser público para a tela de cadastro.
- Contrato da API versionado em `docs/api/openapi.json`, com teste no back e tipos gerados no front (`npm run api:types`), conferidos no CI.
- Todos os tipos da API no front vêm do contrato: os campos que a API sempre devolve são marcados como obrigatórios nos DTOs, e `src/types/api.ts` só dá nomes aos tipos gerados.
- Quem entra pela API vê só os módulos da SRS, todos ligados ao banco; os módulos locais ficam na demonstração e nas contas locais.

### Organização do front-end

- `home/` virou `pages/`, a área de gestão (`workspace.tsx`) foi para `layouts/`, os componentes do shadcn foram para `components/ui/`, a sessão e o token foram para `services/`, e as funções auxiliares de `lib/` foram para `utils/`.
- Saiu o `horizons-preview-scripts.tsx`, que não fazia nada.

### Banco de dados

- Flyway passa a controlar a estrutura do MySQL: as migrações `V1` a `V7` em `backend/src/main/resources/db/migration` são a fonte oficial, aplicadas pela API nos perfis `dev` e `prod`.
- `database/schema.sql` e `database/banco_completo.sql` passam a ser gerados a partir das migrações (`database/scripts/gerar_schema.py`), e o CI confere se estão em dia.
- No desenvolvimento com Docker, os dados de exemplo e a demonstração são carregados pelo serviço `seed`, depois das migrações.
- O `seed` não dá mais a carga como feita quando ela falha no meio: só é ignorado se terminou, e para com erro se o banco ficou com dados pela metade. O README passa a mostrar o comando certo para voltar ao estado inicial.
- `MigracoesMySqlTest` aplica as migrações num MySQL 8 real (Testcontainers) e confere as entidades e os triggers.
- Saíram `database/schema/`, as atualizações manuais `database/migrations/` (v0.4.0 a v0.5.1) e `backend/database/`, que repetiam a estrutura.

### Automação e publicação

- Imagens da API e do front montadas no CI e publicadas no GitHub Container Registry a cada tag `v*`.
- `docker-compose.prod.yml` e `.env.prod.example` para produção: segredos obrigatórios, banco sem dados de exemplo, healthchecks e rotação de logs.
- Perfil `prod` na API: logs em JSON, Actuator com health e métricas do Prometheus na porta interna 8081, Swagger desligado e admin inicial por variável de ambiente.
- `X-Request-Id` em todas as respostas e nos logs.
- CodeQL para Java e TypeScript e Dependabot para npm, Maven, Docker e Actions.
- Imagem do front sem dependências de desenvolvimento e rodando sem root.
- Guia de ambientes, publicação, logs e monitoramento em `docs/operacao/ambientes.md`.
- Proxy Caddy no `docker-compose.prod.yml`: um único domínio com HTTPS automático, `/api` para a API e o resto para o front; só as portas 80 e 443 ficam expostas, e a API e o front passam a escutar só em `127.0.0.1` no servidor. O CORS usa `https://<TRAMA_DOMINIO>`, a menos que `TRAMA_WEB_URL` seja definido.
- Demonstração pública com os dados de exemplo: `docker-compose.demo.yml` e `deploy/demo/subir.sh` (perfil `dev`, senhas aleatórias no `.env`, Caddy opcional com `--proxy`), o bloco `deploy/demo/Caddyfile.externo` para um Caddy que já exista e os scripts de `deploy/demo/windows` para rodar sem Docker num Windows Server.

### Corrigido

- Rota inexistente respondia 500; agora responde 404.
- Na demonstração pública, a API via todo visitante com o IP do proxy, e o limite de 5 cadastros por hora valia para todos juntos. Agora `docker-compose.demo.yml` e `deploy/demo/windows/iniciar-api.cmd` ligam `forward-headers-strategy=framework`, como o perfil `prod`, e o limite passa a contar por visitante.
- Requisição com `Content-Type` não aceito pelo endpoint (ex.: `text/plain` no login) respondia 500 e era registrada como erro inesperado; agora responde 415 com o cabeçalho `Accept` listando os tipos aceitos.
- `procedures.sql` e `triggers.sql` não rodavam sozinhos no cliente `mysql` por causa de espaços nas linhas em branco antes do `DELIMITER`.
- Os testes que ficavam no fim de `triggers.sql` e `auditoria.sql` foram para `database/tests/`, e os arquivos de `schema/` passaram a criar só estrutura.

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
