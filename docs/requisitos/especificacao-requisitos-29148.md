# Especificação de Requisitos — TRAMA (ISO/IEC/IEEE 29148)

| Campo | Informação |
|---|---|
| Projeto | TRAMA (antigo RedeSulanca) — Inteligência de dados aplicada à tomada de decisão no Polo Têxtil do Agreste Pernambucano |
| Instituição / curso | SENAC Pernambuco — Análise e Desenvolvimento de Sistemas |
| Disciplina / professor | Engenharia de Requisitos — Prof. Me. Paulo Pimentel |
| Equipe | AstralCommits — Gyovanna Gabrielly, Maria Nicolle, Ester Reis, Gabriela Olegário, Jamile Keiller e Júlia Cássia |
| Norma | ISO/IEC/IEEE 29148:2018 (substitui a IEEE Std 830-1998), com atributos de qualidade da ISO/IEC 25010:2011 |
| Versão | 2.0 — 09/11/2026 |

## Histórico de revisões

| Versão | Data | Descrição | Autores |
|---|---|---|---|
| 2.0 | 09/11/2026 | Migração para a ISO/IEC/IEEE 29148: requisitos de stakeholder (StRS), atributos de cada requisito (fonte, método de verificação, status), situação de implementação e rastreabilidade até código e casos de teste | AstralCommits |
| 1.0 | 26/10/2026 | Reestruturação no modelo IEEE 830, revisada pelo checklist de V&V | AstralCommits |
| 0.2 | 28/09/2026 | Relatório da Atividade III (escopo, entidades, endpoints, telas) | AstralCommits |
| 0.1 | 22/09/2026 | Project Charter do RedeSulanca | AstralCommits |

## 1. Introdução

### 1.1 Propósito

Este documento reúne, num único lugar, os requisitos de negócio, de stakeholder e de software do TRAMA, conforme a ISO/IEC/IEEE 29148. Serve de base para desenvolvimento, testes ([Plano de Testes — 29119](../testes/plano-testes-29119.md)) e validação com empresários do polo. Leitores: equipe do PI, professores orientadores e empresários que participam da validação.

### 1.2 Escopo

O TRAMA é uma plataforma web que reúne indicadores de vendas e tendências de mercado de forma visual para confecções de pequeno e médio porte de Toritama, Caruaru e Santa Cruz do Capibaribe, ajudando a decidir o que produzir e quando.

| Dentro do escopo | Fora do escopo (versões futuras) |
|---|---|
| Indicadores de vendas por categoria, período e cidade | Transação real de compra e venda |
| Classificação de tendência (alta, queda, estável) | Integração com e-commerce externo |
| Cenário comparativo do impacto da concorrência | Modelo preditivo de machine learning |
| Cadastro de categorias, confecções e vendas com origem do dado | Aplicativo mobile nativo |
| Autenticação com perfis ADMIN e EMPRESARIO | Importação de CSV em lote (complementar, P2) |

### 1.3 Visão geral do produto

**Perspectiva.** Produto novo, independente, em três camadas: SPA React (Front-end), API REST Java/Spring Boot (Back-end) e MySQL 8 (Banco de Dados). A arquitetura está descrita em [Descrição de Arquitetura — 42010](../arquitetura/descricao-arquitetura-42010.md).

**Funções.** Cadastrar e manter categorias, confecções e vendas; exibir dashboard de indicadores; classificar tendências; simular e salvar cenários de concorrência; registrar a fonte de cada dado; controlar acesso por perfil.

**Usuários.**

| Perfil | Quem é | O que faz | Familiaridade digital |
|---|---|---|---|
| ADMIN | Integrante da equipe do PI | Cadastra categorias, confecções, vendas e cenários | Alta |
| EMPRESARIO | Dono ou gestor de confecção do polo (real ou persona) | Consulta dashboard, tendências e cenários | Baixa a média; usa principalmente o celular |

**Limitações.** Base simulada alimentada pela equipe; fórmula de cenário simples e transparente; somente web responsiva; dados de entrevistados conforme a LGPD.

### 1.4 Definições

| Termo | Significado |
|---|---|
| Confecção | Empresa de pequeno ou médio porte do polo que produz e vende roupas |
| Categoria | Grupo de produtos analisado (ex.: jeans, moletom, moda praia) |
| Lançamento mensal | Registro de quantidade e faturamento de uma categoria, por confecção e mês |
| Indicador | Soma de quantidade e faturamento por categoria e período |
| Tendência | Variação entre o período atual e o anterior de mesma duração: ALTA, QUEDA, ESTÁVEL ou SEM BASE |
| Cenário comparativo | Faturamento real × faturamento hipotético a partir de um percentual de impacto da concorrência |
| Persona | Representação fictícia de uma confecção, baseada em entrevistas |
| StR / SwR | Requisito de stakeholder / requisito de software |
| CA | Critério de aceitação |

### 1.5 Referências

- ISO/IEC/IEEE 29148:2018 — Systems and software engineering — Life cycle processes — Requirements engineering.
- ISO/IEC 25010:2011 — System and software quality models.
- ISO/IEC/IEEE 42010, 29119, 26514, ISO/IEC 12207 e 27001 (ver [docs](../README.md)).
- SOMMERVILLE, Ian. *Engenharia de Software*. 10. ed. São Paulo: Pearson, 2019.
- PRESSMAN, Roger S.; MAXIM, Bruce R. *Engenharia de Software*. 8. ed. Porto Alegre: AMGH, 2016.
- Project Charter RedeSulanca (22/09/2026); Relatório da Atividade III (28/09/2026); SRS v1.0 (26/10/2026).
- Fontes do setor: Movimento Econômico, Diario de Pernambuco, G1 PE, Folha de Pernambuco, Jamildo, Agreste Notícia, Repositório UFPE, Empreender 360 (Sebrae/NTCPE).

## 2. Requisitos de negócio e de stakeholder (StRS)

### 2.1 Contexto de negócio

As confecções do Polo do Agreste decidem a produção por observação informal da feira e dos clientes. A chegada de plataformas internacionais de ultra fast fashion pressiona preço e volume. O TRAMA organiza dados de vendas para tornar essa decisão explícita.

**Objetivo de negócio (SMART).** Até a entrega final do PI (23/11/2026), permitir que ao menos duas confecções, reais ou representadas por personas, identifiquem pelo sistema um produto ou categoria com potencial de venda que não identificariam apenas pela observação informal.

### 2.2 Stakeholders

| Stakeholder | Interesse principal |
|---|---|
| Empresário do polo | Saber o que está vendendo mais e quanto a concorrência pode custar |
| Equipe AstralCommits (ADMIN) | Alimentar e manter a base de dados com rastreabilidade da fonte |
| Professores orientadores | Produto funcional, integrado, documentado e com contribuição individual verificável |
| Entrevistados | Não ser identificados (LGPD) |

### 2.3 Requisitos de stakeholder

| ID | Requisito de stakeholder | Origem |
|---|---|---|
| StR01 | O empresário precisa ver quanto vendeu por categoria num período e numa cidade. | Charter, entrevistas |
| StR02 | O empresário precisa saber quais categorias estão subindo ou caindo. | Charter (escopo) |
| StR03 | O empresário precisa estimar a perda de faturamento causada pela concorrência. | Charter, tema do PI |
| StR04 | A equipe precisa cadastrar dados com a fonte de origem registrada. | Charter (resultados esperados) |
| StR05 | O acesso deve separar quem cadastra de quem consulta. | Revisão da SRS v1.0 |
| StR06 | Os entrevistados não podem ser identificados. | LGPD |
| StR07 | O sistema deve ser usável por quem tem pouca familiaridade digital e usa celular. | Perfil EMPRESARIO |

## 3. Requisitos de software

Cada requisito tem: **ID**, enunciado com "deve", **prioridade** (Essencial = Must, Desejável = Should, Opcional = Could), **fonte** (StR), **método de verificação** (T = teste, D = demonstração, I = inspeção, A = análise) e **critério de aceitação**. A situação de implementação está na seção 5.

### 3.1 Requisitos funcionais

| ID | Requisito | Prior. | Fonte | Verif. | Critério de aceitação |
|---|---|---|---|---|---|
| RF01 | O sistema deve permitir ao ADMIN cadastrar, consultar, alterar e excluir categorias, com nome obrigatório, único (sem diferenciar maiúsculas) e de até 50 caracteres. | Essencial | StR04 | T | Cadastrar "Jeans" e depois "jeans" exibe "Categoria já cadastrada" (HTTP 400). |
| RF02 | O sistema deve permitir ao ADMIN cadastrar, consultar, alterar e excluir confecções, com nome e cidade obrigatórios; a cidade deve ser Toritama, Caruaru ou Santa Cruz do Capibaribe. | Essencial | StR04 | T | O campo cidade só oferece as três opções; outra cidade é recusada pela API e pelo banco. |
| RF03 | O sistema deve permitir ao ADMIN registrar vendas com categoria, confecção, mês/ano, quantidade (inteiro ≥ 0) e faturamento em R$ (≥ 0), recusando dois registros ativos com a mesma categoria, confecção e mês/ano. | Essencial | StR04 | T | Registro duplicado e valores negativos são recusados com mensagem do campo. |
| RF04 | O sistema deve registrar a origem de cada venda (ENTREVISTA, QUESTIONARIO ou FONTE_SECUNDARIA) e o nome da fonte. | Desejável | StR04 | T, I | Toda venda listada exibe origem e nome da fonte. |
| RF05 | O sistema deve exibir dashboard com quantidade e faturamento por categoria, filtrável por período (mês/ano inicial e final) e cidade. | Essencial | StR01 | T, D | Período sem registros exibe "Não há dados para o período selecionado". |
| RF06 | O sistema deve classificar a tendência de cada categoria comparando o faturamento do período selecionado com o período anterior de mesma duração: variação ≥ +5% = ALTA; ≤ −5% = QUEDA; entre os limites = ESTÁVEL; sem faturamento no período anterior = SEM BASE. | Essencial | StR02 | T | R$ 10.000 → R$ 11.000 aparece como "ALTA (+10%)"; R$ 10.000 → R$ 10.400 como "ESTÁVEL (+4%)". |
| RF07 | O sistema deve calcular o cenário comparativo de uma categoria e período a partir de um percentual de impacto (0 a 100%), exibindo faturamento real, hipotético e a diferença em R$ e %. | Essencial | StR03 | T | Confere com a fórmula de RNF03 em caso calculado à mão (R$ 20.000, 30% → R$ 14.000; diferença R$ 6.000). |
| RF08 | O sistema deve permitir salvar um cenário com nome e percentual e consultá-lo depois. | Desejável | StR03 | T | Cenário salvo aparece na lista e reproduz o mesmo resultado. |
| RF09 | O sistema deve exigir login e restringir os cadastros (RF01–RF04) ao ADMIN; o EMPRESARIO apenas consulta (RF05–RF08). | Desejável | StR05 | T | EMPRESARIO não vê telas de cadastro e recebe HTTP 403 ao tentar criar categoria pela API. |

### 3.2 Requisitos de desempenho

| ID | Requisito | Prior. | Fonte | Verif. |
|---|---|---|---|---|
| RNF01 | Dashboard, tendências e cenário devem responder em até 3 s em 95% das requisições, com até 10.000 vendas e 20 usuários simultâneos. | Essencial | StR07 | A, T (`teste_desempenho.sql` + medição da API) |

### 3.3 Interfaces

**Usuário.** Dashboard (cards + gráfico de barras), Tendências (lista com badge e variação %), Cenário (percentual, fórmula, real × hipotético), Cadastros (formulários), Login.

**Software (API REST, JSON sobre HTTPS).**

| Recurso | Métodos | Perfil | Requisito |
|---|---|---|---|
| `/api/auth/login` | POST | público | RF09 |
| `/api/cidades` | GET | autenticado | RF02 |
| `/api/categorias`, `/api/confeccoes`, `/api/vendas` | GET / POST / PUT / DELETE | GET autenticado; escrita ADMIN | RF01–RF04 |
| `/api/indicadores?inicio=AAAA-MM&fim=AAAA-MM&cidade&categoriaId` | GET | autenticado | RF05, RF06 |
| `/api/cenarios/simular` | POST | autenticado | RF07 |
| `/api/cenarios`, `/api/cenarios/{id}` | GET / POST | GET autenticado; POST ADMIN | RF08 |
| `/api/health` | GET | público | operação |

**Hardware.** Sem hardware dedicado; computador ou smartphone com navegador.

### 3.4 Requisitos lógicos de banco de dados

Modelo relacional em 3FN no MySQL 8 (base `confeccoes`), com 11 tabelas; as principais e seus vínculos com os requisitos:

| Tabela | Campos-chave | Requisitos |
|---|---|---|
| `cidade` | id_cidade, nome (CHECK nas 3 cidades), uf | RF02 |
| `confeccao` | id_confeccao, nome, porte, tipo, id_cidade | RF02 |
| `categoria` | id_categoria, nome UNIQUE (≤ 50) | RF01 |
| `lancamento_mensal` | id_lancamento, mes_referencia (dia 1), quantidade ≥ 0, faturamento ≥ 0, origem_dado, nome_fonte, lanc_status, UNIQUE (confecção, categoria, mês) | RF03, RF04 |
| `cenario_concorrencia` | id_cenario, nome, percentual_impacto (0–100), id_categoria | RF07, RF08 |
| `usuario` | id_usuario, email, senha_hash, perfil (ADMIN, EMPRESARIO) | RF09 |
| `historico_lancamento` | trilha de UPDATE/DELETE de lançamentos | rastreabilidade |

### 3.5 Restrições de projeto

| ID | Requisito | Prior. | Verif. |
|---|---|---|---|
| RNF02 | Back-end em Java 21/Spring Boot 3, Front-end em React, banco MySQL 8, código no GitHub com GitFlow. | Essencial | I |
| RNF03 | O cenário deve usar fórmula simples, sem modelo preditivo: **faturamento hipotético = faturamento real × (1 − percentual/100)**; a fórmula aparece na tela. | Essencial | T, I |

### 3.6 Atributos de qualidade (ISO/IEC 25010)

| ID | Característica | Requisito | Prior. | Verif. |
|---|---|---|---|---|
| RNF04 | Usabilidade | O EMPRESARIO chega à tendência de uma categoria em no máximo 3 cliques a partir do dashboard. | Essencial | D |
| RNF05 | Usabilidade | Telas responsivas e legíveis a partir de 360 px. | Essencial | D, I |
| RNF06 | Portabilidade | Chrome, Edge e Firefox (duas últimas versões) e Chrome Android 11+. | Desejável | D |
| RNF07 | Segurança | Senhas com BCrypt; HTTPS em produção; segredo do JWT fora do código. | Desejável | I, T |
| RNF08 | Segurança (LGPD) | Dados de entrevistados não identificam pessoas: só cidade, porte ou nome fictício de persona. | Essencial | I |
| RNF09 | Manutenibilidade | Camadas controller/service/repository e endpoints documentados em Swagger/OpenAPI. | Desejável | I |
| RNF10 | Confiabilidade | Entrada inválida retorna HTTP 400 com o campo e a mensagem, sem derrubar a aplicação. | Essencial | T |

Os limites de RF06, RNF01 e RNF04 são metas propostas e devem ser confirmados na validação com empresários.

## 4. Verificação e validação

### 4.1 Verificação

Cada requisito tem método definido (seções 3.1 a 3.6) e ao menos um caso de teste no [Plano de Testes](../testes/plano-testes-29119.md). Os problemas encontrados na v1.0 e corrigidos estão no Apêndice A.

### 4.2 Validação com stakeholders

1. **Protótipo:** apresentar dashboard, tendência e cenário a pelo menos dois empresários: "É isso que você imaginou?".
2. **Cenário de uso:** o empresário usa o sistema para escolher uma categoria a produzir no próximo mês.
3. **Critério de sucesso:** aponta ao menos uma categoria com potencial que não tinha percebido (objetivo SMART).
4. **Confirmar limites:** ±5% (RF06) e o percentual de impacto (RF07).

Registro: tabela `entrevista` (campo `achou_algo_novo`) e ata anexada ao relatório final.

## 5. Rastreabilidade e situação de implementação (09/11/2026)

Legenda: ✅ pronto · 🟡 parcial · ❌ não iniciado. Detalhes dos achados em [auditoria](../auditoria/2026-11-09-auditoria.md).

| Req. | StR | Banco de Dados | Back-end | Front-end | Casos de teste | Situação |
|---|---|---|---|---|---|---|
| RF01 | StR04 | ✅ `categoria` UNIQUE | ✅ `CategoriaController` | 🟡 tela local, sem API | CT-01, CT-02 | 🟡 |
| RF02 | StR04 | ✅ CHECK cidades | ✅ `ConfeccaoController`, `/api/cidades` | 🟡 tela local | CT-03 | 🟡 |
| RF03 | StR04 | ✅ UNIQUE + CHECK ≥ 0 | ✅ `VendaService` | 🟡 tela local | CT-04, CT-05 | 🟡 |
| RF04 | StR04 | ✅ `origem_dado`, `nome_fonte` (PR #8) | ✅ `OrigemDado` | ❌ | CT-06 | 🟡 |
| RF05 | StR01 | ✅ índices RNF01 | 🟡 só na branch `back-05` (AUD-01) | 🟡 contrato divergente (AUD-04) | CT-07, CT-08 | 🟡 |
| RF06 | StR02 | — | 🟡 regra pronta na branch, com teste | 🟡 regra local | CT-09 a CT-11 | 🟡 |
| RF07 | StR03 | ✅ CHECK 0–100 | 🟡 faturamento fixo (AUD-06) | 🟡 simulador local | CT-12, CT-13 | 🟡 |
| RF08 | StR03 | ✅ `cenario_concorrencia` | ❌ | ❌ | CT-14 | ❌ |
| RF09 | StR05 | ✅ `usuario.perfil` | 🟡 login sem filtro JWT (AUD-02) | 🟡 login local | CT-15, CT-16 | 🟡 |
| RNF01 | StR07 | ✅ `teste_desempenho.sql` | ❌ medição | — | CT-17 | 🟡 |
| RNF03 | StR03 | — | ✅ fórmula | ✅ fórmula visível | CT-12 | ✅ |
| RNF04/05 | StR07 | — | — | 🟡 a medir | CT-18, CT-19 | 🟡 |
| RNF07 | StR05 | ✅ `senha_hash` | 🟡 BCrypt ok; segredo no código | — | CT-20 | 🟡 |
| RNF08 | StR06 | ✅ entrevista sem nome | — | — | inspeção | ✅ |
| RNF09 | — | — | ❌ Swagger | — | inspeção | ❌ |
| RNF10 | — | — | ✅ `ApiExceptionHandler` | 🟡 | CT-02, CT-05 | 🟡 |

## Apêndice A — Problemas de redação corrigidos

| Trecho original | Critério que falhou | Correção |
|---|---|---|
| "Visualização de tendência (alta/queda/estável)" | Mensurabilidade | RF06 define comparação entre períodos, ±5% e o caso SEM BASE (novo na v2.0) |
| "Cenário comparativo de impacto da concorrência" | Completude | RF07 e RNF03 definem entrada, fórmula e saída |
| "CRUD categorias / confecções" | Completude, ator | RF01–RF03 definem ADMIN, campos e duplicidade |
| "Reunir indicadores de forma visual" | Clareza | RF05 define cards, gráfico e filtros; RNF04/RNF05 dão critérios |
| RF04 "com o nome da fonte" sem campo no banco (v1.0) | Viabilidade/consistência | Coluna `nome_fonte` criada no BD (v2.0) |
| RNF07 "comunicação deve usar HTTPS" sem tratar segredos | Completude | RNF07 inclui segredo do JWT fora do código (v2.0) |
