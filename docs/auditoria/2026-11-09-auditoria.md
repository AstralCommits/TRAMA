# Auditoria do projeto TRAMA — 09/11/2026

| Campo | Valor |
|---|---|
| Projeto | TRAMA — Inteligência de dados aplicada à tomada de decisão no Polo Têxtil do Agreste |
| Equipe | AstralCommits (ADS Senac Recife, 2026.2) |
| Data | 09/11/2026 |
| Escopo | Repositórios `TRAMA`, `Banco-de-Dados`, `Back-end`, `Front-end`, `TRAMA-novas-funcionalidades`; SRS v1.0 (IEEE 830); cronograma de 27/10 |
| Referência | Normas de Documentação em Tecnologia: ISO/IEC/IEEE 29148, 42010, 26514, 29119, ISO/IEC 12207 e 27001 |
| Auditoria anterior | 27/10/2026 (diagnóstico: BD ~80%, Back-end e Front-end 0% funcional) |

## 1. Método

1. Clone completo dos cinco repositórios e leitura de branches, tags, commits por autor e arquivos.
2. Build: Front-end (`npm install && npm run build`) e verificação estática de dependências do Back-end (o Maven Central não estava acessível no ambiente da auditoria, então a compilação foi conferida pelos imports).
3. Comparação do schema SQL com as entidades JPA e do contrato da API com os tipos do Front-end.
4. Conferência de cada artefato exigido pelas seis normas.

Severidade: **Crítica** (impede a demonstração de 16/11), **Alta** (requisito Essencial da SRS ou exigência de norma sem atendimento), **Média** (qualidade/rastreabilidade), **Baixa** (melhoria).

## 2. Evolução desde 27/10

| Frente | 27/10 | 09/11 | Evidência |
|---|---|---|---|
| Banco de Dados | ~80%, só `main` | ~95%: `develop`, 6 features, tags v0.1.0–v0.3.1, Docker MySQL, SQLite, CI, auditoria de histórico, índices RNF01 | 26 commits, PRs #4 e #6 |
| Back-end | 0% (arquivo Java solto) | ~55%: Spring Boot 3.3 + JDK 21, 6 entidades, CRUD de categorias, confecções e vendas, login JWT, tratamento de erros, 7 testes | 34 commits (28 Gabriela, 3 Ester, 3 Maria em set/26) |
| Front-end | 0% (HTML estático) | ~45%: React Router 7 + Vite + TS, dashboard, tendências, simulador, cadastros — **com dados locais**; build passa | 15 commits (todos Maria) na `develop` |
| Integração Front → API → BD | inexistente | **inexistente** (ver AUD-01 a AUD-05) | — |
| Documentação por norma | SRS IEEE 830 | SRS IEEE 830; demais normas sem artefato | — |

## 3. Achados

| ID | Sev. | Norma / requisito | Achado | Evidência | Responsável | Ação |
|---|---|---|---|---|---|---|
| AUD-01 | Crítica | 12207 (implementação), RF05 | `main` do Back-end não compila: `IndicadorController` importa `IndicadorService` e `IndicadorResponseDTO`, que só existem na branch `back-05-indicadores`. Na branch, o DTO tem 9 campos e o service passa 10. A branch também apaga o JWT. | `Backend/src/main/java/br/com/trama/controller/IndicadorController.java` | Gabriela | Integrar seletivamente, acrescentar `mensagem` no DTO |
| AUD-02 | Crítica | RF09, 27001 | JWT é gerado mas nenhum filtro o valida; toda rota fora de `/api/auth/**` responde 401/403 (inclusive `/api/health`). Chave secreta fixa no código. | `config/SecurityConfig.java`, `service/JwtService.java` | Gabriela, Ester | `JwtAuthenticationFilter`; segredo em variável de ambiente |
| AUD-03 | Crítica | 42010 (visão de dados), RF04 | Schema do BD (`fonte_dado`) diferente da entidade (`origem_dado`, `nome_fonte`); com `ddl-auto: validate` a API não sobe contra o MySQL do Docker. | `schema.sql` × `LancamentoMensal.java` | Jamile | **Corrigido** no PR #8 do Banco-de-Dados (aguarda CI e revisão) |
| AUD-04 | Crítica | 42010 (correspondência), RF05/RF06 | Contrato de `GET /api/indicadores` diverge: parâmetros (`inicio/fim` × `mesInicial/anoInicial...`), campos (`indicadores`/`totalFaturamento` × `categorias`/`faturamentoTotal`) e rótulos (`ESTAVEL`/`SEM_BASE` × `ESTÁVEL`). | `IndicadorResponseDTO` × `types/indicadores.ts` | Ester, Gyovanna | Fixar contrato (proposta: o do back-end) |
| AUD-05 | Crítica | RF01–RF03, RF07–RF09 | Front-end só chama `/api/indicadores`; login, cadastros, vendas e cenário usam `localStorage`. | `lib/auth.client.ts`, `home/*.tsx` | Maria, Gyovanna | Services Axios para cada recurso + token no interceptor |
| AUD-06 | Alta | RF07, RF08, RNF03 | Simulação usa faturamento real fixo de R$ 10.000; não há salvar/listar cenário. | `CenarioController.java` | Gabriela | Buscar faturamento no banco; `POST/GET /api/cenarios` |
| AUD-07 | Alta | 29148 | SRS segue IEEE 830 (substituída pela 29148): faltam requisitos de stakeholder (StRS), atributos de verificação por requisito, status e rastreabilidade até código/teste. | SRS v1.0 | Toda a equipe (Jamile consolida) | **Feito**: SRS v2.0 (29148) neste PR |
| AUD-08 | Alta | 42010 | Não existe Descrição de Arquitetura (stakeholders, preocupações, visões lógica/dados/implantação, decisões). | — | Toda a equipe | **Feito**: `docs/arquitetura` neste PR |
| AUD-09 | Alta | 29119 | Não há plano de testes, casos de teste rastreados nem relatório. Back-end tem 7 testes; Front-end, nenhum. | `src/test` | Toda a equipe | **Feito**: plano e casos em `docs/testes`; execução até 22/11 |
| AUD-10 | Alta | 26514 | Não há guia de instalação unificado nem manual do usuário; README do Front-end indica a pasta errada (`package.json` fica em `apps/web`). | `Frontend/README.md` | Gyovanna, Maria | **Feito** o guia unificado; corrigir README do Front |
| AUD-11 | Alta | 27001 | Sem política de segurança, análise de risco ou plano de continuidade; credenciais fixas (`root/root`, `trama/trama`, chave JWT) versionadas. | `docker-compose.yml`, `JwtService.java` | Toda a equipe | **Feito**: `docs/seguranca`; mover segredos para `.env` |
| AUD-12 | Média | 12207 (gestão de configuração) | GitFlow só no BD. Back-end: sem `develop`, 28 commits diretos na `main`. Front-end: código só na `develop`, `main` com imagens, `.zip` versionado na branch `TRAMA-Versão-1`, commits "Add files via upload". | histórico Git | Ester, Maria | `develop` + PRs; remover zip; Conventional Commits |
| AUD-13 | Média | 12207, rastreabilidade individual | Trabalho de Gyovanna (08/11) está em repositório privado separado e não aparece no Front-end; Júlia tem 2 commits (BD) e Ester 3 (Back-end) desde 27/10. | `shortlog` | Gyovanna, Júlia, Ester | PR para `Front-end/develop`; tarefas com commits próprios no cronograma |
| AUD-14 | Média | 26514, execução | Back-end só tem `mvnw.cmd`; perfil `dev` usa `localhost:3306` com `root` sem senha, enquanto o Docker expõe `3307` com `trama/trama`. | `application-dev.yml` × `docker-compose.yml` | Ester | Gerar `mvnw`; documentar variáveis `DB_*` |
| AUD-15 | Média | RNF09 | Sem Swagger/OpenAPI no Back-end. | `pom.xml` | Ester | `springdoc-openapi` |
| AUD-16 | Média | 12207 (garantia de qualidade) | CI só no BD. | `.github/workflows` | Ester, Maria | Actions: `mvn test`; `npm run typecheck && build` |
| AUD-17 | Baixa | SRS 1.2 (escopo) | Front-end tem 14 módulos (estoque, produção, financeiro, clientes...) fora do escopo da SRS. | `home/workspace.tsx` | Gyovanna, Maria | Marcar como protótipo ou ocultar na banca |
| AUD-18 | Baixa | 12207 | Repositório `TRAMA` (vitrine do projeto) tinha só um README de 2 linhas. | `README.md` | Jamile | **Feito**: README e `docs/` neste PR |
| AUD-19 | Baixa | 12207 | Release do BD: `develop` está 10 commits à frente da `main` (Docker, SQLite, CI, perfil EMPRESARIO não estão na `main`). | `git log main..develop` | Jamile, Júlia | PR de release `develop → main` + tag `v0.4.0` após o PR #8 |

## 4. Conformidade por norma

| Norma | Artefato esperado | Antes (27/10) | Depois deste PR | Pendente |
|---|---|---|---|---|
| ISO/IEC/IEEE 29148 | Especificação de requisitos (StRS, SyRS/SRS) | IEEE 830 | [SRS v2.0](../requisitos/especificacao-requisitos-29148.md) | Validação com 2 empresários (A.2) |
| ISO/IEC/IEEE 42010 | Descrição de arquitetura | Ausente | [Descrição de arquitetura](../arquitetura/descricao-arquitetura-42010.md) | Atualizar quando AUD-04 for fechado |
| ISO/IEC/IEEE 26514 | Guia de instalação e manual do usuário | READMEs por repositório | [Guia de instalação e uso](../usuario/guia-instalacao-uso-26514.md) | Capturas de tela após integração |
| ISO/IEC/IEEE 29119 | Plano, casos e relatório de teste | Ausente | [Plano e casos de teste](../testes/plano-testes-29119.md) | Executar e preencher o relatório até 22/11 |
| ISO/IEC 12207 | Processos do ciclo de vida | Parcial (só BD) | [Processos do ciclo de vida](../processo/ciclo-de-vida-12207.md) | Aplicar GitFlow no Back e Front |
| ISO/IEC 27001 | Política, análise de risco, continuidade | Ausente | [Segurança da informação](../seguranca/seguranca-informacao-27001.md) | Remover segredos do código |

## 5. Conclusão

As três camadas existem e cada uma funciona isoladamente; o que falta para o checkpoint de 16/11 é **integração**. Os cinco achados críticos (AUD-01 a AUD-05) estão todos no caminho Front → API → BD e somam cerca de 3 a 4 dias de trabalho distribuído. A documentação exigida pelas normas foi produzida neste PR; a parte que depende de execução (relatório de testes, capturas do manual) entra no cronograma até 22/11.

Issues prontas para abrir nos repositórios: [issues-propostas.md](issues-propostas.md).
