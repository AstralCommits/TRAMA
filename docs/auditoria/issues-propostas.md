# Issues propostas pela auditoria de 09/11/2026

Texto pronto para abrir em cada repositório (título + corpo). Ao abrir, aplique as labels de prioridade (`P0`/`P1`) e de camada e marque a responsável. Checkpoint: **16/11**. Entrega final: **23/11**.

## AstralCommits/Back-end

### 1. [P0] main não compila: IndicadorService e DTOs só existem na branch back-05-indicadores (AUD-01)

**Responsável:** Gabriela Olegário

`IndicadorController` (main) importa `IndicadorService` e `IndicadorResponseDTO`, que só existem em `back-05-indicadores`. Resultado: `mvn package` falha na main.

Ao integrar:
- a branch `back-05-indicadores` **apaga** `JwtService`, `AuthService` e o login — não fazer merge direto; trazer só `IndicadorService`, `IndicadorAgregadoDTO`, `IndicadorResponseDTO`, a query `agregarIndicadores` e o `IndicadorServiceTest`;
- `IndicadorResponseDTO` tem 9 campos, mas o service chama o construtor com 10 (a mensagem "Não há dados para o período selecionado"). Acrescentar `String mensagem` no record.

**Aceite:** `mvn test` verde na main; `GET /api/indicadores?inicio=2026-01&fim=2026-03` responde 200 com token.

### 2. [P0] Token JWT é emitido mas nunca validado (AUD-02)

**Responsáveis:** Gabriela Olegário (filtro) e Ester Reis (revisão)

`SecurityConfig` libera só `/api/auth/**` e exige autenticação no resto, mas nenhum filtro lê o `Authorization: Bearer`. Nenhuma rota além do login funciona, nem `/api/health`.

- criar `JwtAuthenticationFilter` (`OncePerRequestFilter`) antes de `UsernamePasswordAuthenticationFilter`;
- liberar `/api/health`, `/v3/api-docs/**` e `/swagger-ui/**`;
- RF09: GET de indicadores e cenários para EMPRESARIO e ADMIN; POST/PUT/DELETE de cadastros só ADMIN;
- tirar a chave do código (`JwtService`) e ler de `TRAMA_JWT_SECRET` (ISO/IEC 27001).

**Aceite:** login → token → GET 200; sem token → 401; EMPRESARIO em `POST /api/categorias` → 403.

### 3. [P0] Cenário usa faturamento fixo de R$ 10.000 e não salva cenários (AUD-06)

**Responsável:** Gabriela Olegário

- buscar o faturamento real da categoria/período no banco (reusar `agregarIndicadores`);
- incluir `inicio` e `fim` no `SimulacaoCenarioRequest`;
- `POST /api/cenarios` (salvar com nome), `GET /api/cenarios` e `GET /api/cenarios/{id}` (RF08);
- devolver a fórmula na resposta (RNF03).

**Aceite:** R$ 20.000 × (1 − 30/100) = R$ 14.000; diferença R$ 6.000 (30%).

### 4. [P0] Contrato de GET /api/indicadores diverge do Front-end (AUD-04)

**Responsáveis:** Ester Reis (back) + Gyovanna Gabrielly (front) — decidir até 11/11

| | Back-end hoje | Front-end hoje |
|---|---|---|
| parâmetros | `inicio=AAAA-MM`, `fim=AAAA-MM`, `cidade`, `categoriaId` | `mesInicial`, `anoInicial`, `mesFinal`, `anoFinal`, `cidade`, `incluirVariacao` |
| totais | `totalFaturamento`, `totalQuantidade` | `faturamentoTotal`, `pecasVendidas` |
| lista | `indicadores[]` (`faturamentoAtual`, `quantidadeAtual`, `tendencia`) | `categorias[]` (`faturamento`, `pecasVendidas`, `variacaoPercentual`) |
| tendência | `ALTA`, `QUEDA`, `ESTAVEL`, `SEM_BASE` | `ALTA`, `QUEDA`, `ESTÁVEL` |

Proposta: manter o contrato do back-end (já tem teste) e adaptar o front. Registrar o contrato final no Swagger e em `docs/arquitetura`.

### 5. [P1] mvnw, perfil dev × Docker, Swagger, CI e GitFlow (AUD-12, 14, 15, 16)

**Responsável:** Ester Reis

- só existe `mvnw.cmd`; gerar o `mvnw` com `mvn wrapper:wrapper`;
- perfil `dev` usa `localhost:3306` com `root` sem senha; o Docker do BD expõe `3307` com `trama/trama`. Documentar `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` no README;
- após o PR #8 do Banco-de-Dados, a migração `V0_3_2__origem_dado_lancamento.sql` deixa de ser necessária para bancos novos;
- `springdoc-openapi-starter-webmvc-ui` (RNF09);
- workflow GitHub Actions com `mvn -B test`;
- criar `develop` e integrar por PR.

## AstralCommits/Front-end

### 1. [P0] Código só na develop; main tem apenas imagens; .zip versionado (AUD-12)

**Responsável:** Maria Nicolle

- `main` contém só `Frontend/assets`; a aplicação está em `develop`;
- a branch `TRAMA-Versão-1` guarda `TRAMA_GitHub.zip` — remover;
- o README manda rodar `npm install` na raiz, mas o `package.json` fica em `Frontend/apps/web`.

**Aceite:** README com o caminho correto; release `develop → main` por PR na entrega.

### 2. [P0] Login e cadastro locais; integrar com POST /api/auth/login (AUD-05)

**Responsáveis:** Maria Nicolle + Gyovanna Gabrielly

`lib/auth.client.ts` cria contas no navegador. Trocar por `POST /api/auth/login`, guardar o token e enviá-lo no interceptor do Axios. Esconder cadastros para EMPRESARIO. Depende da issue 2 do Back-end.

### 3. [P0] Cadastros, vendas e cenário não consomem a API (AUD-05)

**Responsável:** Maria Nicolle

Criar services para `/api/categorias`, `/api/confeccoes`, `/api/cidades`, `/api/vendas`, `/api/cenarios/simular` e `/api/cenarios`. Tratar 400 (mensagem do campo) e duplicidade.

**Aceite (16/11):** cadastro feito na tela aparece no banco.

### 4. [P0] Adaptar tipos e services ao contrato de GET /api/indicadores (AUD-04)

**Responsável:** Gyovanna Gabrielly

Ajustar `src/types/indicadores.ts`, `indicadoresService.ts`, `tendenciasService.ts`; tratar `SEM_BASE`; exibir "Não há dados para o período selecionado" quando vier `mensagem`.

### 5. [P0] Trazer as novas funcionalidades por PR (AUD-13)

**Responsável:** Gyovanna Gabrielly

O commit de 08/11 está no repositório privado `TRAMA-novas-funcionalidades` e não conta como evidência no Front-end. Criar `feature/novas-funcionalidades` a partir de `develop`, aplicar `new-features.tsx`, `workspace.tsx` e `demo.ts` e abrir PR.

### 6. [P1] Escopo, estados e testes (AUD-16, AUD-17)

**Responsáveis:** Gyovanna Gabrielly + Maria Nicolle

- 14 módulos fora do escopo da SRS: marcar como "protótipo" ou ocultar;
- conferir RNF04 (≤ 3 cliques) e RNF05 (360 px);
- Vitest com `classifyTrend` e a fórmula do cenário;
- GitHub Actions com `npm ci && npm run typecheck && npm run build`.
