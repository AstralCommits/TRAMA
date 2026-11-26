# TRAMA | Back-end

API REST do [TRAMA](../README.md) em Spring Boot. Os comandos deste documento rodam dentro da pasta `backend/`.

## Tecnologias

- Java 21 e Maven (com o wrapper `mvnw`)
- Spring Boot 3.3: Web, Data JPA, Validation e Security
- Autenticação com JWT
- SpringDoc OpenAPI 2.6 (Swagger)
- MySQL 8 no Docker e H2 em memória no desenvolvimento e nos testes
- JaCoCo para a cobertura de testes

## O que a API faz

| Recurso | Endpoints |
|---|---|
| Autenticação | `POST /api/auth/login` (devolve o token JWT) e `GET /api/auth/me` (nome, perfil e confecção do usuário logado) |
| Vendas (lançamentos mensais) | `GET`, `POST`, `PUT` e `DELETE /api/vendas` |
| Importação de CSV | `GET` e `POST /api/importacoes` |
| Indicadores e tendências | `GET /api/indicadores` e `GET /api/indicadores/tendencias` |
| Categorias | `GET`, `POST` e `DELETE /api/categorias` |
| Confecções | `GET`, `POST` e `DELETE /api/confeccoes` |
| Cenários de concorrência | `POST /api/cenarios/simular`, `GET` e `POST /api/cenarios` |
| Saúde | `GET /api/health` |

Regras principais:

- há dois perfis, `ADMIN` e `EMPRESARIO`, e cada empresário só vê os dados da própria confecção;
- depois de 5 senhas erradas seguidas para o mesmo e-mail, o login fica bloqueado por 15 minutos e responde `429` com `Retry-After` (`TRAMA_LOGIN_MAX_TENTATIVAS` e `TRAMA_LOGIN_BLOQUEIO_MINUTOS` mudam os limites);
- fora do perfil `local`, a API só sobe com `TRAMA_JWT_SECRET` definido, com pelo menos 32 caracteres;
- o impacto de um cenário vai de 0 a 100;
- os erros seguem o padrão Problem Details (RFC 7807);
- a importação de CSV valida cada linha e roda numa transação única;
- os textos livres recusam HTML e scripts, e as respostas levam cabeçalhos de segurança (CSP, HSTS, `X-Frame-Options` e outros).

O arquivo [`api-examples.http`](api-examples.http) tem exemplos de chamadas.

## Como rodar

O perfil padrão (`local`) usa o H2 em memória. Não precisa de banco instalado.

No Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

No Linux ou macOS:

```bash
./mvnw spring-boot:run
```

A API sobe em `http://localhost:8080`. A documentação interativa fica em `http://localhost:8080/swagger-ui.html`.

### Com o MySQL

Suba o banco (veja o [README do banco](../database/README.md)) e rode com o perfil `dev`:

```powershell
$env:SPRING_PROFILES_ACTIVE="dev"
$env:DB_URL="jdbc:mysql://localhost:3307/confeccoes?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Recife"
$env:DB_USERNAME="trama"; $env:DB_PASSWORD="trama"
$env:TRAMA_JWT_SECRET="troque-por-uma-frase-longa-de-32-caracteres-ou-mais"
.\mvnw.cmd spring-boot:run
```

Para subir banco, API e front juntos, use o `docker compose` da [raiz do repositório](../README.md#como-rodar).

### Perfis

| Perfil | Uso |
|---|---|
| `local` (padrão) | H2 em memória, com cidades, categorias e um admin opcional (`TRAMA_LOCAL_ADMIN_EMAIL` e `TRAMA_LOCAL_ADMIN_PASSWORD`) |
| `dev` | MySQL do `docker compose` de desenvolvimento |
| `prod` | MySQL de produção, logs em JSON, Actuator na porta 8081, Swagger desligado e admin inicial por `TRAMA_ADMIN_EMAIL` e `TRAMA_ADMIN_PASSWORD` |
| `test` | testes automatizados, com H2 |

Toda resposta leva o cabeçalho `X-Request-Id`, que também vai para o log. Saúde e métricas ficam em `/actuator/health` e `/actuator/prometheus`. Veja [Ambientes e operação](../docs/operacao/ambientes.md).

## Testes e qualidade

```bash
./mvnw clean verify
```

- Os testes de integração ficam em `src/test/java/br/com/trama` e usam o perfil `test`, com H2 no modo MySQL.
- O relatório de cobertura do JaCoCo fica em `target/site/jacoco/`.
- O contrato da API fica versionado em [`docs/api/openapi.json`](../docs/api/openapi.json). O `ContratoOpenApiTest` falha quando a API muda e o arquivo não. Para atualizar, rode `./mvnw test -Dtest=ContratoOpenApiTest -Dtrama.contrato.atualizar=true` e, no front, `npm run api:types`.
- O workflow [`backend.yml`](../.github/workflows/backend.yml) compila e testa o Back-end em todo Pull Request que altera esta pasta. Quando `SONAR_TOKEN` e `SONAR_HOST_URL` estão configurados, ele também envia a análise ao SonarQube.

## Banco de dados

O schema oficial é o da pasta [`database/`](../database). A pasta [`database/`](database) daqui guarda só referências para o mapeamento JPA:

- `schema_reference.sql`: as tabelas principais como a API espera. Não rode sobre um banco que já existe.
- `migrations/V0_4_0__perfil_empresario_e_impacto.sql`: só para bancos antigos que ainda usam o perfil `CONFECCAO`.

## Estrutura

```
backend/
├── src/main/java/br/com/trama/   código da API (controllers, services, repositories, security, config)
├── src/test/java/br/com/trama/   testes de integração
├── database/                     referências de schema e migrações da API
├── api-examples.http             exemplos de chamadas
├── Dockerfile                    imagem usada pelo docker compose
└── pom.xml
```

## Mais informações

- [`CHANGELOG.md`](CHANGELOG.md): o que entrou em cada etapa.
- [`CONTRIBUICOES.md`](CONTRIBUICOES.md): quem fez o quê.
- [`docs/backend/`](../docs/backend): a etapa 1, as branches e os comentários das issues.

## Equipe

Ester Reis e Gabriela Olegário.
