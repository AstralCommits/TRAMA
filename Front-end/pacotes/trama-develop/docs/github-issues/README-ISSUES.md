# Issues preparadas para o GitHub — TRAMA

Esta pasta reúne 19 descrições individuais de propostas FE-13 a FE-31. Cada arquivo contém título sugerido, objetivo, contexto, critérios de aceite, dependências e limites de escopo. Os códigos FE são identificadores internos; o GitHub atribui os números oficiais.

## Antes de criar ou editar

Consulte [`../MAPA-COMPLETO-ISSUES-TRAMA.md`](../MAPA-COMPLETO-ISSUES-TRAMA.md). Ele descreve as 20 issues antigas, sua classificação, as modificações recomendadas e as relações entre tarefas.

**Evite duplicidades:**
- FE-14 pode substituir a issue aberta #18. Se #18 for reescrita como cadastro de confecção, não crie FE-14 em separado.
- FE-20 pode substituir a issue aberta #19. Se #19 for reescrita como filtro analítico, não crie FE-20 em separado.
- FE-22 é uma descrição atualizada para a issue #22. Prefira atualizar #22 em vez de abrir outra.
- FE-19 só deve ser criada se a auditoria da issue #9 mostrar lacunas reais nos gráficos.
- FE-29 é trabalho de Back-end (ou coordenado com o repositório Back-end), não uma tarefa isolada do React.
- FE-31 controla a interface, mas não garante segurança. Depende de autorização por endpoint no Back-end.

## Índice de descrições

| Código | Arquivo | Prioridade | Tema |
|---|---|---|---|
| FE-13 | `FE-13-crud-categorias.md` | Alta | CRUD de categorias |
| FE-14 | `FE-14-cadastro-confeccoes.md` | Alta | Cadastro de confecções; alternativa à #18 |
| FE-15 | `FE-15-lancamento-mensal-vendas.md` | Crítica | DTO mensal de vendas |
| FE-16 | `FE-16-origem-procedencia.md` | Crítica | Origem de entrada e procedência |
| FE-17 | `FE-17-importacao-csv-api.md` | Alta | Importação CSV real |
| FE-18 | `FE-18-cenarios-persistencia.md` | Alta | Cenários hipotéticos e persistência |
| FE-19 | `FE-19-graficos-recharts.md` | Alta | Gráficos e alternativas acessíveis |
| FE-20 | `FE-20-filtros-analiticos.md` | Alta | Filtros analíticos; alternativa à #19 |
| FE-21 | `FE-21-estados-api.md` | Alta | Loading, erros e sessão |
| FE-22 | `FE-22-acessibilidade-wcag.md` | Alta | Atualização da #22 / WCAG 2.1 AA |
| FE-23 | `FE-23-relatorios-rastreaveis.md` | Média | Relatórios e exportação |
| FE-24 | `FE-24-testes-integracao.md` | Alta | Testes de integração |
| FE-25 | `FE-25-qa-responsividade-desempenho.md` | Média | Qualidade e responsividade global |
| FE-26 | `FE-26-historico-importacoes.md` | Média | Histórico de importações |
| FE-27 | `FE-27-dicionario-indicadores.md` | Média | Dicionário de indicadores |
| FE-28 | `FE-28-periodos-salvos.md` | Baixa | Filtros e períodos salvos |
| FE-29 | `FE-29-organizacao-rbac-backend.md` | Planejamento | Organizações e autorização no Back-end |
| FE-30 | `FE-30-relatorios-responsivos.md` | Alta | Relatórios em celular |
| FE-31 | `FE-31-permissoes-por-usuario.md` | Alta, condicional | Permissões individuais no Front-end |

## Ordem sugerida

1. Confirmar o modelo de vendas mensal e os campos de procedência (FE-15 e FE-16).
2. Integrar cadastros de categorias e confecções (FE-13 e FE-14 ou #18 reescrita).
3. Integrar CSV e estados de API (FE-17 e FE-21).
4. Ajustar filtros e cenários (FE-20 ou #19 reescrita; FE-18).
5. Corrigir responsividade dos relatórios (FE-30) e validar toda a plataforma (FE-25).
6. Atualizar a #22 com FE-22, executar testes FE-24 e revisar gráficos FE-19 apenas se #9 não cobrir tudo.
7. Implementar FE-29 no Back-end antes de considerar FE-31 seguro para produção.
8. Planejar FE-23, FE-26, FE-27 e FE-28 conforme a prioridade do produto.

## Como usar

1. Abra o arquivo `.md` correspondente.
2. Copie o título e o corpo para criar uma nova issue ou use o texto para atualizar uma issue existente indicada no mapa completo.
3. Ajuste labels, responsável, milestone e links de dependência.
4. Confirme que não existe issue equivalente antes de criar.
5. Não marque a tarefa como concluída até validar todos os critérios de aceite.
