# Cronograma pós-auditoria — TRAMA (09/11 a 23/11/2026)

| Campo | Informação |
|---|---|
| Equipe | AstralCommits — ADS Senac Recife 2026.2 |
| Base | [Auditoria de 09/11/2026](../auditoria/2026-11-09-auditoria.md) (normas ISO/IEC/IEEE 29148, 42010, 26514, 29119, ISO/IEC 12207 e 27001) |
| Checkpoint | **16/11 (segunda)** — apresentação do cronograma e demonstração integrada |
| Entrega final | **23/11 (segunda)** — sistema executável, documentação e contribuição individual |

## 1. Onde estamos (09/11)

| Frente | Progresso | O que já está pronto | O que trava |
|---|---|---|---|
| Banco de Dados | ~95% | 11 tabelas em 3FN, procedures, triggers, índices RNF01, Docker MySQL, SQLite, CI, GitFlow com tags | Merge do PR #8 (compatibilidade com a API) e release para a `main` |
| Back-end | ~55% | Spring Boot 3.3/Java 21, entidades, CRUD de categorias, confecções e vendas, login JWT, erros padronizados | `main` não compila (AUD-01); JWT sem validação (AUD-02); cenário com valor fixo (AUD-06) |
| Front-end | ~45% | SPA React com dashboard, tendências, simulador e cadastros; build passa | Tudo em `localStorage`; contrato de indicadores diferente da API (AUD-04/05) |
| Documentação (normas) | 100% redigida | SRS v2.0 (29148), arquitetura (42010), guia (26514), testes (29119), processo (12207), segurança (27001) | Relatório de testes e capturas de tela dependem da integração |

**Caminho crítico até 16/11:** compilar a API → validar o JWT → fixar o contrato de indicadores → Front consumindo a API real.

## 2. Linha do tempo

| Data | Marco | Entregas verificáveis |
|---|---|---|
| Seg 09/11 | Aula — checkpoint 1 | Auditoria apresentada; issues distribuídas |
| Ter 10/11 | Destravar | PR #8 do BD revisado e mesclado; AUD-01 corrigido (API compila); PR das novas funcionalidades no Front; issues abertas |
| Qua 11/11 | Contrato | Contrato de `GET /api/indicadores` fechado (Ester + Gyovanna); release BD `v0.4.0`; `develop` no Back-end |
| Qui 12/11 | Segurança | Filtro JWT + segredo em variável; seed de demonstração com ALTA/QUEDA/ESTÁVEL e usuários ADMIN/EMPRESARIO |
| Sex 13/11 | Integração 1 | API no perfil `dev` contra o Docker; Front com login real e indicadores reais |
| Sáb 14/11 | Integração 2 | Cenário com faturamento real + salvar/listar; services de cadastros e vendas no Front |
| Dom 15/11 | Ensaio | Jornada completa rodando; CT-01 a CT-13 executados; slides revisados |
| **Seg 16/11** | **Aula — checkpoint 2** | Apresentação do cronograma e demonstração Front → API → BD |
| 17–19/11 | Qualidade | Perfis RF09 (403), Swagger, CI no Back e no Front, testes de unidade no Front |
| 20/11 | Congelamento de funcionalidades | Nada novo a partir daqui; só correções |
| 21/11 | Regressão | CT-01 a CT-20; capturas de tela no manual |
| 22/11 | Ensaio final | Ensaio em 2 máquinas; vídeo de contingência; backup do banco; relatório de testes |
| **Seg 23/11** | **Entrega final** | Release `v1.0.0` nos três repositórios; demonstração; retrospectiva |

## 3. Atividades individuais

Status em 09/11: ✅ feito · 🔄 em andamento · ⬜ a fazer.

### Jamile Keiller — Banco de Dados (modelagem e compatibilidade) + documentação

| # | Atividade | Ref. | Prazo | Status |
|---|---|---|---|---|
| J1 | Compatibilizar `lancamento_mensal` com a entidade da API (`origem_dado`, `nome_fonte`) + migração | AUD-03 | 09/11 | ✅ PR #8 |
| J2 | Documentação por norma em `TRAMA/docs` e SRS v2.0 | AUD-07 a 11, 18 | 09/11 | ✅ |
| J3 | Abrir as issues propostas nos repositórios Back-end e Front-end | AUD-01 a 17 | 10/11 | ⬜ |
| J4 | Mesclar PR #8 e fazer release `develop → main` com tag `v0.4.0` | AUD-19 | 11/11 | ⬜ |
| J5 | Seed de demonstração com casos ALTA, QUEDA, ESTÁVEL e SEM BASE + usuários ADMIN/EMPRESARIO (BCrypt) | CT-07 a 11 | 12/11 | ⬜ |
| J6 | Subir a API no perfil `dev` contra o Docker com Ester e registrar o resultado | COR-01, 03 | 13/11 | ⬜ |
| J7 | Credenciais do Docker em `.env` + `.env.example` | R05 | 20/11 | ⬜ |
| J8 | Capturas de tela no guia (26514) e atualização da rastreabilidade da SRS | 26514, 29148 | 21/11 | ⬜ |
| J9 | Executar e registrar CT-03, CT-05, CT-06 e CT-20 | 29119 | 16 e 22/11 | ⬜ |

### Júlia Cássia — Banco de Dados (otimização e auditoria)

| # | Atividade | Ref. | Prazo | Status |
|---|---|---|---|---|
| U1 | Revisar o PR #8 do Banco-de-Dados | AUD-03 | 10/11 | ⬜ |
| U2 | Rodar `teste_desempenho.sql` (10.000 vendas) e registrar EXPLAIN da consulta de indicadores | RNF01, CT-17 | 14/11 | ⬜ |
| U3 | Conferir com EXPLAIN a query `agregarIndicadores` gerada pela API (log SQL) | RNF01 | 15/11 | ⬜ |
| U4 | Backup e teste de restauração antes de cada apresentação | R04 | 15/11 e 22/11 | ⬜ |
| U5 | Documentar procedures, triggers e histórico no README do BD (os comentários saíram dos scripts) | 42010 | 19/11 | ⬜ |
| U6 | Executar CT-17 (desempenho) na API integrada e preencher o relatório | 29119 | 22/11 | ⬜ |

### Ester Reis — Back-end (estrutura, cadastros, vendas)

| # | Atividade | Ref. | Prazo | Status |
|---|---|---|---|---|
| E1 | Criar `develop` no Back-end e passar a integrar por PR | AUD-12 | 10/11 | ⬜ |
| E2 | Fechar o contrato de `GET /api/indicadores` com Gyovanna | AUD-04 | 11/11 | ⬜ |
| E3 | Gerar `mvnw`; documentar `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` e `TRAMA_JWT_SECRET` no README | AUD-14 | 11/11 | ⬜ |
| E4 | Revisar o PR de Gabriela que corrige a compilação (AUD-01) | AUD-01 | 11/11 | ⬜ |
| E5 | Testes de integração dos cadastros e vendas (CT-01 a CT-05) | 29119 | 14/11 | ⬜ |
| E6 | Swagger/OpenAPI com o contrato acordado | RNF09, AUD-15 | 18/11 | ⬜ |
| E7 | GitHub Actions com `mvn -B test` | AUD-16 | 19/11 | ⬜ |
| E8 | Release `v1.0.0` do Back-end | 12207 | 23/11 | ⬜ |

### Gabriela Olegário — Back-end (indicadores, cenários, segurança)

| # | Atividade | Ref. | Prazo | Status |
|---|---|---|---|---|
| G1 | Trazer `IndicadorService` e DTOs para a `main` sem perder o JWT; incluir `mensagem` no DTO | AUD-01 | 10/11 | ⬜ |
| G2 | `JwtAuthenticationFilter`; segredo em `TRAMA_JWT_SECRET`; liberar `/api/health` e Swagger | AUD-02, R01, R02 | 12/11 | ⬜ |
| G3 | Cenário com faturamento real do banco; `POST/GET /api/cenarios` | AUD-06, RF07, RF08 | 14/11 | ⬜ |
| G4 | Testes de unidade de tendência (limites ±5%, SEM BASE) e da fórmula | CT-09 a 14 | 15/11 | ⬜ |
| G5 | Regras de perfil: escrita só ADMIN; teste 401/403 | RF09, CT-15, 16 | 18/11 | ⬜ |
| G6 | Revisar a política de segurança (27001) e confirmar riscos R01/R02 fechados | 27001 | 20/11 | ⬜ |

### Gyovanna Gabrielly — Front-end (estrutura SPA e dashboard)

| # | Atividade | Ref. | Prazo | Status |
|---|---|---|---|---|
| Y1 | Levar o trabalho de `TRAMA-novas-funcionalidades` para `Front-end/develop` por PR | AUD-13 | 10/11 | ⬜ |
| Y2 | Fechar o contrato de indicadores com Ester | AUD-04 | 11/11 | ⬜ |
| Y3 | Adaptar `types/indicadores.ts`, `indicadoresService` e `tendenciasService` ao contrato | AUD-04 | 13/11 | ⬜ |
| Y4 | Login real (`POST /api/auth/login`) e interceptor do token, com Maria | AUD-05, RF09 | 14/11 | ⬜ |
| Y5 | Dashboard e tendências com dados da API, estados de carregamento, vazio e erro | RF05, RF06 | 15/11 | ⬜ |
| Y6 | Conferir RNF04 (≤ 3 cliques) e RNF05 (360 px) | CT-18, 19 | 19/11 | ⬜ |
| Y7 | Vitest para `classifyTrend` e formatação | 29119 | 19/11 | ⬜ |

### Maria Nicolle — Front-end (tendências, cenários, cadastros)

| # | Atividade | Ref. | Prazo | Status |
|---|---|---|---|---|
| M1 | Corrigir o README (pasta `apps/web`) e remover o `.zip` da branch `TRAMA-Versão-1` | AUD-10, 12 | 10/11 | ⬜ |
| M2 | Services de categorias, confecções, cidades e vendas | AUD-05 | 13/11 | ⬜ |
| M3 | Login real e interceptor, com Gyovanna | AUD-05 | 14/11 | ⬜ |
| M4 | Telas de cadastro e vendas gravando na API (exibir origem e fonte) | RF01 a 04 | 15/11 | ⬜ |
| M5 | Simulador ligado a `/api/cenarios/simular`; salvar e listar cenários | RF07, RF08 | 18/11 | ⬜ |
| M6 | GitHub Actions do Front (`typecheck` + `build`) | AUD-16 | 19/11 | ⬜ |
| M7 | Marcar como "protótipo" ou ocultar os módulos fora da SRS | AUD-17 | 20/11 | ⬜ |
| M8 | Release `develop → main` e tag `v1.0.0` do Front | 12207 | 23/11 | ⬜ |

### Toda a equipe

| Atividade | Prazo |
|---|---|
| 2FA ativo nas contas do GitHub; docente com permissão de escrita | 16/11 |
| Atualizar status das issues todo dia (A Fazer → Em execução → Em revisão → Concluído) | contínuo |
| Execução de CT-01 a CT-13 na demonstração | 16/11 |
| Regressão completa e relatório de testes | 21–22/11 |
| Ensaio em duas máquinas + vídeo de contingência | 22/11 |

## 4. O que falta para a entrega final

| Prioridade | Pendência | Responsáveis | Prazo |
|---|---|---|---|
| P0 | API compilando na `main` com indicadores | Gabriela | 10/11 |
| P0 | Validação do JWT e segredo fora do código | Gabriela | 12/11 |
| P0 | Contrato de indicadores único e Front adaptado | Ester, Gyovanna | 13/11 |
| P0 | Front com login, cadastros, vendas e indicadores na API real | Maria, Gyovanna | 15/11 |
| P0 | Cenário com faturamento real | Gabriela | 14/11 |
| P0 | Banco compatível na `main` (`v0.4.0`) e seed de demonstração | Jamile | 12/11 |
| P1 | Salvar/listar cenários (RF08) | Gabriela, Maria | 18/11 |
| P1 | Perfis ADMIN/EMPRESARIO aplicados (RF09) | Gabriela, Gyovanna | 18/11 |
| P1 | Swagger, CI no Back e no Front | Ester, Maria | 19/11 |
| P1 | Relatório de testes preenchido; capturas no manual | Toda a equipe; Jamile | 22/11 |
| P2 | Importação CSV, SonarQube, refinamentos visuais | — | backlog |

## 5. Riscos do cronograma

| Risco | Sinal de alerta | Resposta |
|---|---|---|
| AUD-01 não fechado em 10/11 | API não compila na quarta | Ester pareia com Gabriela; G3 escorrega para 15/11 |
| Contrato não fechado em 11/11 | Front continua com tipos antigos | Vale o contrato do back-end descrito em `docs/arquitetura` |
| Integração no domingo | Nada rodando junto até 14/11 | Demonstrar em 16/11 o que estiver integrado e declarar o resto com data |
| Pouca evidência individual | Integrante sem commit na semana | Cada tarefa acima vira PR próprio |
