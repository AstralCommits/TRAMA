# Processos do Ciclo de Vida — TRAMA (ISO/IEC 12207)

| Campo | Informação |
|---|---|
| Versão | 1.0 — 09/11/2026 |
| Aplica-se a | Repositórios `TRAMA`, `Banco-de-Dados`, `Back-end`, `Front-end` |

A ISO/IEC 12207 define um conjunto de processos de ciclo de vida. Abaixo está como o TRAMA atende cada grupo, em escala de projeto acadêmico de 6 pessoas e 9 semanas.

## 1. Mapa de processos

| Grupo (12207) | Processo | Como fazemos | Artefato / evidência |
|---|---|---|---|
| Acordo | Aquisição/fornecimento | Escopo e critérios combinados com os professores | Project Charter; cronograma |
| Organizacional | Gestão de modelo de ciclo de vida | Iterativo com checkpoints semanais (09, 16, 23/11) | Este documento |
| Gestão técnica | Planejamento do projeto | Cronograma com tarefa, responsável e data | [Cronograma](../cronograma/cronograma-2026-11.md) |
| | Avaliação e controle | Checkpoint às segundas; Kanban no Planner/GitHub (A Fazer → Em Execução → Em revisão → Concluído) | Issues, quadro |
| | Gestão de riscos | Lista de riscos no cronograma e na política de segurança | [Segurança](../seguranca/seguranca-informacao-27001.md) |
| | Gestão de configuração | GitFlow, SemVer, tags, CHANGELOG | Seção 2 |
| | Gestão da informação | Documentação versionada em `TRAMA/docs` | `docs/` |
| | Garantia de qualidade | Revisão em PR + CI | Seção 3 |
| Técnico | Definição de requisitos | ISO/IEC/IEEE 29148 | [SRS v2.0](../requisitos/especificacao-requisitos-29148.md) |
| | Definição de arquitetura | ISO/IEC/IEEE 42010 | [Arquitetura](../arquitetura/descricao-arquitetura-42010.md) |
| | Implementação e integração | Feature branches → PR → `develop` | PRs |
| | Verificação e validação | ISO/IEC/IEEE 29119; validação com empresários | [Testes](../testes/plano-testes-29119.md) |
| | Transição / operação | Guia de instalação (26514); release com tag | [Guia](../usuario/guia-instalacao-uso-26514.md) |
| | Manutenção / descarte | Backlog P2 registrado; após o semestre os repositórios ficam arquivados e o banco de demonstração é destruído (`docker compose down -v`) | README |

## 2. Gestão de configuração

### 2.1 Branches (GitFlow mínimo)

| Branch | Uso | Quem faz merge |
|---|---|---|
| `main` | Só versões entregues, sempre com tag | PR de release revisado |
| `develop` | Integração do dia a dia | PR revisado por outra pessoa da frente |
| `feature/<id>-<descricao>` | Uma tarefa | Autora abre PR para `develop` |
| `hotfix/<descricao>` | Correção urgente na `main` | PR para `main` e `develop` |

Proibido: commit direto na `main`; versionar `.zip`, `node_modules`, `target/`, `.env`.

### 2.2 Commits (Conventional Commits)

```
<tipo>(<escopo>): <descrição no imperativo>

feat(indicadores): calcula variação por categoria
fix(auth): valida token JWT no filtro
docs(readme): corrige caminho do package.json
```

Tipos: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`. Referencie a issue no corpo (`Refs #12`).

### 2.3 Versões

SemVer (`MAJOR.MINOR.PATCH`), tag anotada e CHANGELOG em cada repositório. Entrega final: **v1.0.0** em 23/11 nos três repositórios de código.

## 3. Garantia de qualidade

### 3.1 Definição de Pronto (DoD)

Uma tarefa só vai para **Concluído** quando:

1. o código está em `develop` via PR com ao menos uma revisão;
2. o CI passou;
3. há teste para a regra nova (quando houver regra);
4. o caso de teste correspondente foi atualizado no relatório;
5. a documentação afetada (README, Swagger, `docs/`) foi atualizada.

### 3.2 Revisão em pares

| Autora | Revisora preferencial |
|---|---|
| Jamile | Júlia |
| Júlia | Jamile |
| Ester | Gabriela |
| Gabriela | Ester |
| Gyovanna | Maria |
| Maria | Gyovanna |

Mudanças de contrato (API ↔ Front, BD ↔ API) exigem revisão de alguém da outra frente.

### 3.3 Integração contínua

| Repositório | Workflow | Situação 09/11 |
|---|---|---|
| Banco-de-Dados | `docker compose up` + 11 tabelas com dados | ✅ |
| Back-end | `mvn -B test` | ❌ a criar (Ester) |
| Front-end | `npm ci && npm run typecheck && npm run build` | ❌ a criar (Maria) |

## 4. Papéis

| Integrante | Frente | Papel adicional |
|---|---|---|
| Jamile Keiller | Banco de Dados (modelagem, compatibilidade) | Gestão da documentação (`TRAMA/docs`) e da organização no GitHub |
| Júlia Cássia | Banco de Dados (otimização, auditoria) | Gestão de testes de banco e desempenho (RNF01) |
| Ester Reis | Back-end (estrutura, cadastros, vendas) | Gestão de configuração do Back-end (GitFlow, CI, Swagger) |
| Gabriela Olegário | Back-end (indicadores, cenários, segurança) | Responsável pela segurança (27001) |
| Gyovanna Gabrielly | Front-end (SPA, dashboard) | Contrato API ↔ Front |
| Maria Nicolle | Front-end (tendências, cenários, cadastros) | Gestão de configuração do Front-end |
