# Plano, Casos e Relatório de Teste — TRAMA (ISO/IEC/IEEE 29119-3)

| Campo | Informação |
|---|---|
| Versão | 1.0 — 09/11/2026 |
| Base de teste | [Especificação de Requisitos v2.0](../requisitos/especificacao-requisitos-29148.md) |
| Coordenação | Toda a equipe; cada frente executa os casos da sua camada |

## 1. Plano de teste

### 1.1 Escopo

Em escopo: RF01–RF09, RNF01, RNF03–RNF05, RNF07 e RNF10, nas três camadas e na jornada integrada. Fora: RNF06 completo (só Chrome desktop e Chrome Android serão testados), carga acima de 20 usuários, importação CSV.

### 1.2 Níveis e técnicas

| Nível | O que testa | Ferramenta | Responsáveis |
|---|---|---|---|
| Unidade | Regras: tendência, fórmula, duplicidade | JUnit 5 (Back), Vitest (Front) | Gabriela, Ester · Gyovanna, Maria |
| Banco | Constraints, triggers, procedures, índices | Scripts SQL + workflow Docker MySQL | Jamile, Júlia |
| Integração de API | Controller → banco, segurança, erros 400/401/403 | `@SpringBootTest` + MockMvc; `api-examples.http` | Ester, Gabriela |
| Sistema (ponta a ponta) | Jornada Front → API → BD | Roteiro manual com evidência (print/vídeo) | Toda a equipe |
| Aceitação | Objetivo SMART com empresários | Roteiro da seção 4.2 da SRS | Toda a equipe |

Técnicas: partição de equivalência e valor-limite (±5%, 0%/100%, valores negativos), tabela de decisão (perfis × operações).

### 1.3 Ambiente

MySQL 8 via `docker compose` do Banco-de-Dados (porta 3307); API no perfil `dev`; Front com `VITE_API_URL=http://localhost:8080`; dados do `inserts.sql`.

### 1.4 Critérios

- **Entrada:** build da API e do Front verdes; banco sobe pelo Docker.
- **Saída (23/11):** 100% dos casos Essenciais executados; nenhum defeito Crítico aberto; casos Desejáveis com falha registrados como limitação no README.
- **Suspensão:** banco ou API não sobem — corrigir antes de seguir.

### 1.5 Cronograma de teste

| Data | Atividade |
|---|---|
| até 13/11 | Testes de unidade das regras (tendência, cenário, duplicidade) |
| 16/11 | Execução de CT-01 a CT-13 na demonstração integrada |
| 17–20/11 | CT-14 a CT-20; correção de defeitos |
| 21–22/11 | Regressão completa e preenchimento do relatório (seção 3) |

### 1.6 Riscos de teste

| Risco | Mitigação |
|---|---|
| Integração só no fim | Checkpoint 16/11 exige CT-01 a CT-13 integrados |
| Maven Central/Docker indisponível em algum PC | Perfil `local` (H2) para testes de API; SQLite para o banco |
| Dados de seed insuficientes para ALTA/QUEDA/ESTÁVEL | Seed com as três situações (responsável: Jamile) |

## 2. Especificação de casos de teste

Formato: pré-condição · passos/entrada · resultado esperado. **Camada**: BD, API, UI ou E2E (ponta a ponta).

| ID | Req. | Camada | Entrada / passos | Resultado esperado |
|---|---|---|---|---|
| CT-01 | RF01 | API, UI | ADMIN cria categoria "Moletom" | 201; aparece na listagem e no banco |
| CT-02 | RF01, RNF10 | API, UI | Cria "jeans" com "Jeans" já existente | 400 "Categoria já cadastrada"; app continua no ar |
| CT-03 | RF02 | BD, API, UI | Cria confecção em "Recife" | Recusada; o formulário só oferece as 3 cidades |
| CT-04 | RF03 | API, UI | Venda com mesma confecção, categoria e mês de uma existente | 400 com mensagem de duplicidade |
| CT-05 | RF03, RNF10 | BD, API | Quantidade −1 ou faturamento −10 | 400 indicando o campo; CHECK impede no banco |
| CT-06 | RF04 | BD, UI | Lista de vendas | Cada linha mostra origem e nome da fonte |
| CT-07 | RF05 | E2E | Dashboard, jan–mar/2026, Caruaru | Totais iguais ao `SELECT SUM` no banco |
| CT-08 | RF05 | API, UI | Período sem registros | "Não há dados para o período selecionado" |
| CT-09 | RF06 | Unidade, UI | Anterior R$ 10.000, atual R$ 11.000 | ALTA (+10%) |
| CT-10 | RF06 | Unidade | R$ 10.000 → R$ 10.500 e R$ 10.000 → R$ 9.500 | ALTA (+5%) e QUEDA (−5%) — limites incluídos |
| CT-11 | RF06 | Unidade | R$ 10.000 → R$ 10.400; anterior R$ 0 | ESTÁVEL (+4%); SEM BASE |
| CT-12 | RF07, RNF03 | Unidade, UI | Real R$ 20.000, impacto 30% | Hipotético R$ 14.000; diferença R$ 6.000 (30%); fórmula visível |
| CT-13 | RF07 | API | Impacto 101% e −1% | 400; 0% e 100% aceitos |
| CT-14 | RF08 | E2E | Salvar "Shein 30%" e reabrir | Lista mostra o cenário; mesmo resultado |
| CT-15 | RF09 | API | GET /api/indicadores sem token | 401 |
| CT-16 | RF09 | API, UI | EMPRESARIO tenta POST /api/categorias e abrir Cadastros | 403; menu de cadastros oculto |
| CT-17 | RNF01 | BD, API | 10.000 vendas (`teste_desempenho.sql`); 20 requisições simultâneas ao dashboard | p95 ≤ 3 s; EXPLAIN usa `idx_lancamento_mes_categoria` |
| CT-18 | RNF04 | UI | Do dashboard até a tendência de "Jeans" | ≤ 3 cliques |
| CT-19 | RNF05 | UI | DevTools 360 px | Sem rolagem horizontal; textos legíveis |
| CT-20 | RNF07 | BD, Inspeção | `SELECT senha_hash FROM usuario`; buscar segredos no código | Hash BCrypt (`$2a$`); nenhum segredo fixo no código |

## 3. Relatório de execução

Preencher a cada rodada (16/11 e 22/11). Status: ✅ passou · ❌ falhou · ⏸ bloqueado · — não executado.

| ID | 16/11 | 22/11 | Defeito / evidência | Executado por |
|---|---|---|---|---|
| CT-01 | — | — | | |
| CT-02 | — | — | | |
| CT-03 | — | — | | |
| CT-04 | — | — | | |
| CT-05 | — | — | | |
| CT-06 | — | — | | |
| CT-07 | — | — | | |
| CT-08 | — | — | | |
| CT-09 | — | — | | |
| CT-10 | — | — | | |
| CT-11 | — | — | | |
| CT-12 | — | — | | |
| CT-13 | — | — | | |
| CT-14 | — | — | | |
| CT-15 | — | — | | |
| CT-16 | — | — | | |
| CT-17 | — | — | | |
| CT-18 | — | — | | |
| CT-19 | — | — | | |
| CT-20 | — | — | | |

### Situação em 09/11 (antes da execução formal)

- Banco: workflow Docker MySQL confere 11 tabelas com dados; `gerar_sqlite.py` passa em `foreign_key_check` e `integrity_check`.
- Back-end: 7 testes em `ApiIntegrationTest` e 1 classe de teste de indicadores na branch `back-05`; a `main` não compila (AUD-01), então nenhum teste roda hoje.
- Front-end: `npm run build` passa; não há testes automatizados.

### Registro de defeitos

| ID | Caso | Descrição | Severidade | Responsável | Status |
|---|---|---|---|---|---|
| DEF-01 | — | `main` do Back-end não compila (AUD-01) | Crítica | Gabriela | Aberto |
| DEF-02 | CT-15 | JWT não validado (AUD-02) | Crítica | Gabriela | Aberto |
| DEF-03 | CT-12 | Faturamento real fixo em R$ 10.000 (AUD-06) | Alta | Gabriela | Aberto |
