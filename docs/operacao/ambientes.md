# Ambientes, publicação e operação

Como o TRAMA roda em cada ambiente, como uma versão é publicada e como acompanhar a aplicação em produção.

## Ambientes

| Ambiente | Como sobe | Banco | Perfil da API | Dados |
|---|---|---|---|---|
| Desenvolvimento local | `./mvnw spring-boot:run` e `npm run dev` | H2 em memória | `local` | cidades, categorias e, se configurado, um admin local |
| Desenvolvimento com Docker | `docker compose up --build` | MySQL 8 no container, com a estrutura criada pelo Flyway | `dev` | dados de exemplo e massa de demonstração, carregados pelo serviço `seed` |
| CI | GitHub Actions | H2 (back) e MySQL no container (banco) | `test` | criados pelos testes |
| Produção | `docker compose -f docker-compose.prod.yml up -d` | MySQL 8 com volume próprio | `prod` | só a estrutura, criada pelo Flyway; cidades, categorias e o primeiro admin são criados pela API |

O perfil `prod` não carrega os dados de exemplo nem os usuários de demonstração, que têm senha pública.

## Integração contínua

| Workflow | Quando roda | O que faz |
|---|---|---|
| [`backend.yml`](../../.github/workflows/backend.yml) | PR e push que mudam `backend/` ou o contrato | `mvn verify` com os testes, a cobertura do JaCoCo e o teste do contrato da API |
| [`frontend.yml`](../../.github/workflows/frontend.yml) | PR e push que mudam `frontend/` ou o contrato | tipos do contrato em dia, lint, typecheck, testes e build |
| [`database.yml`](../../.github/workflows/database.yml) | PR e push que mudam `database/` ou o compose | sobe o MySQL e confere tabelas, views, procedures, triggers e os casos da demonstração |
| [`docker.yml`](../../.github/workflows/docker.yml) | PR que muda o código; tags `v*` | monta as imagens da API e do front; nas tags, publica no GitHub Container Registry |
| [`codeql.yml`](../../.github/workflows/codeql.yml) | PR, push na `main` e na `develop` e toda segunda-feira | análise de segurança do Java e do TypeScript |

O [Dependabot](../../.github/dependabot.yml) abre PRs semanais para as dependências do npm e do Maven e mensais para as imagens Docker e as actions.

## Publicar uma versão

1. Na `develop`, registre a versão no [CHANGELOG](../../CHANGELOG.md) e leve a `develop` para a `main` por Pull Request.
2. Defina a variável do repositório `TRAMA_API_URL` (Settings → Secrets and variables → Actions → Variables) com o endereço público do TRAMA, por exemplo `https://trama.exemplo.com.br` (sem `/api` no fim). O front recebe esse endereço no build e chama a API em `/api` no mesmo domínio.
3. Na `main` atualizada, crie a tag e envie:

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. O workflow `docker.yml` publica `ghcr.io/astralcommits/trama-api` e `ghcr.io/astralcommits/trama-web` com as tags `1.0.0`, `1.0` e `latest`.

## Subir em produção

Precisa de um servidor com Docker e Docker Compose, com as portas 80 e 443 abertas, e de um domínio apontando para o IP do servidor. Sem domínio próprio, dá para usar o IP com o [sslip.io](https://sslip.io): o servidor `203.0.113.10` responde em `203-0-113-10.sslip.io`.

O compose sobe quatro serviços. Só o `proxy` (Caddy) fica exposto para fora: ele emite o certificado HTTPS sozinho e encaminha `/api`, `/v3/api-docs` e `/swagger-ui` para a API e o resto para o front. O banco, a API e o front conversam pela rede interna do Docker; a API e o front também ficam em `127.0.0.1` nas portas `API_PORT` e `WEB_PORT`, acessíveis só de dentro do servidor, para diagnóstico e para o teste de produção.

As imagens no GitHub Container Registry nascem privadas. Torne os pacotes `trama-api` e `trama-web` públicos (Packages → Package settings → Change visibility) ou faça `docker login ghcr.io` no servidor com um token que tenha `read:packages`.

No servidor:

```bash
git clone https://github.com/AstralCommits/TRAMA.git
cd TRAMA
cp .env.prod.example .env
```

Preencha o `.env`:

| Variável | Para quê |
|---|---|
| `TRAMA_VERSION` | versão das imagens, por exemplo `1.0.0` |
| `TRAMA_DOMINIO` | domínio do TRAMA, sem `https://`; o mesmo da variável `TRAMA_API_URL` do repositório. Usado no certificado HTTPS e no CORS da API |
| `API_PORT` e `WEB_PORT` | portas da API e do front em `127.0.0.1` no servidor (padrão `8080` e `3000`) |
| `HTTP_PORT` e `HTTPS_PORT` | portas públicas do proxy (padrão `80` e `443`); só mude se o servidor já usa essas portas |
| `MYSQL_ROOT_PASSWORD` e `MYSQL_PASSWORD` | senhas do MySQL; use senhas longas e diferentes |
| `TRAMA_JWT_SECRET` | segredo do token, com pelo menos 32 caracteres (`openssl rand -base64 48`) |
| `TRAMA_ADMIN_EMAIL` e `TRAMA_ADMIN_PASSWORD` | primeiro administrador, criado só se ainda não existir |

Depois:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --wait
```

Abra `https://<TRAMA_DOMINIO>` e entre com o administrador. Depois do primeiro login, apague `TRAMA_ADMIN_PASSWORD` do `.env`.

O MySQL não fica exposto fora da rede do Docker, e o Swagger fica desligado em produção (`TRAMA_API_DOCS=true` liga).

## Demonstração pública

Para apresentar o TRAMA com os dados de demonstração num endereço público, o [`docker-compose.demo.yml`](../../docker-compose.demo.yml) usa o ambiente de desenvolvimento com Docker (perfil `dev`, serviço `seed`) atrás de um Caddy, que emite o certificado HTTPS sozinho e manda `/api/*` e o Swagger para a API e o resto para o front. O MySQL não fica exposto, e a API e o front só escutam em `127.0.0.1`.

Num servidor Linux com Docker e as portas 80 e 443 livres, na raiz do repositório:

```bash
./deploy/demo/subir.sh --proxy                      # usa <ip>.sslip.io
./deploy/demo/subir.sh --proxy trama.exemplo.com.br # ou um domínio que já aponte para o servidor
```

Se o servidor já tem um proxy nas portas 80 e 443, rode sem `--proxy` e cole o bloco de [`deploy/demo/Caddyfile.externo`](../../deploy/demo/Caddyfile.externo) no Caddyfile dele (a API fica em `127.0.0.1:18080` e o front em `127.0.0.1:13000`).

O script cria um `.env` com senhas aleatórias na primeira vez e depois só reconstrói e sobe os containers.

### Sem Docker, num Windows Server

Numa VM que não repassa a virtualização da CPU, o WSL2 e o Docker não sobem. A demonstração atual roda assim, nativa, em `C:\trama-demo`:

| Peça | Como roda | Endereço |
|---|---|---|
| MySQL 8.4 (zip oficial) | serviço `TRAMA-MySQL`, `my.ini` com `log-bin-trust-function-creators=1` | `127.0.0.1:3308` |
| API (`trama.jar`, perfil `dev`) | tarefa agendada `TRAMA API` no boot, [`iniciar-api.cmd`](../../deploy/demo/windows/iniciar-api.cmd) | `127.0.0.1:18080` |
| Front (build com `VITE_API_URL` do domínio público, Node 24 portátil) | tarefa agendada `TRAMA Web` no boot, [`iniciar-web.cmd`](../../deploy/demo/windows/iniciar-web.cmd) | `127.0.0.1:13000` |
| HTTPS | bloco de [`Caddyfile.externo`](../../deploy/demo/Caddyfile.externo) no Caddy que já roda no servidor | portas 80 e 443 |

As senhas ficam em `C:\trama-demo\config\segredos.cmd`, legível só por administradores. O Flyway cria a estrutura quando a API sobe; os dados de demonstração entram uma vez, na ordem do serviço `seed` do compose (`seeds/inserts.sql`, `tests/teste_triggers.sql`, `queries/transacoes.sql`, `seeds/seed_demonstracao_projetai.sql`). Logs em `C:\trama-demo\logs`.

Para atualizar: gere o jar (`mvnw -DskipTests package`) e o build do front (`npm ci && npm run build` com `VITE_API_URL`), copie para `C:\trama-demo\api\trama.jar` e `C:\trama-demo\web` e reinicie as tarefas `TRAMA API` e `TRAMA Web`.

Os usuários de demonstração têm senha pública: não cadastre dados reais nesse ambiente.

## Atualizar e voltar uma versão

```bash
# atualizar
sed -i 's/^TRAMA_VERSION=.*/TRAMA_VERSION=1.1.0/' .env
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --wait

# voltar
sed -i 's/^TRAMA_VERSION=.*/TRAMA_VERSION=1.0.0/' .env
docker compose -f docker-compose.prod.yml up -d --wait
```

Antes de atualizar, faça um backup do banco (veja [Backup automatizado](../../database/README.md#backup-automatizado-e-recuperação-db-07)). As mudanças de estrutura do banco são migrações do Flyway, em [`backend/src/main/resources/db/migration`](../../backend/src/main/resources/db/migration), e a API aplica as que faltam quando a versão nova sobe.

## Logs

Em produção, a API escreve um JSON por linha, com `@timestamp`, `level`, `logger_name`, `message`, `app` e `requestId`. Os containers guardam até 5 arquivos de 10 MB cada.

```bash
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs --since 1h api | grep '"level":"ERROR"'
```

Toda resposta da API leva o cabeçalho `X-Request-Id`. Para investigar um erro relatado por alguém, procure esse valor nos logs:

```bash
docker compose -f docker-compose.prod.yml logs api | grep '"requestId":"<valor>"'
```

Erros inesperados aparecem com o stack trace no log, e a resposta ao usuário não mostra detalhes internos.

## Monitoramento

A API expõe o Actuator na porta 8081, que fica só na rede interna do Docker:

| Endpoint | Uso |
|---|---|
| `/actuator/health/liveness` | a aplicação está de pé |
| `/actuator/health/readiness` | a aplicação está pronta para receber requisições; usado no healthcheck do compose |
| `/actuator/prometheus` | métricas no formato do Prometheus: requisições por rota e status, tempo de resposta, memória da JVM e conexões com o banco |
| `/actuator/info` | nome e versão |

Para acompanhar de fora, aponte um Prometheus (ou o agente do provedor) para `api:8081/actuator/prometheus` na mesma rede do Docker. Um alerta útil para começar: taxa de respostas 5xx acima de 1% em 5 minutos.

O `docker compose ps` mostra o estado de saúde dos serviços.
