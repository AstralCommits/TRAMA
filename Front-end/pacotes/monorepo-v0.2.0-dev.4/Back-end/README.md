# TRAMA — Back-end (v0.2.0-dev.4)

API REST desenvolvida com Java 21 e Spring Boot 3.3.13. O Back-end é a fonte persistente das contas reais, lançamentos mensais, importações, indicadores e cenários disponíveis nesta entrega.

## Requisitos

- JDK 21.
- Maven Wrapper incluído (`mvnw` / `mvnw.cmd`).
- MySQL 8 para o perfil `dev`; o perfil padrão `local` utiliza H2 em memória.

## Executar localmente no Windows

No PowerShell, entre na pasta `Back-end`:

```powershell
$env:TRAMA_ADMIN_EMAIL = "admin@trama.local"
$env:TRAMA_ADMIN_PASSWORD = Read-Host "Defina uma senha forte (12 a 72 caracteres)"
.\mvnw.cmd clean test
.\mvnw.cmd spring-boot:run
```

A aplicação inicia em `http://localhost:8080`. Cidades e categorias de referência são criadas se estiverem ausentes. As seis categorias de referência são Jeans, Moda Feminina, Moda Masculina, Moda Infantil, Moda Praia e Moletom; categorias antigas já existentes não são excluídas automaticamente. O conjunto demonstrativo legado ainda contém Fitness associado a lançamentos fictícios; ao importar essas fixtures, essa categoria permanece visível enquanto houver vínculos. A conta ADMIN local só é provisionada quando as duas variáveis `TRAMA_ADMIN_EMAIL` e `TRAMA_ADMIN_PASSWORD` são fornecidas; não existe senha padrão. Se o e-mail já pertencer a um ADMIN sem senha BCrypt válida (por exemplo, a linha-fixture do SQL de demonstração), a senha informada é gravada com BCrypt. Se o e-mail pertencer a outro perfil, a inicialização é interrompida em vez de elevar privilégios. O banco H2 é recriado a cada inicialização do perfil `local`; os dados são temporários. As variáveis antigas `TRAMA_LOCAL_ADMIN_EMAIL` e `TRAMA_LOCAL_ADMIN_PASSWORD` continuam aceitas como alternativa.

## Usar MySQL

1. Faça backup do banco antes de qualquer alteração.
2. Crie/altere o schema `confeccoes` usando o script da equipe de Banco de Dados, depois aplique somente as migrações necessárias descritas em `database/README.md`.
3. Configure as variáveis abaixo no ambiente local; não as coloque no Git:

```powershell
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:DB_URL = "jdbc:mysql://localhost:3306/confeccoes?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Recife&characterEncoding=UTF-8"
$env:DB_USERNAME = "seu_usuario"
$env:DB_PASSWORD = "sua_senha"
$env:TRAMA_JWT_SECRET = "uma-chave-secreta-longa-e-aleatoria-com-pelo-menos-32-bytes"
$env:TRAMA_CORS_ALLOWED_ORIGINS = "http://localhost:3000"
$env:TRAMA_ADMIN_EMAIL = "admin@trama.local"
$env:TRAMA_ADMIN_PASSWORD = Read-Host "Defina uma senha forte (12 a 72 caracteres)"
.\mvnw.cmd spring-boot:run
```

O perfil `dev` usa `ddl-auto: validate`: não cria nem altera tabelas automaticamente. O schema precisa corresponder às entidades JPA. Após a conexão, o Back-end garante as três cidades do Polo e as seis categorias de referência do TRAMA ausentes (Jeans, Moda Feminina, Moda Masculina, Moda Infantil, Moda Praia e Moletom); ele não cria tabelas nem dados de vendas fictícios. Categorias antigas já existentes são preservadas; a fixture SQL legada contém `Fitness`, ligada a vendas demonstrativas, e por isso ela pode aparecer na lista quando essas fixtures forem carregadas. A conta ADMIN só é criada/atualizada quando `TRAMA_ADMIN_EMAIL` e `TRAMA_ADMIN_PASSWORD` são informados. Sem essas variáveis, o cadastro empresarial continua disponível, mas as operações reservadas a ADMIN exigem provisionamento administrativo autorizado. A senha não deve ser salva no repositório, `.env` versionado ou histórico de terminal. Não execute `schema.sql` ou `banco_completo.sql` sobre uma base com dados que devem ser preservados.

## Endpoints implementados

| Grupo | Rotas | Observação |
|---|---|---|
| Saúde | `GET /api/health` | Público |
| Autenticação | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` | Cadastro e login públicos; `/me` requer JWT |
| Categorias | `GET/POST /api/categorias`, `GET/PUT/DELETE /api/categorias/{id}` | Escrita exige `ADMIN`; leitura autenticada |
| Confecções | `GET /api/confeccoes`, `GET /api/confeccoes/{id}`, CRUD administrativo, `PUT /api/confeccoes/minha` | Empresário e funcionário consultam apenas sua confecção; o responsável atualiza os dados da própria empresa |
| Vendas mensais | `GET/POST /api/vendas`, `GET/PUT/DELETE /api/vendas/{id}` | Empresário e funcionário limitados à própria confecção |
| Indicadores | `GET /api/indicadores?inicio=AAAA-MM&fim=AAAA-MM&cidade=...` | Dados agregados e escopo do token |
| Importações | `POST /api/importacoes` (`multipart` campo `arquivo`), `GET /api/importacoes` | CSV mensal; histórico por usuário, ADMIN pode consultar todos |
| Cenários | `GET/POST /api/cenarios`, `PUT/DELETE /api/cenarios/{id}`, `POST /api/cenarios/simular` | Cenários do usuário; simulação hipotética |
| Equipe | `GET /api/equipe/membros`, `DELETE /api/equipe/membros/{id}`, `GET/POST /api/equipe/convites`, `DELETE /api/equipe/convites/{id}`, `POST /api/equipe/convites/aceitar`, `GET /api/equipe/auditoria` | Responsável gera/revoga convites; funcionário aceita token de uso único; auditoria da equipe; sem e-mail automático |
| Filtros salvos | `GET/POST /api/filtros-salvos`, `DELETE /api/filtros-salvos/{id}` | Persistência privada por usuário e contexto |
| Cidades | `GET /api/cidades` | Leitura autenticada |

Não há envio automático de convites por e-mail, recuperação de senha, relatório persistido, estoque, produção, pedidos, financeiro, CRM ou calendário. A presença de telas demonstrativas no Front-end não significa que essas operações estejam persistidas pela API.

## Registro e autenticação

`POST /api/auth/register` recebe `nome`, `email`, `senha`, `nomeConfeccao` e `cidade`. Cidades admitidas nesta versão: Toritama, Caruaru e Santa Cruz do Capibaribe. O serviço cria uma confecção MICRO do tipo CONFECCAO e um usuário EMPRESARIO vinculado, retornando `token` e `usuario`.

`POST /api/auth/login` recebe `email` e `senha`, retorna o mesmo formato de resposta. `GET /api/auth/me` retorna os dados da conta autenticada. O cliente deve enviar `Authorization: Bearer <token>` às rotas protegidas.

O perfil `FUNCIONARIO` é criado somente pela aceitação de um convite válido e fica vinculado à confecção que o gerou. Funcionários podem operar lançamentos, indicadores, importações e cenários da própria confecção, mas não podem editar o cadastro da empresa nem administrar a equipe. O responsável gera um token de convite de uso único com validade de 72 horas; o sistema não envia e-mail, portanto o token deve ser compartilhado manualmente por canal seguro. O banco armazena apenas o hash SHA-256 do token.

Não há recuperação de senha, verificação de e-mail, refresh token ou revogação individual de JWT. A expiração padrão é de 24 horas, configurável por `TRAMA_JWT_EXPIRATION_MS`.

## Lançamento mensal e CSV

Um lançamento corresponde a uma confecção, categoria e mês (`AAAA-MM`), com quantidade total de peças, faturamento, origem de inclusão (`MANUAL` ou `IMPORTACAO`), procedência (`ENTREVISTA`, `QUESTIONARIO`, `FONTE_SECUNDARIA` ou `DEMONSTRACAO`) e nome da fonte.

Cabeçalho CSV esperado (delimitador `;` ou `,`):

```csv
mesAno;quantidade;faturamento;idConfeccao;idCategoria;origemDado;nomeFonte
2026-11;120;8500.00;1;2;FONTE_SECUNDARIA;Controle próprio da confecção
```

O servidor valida o CSV inteiro e grava os lançamentos em transação. Empresários e funcionários não podem importar linhas de outra confecção. Um lançamento ativo duplicado por confecção/categoria/mês é rejeitado. Quando a combinação já existe apenas como CANCELADA, um novo lançamento ou uma nova importação reativa o registro e atualiza sua procedência; a chave única mensal é preservada.

## Fórmula dos indicadores e cenários

- Ticket médio por peça = faturamento total ÷ quantidade total de peças.
- Comparação: período imediatamente anterior com a mesma quantidade de meses.
- Sem faturamento anterior, a variação percentual é `null` (sem base).
- Simulação: faturamento hipotético = faturamento acumulado ativo × (1 − percentual ÷ 100). É uma hipótese matemática, não uma previsão.

## Testes e documentação

```powershell
.\mvnw.cmd clean test
```

Os testes Spring em `src/test/java` cobrem autenticação JWT, cadastro, isolamento de confecção, importação CSV, comparação de períodos, cenários, convites de equipe, auditoria e filtros salvos. Precisam ser efetivamente executados no ambiente da equipe antes de declarar a suíte aprovada. Consulte também `api-examples.http`, `database/README.md` e `docs/`.
