# Roteiro de apresentação do TRAMA (ProjetAÍ, 10 minutos)

Fluxo combinado: **Problema do Polo Têxtil → Importação CSV → Análise regional → Tendências e cenário → Relatórios e encerramento.**
Cada integrante tem uma fala e um tempo. O total fecha em 10:00, com 30 segundos de folga para trocas de tela.

## Preparação (antes de subir no palco)

| Item | Responsável | Como conferir |
|---|---|---|
| Banco com a carga de demonstração | Jamile Keiller | `docker compose up -d` e rodar `Banco-de-Dados/database/seed_demonstracao_projetaí.sql` |
| API no ar | Ester Reis | `http://localhost:8080/api/health` responde `UP` |
| Front no ar | Gyovanna Gabrielly | `http://localhost:3000` abre a tela inicial (usar `localhost`, não `127.0.0.1`, por causa do CORS) |
| Login de demonstração | Maria Nicolle | `admin@confeccoes.com`, senha de demonstração combinada com a equipe |
| Arquivo CSV da demonstração | Gabriela Olegário | `docs/apresentacao/vendas-novembro-2026.csv` aberto no Swagger (`/swagger-ui.html`) |
| Ids do CSV batem com o banco | Júlia Cássia | `GET /api/categorias` (Jeans, Fitness e Praia) e confecções 9005, 9006, 9009 e 9011 |
| Plano B (sem internet ou sem API) | Júlio Cesar Braga | Prints das telas tirados no último ensaio e o vídeo da issue #99 |

## Roteiro cronometrado

| Tempo | Bloco | Quem fala | Tela | Fala (resumo) |
|---|---|---|---|---|
| 0:00 a 1:00 | Abertura e problema | Maria Nicolle | Slide de capa | Apresenta a equipe e o problema: as confecções do Polo Têxtil do Agreste (Caruaru, Toritama e Santa Cruz do Capibaribe) vendem muito, mas decidem produção "no olho", sem dados organizados por categoria e período. |
| 1:00 a 2:00 | Proposta do TRAMA | Júlio Cesar Braga | Slide de escopo | O TRAMA reúne vendas mensais das confecções e transforma em indicadores, tendências e cenários. Diz o que **não** é: não é marketplace, não vende peça, não faz pagamento nem previsão com IA. |
| 2:00 a 3:00 | Dados e banco | Jamile Keiller | Diagrama do banco | Mostra de onde vêm os dados (questionários, entrevistas e fontes secundárias), as tabelas principais (confecção, categoria, lançamento mensal, importação) e a carga de demonstração com 12 confecções e 24 meses. |
| 3:00 a 4:15 | Importação CSV | Gabriela Olegário | Swagger, `POST /api/importacoes` | Envia `vendas-novembro-2026.csv` no campo `arquivo`. Mostra a resposta com 4 linhas importadas e explica as validações: colunas obrigatórias, valores não negativos, mês no formato `AAAA-MM` e rejeição de linha duplicada. |
| 4:15 a 5:00 | Segurança e qualidade | Júlia Cássia | Swagger e relatório de testes | Login gera token JWT, cada perfil só vê o que pode (empresário vê a própria confecção, admin vê tudo) e o banco valida chaves e tipos. Cita os testes automatizados do back e do front e a cobertura acima de 80%. |
| 5:00 a 6:30 | Análise regional | Gyovanna Gabrielly | Front, painel de indicadores | Faz login, filtra por cidade e período. Lê os cartões: faturamento total, peças vendidas, ticket médio e variação contra o período anterior. Mostra a categoria líder e o gráfico de faturamento por categoria. |
| 6:30 a 7:45 | Tendências e cenário | Ester Reis | Front, bloco "Movimentação do mercado" e Swagger `POST /api/cenarios/simular` | Explica a regra: variação de 5% ou mais é **ALTA**, de -5% ou menos é **QUEDA**, entre as duas é **ESTÁVEL** e categoria sem histórico fica **SEM BASE**. Simula a chegada de uma concorrente que tira 10% das vendas de Jeans. |
| 7:45 a 8:45 | Relatórios e uso real | Maria Nicolle | Front, tabela de indicadores por categoria | Mostra como o empresário usa a tabela para decidir o que produzir no próximo mês e como a associação do polo compara as três cidades. |
| 8:45 a 9:30 | Encerramento | Júlio Cesar Braga | Slide final | Resume o ganho (decisão com dado, não com palpite), próximos passos (mais confecções enviando dados, novas fontes públicas) e agradece. |
| 9:30 a 10:00 | Folga | Todos | | Margem para trocas de tela ou atraso. Se sobrar, abre para perguntas. |

## Falas por integrante

| Integrante | Área | Bloco(s) | Tempo total |
|---|---|---|---|
| Maria Nicolle | Front-end | Abertura e Relatórios | 2:00 |
| Júlio Cesar Braga | Front-end | Proposta e Encerramento | 1:45 |
| Gyovanna Gabrielly | Front-end | Análise regional | 1:30 |
| Ester Reis | Back-end | Tendências e cenário | 1:15 |
| Gabriela Olegário | Back-end | Importação CSV | 1:15 |
| Jamile Keiller | Banco de dados | Dados e banco | 1:00 |
| Júlia Cássia | Banco de dados | Segurança e qualidade | 0:45 |

## Plano B

- **API fora do ar:** Júlio troca para os prints do último ensaio e a pessoa do bloco segue a fala normalmente.
- **CSV recusado:** Gabriela mostra a mensagem de erro (ela diz a linha e o motivo), explica que isso é a validação funcionando e segue com os dados já carregados.
- **Login falhou:** conferir se o endereço é `localhost:3000`; se persistir, Maria segue com os prints.
- **Atraso acumulado:** cortar a simulação de cenário (Ester só explica a regra das tendências) e o bloco de relatórios cai para 30 segundos.

## Ensaio

- Ensaiar ao menos duas vezes com cronômetro, com a pessoa da próxima fala já com a tela aberta.
- Anotar o tempo real de cada bloco aqui embaixo e ajustar as falas que passarem do tempo.

| Ensaio | Data | Tempo total | Ajustes |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
