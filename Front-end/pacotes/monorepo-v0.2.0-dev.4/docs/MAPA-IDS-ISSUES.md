# Mapa de identificação das issues — TRAMA

Este arquivo evita confundir dois conjuntos diferentes de identificadores incluídos no pacote.

## 1. Backlog interno FE-13 a FE-31

São 19 atividades de integração e evolução usadas no trabalho técnico desta consolidação. Os documentos individuais estão em `issues-internas/`. Esses IDs **não são números das issues oficiais do GitHub**.

| ID interno | Área | Relação temática com requisitos oficiais (não é equivalência) |
|---|---|---|
| FE-13 | CRUD de categorias | #5, formulários administrativos |
| FE-14 | CRUD de confecções e vínculo | #5, formulários administrativos |
| FE-15 | Lançamentos mensais | #5, #2 e #9 |
| FE-16 | Origem/procedência dos dados | #5 e documentação da entrega #10 |
| FE-17 | Importação e prévia CSV | Sem issue oficial equivalente no inventário atual |
| FE-18 | Cenários hipotéticos | #4 |
| FE-19 | Indicadores e alternativas de gráfico | #2 e #9 |
| FE-20 | Filtros de período/cidade/categoria | #2 e #3 |
| FE-21 | Tratamento de erros HTTP | #8 e #17 apenas no tema de integração; contratos diferentes |
| FE-22 | Acessibilidade de diálogos e formulários | #22 como tema geral; os critérios originais de #22 citam vitrine/cotação |
| FE-23 | Relatórios/exportação | Sem issue oficial equivalente no inventário atual |
| FE-24 | Testes automatizados | Sem issue oficial equivalente no inventário atual |
| FE-25 | Responsividade da plataforma | #16 apenas como tema responsivo; #16 é catálogo/marketplace |
| FE-26 | Histórico de importações | Sem issue oficial equivalente no inventário atual |
| FE-27 | Dicionário de indicadores | #2 e #3 apenas como tema de indicadores |
| FE-28 | Filtros salvos por usuário | Sem issue oficial equivalente no inventário atual |
| FE-29 | Equipe, convites e auditoria | Sem issue oficial equivalente no inventário atual |
| FE-30 | Impressão e responsividade de relatórios | #16 apenas como tema de responsividade; escopo distinto |
| FE-31 | Autorização server-side e isolamento | #8/#17 apenas como tema de autenticação/API; critérios distintos |

## 2. Issues oficiais do GitHub #1 a #22

Os números #1–#22 são os IDs reais do repositório `AstralCommits/Front-end`. A lista com os títulos, status observado e links está em `ISSUES-GITHUB-OFICIAIS-2026-11-23.md`; os registros individuais estão em `issues-github/`.

No estado consultado em 23/11/2026:

- #17 e #18 estavam abertas e foram classificadas como fora do escopo TRAMA; os estados remotos permanecem inalterados. Consulte `DECISAO-DE-ESCOPO-ISSUES-17-18.md`.
- #20 e #21 estavam fechadas com motivo `not_planned`.
- #1–#16, #19 e #22 estavam fechadas, embora o fechamento não substitua uma verificação técnica dos critérios.

## 3. Diretriz para o grupo

Não fechar, renumerar ou marcar uma issue como concluída somente porque há um arquivo com seu título neste ZIP. A equipe deve comparar o critério original com a funcionalidade real, executar os testes e só então atualizar o estado no GitHub.
