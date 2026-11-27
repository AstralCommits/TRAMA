# Ambientes, publicação e operação

Como o TRAMA roda em cada ambiente, como uma versão é publicada e como acompanhar a aplicação em produção.

## Ambientes

| Ambiente | Como sobe | Banco | Perfil da API | Dados |
|---|---|---|---|---|
| Desenvolvimento local | `./mvnw spring-boot:run` e `npm run dev` | H2 em memória | `local` | cidades, categorias e, se configurado, um admin local |
| Desenvolvimento com Docker | `docker compose up --build` | MySQL 8 no container | `dev` | dados de exemplo e massa de demonstração |
| CI | GitHub Actions | H2 (back) e MySQL no container (banco) | `test` | criados pelos testes |
| Produção | `docker compose -f docker-compose.prod.yml up -d` | MySQL 8 com volume próprio | `prod` | só a estrutura; cidades, categorias e o primeiro admin são criados pela API |

O perfil `prod` não carrega os dados de exemplo nem os usuários de demonstração, que têm senha pública.

## Integração contínua

| Workflow | Quando roda | O que faz |
|---|---|---|
| [`backend.yml`](../../.github/workflows/backend.yml) | PR e push que mudam `backend/` ou o contrato | `mvn verify` com os testes, a cobertura do JaCoCo e o teste do contrato da API |
| [`frontend.yml`](../../.github/workflows/frontend.yml) | PR e push que mudam `frontend/` ou o contrato | tipos do contrato em dia, lint, typecheck, testes e build |
| [`database.yml`](../../.github/workflows/database.yml) | PR e push que mudam `database/` ou o compose | sobe o MySQL e confere tabelas, views, procedures, triggers e os casos da demonstração |
| [`docker.yml`](../../.github/workflows/docker.yml) | PR que muda o código; tags `v*` | monta as imagens da API e do front; nas tags, publica no GitHub Container Registry |
| [`codeql.yml`](../../.github/workflows/codeql.yml) | PR, push na `main` e toda segunda-feira | análise de segurança do Java e do TypeScript |

O [Dependabot](../../.github/dependabot.yml) abre PRs semanais para as dependências do npm e do Maven e mensais para as imagens Docker e as actions.

## Publicar uma versão

1. Na `develop`, registre a versão no [CHANGELOG](../../CHANGELOG.md) e leve a `develop` para a `main` por Pull Request.
2. Defina a variável do repositório `TRAMA_API_URL` (Settings → Secrets and variables → Actions → Variables) com o endereço público da API, por exemplo `https://api.trama.exemplo.com.br`. O front recebe esse endereço no build.
3. Na `main` atualizada, crie a tag e envie:

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. O workflow `docker.yml` publica `ghcr.io/astralcommits/trama-api` e `ghcr.io/astralcommits/trama-web` com as tags `1.0.0`, `1.0` e `latest`.

## Subir em produção

Precisa de um servidor com Docker e Docker Compose. No servidor:

```bash
git clone https://github.com/AstralCommits/TRAMA.git
cd TRAMA
cp .env.prod.example .env
```

Preencha o `.env`:

| Variável | Para quê |
|---|---|
| `TRAMA_VERSION` | versão das imagens, por exemplo `1.0.0` |
| `TRAMA_WEB_URL` | endereço público do front, usado no CORS da API |
| `MYSQL_ROOT_PASSWORD` e `MYSQL_PASSWORD` | senhas do MySQL; use senhas longas e diferentes |
| `TRAMA_JWT_SECRET` | segredo do token, com pelo menos 32 caracteres (`openssl rand -base64 48`) |
| `TRAMA_ADMIN_EMAIL` e `TRAMA_ADMIN_PASSWORD` | primeiro administrador, criado só se ainda não existir |
| `API_PORT` e `WEB_PORT` | portas publicadas no servidor |

Depois:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --wait
```

Depois do primeiro login, apague `TRAMA_ADMIN_PASSWORD` do `.env`. Em produção, coloque um proxy com HTTPS (Nginx, Caddy ou o do provedor) na frente das portas da API e do front.

O MySQL não fica exposto fora da rede do Docker, e o Swagger fica desligado em produção (`TRAMA_API_DOCS=true` liga).

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

Antes de atualizar, faça um backup do banco (veja [Backup automatizado](../../database/README.md#backup-automatizado-e-recuperação-db-07)). As mudanças de estrutura do banco ficam em [`database/migrations`](../../database/migrations) e são aplicadas antes de subir a versão nova.

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

O `docker compose ps` mostra o estado de saúde dos três serviços.
