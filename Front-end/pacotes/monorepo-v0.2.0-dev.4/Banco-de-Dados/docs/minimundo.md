# Minimundo — TRAMA

## 1. Contexto e objetivo

A TRAMA é uma plataforma de inteligência de vendas para pequenas e médias confecções do Polo Têxtil do Agreste Pernambucano, com foco em Santa Cruz do Capibaribe, Toritama e Caruaru.

O sistema organiza os totais mensais informados por cada confecção, por categoria e por mês, para facilitar a leitura do desempenho comercial. A plataforma oferece indicadores, tendências, comparação entre categorias, cenários hipotéticos e relatórios exportáveis. Ela apoia a análise e a tomada de decisão; não substitui a experiência da gestão, não prevê vendas futuras e não consulta dados privados de concorrentes.

O registro é agregado: cada lançamento representa o total de peças e o faturamento de uma categoria em determinado mês. Não representa uma venda individual nem um item específico de produto.

## 2. Usuários e permissões

- **ADMIN:** administra categorias e confecções e pode consultar os dados conforme as permissões da aplicação.
- **EMPRESARIO:** representa uma confecção, mantém os dados da própria empresa, registra vendas mensais, importa CSV, consulta indicadores e gerencia os acessos da equipe.
- **FUNCIONARIO:** participa de uma única confecção por convite válido e pode operar os dados permitidos dessa confecção; não administra a equipe nem altera o cadastro da empresa.

O usuário possui nome, e-mail único, senha armazenada como hash BCrypt e perfil. EMPRESARIO e FUNCIONARIO pertencem a uma confecção; ADMIN não possui vínculo com uma confecção.

## 3. Dados organizados

### Cidades e confecções

A versão atual considera as cidades do Polo Têxtil do Agreste Pernambucano: Santa Cruz do Capibaribe, Toritama e Caruaru. Cada confecção pertence a uma cidade e pode possuir CNPJ opcional, porte (MICRO, PEQUENA ou MEDIA) e atividade (CONFECCAO ou FACCAO).

### Categorias

As categorias de referência atuais são:

- Jeans;
- Moda Feminina;
- Moda Masculina;
- Moda Infantil;
- Moda Praia;
- Moletom.

Categorias antigas que já possuam lançamentos podem permanecer no banco para preservar o histórico. A fixture SQL legada contém `Fitness` associada a lançamentos demonstrativos; ao importar essa fixture, a categoria continua disponível para que esses registros não percam sua classificação. Ela não é uma das seis categorias de referência atuais. A semente automática de uma base nova cria somente as seis categorias listadas acima.

### Lançamentos mensais

O lançamento mensal é a unidade central de análise. Registra confecção, categoria, mês de referência, quantidade total de peças, faturamento, origem do lançamento (MANUAL ou IMPORTACAO), procedência do dado e nome da fonte.

- O mês de referência é armazenado como o primeiro dia do mês.
- Há no máximo um registro por confecção, categoria e mês.
- Um lançamento pode ser incluído manualmente ou por arquivo CSV.
- Um lançamento cancelado permanece no histórico, mas não entra nos indicadores. A combinação mensal pode ser reativada por uma nova inclusão válida.
- O arquivo CSV é validado como um conjunto: linhas inválidas impedem a gravação parcial da importação.

### Indicadores e relatórios

Os indicadores são calculados a partir dos lançamentos ativos e respeitam o período, a confecção e os filtros disponíveis. O ticket médio por peça corresponde ao faturamento total dividido pela quantidade total de peças. Relatórios são gerados a partir dos dados consultados e podem ser exportados; nesta versão, não existe persistência separada de relatórios na API.

### Tendências e comparação

As tendências descrevem variações observadas nos dados do período selecionado. A comparação analítica ocorre entre categorias, porque o modelo atual não registra vendas individuais por produto.

### Cenários hipotéticos

O usuário pode simular um percentual de queda aplicado ao faturamento histórico da própria confecção. O cálculo apresenta o valor hipotético resultante e deve ser interpretado como exercício matemático, não como previsão de mercado nem como informação real de concorrentes.

### Equipe e segurança

O responsável pode criar convites de uso único, com validade de 72 horas, para vincular funcionários à mesma confecção. O token original é apresentado uma vez e compartilhado manualmente; o banco armazena somente seu hash. A aplicação registra ações de equipe e restringe o acesso aos dados pelo vínculo da conta.

## 4. Fora do escopo desta versão

A TRAMA não é marketplace, ERP ou sistema de pedidos. Não oferece catálogo transacional de produtos/artesãos, cotação, compra, pagamento, comissão, gestão de estoque, produção, financeiro, CRM, agenda ou envio automático de convites por e-mail. Estruturas antigas ainda existentes no schema SQL são legadas e não possuem endpoints ativos no Back-end desta versão; não devem ser apresentadas como funcionalidades disponíveis.

## 5. Regras de negócio principais

| # | Regra |
|---|---|
| RN01 | Cada confecção pertence a uma cidade; o CNPJ é opcional e, quando informado, é único. |
| RN02 | ADMIN não pertence a uma confecção; EMPRESARIO e FUNCIONARIO pertencem a exatamente uma. |
| RN03 | Cada confecção possui no máximo um lançamento por categoria e mês. |
| RN04 | Lançamento CANCELADO não entra nos indicadores; seu registro é preservado e pode ser reativado por nova inclusão válida. |
| RN05 | A importação CSV é transacional: uma linha inválida impede a gravação parcial do arquivo. |
| RN06 | O impacto de um cenário está entre 0 e 100 e é aplicado ao faturamento histórico da própria confecção. |
| RN07 | Funcionários só acessam dados da confecção vinculada ao convite aceito. |
| RN08 | Convites são de uso único, expiram em 72 horas e o token é armazenado somente como hash. |
| RN09 | Ticket médio por peça = faturamento total ÷ quantidade total de peças; quando não há quantidade, não se inventa resultado. |

## 6. Requisitos funcionais atendidos pela aplicação atual

| # | Requisito |
|---|---|
| RF01 | Manter categorias e confecções por meio de operações administrativas. |
| RF02 | Registrar conta empresarial, autenticar usuário e restaurar sessão por JWT. |
| RF03 | Registrar, consultar, editar e cancelar lançamentos mensais. |
| RF04 | Importar lançamentos mensais por CSV e consultar o histórico de importações. |
| RF05 | Consultar indicadores e tendências por período e filtros disponíveis. |
| RF06 | Comparar categorias usando os totais mensais registrados. |
| RF07 | Criar, editar, excluir e simular cenários hipotéticos de impacto. |
| RF08 | Exportar relatórios de dados consultados em CSV e oferecer impressão. |
| RF09 | Salvar filtros por usuário. |
| RF10 | Gerenciar convites, membros e auditoria da equipe conforme o perfil. |

## 7. Observação sobre o schema legado

O banco herdou tabelas de modelagens anteriores (por exemplo, produto, pedido, cotação/comissão e avaliação de artesão, além de tabelas de entrevista/relatório persistido). Elas foram mantidas nos scripts existentes para não realizar uma remoção destrutiva de estruturas ou dados. O Back-end atual não mapeia nem expõe essas operações; sua presença física não significa que a TRAMA tenha sido convertida em marketplace.
