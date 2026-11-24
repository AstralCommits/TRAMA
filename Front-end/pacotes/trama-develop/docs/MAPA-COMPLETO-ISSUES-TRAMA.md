# TRAMA — Mapa completo de issues, decisões e propostas para o GitHub

**Repositório:** [AstralCommits/Front-end](https://github.com/AstralCommits/Front-end)  
**Data de conferência das issues antigas:** 22/11/2026  
**Finalidade:** consolidar o histórico, explicar o que cada issue solicitava, avaliar a relação com o escopo da TRAMA e fornecer descrições organizadas para as próximas tarefas.

> Este documento é um guia de planejamento. Ele não cria, fecha, reabre ou altera issues no GitHub. Os códigos FE-13 a FE-31 são identificadores internos dos rascunhos; o GitHub atribuirá números oficiais quando as issues forem criadas. As descrições das issues antigas abaixo foram reescritas em forma de resumo explicativo, sem substituir o texto e o histórico originais, que permanecem nos links.

---

## 1. Como interpretar as classificações

- **Totalmente alinhada:** o objetivo principal pertence à plataforma de inteligência de vendas da TRAMA. Ainda pode exigir ajustes de critérios, contrato, acessibilidade ou implementação.
- **Parcialmente alinhada:** existe uma ideia técnica ou parte do fluxo que pode ser aproveitada, mas o objetivo original precisa ser alterado para corresponder ao domínio da TRAMA.
- **Fora do escopo atual:** a funcionalidade descreve outro produto ou processo. Não deve ser desenvolvida como parte do núcleo da TRAMA. Componentes genéricos, como formulário ou modal, podem ser reutilizados tecnicamente, mas isso não torna o requisito parte do produto.

### O que é a TRAMA

A TRAMA organiza e apresenta informações de vendas de pequenas e médias confecções do Polo Têxtil do Agreste pernambucano. O foco é permitir que a pessoa responsável pela confecção acompanhe faturamento, quantidade vendida, categorias, períodos, tendências, cenários hipotéticos e relatórios.

A TRAMA não deve ser tratada como marketplace, catálogo de artesanato, sistema de pedidos/cotações, painel operacional de artesãos ou ERP completo. Dados demonstrativos precisam estar identificados como fictícios. Cenários são simulações matemáticas, não previsões nem acesso a informações privadas de concorrentes.

---

## 2. Visão geral das 20 issues anteriores

Na conferência realizada em 22/11/2026, as issues consultadas apresentavam **14 como fechadas e 6 como abertas**. O estado pode mudar depois da consulta; confirme o status antes de agir.

| Issue | Status na consulta | Classificação | Encaminhamento resumido |
|---|---|---|---|
| [#1 — Inicialização React/Vite/TypeScript](https://github.com/AstralCommits/Front-end/issues/1) | Fechada | Totalmente alinhada | Manter como fundação técnica e preservar histórico. |
| [#2 — Dashboard de indicadores](https://github.com/AstralCommits/Front-end/issues/2) | Fechada | Totalmente alinhada | Manter; conferir filtros, indicadores, dados vazios e responsividade real. |
| [#3 — Tendências por categoria](https://github.com/AstralCommits/Front-end/issues/3) | Fechada | Totalmente alinhada | Manter; explicitar comparação de períodos equivalentes e limites de classificação. |
| [#4 — Simulador de cenário comparativo](https://github.com/AstralCommits/Front-end/issues/4) | Fechada | Totalmente alinhada | Manter; deixar a simulação hipotética e completar persistência/integração. |
| [#5 — Formulários de gestão e cadastro](https://github.com/AstralCommits/Front-end/issues/5) | Fechada | Totalmente alinhada | Manter; detalhar cadastros de categoria, confecção e venda mensal. |
| [#7 — Restauração do pacote TRAMA](https://github.com/AstralCommits/Front-end/issues/7) | Fechada | Totalmente alinhada (técnica) | Preservar como histórico de recuperação/estruturação do repositório. |
| [#8 — Cliente HTTP e JWT](https://github.com/AstralCommits/Front-end/issues/8) | Fechada | Totalmente alinhada | Manter; separar infraestrutura HTTP de integração dos serviços de domínio. |
| [#9 — Gráficos Recharts](https://github.com/AstralCommits/Front-end/issues/9) | Fechada | Totalmente alinhada | Manter; auditar se os gráficos efetivamente usam a biblioteca e dados da API. |
| [#11 — Vitrine de artesanato com galeria e zoom](https://github.com/AstralCommits/Front-end/issues/11) | Fechada | Fora do escopo atual | Não reintroduzir vitrine/galeria de artesanato como módulo TRAMA. |
| [#12 — Cadastro corporativo com CNPJ](https://github.com/AstralCommits/Front-end/issues/12) | Fechada | Parcialmente alinhada | Reaproveitar apenas a ideia de cadastro; adaptar para confecção e não exigir CNPJ sem requisito aprovado. |
| [#13 — Filtro de produtos por técnica artesanal](https://github.com/AstralCommits/Front-end/issues/13) | Fechada | Parcialmente alinhada | Reaproveitar o padrão de filtros, mas trocar técnica artesanal por dimensões analíticas de vendas. |
| [#14 — Solicitação de orçamento personalizado](https://github.com/AstralCommits/Front-end/issues/14) | Fechada | Fora do escopo atual | Não implementar fluxo de cotação B2B na TRAMA atual. |
| [#15 — Painel do artesão e histórico de vendas](https://github.com/AstralCommits/Front-end/issues/15) | Fechada | Fora do escopo atual | Não desenvolver pedidos, repasses sociais ou acompanhamento de produção de artesãos. |
| [#16 — Responsividade mobile do catálogo](https://github.com/AstralCommits/Front-end/issues/16) | Fechada | Parcialmente alinhada | Reaproveitar o requisito de responsividade, ampliando-o para todas as telas da TRAMA. |
| [#17 — Cliente Axios e endpoints Spring Boot](https://github.com/AstralCommits/Front-end/issues/17) | Aberta | Parcialmente alinhada | Reformular os endpoints de produtos/artesãos para os serviços reais de vendas, indicadores e demais módulos. |
| [#18 — Cadastro e validação de CNPJ](https://github.com/AstralCommits/Front-end/issues/18) | Aberta | Parcialmente alinhada | Preferencialmente reescrever como cadastro de confecção; evitar duplicar com FE-14. |
| [#19 — Filtros por técnica e polo têxtil](https://github.com/AstralCommits/Front-end/issues/19) | Aberta | Parcialmente alinhada | Reformular para período, categoria e cidade, conforme filtros suportados pela API. |
| [#20 — Cotação de encomendas em lote](https://github.com/AstralCommits/Front-end/issues/20) | Aberta | Fora do escopo atual | Não desenvolver encomendas, quantidades mínimas ou protocolo de cotação na TRAMA atual. |
| [#21 — Galeria de fotos e zoom de produto](https://github.com/AstralCommits/Front-end/issues/21) | Aberta | Fora do escopo atual | Não desenvolver galeria de produtos como parte do núcleo. |
| [#22 — Acessibilidade WCAG 2.1 AA](https://github.com/AstralCommits/Front-end/issues/22) | Aberta | Totalmente alinhada | Manter e atualizar os exemplos para telas reais de vendas, indicadores e relatórios. |

**Contagem da classificação:** 9 totalmente alinhadas, 6 parcialmente alinhadas e 5 fora do escopo atual.

---

## 3. Descrição e decisão individual das issues antigas

### Issue #1 — Inicialização da aplicação React (Vite/TypeScript)

**Status consultado:** Fechada.  
**Classificação:** Totalmente alinhada.  
**Descrição do que foi solicitado:** estruturar o Front-end como uma aplicação React com Vite e TypeScript, substituir a página estática, configurar navegação entre as áreas principais e preparar o cliente HTTP para conversar com a API Spring Boot. As rotas originalmente citadas cobriam dashboard, tendências, cenários, cadastros e login.

**O que manter:** a arquitetura SPA, a organização de rotas, a configuração de build e a separação entre aplicação web e API.  
**O que aprimorar:** validar os caminhos atuais, os estados de carregamento/erro, o acesso direto às rotas e a experiência responsiva. Não reabrir a issue apenas para pequenas melhorias que já tenham tarefas específicas.  
**Decisão:** manter fechada como entrega de fundação, se o estado e os critérios continuarem confirmados no GitHub.

### Issue #2 — Dashboard de indicadores de vendas

**Status consultado:** Fechada.  
**Classificação:** Totalmente alinhada.  
**Descrição do que foi solicitado:** uma tela inicial com indicadores de faturamento total, quantidade de peças vendidas e categoria líder; visualização de faturamento por categoria; filtros por mês/ano inicial e final e cidade; mensagem amigável quando não existirem dados; atualização após mudanças nos filtros por meio de `GET /api/indicadores`.

**O que manter:** dashboard, KPIs, filtros e gráficos relacionados às vendas.  
**O que aprimorar:** garantir que os valores venham do período e da fonte exibidos; não manter valores locais misturados com resposta remota; explicar cálculo/unidade; tratar falhas e ausência de dados; conferir a experiência mobile e a alternativa textual dos gráficos.  
**Relação com novas issues:** FE-19 (padronização de gráficos), FE-20 (filtros), FE-21 (estados da API), FE-23 (relatórios) e FE-24 (testes).  
**Decisão:** manter fechada como implementação inicial; abrir as tarefas específicas apenas para lacunas ainda existentes.

### Issue #3 — Visualização e classificação de tendências por categoria

**Status consultado:** Fechada.  
**Classificação:** Totalmente alinhada.  
**Descrição do que foi solicitado:** apresentar as categorias em alta, queda ou estabilidade, com variação percentual; permitir ordenar os resultados pelo crescimento; tornar a informação acessível em até três interações a partir do dashboard. Os limites indicados na issue são alta a partir de +5%, queda até -5% e estabilidade entre esses valores.

**O que manter:** classificação simples, percentual visível, ordenação e acesso fácil.  
**O que aprimorar:** comparar períodos de mesma duração; explicar a base de comparação; tratar exatamente os limites de ±5%; mostrar o período e a origem; não classificar quando não houver dados suficientes.  
**Relação com novas issues:** FE-19, FE-20, FE-22 e FE-24.  
**Decisão:** manter fechada como tela inicial e registrar lacunas como tarefas novas, se confirmadas.

### Issue #4 — Simulador de cenário comparativo de concorrência

**Status consultado:** Fechada.  
**Classificação:** Totalmente alinhada, com ajuste de linguagem.  
**Descrição do que foi solicitado:** permitir que a pessoa escolha um percentual de impacto entre 0% e 100%, visualizar a fórmula de cálculo, comparar o faturamento histórico com o valor hipotético e observar a diferença em reais e percentual. Também foi solicitado salvar o cenário com nome.

**O que manter:** o cálculo ajustável, a fórmula visível, a comparação e o salvamento de cenários.  
**O que aprimorar:** deixar claro que é uma simulação hipotética definida pelo usuário; não afirmar que a TRAMA acompanha dados privados de concorrentes ou prevê o futuro; persistir cenários via API e permitir consultar os salvos.  
**Relação com nova issue:** FE-18.  
**Decisão:** manter fechada como interface inicial; FE-18 deve completar integração, intervalo e persistência sem duplicar a tela.

### Issue #5 — Formulários de gestão e cadastro para administrador

**Status consultado:** Fechada.  
**Classificação:** Totalmente alinhada.  
**Descrição do que foi solicitado:** formulários administrativos para categorias, confecções e registros mensais de vendas; validação de campos obrigatórios; seleção de cidade dentre os municípios definidos no projeto; mensagens compreensíveis para duplicidade e erros retornados pelo Back-end.

**O que manter:** o foco em dados que alimentam as análises.  
**O que aprimorar:** integrar cada formulário ao endpoint correto; usar IDs da API; seguir o DTO mensal de vendas; não pressupor CNPJ obrigatório; exibir sucesso somente após confirmação do servidor.  
**Relação com novas issues:** FE-13, FE-14 (ou reformulação da #18), FE-15, FE-16 e FE-21.  
**Decisão:** manter a issue histórica fechada; separar as lacunas por domínio para que cada tarefa tenha critérios testáveis.

### Issue #7 — Restauração e extração do pacote TRAMA para o repositório

**Status consultado:** Fechada.  
**Classificação:** Totalmente alinhada como tarefa técnica.  
**Descrição do que foi solicitado:** recuperar os arquivos da aplicação React/Vite existentes em um commit anterior e organizá-los na árvore do repositório, substituindo a estrutura vazia que havia na branch de desenvolvimento.

**O que manter:** a rastreabilidade da restauração e a organização do projeto.  
**O que aprimorar:** documentação de instalação, scripts da raiz, estrutura clara e validação de typecheck/lint/build.  
**Relação com novas issues:** não exige issue funcional nova; FE-24/FE-25 tratam da qualidade contínua.  
**Decisão:** preservar fechada como histórico de recuperação.

### Issue #8 — Cliente HTTP com interceptor JWT

**Status consultado:** Fechada.  
**Classificação:** Totalmente alinhada.  
**Descrição do que foi solicitado:** configurar uma camada de comunicação HTTP no React para anexar o token JWT como Bearer nas chamadas autenticadas do Back-end.

**O que manter:** cliente centralizado, URL configurável e envio do token nas rotas protegidas.  
**O que aprimorar:** testar expiração, resposta 401, acesso negado 403, falha de rede e limpeza de sessão; não duplicar a configuração de cliente em cada serviço.  
**Relação com novas issues:** FE-21 (tratamento de estados e erros), FE-24 (testes) e FE-31 (permissões de interface, dependentes da autorização no servidor).  
**Decisão:** manter fechada como infraestrutura; reformular #17 para integração dos serviços de domínio, não para repetir o interceptor.

### Issue #9 — Gráficos interativos com Recharts

**Status consultado:** Fechada.  
**Classificação:** Totalmente alinhada.  
**Descrição do que foi solicitado:** substituir visualizações estáticas por gráficos interativos de faturamento mensal e quantidade de peças por categoria, utilizando os dados de `GET /api/indicadores` e a biblioteca Recharts.

**O que manter:** gráficos coerentes com os indicadores e reutilização em dashboard/tendências.  
**O que aprimorar:** conferir no código e nas telas se Recharts está efetivamente sendo utilizado; a existência da dependência instalada não comprova isso. Adicionar rótulos, unidades, período, estados vazios e tabela/resumo equivalente.  
**Relação com nova issue:** FE-19.  
**Decisão:** antes de abrir FE-19 como issue nova, auditar #9. Se todos os critérios estiverem atendidos, atualizar a documentação e não criar duplicata. Se houver lacunas, transformar FE-19 em continuação objetiva e vinculá-la à #9.

### Issue #11 — Vitrine de artesanato com galeria e zoom

**Status consultado:** Fechada.  
**Classificação:** Fora do escopo atual.  
**Descrição do que foi solicitado:** criar galeria de imagens de peças artesanais, com miniaturas, imagem principal, ampliação ao passar o cursor e navegação por toque em smartphones.

**O que não se encaixa:** a TRAMA atual não é uma vitrine de artesanato nem catálogo de peças para compradores. O objetivo é analisar dados de vendas das confecções.  
**Reaproveitamento possível:** componentes genéricos de imagem, carrossel e acessibilidade podem servir em outro recurso, mas não justificam manter a galeria como requisito TRAMA.  
**Decisão:** preservar o histórico fechado e não reintroduzir a funcionalidade no escopo atual.

### Issue #12 — Cadastro e validação de CNPJ corporativo

**Status consultado:** Fechada.  
**Classificação:** Parcialmente alinhada.  
**Descrição do que foi solicitado:** cadastro de empresas com razão social e CNPJ, máscara, validação de dígitos e possibilidade de consulta externa para validar o CNPJ.

**Parte aproveitável:** a TRAMA precisa identificar a confecção e associar registros a ela.  
**Parte a retirar:** exigir CNPJ, consultar serviços externos ou criar cadastro genérico de empresas apoiadoras/compradoras sem que isso esteja no SRS e no contrato do Back-end.  
**Reformulação recomendada:** cadastro de confecção com os campos oficialmente exigidos, principalmente nome e cidade; CNPJ deve ser opcional somente se aprovado e suportado pela API.  
**Relação com FE-14:** a nova descrição pode servir para corrigir o escopo. Não cadastrar duas tarefas para o mesmo cadastro.

### Issue #13 — Filtro de produtos por técnica artesanal

**Status consultado:** Fechada.  
**Classificação:** Parcialmente alinhada.  
**Descrição do que foi solicitado:** filtro instantâneo do catálogo por técnicas artesanais, como renda, cerâmica e xilogravura, com contagem de itens encontrados.

**Parte aproveitável:** filtros claros, seleção múltipla quando necessária, atualização sem recarregar a tela e contagem de resultados.  
**Parte a retirar:** catálogo de produtos e técnicas artesanais como dimensão principal de consulta.  
**Reformulação recomendada:** filtros analíticos por intervalo mensal, categoria de vendas e cidade/confecção, somente quando suportados pela API.  
**Relação com nova issue:** FE-20. Não criar os dois conjuntos de filtros em paralelo.

### Issue #14 — Modal de solicitação de orçamento personalizado

**Status consultado:** Fechada.  
**Classificação:** Fora do escopo atual.  
**Descrição do que foi solicitado:** modal para uma empresa apresentar briefing e quantidade, enviar uma solicitação ao endpoint de cotações e receber um protocolo de atendimento.

**O que não se encaixa:** a TRAMA não gerencia compras, pedidos ou negociação B2B entre compradores e artesãos.  
**Reaproveitamento possível:** validação de formulários e mensagens de confirmação são padrões genéricos, já úteis em cadastros e lançamentos.  
**Decisão:** não reimplementar o fluxo de orçamento na plataforma de inteligência de vendas.

### Issue #15 — Painel de controle do artesão com histórico de vendas

**Status consultado:** Fechada.  
**Classificação:** Fora do escopo atual.  
**Descrição do que foi solicitado:** painel individual do artesão com pedidos recebidos, valores a receber, regra de repasse social mínimo e atualização do status de produção de encomendas.

**O que não se encaixa:** essa funcionalidade administra a operação de um vendedor/artesão em um marketplace, não os dados agregados de vendas de uma confecção. Pedidos, repasses e produção não fazem parte do núcleo documentado da TRAMA.  
**Decisão:** não reintroduzir como módulo; preservar apenas o histórico da issue fechada.

### Issue #16 — Responsividade mobile do catálogo

**Status consultado:** Fechada.  
**Classificação:** Parcialmente alinhada.  
**Descrição do que foi solicitado:** adaptar catálogo para telas pequenas entre 360 e 480 px, transformar navegação em gaveta lateral e ajustar botões para toque.

**Parte aproveitável:** a exigência de uma plataforma responsiva e utilizável em smartphone.  
**Parte a retirar:** catálogo e navegação de coleções artesanais.  
**Reformulação recomendada:** validar todos os módulos reais da TRAMA: dashboard, vendas, indicadores, tendências, comparações demonstrativas, relatórios, formulários e administração.  
**Relação com novas issues:** FE-25 cobre QA responsivo global; FE-30 trata especificamente a tela de relatórios. Não é necessário reabrir #16 apenas por causa das telas atuais.

### Issue #17 — Integração Axios com endpoints Spring Boot

**Status consultado:** Aberta.  
**Classificação:** Parcialmente alinhada.  
**Descrição do que foi solicitado:** configurar URL da API por variável de ambiente, anexar JWT, tratar carregamento/sucesso/erro e integrar telas de catálogo a endpoints de produtos, artesãos e cotações.

**Parte aproveitável:** comunicação assíncrona, URL configurável, autenticação, estados de interface e integração com a API.  
**Parte a retirar:** serviços `/api/produtos`, `/api/artesaos` e `/api/cotacoes` se não existem no domínio TRAMA atual.  
**Reformulação recomendada:** manter a infraestrutura já coberta pela #8 e usar esta issue para integrar os serviços reais: autenticação, vendas, indicadores, categorias, confecções, cidades, importações e cenários.  
**Decisão:** editar a issue aberta para refletir os endpoints do README/contratos atuais; não duplicar o interceptor da #8.

### Issue #18 — Cadastro e validação reativa de CNPJ de empresas

**Status consultado:** Aberta.  
**Classificação:** Parcialmente alinhada.  
**Descrição do que foi solicitado:** formulário empresarial com razão social, nome fantasia, CNPJ, e-mail e telefone; máscara e validação no navegador; envio a uma API de cadastro de empresa.

**Parte aproveitável:** cadastro de uma entidade de negócio à qual os registros de vendas serão associados.  
**Parte a retirar:** CNPJ obrigatório, campos extras sem correspondência contratual e endpoint genérico de empresas se o Back-end expõe `/api/confeccoes`.  
**Reformulação recomendada:** preferencialmente editar a #18 aberta para cadastro e manutenção de confecções usando nome, cidade e campos efetivamente definidos pelo DTO/API. Se a equipe preferir não reaproveitar a #18, fechá-la somente após aprovação e criar FE-14 como substituta. **Não criar #18 reformulada e FE-14 separadamente com o mesmo escopo.**

### Issue #19 — Filtros multicritério por técnica artesanal e polo têxtil

**Status consultado:** Aberta.  
**Classificação:** Parcialmente alinhada.  
**Descrição do que foi solicitado:** filtros por várias técnicas artesanais e municípios, atualizando uma vitrine de produtos e mostrando a quantidade de resultados.

**Parte aproveitável:** filtros combinados, atualização de resultados, contagem e seleção de localidade.  
**Parte a retirar:** técnicas artesanais e vitrine de produtos.  
**Reformulação recomendada:** filtros de análise de vendas por período, categoria e cidade, usando identificadores e parâmetros suportados por `/api/indicadores`, `/api/categorias` e `/api/cidades`.  
**Relação com nova issue:** FE-20. A recomendação é editar a #19 aberta para o domínio TRAMA ou encerrá-la com aprovação e abrir FE-20; não manter ambas com o mesmo escopo.

### Issue #20 — Modal de cotação de encomendas em lote

**Status consultado:** Aberta.  
**Classificação:** Fora do escopo atual.  
**Descrição do que foi solicitado:** fluxo de encomendas corporativas com quantidade mínima, data de entrega, personalização de lote e envio a endpoint de cotação, retornando protocolo.

**O que não se encaixa:** pedidos, encomendas e cotações são processos de marketplace/compra, não análise de vendas internas das confecções.  
**Decisão:** não desenvolver no escopo atual. Se a equipe/professor confirmar que a descrição veio de outro produto, comentar a incompatibilidade e propor encerramento ou migração para o repositório correto.

### Issue #21 — Galeria de fotos com zoom e preview

**Status consultado:** Aberta.  
**Classificação:** Fora do escopo atual.  
**Descrição do que foi solicitado:** componente de galeria de imagens de produtos com miniaturas, imagem principal, zoom por cursor e navegação por gesto em celular.

**O que não se encaixa:** não existe no escopo atual uma página de detalhe de produto/galeria comercial que justifique essa funcionalidade.  
**Reaproveitamento possível:** conhecimentos de responsividade, acessibilidade e interação por toque são genéricos, mas já são cobertos por tarefas transversais.  
**Decisão:** não implementar como feature da TRAMA; propor fechamento ou migração após alinhamento.

### Issue #22 — Acessibilidade e contraste WCAG 2.1 AA

**Status consultado:** Aberta.  
**Classificação:** Totalmente alinhada, com atualização de escopo.  
**Descrição do que foi solicitado:** revisar contraste de texto e botões, semântica e nomes acessíveis, navegação por teclado, foco visível e compatibilidade com leitor de tela.

**O que manter:** acessibilidade de ponta a ponta, não apenas correção estética.  
**O que atualizar:** substituir exemplos de vitrine e cotação por login, dashboard, vendas, filtros, gráficos, tendências, relatórios, formulários, menus e permissões. Incluir alternativa textual para gráficos e não transmitir estados somente por cor.  
**Relação com nova issue:** FE-22 é uma descrição revisada para atualizar a issue #22 existente. **Não abrir FE-22 como duplicata se a #22 continuar ativa e for atualizada.**

---

## 4. Como tratar as issues antigas sem perder o histórico

### 4.1 Issues fechadas e alinhadas (#1, #2, #3, #4, #5, #7, #8, #9)

Manter o histórico fechado. Se os critérios originais foram concluídos, registrar as novas lacunas em issues separadas e vinculadas. Não reabrir uma issue ampla para misturar várias tarefas menores.

### 4.2 Issues fechadas mas parcialmente alinhadas (#12, #13, #16)

Como já estão fechadas, preservar o status histórico. Não editar o passado para fazer parecer que a tarefa sempre foi sobre TRAMA. Criar uma issue nova com o objetivo correto apenas para a parte reutilizável: cadastro de confecção, filtros analíticos ou responsividade global.

### 4.3 Issues fechadas e fora do escopo (#11, #14, #15)

Manter como registro histórico. Não reintroduzir os módulos de galeria artesanal, cotação ou gestão de artesão na aplicação atual.

### 4.4 Issues abertas e parcialmente alinhadas (#17, #18, #19)

Preferir editar título, corpo e critérios de aceite da própria issue aberta para alinhá-la à TRAMA. Isso evita duplicidade e preserva comentários e histórico. Se a equipe decidir não reaproveitar a issue, documentar a decisão antes de encerrá-la e só então abrir outra.

### 4.5 Issues abertas fora do escopo (#20, #21)

Não implementar. Solicitar validação da equipe/professor e então comentar a incompatibilidade com o produto, propondo fechamento ou migração para o repositório adequado. Não fechar por conta própria sem aprovação.

### 4.6 Issue aberta de acessibilidade (#22)

Atualizar a própria #22 para cobrir telas da TRAMA. A proposta FE-22 deste pacote é um texto revisado para essa issue, não uma tarefa duplicada.

---

## 5. Novas issues propostas — FE-13 a FE-31

As propostas abaixo estão preparadas em arquivos individuais em `docs/github-issues/`. Os critérios completos de aceite, contexto, dependências e itens fora de escopo estão nos respectivos arquivos. Os códigos FE são identificadores temporários, não números oficiais do GitHub.

| Código | Título resumido | Prioridade | Relações e recomendação |
|---|---|---|---|
| [FE-13](github-issues/FE-13-crud-categorias.md) | CRUD de categorias integrado à API | Alta | Complementa #5; depende dos métodos realmente existentes em `/api/categorias`. |
| [FE-14](github-issues/FE-14-cadastro-confeccoes.md) | Cadastro e manutenção de confecções | Alta | Pode substituir a #18; não abrir em duplicidade. |
| [FE-15](github-issues/FE-15-lancamento-mensal-vendas.md) | Adaptar vendas ao DTO mensal | Crítica | Alinha tela de vendas ao contrato; depende de categoria e confecção. |
| [FE-16](github-issues/FE-16-origem-procedencia.md) | Registrar origem e procedência dos dados | Crítica | Distingue método de entrada e fonte da informação; depende da FE-15. |
| [FE-17](github-issues/FE-17-importacao-csv-api.md) | Integrar importação CSV ao servidor | Alta | Envio multipart `arquivo`; prévia local não equivale a persistência no servidor. |
| [FE-18](github-issues/FE-18-cenarios-persistencia.md) | Completar simulação 0–100% e cenários salvos | Alta | Complementa #4; integração e persistência via API. |
| [FE-19](github-issues/FE-19-graficos-recharts.md) | Padronizar gráficos e alternativas acessíveis | Alta | Auditar #9 antes; criar somente se houver lacunas reais. |
| [FE-20](github-issues/FE-20-filtros-analiticos.md) | Filtros de período, categoria e cidade | Alta | Reformula #19; não criar as duas versões em paralelo. |
| [FE-21](github-issues/FE-21-estados-api.md) | Loading, erros, sessão e acesso negado | Alta | Complementa #8 e #17 com tratamento consistente. |
| [FE-22](github-issues/FE-22-acessibilidade-wcag.md) | Auditoria WCAG 2.1 AA | Alta | Usar para atualizar a #22 existente, não criar duplicata. |
| [FE-23](github-issues/FE-23-relatorios-rastreaveis.md) | Relatórios e exportação rastreáveis | Média | Alinhar período, filtros, fonte e dados consultados. |
| [FE-24](github-issues/FE-24-testes-integracao.md) | Testes de integração Front-end/Back-end | Alta | Validar fluxos reais com API e dados de teste. |
| [FE-25](github-issues/FE-25-qa-responsividade-desempenho.md) | QA global responsivo, navegadores e desempenho | Média | Amplia #16 para todas as telas; complementa FE-30. |
| [FE-26](github-issues/FE-26-historico-importacoes.md) | Histórico e detalhes de importações | Média | Depende dos dados retornados por `/api/importacoes`. |
| [FE-27](github-issues/FE-27-dicionario-indicadores.md) | Dicionário e fórmulas dos indicadores | Média | Apoia compreensão e reduz dúvidas de interpretação. |
| [FE-28](github-issues/FE-28-periodos-salvos.md) | Salvar filtros e comparações de períodos | Baixa | Opcional após estabilizar os filtros. |
| [FE-29](github-issues/FE-29-organizacao-rbac-backend.md) | Organizações, membros e autorização no servidor | Planejamento / Alta se multiusuário aprovado | Tarefa de Back-end ou coordenada com o repositório Back-end; dependência da FE-31. |
| [FE-30](github-issues/FE-30-relatorios-responsivos.md) | Corrigir e validar relatórios no celular | Alta | Necessidade específica; tabela, filtros, gráficos, exportação e impressão. |
| [FE-31](github-issues/FE-31-permissoes-por-usuario.md) | Centralizar e configurar permissões individuais | Alta, condicionada à decisão multiusuário | Front-end: matriz e configuração; segurança efetiva depende de FE-29/API. |

### Explicação adicional das duas necessidades recentes

**FE-30 — Relatórios responsivos:** não é apenas inserir media queries. A issue exige validar em 360, 390 e 430 px, além de tablet/desktop; ajustar filtros, métricas, gráficos, ranking, tabela e ações de exportação; impedir rolagem horizontal da página inteira; testar zoom e impressão; anexar capturas e matriz de dispositivos.

**FE-31 — Permissões individuais:** a matriz de permissões deve ser centralizada no código com chaves estáveis (por exemplo `sales.read`, `sales.create`, `sales.update`, `sales.delete`, `reports.read`, `reports.export`, `team.manage`). A interface deve permitir configurar acessos por usuário e refletir a política em menu, rota e ações. Isso não protege a API: para produção, o Back-end precisa armazenar permissões e validar cada endpoint, com isolamento por organização quando multiempresa existir.

---

## 6. Duplicidades e substituições que precisam ser resolvidas antes de cadastrar

| Conjunto | Risco | Ação recomendada |
|---|---|---|
| #18 × FE-14 | Cadastro de empresa/confecção repetido | Reescrever #18 como cadastro de confecção; não criar FE-14 separada, a menos que #18 seja encerrada formalmente e substituída. |
| #19 × FE-20 | Filtros de catálogo versus filtros de análise | Reescrever #19 para filtros analíticos ou encerrar e usar FE-20; não manter duas issues para o mesmo filtro. |
| #22 × FE-22 | Acessibilidade repetida | Atualizar o corpo da #22 com o texto da FE-22. |
| #9 × FE-19 | Recharts pode já estar concluído | Conferir os componentes e os critérios de #9; abrir FE-19 apenas para lacunas não resolvidas. |
| #8 × #17 | Configuração Axios/interceptor repetida | #8 deve ser infraestrutura HTTP/JWT; #17 deve ser integração de serviços e endpoints de domínio. |
| #16 × FE-25 × FE-30 | Responsividade geral e específica | #16 é o registro antigo focado em catálogo; FE-25 cobre QA de toda a plataforma; FE-30 cobre relatórios especificamente. |
| #2 × #9 × FE-19 | Dashboard e biblioteca de gráficos se confundem | #2 define a tela/indicadores; #9/FE-19 definem tecnologia e padrão das visualizações. |
| #14 × #20 | Duas issues de cotação | Ambas fora do escopo atual; não criar nova tarefa de orçamento. |
| #11 × #21 | Duas issues de galeria | Ambas fora do escopo atual; não criar nova tarefa de galeria. |
| #12 × #18 | Cadastro corporativo/CNPJ repetido | Não duplicar; adaptar somente para confecção, sem obrigatoriedade de CNPJ não aprovada. |

---

## 7. Melhorias já presentes ou documentadas e o que ainda falta

Esta seção diferencia a existência de uma interface ou protótipo da conclusão de uma funcionalidade integrada.

| Área | O que já está presente/documentado | O que continua pendente ou precisa de confirmação |
|---|---|---|
| Estrutura e navegação | React/TypeScript, Vite/React Router, rotas e menu agrupado | Testes de navegação completa e responsividade global. |
| Login | Chamada remota a `POST /api/auth/login`, token JWT e cliente HTTP | Cadastro de usuário, perfil, recuperação de senha e sessão segura dependem de API. |
| Vendas | Tela simplificada, busca, filtro, formulário e prévia CSV local | DTO mensal e persistência real ainda precisam ser integrados (FE-15/16). |
| Importação CSV | Leitura/prévia/validação local | Envio multipart e resposta real de `/api/importacoes` (FE-17). |
| Categorias | Endpoint de consulta documentado | CRUD administrativo completo precisa ser confirmado (FE-13). |
| Confecções | Endpoint de consulta documentado; área Organização é protótipo local | Cadastro/edição oficial da confecção (FE-14 ou #18 reformulada). |
| Indicadores | Serviço alinhado a parâmetros e DTO documentados | Testes ponta a ponta com servidor e consistência de dados. |
| Tendências | Consulta por categoria e comparação entre períodos descritas no README | Validar fórmulas, período equivalente, dados vazios e origem. |
| Cenários | Interface de simulação demonstrativa | 0–100%, salvamento/consulta remotos e aviso claro de hipótese (FE-18). |
| Gráficos | Recharts é dependência declarada | Confirmar uso real nas telas; padronizar e oferecer alternativa textual (FE-19). |
| Relatórios | Filtros, indicadores, tabela, ranking, CSV e impressão baseados em dados locais | Conectar a fonte oficial, exportar dados filtrados e validar mobile (FE-23/30). |
| Equipe e permissões | Gestão local de organização/membros e seleção de módulos | Não é autorização segura; exige catálogo de permissões e validação do Back-end (FE-29/31). |
| Acessibilidade | Princípios e componentes existentes | Auditoria WCAG documentada em todas as telas (atualização da #22). |
| Qualidade | Em 22/11/2026 foram informados typecheck sem erros, lint com 0 avisos/erros e build concluído | Testes de navegador, integração, acessibilidade, mobile e segurança ainda são necessários. |

### Decisões técnicas importantes

1. `origem` e `origemDado` representam informações diferentes: uma registra o meio de entrada; a outra, a procedência da informação comercial. Não usar uma no lugar da outra.
2. O DTO mensal de vendas precisa ser confirmado antes de definir o formulário final. Decidir se a pessoa informa totais mensais ou se o sistema agrega lançamentos detalhados.
3. Uma prévia de CSV no navegador não é uma importação persistida no servidor.
4. Ocultar itens do menu por permissão não é segurança. A API precisa verificar autorização em cada operação.
5. Comparação de mercado com dados sintéticos deve permanecer identificada como demonstração e nunca ser descrita como média real do Polo.
6. Não acrescentar estoque, previsão automática, marketplace, cotação ou gestão de produção sem mudança formal de escopo.

---

## 8. Ordem recomendada de execução

### Etapa 1 — Decisões e contratos
- Definir o modelo de lançamento mensal (FE-15).
- Confirmar os enums/campos para origem e procedência (FE-16).
- Confirmar métodos HTTP e DTOs de categorias/confecções.
- Decidir se a #18 será reformulada no lugar da FE-14 e se a #19 será reformulada no lugar da FE-20.

### Etapa 2 — Cadastros e vendas
- FE-13 — categorias.
- FE-14 ou #18 reformulada — confecções (escolher somente uma).
- FE-15 — vendas mensais.
- FE-16 — origem e procedência.
- FE-21 — estados de carregamento, erro, sessão e autorização.

### Etapa 3 — Importação e análises
- FE-17 — importação CSV real.
- FE-20 ou #19 reformulada — filtros analíticos (escolher somente uma).
- FE-18 — simulação e cenários persistidos.
- Auditoria da #9; FE-19 só se houver trabalho complementar.

### Etapa 4 — Relatórios e experiência mobile
- FE-23 — relatórios rastreáveis.
- FE-30 — responsividade específica de relatórios.
- FE-25 — QA responsivo global e desempenho.

### Etapa 5 — Permissões e segurança multiusuário
- Decidir se o TRAMA terá múltiplos usuários por confecção/organização.
- Se aprovado, executar FE-29 no Back-end e depois FE-31 no Front-end, com autorização real por endpoint.

### Etapa 6 — Qualidade e evolução opcional
- Atualizar a #22 com FE-22 (WCAG 2.1 AA).
- FE-24 — testes de integração.
- FE-26 — histórico de importações.
- FE-27 — dicionário de indicadores.
- FE-28 — filtros/períodos salvos.

---

## 9. Ideias adicionais para o backlog futuro

Estas ideias não são todas requisitos obrigatórios do MVP. Devem ser aprovadas antes de virarem issues de implementação.

| Proposta | Prioridade sugerida | Por que pode ajudar | Dependências/limites |
|---|---|---|---|
| Trilha de auditoria de alterações | Média | Mostrar quem criou, alterou ou removeu registros e permissões | Exige eventos e armazenamento no Back-end. |
| Recuperação e troca de senha | Alta para produção | Evitar perda de acesso à conta | Depende de endpoints de autenticação e fluxo seguro. |
| Isolamento dos dados por confecção | Crítica se houver multiempresa | Impedir que uma conta veja os dados de outra confecção | Deve ser garantido no servidor e no banco. |
| Arquivamento de categorias/confecções | Média | Preservar histórico quando existem vendas vinculadas | Regra de negócio precisa ser definida. |
| Conferência da consistência dos indicadores | Alta | Evitar diferenças entre dashboard, tendências e relatórios | Regras matemáticas e testes compartilhados. |
| PDF estruturado para relatórios | Média | Entregar um arquivo com período, filtros, origem e totais | Definir se será gerado no navegador ou servidor. |
| Ajuda contextual | Média | Explicar indicadores sem exigir conhecimento técnico | Textos e fórmulas aprovados pela equipe. |
| Testes de usabilidade com confecções | Alta | Verificar se linguagem e formulários fazem sentido no trabalho real | Participação voluntária; proteger dados comerciais. |
| Backup e restauração | Média | Apoiar recuperação dos dados | Deve ser implementado no Back-end; exportação JSON local não é backup oficial. |
| Monitoramento de erros | Média | Identificar falhas de navegação e integração | Não coletar senhas, tokens ou informações comerciais desnecessárias. |
| Modo de baixa conectividade | Baixa | Informar quando a API estiver indisponível | Definir primeiro se haverá operação offline e como sincronizar. |

---

## 10. Labels e organização sugeridas no GitHub

**Tipo:** `type: feature`, `type: bug`, `type: documentation`, `type: test`, `type: chore`  
**Área:** `area: sales`, `area: categories`, `area: confeccoes`, `area: analytics`, `area: reports`, `area: auth`, `area: accessibility`, `area: responsive`, `area: import`, `area: admin`  
**Prioridade:** `priority: critical`, `priority: high`, `priority: medium`, `priority: low`  
**Dependências/decisão:** `needs-backend`, `needs-decision`, `out-of-scope`, `duplicate-review`

Antes de criar uma issue, pesquisar o repositório para evitar duplicidade. Em issues que ainda estão abertas (#17, #18 e #19), considerar editar o conteúdo existente em vez de abrir outra issue. As issues fora do escopo (#20 e #21) devem receber comentário explicativo e validação da equipe/professor antes de eventual fechamento.

---

## 11. Como usar este material

1. Abra a issue original pelo link e confira status, título, comentários e critérios atuais.
2. Para uma issue aberta parcialmente alinhada, prefira editar a própria descrição para manter o histórico.
3. Para uma issue nova, copie o arquivo individual em `docs/github-issues/` e ajuste responsáveis, labels, milestones e dependências.
4. Não crie FE-14 se #18 já tiver sido reformulada para confecção; não crie FE-20 se #19 já tiver sido reformulada para filtros analíticos; não crie FE-22 em duplicidade com #22.
5. FE-29 é uma tarefa de Back-end ou coordenada com o repositório Back-end. FE-31 não pode ser considerada segurança real sem essa dependência.
6. Registre evidências de conclusão: endpoint utilizado, testes, capturas, dispositivos e critérios de aceite verificados.
7. Não marque uma issue como concluída apenas porque existe uma tela visual ou porque o build passa.
8. Não feche issues antigas automaticamente. Confirme a decisão com a equipe/professor.

## 12. Limites deste registro

O status das issues antigas foi consultado no GitHub em 22/11/2026 e pode mudar. A classificação é uma análise de aderência ao escopo descrito para a TRAMA. A descrição de cada issue antiga é um resumo reescrito para facilitar o entendimento; o texto original e os comentários continuam sendo a referência histórica. As propostas FE-13 a FE-31 ainda não são issues oficiais enquanto não forem cadastradas no GitHub.
