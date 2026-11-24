# Descrição recomendada — integração TRAMA na branch `develop`

Use o texto abaixo na descrição do commit ou no campo de descrição da atualização. Esta é uma **entrega de integração**, não uma declaração de conclusão integral nem de prontidão para produção.

## Título sugerido

`feat(trama): integra frontend backend e banco na develop (dev.4)`

## Descrição

Esta atualização consolida o TRAMA em um único monorepositório, reunindo Front-end, Back-end e Banco de Dados para facilitar a integração e o desenvolvimento conjunto da equipe.

### O que foi integrado

- Integração do Front-end React/TypeScript com a API Java/Spring Boot.
- Autenticação com JWT e proteção de rotas/recursos conforme perfil.
- Cadastro e sessão de contas, gestão de categorias e confecções.
- Lançamentos mensais agregados por confecção, categoria e mês, com origem e procedência dos dados separadas.
- Importação CSV com pré-visualização no navegador e validação definitiva no servidor.
- Indicadores, tendências, comparação entre categorias e cenários hipotéticos calculados sobre o faturamento histórico.
- Relatórios CSV e impressão, filtros salvos, gestão de equipe, convites e trilha de auditoria.
- Schema MySQL, migrações e scripts reunidos com o Back-end e o Front-end.
- Documentação consolidada, inventário das 19 tarefas internas FE-13 a FE-31, registros das 22 issues oficiais #1 a #22 e workflow inicial de CI.
- Preservação do catálogo institucional demonstrativo relacionado à issue #19.

### Decisão de escopo

O TRAMA permanece uma plataforma de inteligência de vendas para confecções do Agreste. Não será transformado em marketplace. As solicitações de catálogo de produtos/artesãos e cotações da issue #17 e de cadastro de empresa compradora da issue #18 foram classificadas como fora do escopo atual. Essa decisão está documentada; os estados dessas issues no GitHub não foram alterados por esta entrega.

### Verificações que passaram

- `npm run qa:static`: aprovado.
- 49/49 verificações estáticas/contratuais aprovadas.
- Estrutura do monorepositório e consistência das versões conferidas.
- 19/19 descrições internas FE-13 a FE-31 e 22/22 registros das issues oficiais #1 a #22 presentes.
- Parsing de 104 arquivos TypeScript/TSX sem erros de sintaxe.
- Parsing de 5 arquivos JavaScript/MJS e 6 arquivos YAML sem erros.
- Schemas SQL de referência do Back-end e do diretório Banco-de-Dados conferidos como idênticos.
- Integridade do pacote ZIP conferida.

### O que ainda falta validar

Os itens abaixo **não devem ser considerados aprovados** nesta entrega:

1. Instalar dependências com Node.js >=22.22.0 e executar `npm ci --prefix Frontend` sem falhas.
2. Executar e aprovar `npm run typecheck`, `npm run lint` e `npm run build`.
3. Executar `mvn clean verify`/`npm run verify:backend` com Java 21 e confirmar todos os testes JUnit, inclusive os adicionados nesta consolidação.
4. Aplicar schema e migrações em MySQL real e testar cadastro, login, perfis, isolamento por confecção, convites, lançamentos mensais, cancelamento/reativação, CSV, indicadores, cenários, filtros e relatórios.
5. Fazer teste ponta a ponta no navegador e validar os viewports 360, 390, 768, 1024 e 1440 px, zoom 200%, teclado, foco, impressão e leitor de tela.
6. Concluir avaliação manual de acessibilidade, incluindo critérios WCAG 2.1 AA aplicáveis.
7. Atualizar este registro de QA com evidências dos testes executados no ambiente da equipe e corrigir qualquer falha encontrada.

### Limitações conhecidas

- O ambiente usado para esta revisão não conseguiu concluir a instalação do npm por falha de DNS; o Node disponível era 22.16.0, inferior ao mínimo declarado de 22.22.0. Typecheck, lint e build não foram aprovados.
- O Maven Wrapper não conseguiu baixar Maven 3.9.9 por falha de DNS; compilação Java e testes JUnit não foram aprovados nesta sessão.
- Não havia MySQL/Docker nem navegador de teste disponíveis para validar a integração ponta a ponta.
- Convites de equipe não são enviados automaticamente por e-mail; o compartilhamento do token é manual.
- O modelo de dados é mensal e agregado por categoria; não há vendas unitárias por produto, estoque ou previsão de mercado.

### Observação sobre o status

Esta atualização está sendo enviada à `develop` como **base integrada para continuidade e validação pela equipe**. Os testes estáticos aprovados não substituem os gates pendentes. Não declarar a entrega 100% concluída, não publicar como release final e não afirmar conformidade WCAG integral até que as validações acima sejam executadas e aprovadas.
