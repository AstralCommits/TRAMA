# TRAMA — Tecendo Relações e Analisando o Mercado do Agreste

Plataforma web de gestão e inteligência comercial para confecções e facções do Agreste pernambucano. Este repositório reúne o front-end React/React Router e a API REST Spring Boot, mantendo as aplicações em pastas separadas.

## Estado da entrega

- Front-end institucional e módulos de gestão preservados.
- FRONT-06: estrutura, configuração e documentação revisadas.
- FRONT-07: autenticação de servidor com BCrypt, JWT em cookie HttpOnly, CSRF double-submit, cadastro público e cadastro administrativo de funcionários.
- FRONT-08: integração dos indicadores com o endpoint real, além de modo demonstrativo identificado.
- Banco principal: MySQL 8.
- H2 permanece disponível apenas no perfil local/teste.

**Limitação funcional conhecida:** os indicadores consultam a API, mas vendas diárias, estoque, produção, financeiro e outros registros operacionais do front-end continuam locais no navegador e não são persistidos no MySQL. A interface sinaliza essa diferença. Não use os módulos locais como sistema de registro/backup de produção até implementar os endpoints e a persistência correspondentes.

## Estrutura

```text
TRAMA/
├── Frontend/                 # React + React Router + TypeScript
│   ├── apps/web/
│   ├── assets/
│   └── package.json
├── Backend/                  # Java 21 + Spring Boot + Maven
│   ├── src/main/java/
│   ├── src/main/resources/
│   ├── database/
│   └── pom.xml
├── docker-compose.yml        # MySQL 8 local
├── .env.example
└── README.md
```

## Requisitos

- Node.js 22.22 ou superior e npm compatível.
- Java JDK 21.
- Maven 3.9+ (ou os scripts `mvnw.cmd` / `mvnw`; a primeira execução pode precisar baixar Maven).
- Docker Desktop com Docker Compose, ou MySQL 8 instalado localmente.

## 1. Preparar o MySQL

Na raiz do repositório, copie `.env.example` para `.env` e substitua as senhas. Para subir o banco local:

```bash
docker compose up -d mysql
```

O contêiner inicializa um volume vazio com `Backend/database/schema_reference.sql` e aplica `V0_3_2__origem_dado_lancamento.sql`. Isso acontece somente na primeira inicialização do volume. Para banco já existente, faça backup, confira o schema e aplique apenas as migrações necessárias; **não execute o schema de referência sobre dados existentes**.

O usuário de aplicação do compose é `trama`; o banco é `confeccoes`. Se modificar `DB_PASSWORD`, mantenha o mesmo valor em `MYSQL_PASSWORD` no compose e em `DB_PASSWORD` no ambiente do back-end. Para recriar o banco local apagando todos os dados, somente se tiver certeza: `docker compose down -v`.

## 2. Configurar e iniciar o Back-end

Configure as variáveis no ambiente do terminal ou em um arquivo `.env` carregado pela sua ferramenta de execução. O Spring Boot não carrega automaticamente o `.env` da raiz. Gere o segredo JWT com:

```bash
openssl rand -base64 32
```

Defina `TRAMA_JWT_SECRET` com o resultado, além de `TRAMA_ADMIN_EMAIL` e `TRAMA_ADMIN_PASSWORD`. A senha administrativa deve ter pelo menos 12 caracteres. A conta ADMIN é criada no primeiro start quando essas duas variáveis estão definidas; não existe senha administrativa padrão no código.

Windows PowerShell (a partir de `Backend/`):

```powershell
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:DB_URL = "jdbc:mysql://localhost:3306/confeccoes?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Recife&characterEncoding=UTF-8"
$env:DB_USERNAME = "trama"
$env:DB_PASSWORD = "troque_esta_senha_app"
$env:TRAMA_JWT_SECRET = "COLE_A_CHAVE_BASE64_GERADA"
$env:TRAMA_CORS_ALLOWED_ORIGINS = "http://localhost:3000"
$env:TRAMA_ADMIN_EMAIL = "admin@trama.local"
$env:TRAMA_ADMIN_PASSWORD = "DEFINA_SENHA_FORTE_COM_12_CARACTERES_OU_MAIS"
.\mvnw.cmd spring-boot:run
```

No PowerShell, execute `.\mvnw.cmd spring-boot:run` (ou `mvn spring-boot:run` se Maven estiver instalado). Linux/macOS: `SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run`.

API: `http://localhost:8080`. Verifique `GET http://localhost:8080/api/health`.

### Perfis de banco

- `dev`: MySQL 8, `ddl-auto=validate`; é o perfil de integração da equipe.
- `local`: H2 em memória para testes e desenvolvimento isolado; não persiste dados após encerrar o processo.
- `sqlite`: perfil de compatibilidade experimental.

## 3. Configurar e iniciar o Front-end

Crie `Frontend/apps/web/.env` com:

```env
VITE_API_URL=http://localhost:8080
```

Na pasta `Frontend/`:

```bash
npm ci
npm run typecheck --prefix apps/web
npm run lint --prefix apps/web
npm run dev --prefix apps/web
```

A aplicação abre em `http://localhost:3000`. Requer Node.js 22.22+. Para build de produção:

```bash
npm run build --prefix apps/web
npm run start --prefix apps/web
```

## 4. Autenticação e autorização

- `POST /api/auth/register`: cadastro público de uma confecção e do usuário administrador daquela confecção. O perfil é sempre `CONFECCAO`.
- `POST /api/auth/login`: valida e-mail/senha; senha é armazenada somente como hash BCrypt.
- `GET /api/auth/me`: retorna o usuário autenticado.
- `PUT /api/auth/profile`: atualiza dados básicos do perfil.
- `POST /api/auth/logout`: expira os cookies no navegador.
- `POST /api/auth/admin/users`: somente ADMIN; cria funcionário vinculado a uma confecção existente. O endpoint sempre atribui `CONFECCAO`.

A sessão usa JWT em cookie `TRAMA_ACCESS_TOKEN` com `HttpOnly`; o front-end não lê nem grava o token. Operações mutáveis exigem CSRF double-submit via cookie `XSRF-TOKEN` e cabeçalho `X-XSRF-TOKEN`. CORS aceita somente as origens configuradas e credenciais. Em produção use HTTPS, `TRAMA_AUTH_COOKIE_SECURE=true`, `TRAMA_AUTH_COOKIE_SAME_SITE=None`, domínio/origens explícitos e segredo forte fora do Git.

As contas ADMIN são provisionadas por `TRAMA_ADMIN_EMAIL` e `TRAMA_ADMIN_PASSWORD` no servidor. Não existe cadastro público de ADMIN e não coloque credenciais no código ou no front-end.

## 5. Indicadores e demonstração

O dashboard utiliza o endpoint real `GET /api/indicadores?inicio=AAAA-MM-DD&fim=AAAA-MM-DD` com os filtros suportados pela API. Os resultados são escopados à confecção do usuário autenticado. Quando o usuário entra no modo demonstração, os valores fictícios são identificados como demonstração e não devem ser confundidos com dados reais. Falha de API não deve ser convertida silenciosamente em valores simulados.

O back-end mantém lançamentos mensais agregados por confecção/categoria/mês. A interface contém registros operacionais diários locais; esses formatos não são automaticamente convertidos para não criar totais incorretos.

## 6. Endpoints principais

| Método | Endpoint | Acesso |
|---|---|---|
| GET | `/api/health` | Público |
| GET | `/api/auth/csrf` | Público |
| POST | `/api/auth/register` | Público + CSRF |
| POST | `/api/auth/login` | Público + CSRF |
| GET | `/api/auth/me` | Autenticado |
| PUT | `/api/auth/profile` | Autenticado + CSRF |
| POST | `/api/auth/logout` | CSRF |
| POST | `/api/auth/admin/users` | ADMIN + CSRF |
| GET | `/api/cidades` | Autenticado |
| GET | `/api/categorias` | Autenticado |
| POST/PUT/DELETE | `/api/categorias` | ADMIN + CSRF |
| GET | `/api/confeccoes` | Autenticado (escopo por perfil) |
| POST/PUT/DELETE | `/api/confeccoes` | ADMIN + CSRF |
| GET/POST | `/api/vendas` | Autenticado + CSRF no POST |
| GET/PUT/DELETE | `/api/vendas/{id}` | Autenticado; escopo por confecção |
| GET | `/api/indicadores` | Autenticado; escopo por confecção |

Consulte `Backend/README.md` e `Backend/api-examples.http` para contratos e exemplos detalhados.

## 7. Testes

Back-end (perfil local/H2):

```bash
cd Backend
./mvnw -Dspring.profiles.active=local test
```

No Windows, use `mvnw.cmd -Dspring.profiles.active=local test` ou `mvn` instalado. Os testes de integração provisionam um administrador exclusivo da suíte. Não reutilize essas credenciais em nenhum ambiente.

Front-end, a partir de `Frontend/`:

```bash
npm ci
npm run typecheck --prefix apps/web
npm run lint --prefix apps/web
npm run build --prefix apps/web
```

Teste manual integrado: registrar confecção; sair; entrar; confirmar `/api/auth/me`; abrir dashboard; verificar cookie HttpOnly; testar acesso anônimo; tentar consultar outra confecção; cadastrar funcionário com ADMIN; testar logout e credenciais inválidas.

**Importante:** resultados de testes precisam ser registrados somente depois de executados no ambiente da equipe. Este pacote não declara como aprovados testes que não foram executados nesta sessão.

## 8. Publicação no GitHub — branch `dev`

Após revisar e executar os testes, a pessoa responsável pelo repositório pode usar:

```bash
git status
git switch dev
git pull --ff-only origin dev
git add README.md .gitignore docker-compose.yml Frontend Backend
git diff --cached --stat
git diff --cached
git commit -m "feat: integra autenticacao e indicadores TRAMA"
git push origin dev
```

Se ainda não existir branch local `dev`: `git fetch origin` e `git switch -c dev --track origin/dev`. Não force push. Não adicione `.env`, senhas, tokens, dumps de banco ou arquivos de build. Se houver conflito, pare e resolva com a equipe antes do push.

## Segurança e dados

Não versionar credenciais, dados pessoais reais, arquivos `.env`, tokens, backups ou dumps. Use senhas de desenvolvimento distintas das senhas institucionais. Antes de publicar, revise `git diff` e a lista de arquivos staged. Em produção, configure TLS, segredos em gerenciador apropriado, backups e política de retenção.
