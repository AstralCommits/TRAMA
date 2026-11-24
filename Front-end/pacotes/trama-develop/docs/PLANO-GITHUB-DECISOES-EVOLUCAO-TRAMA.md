# TRAMA — Plano de evolução, decisões de escopo e organização do GitHub

**Repositório de referência:** https://github.com/AstralCommits/Front-end  
**Branch de referência informada:** `develop`  
**Data do registro:** 22/11/2026

> Este documento registra o que existe no pacote analisado, o que foi aprimorado, o que está parcialmente implementado, o que não deve ser tratado como requisito da TRAMA e o que precisa ser criado ou reformulado no GitHub. O status das issues existentes é apenas o retrato que constava no backlog anterior; confira o GitHub antes de alterar qualquer issue.

---

## 1. Resumo executivo

A TRAMA é uma plataforma de organização e análise de dados de vendas para pequenas e médias confecções do Polo Têxtil do Agreste pernambucano. O produto deve ajudar a pessoa responsável pela confecção a entender seus próprios dados, acompanhar indicadores e comparar períodos. Não deve ser transformado em marketplace, sistema de cotações, catálogo de artesãos ou ERP completo.

A aplicação reúne o site institucional e a área interna, com módulos de vendas, indicadores, tendências, comparação demonstrativa, relatórios, organização/equipe e configurações. O backlog abaixo separa funcionalidades do produto, melhorias técnicas, protótipos locais e propostas ainda dependentes do Back-end. A última validação executada pela equipe local foi positiva: `typecheck` sem erros apresentados, `lint` com 0 avisos e 0 erros e `build` concluído. Isso comprova a verificação estática e a compilação, não a conclusão dos fluxos funcionais nem a integração ponta a ponta com o Back-end.

**Decisões centrais recomendadas:**

1. Manter como núcleo: vendas, categorias, confecções, indicadores, tendências, cenários hipotéticos e relatórios.
2. Manter a comparação regional somente como demonstração até existir fonte legítima, metodologia e dados autorizados.
3. Tratar equipe e permissões atuais como protótipo local; para produção, criar autorização real no Back-end.
4. Criar uma issue específica para responsividade dos relatórios; há regras CSS responsivas, mas ainda falta validação em dispositivos e adequação de tabelas/visualizações.
5. Criar uma issue para centralizar permissões por usuário e outra dependente no Back-end para impedir acesso não autorizado por API.
6. Não fechar issues antigas automaticamente. Reformular, dividir ou propor encerramento somente após alinhamento com a equipe/professor.

## 2. Identidade e limite do produto

### Faz parte da TRAMA

- Cadastro e consulta de dados comerciais de confecções.
- Registro de vendas no formato definido pelo Back-end e pelo SRS.
- Categorias, períodos, cidades e filtros analíticos.
- Indicadores de faturamento, quantidade vendida e valor médio por peça.
- Tendências calculadas a partir de períodos comparáveis.
- Cenários hipotéticos com fórmula e premissas visíveis.
- Relatórios que reproduzam os dados e filtros consultados.
- Importação de dados, com validação e rastreabilidade da origem.
- Acesso por usuário e permissões, caso a equipe mantenha multiusuário no escopo.
- Interface acessível, simples e responsiva.

### Não faz parte do escopo atual, salvo decisão formal

- Marketplace ou vitrine de produtos/artesãos.
- Solicitação de orçamento/cotação e encomendas em lote.
- Galeria de fotos de produtos como função principal.
- Gestão operacional/financeira de artesãos.
- Estoque completo, logística, pedidos, pagamentos ou ERP genérico sem requisito no SRS.
- Previsão automática de vendas ou afirmações de inteligência preditiva não sustentadas por dados e metodologia.
- Acesso a dados privados de concorrentes.
- Comparações apresentadas como médias reais sem fonte comprovável.

Esses itens podem ser discutidos como outro produto ou expansão futura, mas não devem consumir a prioridade do núcleo de inteligência de vendas.

## 3. Auditoria do ZIP: o que existe de fato

### 3.1 Organização e navegação

O `workspace.tsx` apresenta navegação por grupos: Visão geral, Rotina de vendas, Análises e mercado, Acompanhamento e Administração. Os módulos incluem Início, Minhas vendas, Meus produtos, Indicadores, Tendências, Comparar mercado, Relatórios, Organização e equipe e Configurações.

**Avaliação:** melhoria coerente com a proposta, pois agrupa as tarefas e reduz a sensação de menu extenso.  
**Pendência:** verificar em celular se o menu lateral abre/fecha de forma previsível, se o foco permanece acessível e se a navegação não cobre o conteúdo.

### 3.2 Acesso e autenticação

O pacote contém login remoto por `POST /api/auth/login`, armazenamento do token no `sessionStorage` e cliente HTTP com Bearer token, conforme o README. O cadastro de conta local/demonstração não equivale a criar um usuário no banco do servidor.

**Avaliação:** manter a distinção explícita entre sessão autenticada no Back-end e conta local de demonstração.  
**Pendência:** revisar o modelo de sessão e a estratégia de armazenamento com o Back-end antes de produção; o README já registra que `sessionStorage` é acessível por JavaScript e não substitui uma sessão protegida por cookie `HttpOnly`.

### 3.3 Minhas vendas e importação

A tela atual usa produto, categoria em texto, quantidade, preço unitário e data. O DTO descrito no README para `POST /api/vendas` é mensal e requer `idConfeccao`, `idCategoria`, `mesAno`, `quantidade`, `faturamento`, `origem`, `origemDado` e `nomeFonte`.

**Avaliação:** a interface local pode ser útil para demonstração, mas não pode enviar os campos atuais como se fossem o DTO mensal. A separação evita gravações incompatíveis.  
**Pendência crítica:** definir com a equipe se o usuário lança totais mensais por categoria ou se a aplicação agrega vendas detalhadas antes de enviar. Essa decisão deve preceder a integração.

A prévia CSV atual é local. O README registra que o endpoint real recebe multipart no campo `arquivo`.

**Pendência alta:** alinhar layout CSV, validar linhas e enviar arquivo ao servidor, mostrando erros retornados pelo Back-end.

### 3.4 Indicadores e tendências

O README registra que o serviço de indicadores foi alinhado aos parâmetros `inicio` e `fim` no formato `AAAA-MM`, além de filtros de categoria/cidade conforme o contrato disponível. Para categorias, o front consulta `/api/categorias` e faz chamadas filtradas ao endpoint de indicadores.

**Avaliação:** integração mais próxima do contrato real, mas precisa de testes de integração com o Back-end ativo e de estados de erro/vazio/carregamento.  
**Cuidado:** quando a consulta falhar e a interface usar dados locais, isso precisa estar visível; não misturar dados de demonstração e dados remotos no mesmo total.

### 3.5 Relatórios: estado e responsividade

`apps/web/src/home/reports.tsx` gera relatórios a partir do array local `sales`. Inclui filtro por mês e categoria, indicadores, barras horizontais por categoria, ranking de produtos, tabela de vendas, exportação CSV e impressão/salvamento em PDF pelo navegador.

O CSS possui regras responsivas para `report-two-columns`, `report-filters` e `report-metrics`, inclusive ajustes em larguras abaixo de 700 px. Portanto, não é correto afirmar que a tela não tem nenhuma responsividade. Entretanto, a existência de media queries não comprova uma boa experiência real em celular.

**Problemas e verificações que justificam uma issue própria:**
- A tabela usa rolagem horizontal do wrapper geral e deve ser testada em 360–430 px; avaliar uma apresentação em cartões no celular.
- Conferir se filtros, botões, métricas e títulos quebram sem sobreposição.
- Conferir se os gráficos em barras continuam legíveis, com valores e nomes longos.
- Testar impressão sem que a versão móvel esconda informações necessárias.
- Testar zoom do navegador, orientação retrato/paisagem e toque.
- Verificar se o conteúdo não cria rolagem horizontal da página inteira.
- Adicionar evidências de testes em dispositivos/emuladores.

**Decisão:** abrir `FE-30 — Melhorar e validar a responsividade da área de relatórios`. Não declarar que a issue está resolvida apenas porque há CSS responsivo.

### 3.6 Organização, equipe e permissões

`organization.tsx` permite criar/editar a organização local, adicionar membros locais, definir cargo e selecionar módulos permitidos. `auth.client.ts` salva contas e permissões no armazenamento local do navegador. `workspace.tsx` filtra a navegação de acordo com o papel e a lista de módulos.

**O que já existe:**
- Administrador principal.
- Administrador e Funcionário.
- Seleção de módulos para funcionário.
- Administrador principal pode alterar cargo/permissões e remover membro.
- Convite local por código de oito caracteres.
- Lista central de módulos em `workspace-modules.ts`.

**Limitações importantes:**
- Os dados ficam no navegador, não no banco do Back-end.
- O código de convite não é um convite seguro de servidor e não funciona como identidade compartilhada entre dispositivos.
- A filtragem atual é principalmente de navegação/interface.
- Esconder uma página ou botão não impede que alguém chame a API diretamente.
- Os cargos têm regras fixas no código: Administrador recebe todos os módulos e Funcionário recebe permissões selecionadas.
- As permissões usam rótulos de módulos como identificadores; isso é frágil se um texto de menu for renomeado.
- O Back-end descrito não apresenta endpoints/tabelas para organizações, membros, convites ou permissões.

**Decisão:** preservar o protótipo local para demonstração, mas não apresentá-lo como segurança de produção. Criar uma issue de front para centralizar chaves de permissões e UX de configuração; criar/solicitar issue correspondente no repositório Back-end para persistência e autorização em cada endpoint. A issue de front depende do contrato do Back-end para autorização real.

### 3.7 Comparar mercado

O README e o relatório técnico identificam referências fictícias/sintéticas. O módulo é útil para explicar o conceito de comparação, mas não representa média real do Polo nem consulta concorrentes.

**Decisão:** manter somente se o aviso de demonstração for inequívoco. Não usar nomes de empresas reais nem apresentar os números como pesquisa de mercado. Uma versão real exigiria fonte legítima, metodologia, recorte temporal, consentimento/licença quando aplicável e anonimização.

### 3.8 Configurações, perfil e imagens

Preferências, cópia JSON, foto de perfil e logo são locais. São melhorias úteis de experiência, mas não substituem gestão de conta no servidor. A cópia JSON não deve incluir credenciais ou hashes.

**Decisão:** manter como recursos demonstrativos; mover para integração futura somente se o SRS/professor aprovar persistência multi-dispositivo.

## 4. Registro das melhorias incluídas no pacote

| Área | Aprimoramento | Avaliação | Situação/limite |
|---|---|---|---|
| Navegação | Menu agrupado por tarefas | Coerente | Testar em celular e teclado |
| Página inicial | Melhor contraste do resumo do negócio | Coerente | Validar contraste e zoom |
| Login/cadastro | Modal com rolagem em telas menores | Coerente | Testar alturas curtas e mobile |
| Minhas vendas | Resumo, busca, filtro e tabela simplificada | Coerente como protótipo | Modelo ainda não é DTO mensal |
| CSV | Prévia com vírgula/ponto e vírgula, aspas e decimal | Coerente | Ainda local; falta endpoint |
| Organização | Perfil, cidade e imagem | Opcional/condicional | Local, não multi-dispositivo |
| Equipe | Adicionar membros e definir cargos | Condicional | Local, sem API de usuários |
| Permissões | Selecionar módulos por funcionário | Coerente como protótipo | Não é autorização de servidor |
| Convites | Código local de oito caracteres | Demonstração apenas | Não é convite seguro remoto |
| Relatórios | Filtros, indicadores, ranking, tabela e exportação | Coerente | Dados locais; responsividade precisa de QA |
| Comparação | Referências sintéticas e cenário matemático | Condicional | Sempre identificar como fictício |
| Configurações | Preferências e exportação JSON | Opcional | Local |
| SSR | Módulo compartilhado de navegação | Correção técnica necessária | Corrige acesso compartilhado entre SSR e browser |
| Scripts | Scripts raiz apontando para `apps/web` | Coerente | Validado localmente pela equipe |
| Tipagem | Correções em `auth.client.ts` e `home.tsx` | Necessária | Typecheck informado como aprovado |
| Lint | Remoção de variável não utilizada | Necessária | 0 avisos/erros informados |

## 5. Decisões sobre o backlog antigo e issues existentes

Os nomes/status abaixo reproduzem a revisão anterior do backlog e não são consulta ao estado atual do GitHub. Antes de agir, abrir o repositório e conferir se título, descrição, labels e status continuam iguais.

### 5.1 Issues alinhadas ao núcleo do produto

| Issue | Tratamento recomendado | Motivo |
|---|---|---|
| #1 — Estrutura React/Vite | Manter como concluída se o GitHub confirmar e os critérios estiverem atendidos | Base técnica |
| #2 — Dashboard | Manter; revisar critérios de dados reais, filtros e acessibilidade | Núcleo de indicadores |
| #3 — Tendências | Manter; validar comparação de períodos equivalentes | Inteligência de vendas |
| #4 — Cenários | Manter e complementar com integração/persistência e faixa de 0–100% | Simulação hipotética |
| #5 — Formulários administrativos | Manter, mas esclarecer quais cadastros são da TRAMA (categoria/confecção) | Administração do domínio |
| #7 — Restauração/extração do projeto | Manter como histórico técnico, se concluída | Recuperação do front |
| #8 — Cliente HTTP/JWT | Manter; validar erros 401/403 e sessão | Integração |
| #9 — Recharts | Manter como complementar a #2/#3; confirmar uso real | Visualização |
| #17 — Serviços/endpoints Axios | Reformular para endpoints reais da TRAMA, não produtos/artesãos | Integração de domínio |
| #18 — CNPJ | Reformular para cadastro de confecção se esse for o requisito aprovado | CNPJ não deve ser obrigatório por suposição |
| #19 — Filtros de técnica/polo | Reformular para filtros analíticos de mês, categoria e cidade | Filtros corretos ao domínio |
| #22 — WCAG 2.1 AA | Manter e adaptar a telas reais da TRAMA | Qualidade obrigatória |

### 5.2 Issues que parecem pertencer a outro produto/escopo

| Issue | Tratamento recomendado | Motivo |
|---|---|---|
| #11 — Vitrine/galeria de artesãos | Não desenvolver na TRAMA atual; propor encerramento ou mover para outro projeto | Marketplace/catálogo não é objetivo |
| #12 — Cadastro corporativo por CNPJ | Não manter como requisito obrigatório sem aprovação do SRS | Não comprovado como necessidade |
| #13 — Filtro de técnicas artesanais | Não implementar como filtro de catálogo | Domínio incompatível |
| #14 — Solicitação de orçamento | Fora do escopo atual | Cotação B2B |
| #15 — Painel operacional/financeiro de artesão | Fora do escopo atual | Persona e processo diferentes |
| #16 — Responsividade de catálogo mobile | Reformular para responsividade global da plataforma, ou fechar como requisito específico de catálogo | Catálogo não é núcleo; responsividade geral é |
| #20 — Cotação em lote | Fora do escopo atual | Fluxo de encomendas |
| #21 — Galeria de fotos/zoom de produto | Fora do escopo atual | Vitrine de produto |

**Não fechar automaticamente.** Se a equipe decidir retirar um item, registrar um comentário explicando a incompatibilidade com o escopo e obter aprovação do responsável/professor. Se houver reaproveitamento de parte técnica, abrir issue nova com objetivo TRAMA claro.

## 6. Novas issues para cadastrar no GitHub

As descrições das propostas estão em `docs/github-issues/`. O documento `docs/MAPA-COMPLETO-ISSUES-TRAMA.md` reúne também o histórico e a análise individual das 20 issues anteriores. Os identificadores `FE-xx` são rótulos temporários deste planejamento; o GitHub atribuirá os números oficiais ao criar cada issue.

### Prioridade crítica
- **FE-15 — Adaptar lançamento de vendas ao DTO mensal.**
- **FE-16 — Registrar origem de entrada e procedência da informação.**

### Prioridade alta
- **FE-13 — CRUD de categorias integrado.**
- **FE-14 — Cadastro/gestão de confecções integrado.**
- **FE-17 — Importação CSV real.**
- **FE-18 — Simulação 0–100% e persistência de cenários.**
- **FE-19 — Padronizar gráficos Recharts e alternativas textuais.**
- **FE-20 — Filtros analíticos por período, categoria e cidade.**
- **FE-21 — Estados de carregamento, erro, sessão e autorização.**
- **FE-22 — Auditoria WCAG 2.1 AA.**
- **FE-24 — Testes de integração front/back.**
- **FE-30 — Responsividade da área de relatórios.**
- **FE-31 — Centralizar e configurar permissões por usuário no front-end.**

### Prioridade média
- **FE-23 — Relatórios rastreáveis e exportação coerente com filtros.**
- **FE-25 — Matriz de compatibilidade, responsividade geral e desempenho.**
- **FE-26 — Histórico detalhado de importações.**
- **FE-27 — Dicionário de indicadores e fórmulas.**

### Prioridade baixa/planejamento
- **FE-28 — Comparações de períodos salvas.**
- **FE-29 — Gestão de organização/equipe e autorização no servidor**, condicionada à aprovação do escopo e à implementação correspondente no Back-end.

## 7. Recomendações técnicas para as duas novas necessidades

### FE-30 — Relatórios responsivos

Não basta reduzir a largura dos cartões. A issue deve exigir:
- teste em 360, 390, 430 px, tablet e desktop;
- filtros empilhados em celular;
- cartões de métricas com texto sem corte;
- ranking com nome e valor legíveis;
- barras com rótulos acessíveis;
- tabela em cartões no mobile ou rolagem horizontal confinada ao próprio bloco;
- botões com área de toque confortável;
- ausência de overflow horizontal na página;
- impressão/PDF preservando cabeçalhos e totais;
- evidências (capturas) e lista de dispositivos/navegadores.

### FE-31 — Permissões configuráveis

Separar três conceitos:
1. **Papel:** Administrador principal, Administrador, Funcionário.
2. **Permissões:** ações específicas, como `sales.read`, `sales.create`, `sales.update`, `sales.delete`, `reports.read`, `reports.export`, `team.manage`.
3. **Escopo:** a qual organização/confecção os dados pertencem.

Recomenda-se uma matriz central de permissões no código, com chaves estáveis (não rótulos de menu). A interface deve mostrar permissões por área e ação, permitir configurar cada funcionário e explicar o efeito. O padrão deve ser negar quando não houver permissão explícita.

**Limite de segurança:** o front-end pode ocultar controles e impedir navegação, mas a API precisa validar a permissão em toda operação. A autorização definitiva deve estar no Back-end. A issue FE-31 é interface/contrato e depende da issue de Back-end (FE-29 ou issue equivalente do repositório Back-end).

## 8. Ideias adicionais — priorizadas e justificadas

| Ideia | Prioridade | Por que vale considerar | Condição |
|---|---|---|---|
| Trilha de auditoria de alterações | Média | Saber quem cadastrou, alterou ou removeu lançamentos e permissões | Exige eventos/registro no servidor |
| Recuperação e troca de senha | Alta para produção | Evita contas sem recuperação segura | Exige API de autenticação |
| Sessão segura e expiração | Alta para produção | Reduz riscos de sessão persistente/inválida | Alinhar cookie HttpOnly/SameSite com Back-end |
| Controle de acesso por organização | Crítica se houver multiempresa | Impede vazamento entre confecções | Back-end e banco obrigatórios |
| Arquivamento em vez de exclusão definitiva | Média | Preserva histórico de categoria/confecção quando houver vendas vinculadas | Regra de negócio aprovada |
| Validação de consistência de indicadores | Alta | Evita divergência entre dashboard, tendências e relatórios | Contratos e testes |
| Exportação PDF estruturada | Média | Relatório com cabeçalho, período, filtros e identificação da origem | Não confundir impressão do navegador com PDF gerado no servidor |
| Central de ajuda/termos dos indicadores | Média | Reduz dúvidas de usuários com pouca familiaridade digital | Conteúdo validado |
| Estado offline/instabilidade | Baixa | Explicar quando a conexão cai e evitar falsa confirmação | Definir se haverá suporte offline |
| Telemetria de erros sem dados pessoais | Média | Identificar falhas de uso e integração | Política de privacidade e consentimento |
| Teste de usabilidade com confecções | Alta | Validar linguagem, formulários e indicadores com público real | Participação voluntária e dados anonimizados |
| Backup/restauração dos dados da organização | Média | Recuperação operacional | Backend; exportação local atual não é backup confiável |

Não abrir todas essas ideias de uma vez. Criar primeiro as issues críticas e altas, e deixar as demais como propostas de melhoria/épicos futuros.

## 9. Ordem recomendada de execução

1. **Decisão de domínio:** fechar o modelo de lançamento mensal e confirmar campos de origem/procedência.
2. **Base de domínio:** categorias e confecções integradas.
3. **Vendas:** lançamento mensal e rastreabilidade.
4. **Importação:** CSV validado e envio multipart.
5. **Análises:** filtros, indicadores, tendências e cenários persistidos.
6. **Relatórios:** alinhar dados reais, exportação e responsividade mobile.
7. **Permissões:** contrato de papéis/permissões no Back-end; depois integração e UI configurável.
8. **Qualidade:** acessibilidade, testes de integração, responsividade geral e desempenho.
9. **Melhorias futuras:** histórico, dicionário, auditoria, recuperação de senha e comparações salvas.

Algumas tarefas podem andar em paralelo (por exemplo, responsividade FE-30 e dicionário FE-27), mas não antecipar a UI de permissões como se a segurança já existisse no servidor.

## 10. Labels recomendadas no GitHub

- `type: feature` — nova funcionalidade.
- `type: bug` — comportamento incorreto.
- `type: documentation` — documentação e critérios.
- `type: test` — testes.
- `area: sales`, `area: reports`, `area: analytics`, `area: auth`, `area: accessibility`, `area: responsive`, `area: import`, `area: admin`.
- `priority: critical`, `priority: high`, `priority: medium`, `priority: low`.
- `needs-backend` — depende de endpoint/contrato do Back-end.
- `needs-decision` — depende de decisão de produto/professor.
- `out-of-scope` — item a discutir para encerramento/migração, não implementar no front atual.

## 11. Como seguir no GitHub sem perder rastreabilidade

1. Abra cada issue existente e confirme o status atual, o título e os comentários.
2. Não reutilize os identificadores temporários `FE-xx` como número de issue.
3. Crie primeiro FE-15 e FE-16 após confirmar o modelo mensal e a origem dos dados.
4. Crie FE-30 e FE-31 porque são necessidades novas explicitadas pela equipe; vincule FE-31 à issue de Back-end correspondente.
5. Ao criar issue nova, copie o arquivo `.md` correspondente de `docs/github-issues/` e ajuste responsável, labels e dependências.
6. Nas issues antigas fora de escopo, comente explicando a decisão e peça validação antes de fechar.
7. Use milestones, por exemplo: `MVP integrado`, `Qualidade e acessibilidade`, `Evoluções futuras`.
8. Ao concluir uma issue, registre evidência: testes, captura de tela, endpoint usado e critério de aceite verificado.
9. Não marcar uma issue como concluída apenas porque existe uma tela ou um formulário local.
10. Atualize o backlog deste repositório após cada decisão de escopo ou alteração de status.

## 12. Evidências de validação local informadas em 22/11/2026

A equipe executou no computador de desenvolvimento:

- `npm run typecheck`: terminou sem apresentar erros.
- `npm run lint`: `Found 0 warnings and 0 errors` em 105 arquivos.
- `npm run build`: compilação client e SSR concluída.

**Interpretação:** validação estática e build aprovados conforme saída compartilhada. Ainda são necessários testes no navegador, testes com Back-end ativo, teste de permissões por API, teste responsivo em dispositivos e auditoria WCAG. O `npm install` e o build não comprovam funcionamento de cada fluxo.

## 13. Referências do pacote

- `README.md`
- `docs/RELATORIO-TECNICO.md`
- `docs/REGISTRO-ATUALIZACAO-DEVELOP.md`
- `docs/BACKLOG-ISSUES-TRAMA-REVISADO.md`
- `docs/VALIDACAO-E-CORRECOES-TIPAGEM-2026-11-20.md`
- `apps/web/src/home/reports.tsx`
- `apps/web/src/home/organization.tsx`
- `apps/web/src/lib/auth.client.ts`
- `apps/web/src/lib/workspace-modules.ts`
- `apps/web/src/home/workspace.tsx`
- `apps/web/src/index.css`

---

**Conclusão:** a aplicação contém uma base de front-end com protótipo e partes integradas, não uma versão completa de produção. O GitHub deve separar claramente: (a) melhorias já implementadas no front, (b) integração ainda pendente, (c) requisitos que dependem do Back-end e (d) ideias fora do escopo. Essa separação evita retrabalho, fechamento incorreto de issues e promessas de segurança/funcionalidade que o código atual ainda não garante.


## 14. Documento consolidado de issues

Consulte `docs/MAPA-COMPLETO-ISSUES-TRAMA.md` para encontrar, em um único lugar, a descrição resumida de cada issue anterior, sua relação com a TRAMA, as decisões de manter/reformular/retirar, as 19 novas propostas FE-13 a FE-31, as dependências e as orientações para evitar duplicidades.
