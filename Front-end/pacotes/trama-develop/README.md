# TRAMA — Inteligência de vendas para confecções do Agreste

A TRAMA é uma plataforma de apoio à compreensão dos dados comerciais de pequenas e médias confecções do Polo Têxtil do Agreste pernambucano. Seu propósito é organizar informações de vendas e apresentá-las de forma clara para apoiar decisões do dia a dia.

A interface deve ser simples para pessoas com diferentes níveis de familiaridade com tecnologia. Por isso, prioriza nomes conhecidos, poucos caminhos de navegação, mensagens diretas e explicações junto aos indicadores.

## Escopo do produto

A aplicação reúne o site institucional e uma área interna. O foco da área interna é:

- consultar, cadastrar e importar registros de vendas em modo de demonstração;
- visualizar indicadores de faturamento, peças vendidas e desempenho por categoria;
- acompanhar tendências e comparar períodos;
- comparar o próprio negócio com referências fictícias claramente identificadas;
- gerar relatórios filtrados e exportar CSV ou imprimir/salvar em PDF;
- criar o perfil de uma organização, adicionar membros e configurar permissões locais por pessoa;
- ajustar preferências e inserir foto de perfil e imagem da organização.

A TRAMA não deve ser tratada como marketplace, vitrine de artesanato, sistema de cotação B2B ou ERP completo. Recursos operacionais genéricos existentes no código devem ser avaliados antes de receberem novas evoluções.

## Público e princípios de experiência

- Linguagem cotidiana em português brasileiro.
- Uma tarefa principal por tela sempre que possível.
- Formulários curtos, com exemplos e validações compreensíveis.
- Gráficos acompanhados de títulos, legendas e uma explicação textual.
- Estados vazios que orientam o próximo passo, sem inventar valores.
- Navegação responsiva e utilizável por teclado.
- Identidade visual em tons de bege, areia, terracota, oliva e marrom, com referências ao Agreste.

## Tecnologias

- React 19, TypeScript e Vite/React Router.
- Tailwind CSS e estilos próprios da identidade TRAMA.
- Axios para comunicação HTTP.
- Recharts disponível no conjunto de dependências para visualizações.
- Back-end separado em Java/Spring Boot, com Spring Security e JWT.

As versões efetivas estão declaradas em `package.json` e `apps/web/package.json`. O projeto declara Node.js `22.22.0` ou superior.

## Estrutura

```text
./
├── assets/                         # Materiais gráficos de apoio
├── apps/
│   └── web/
│       ├── public/images/          # Logo e imagens institucionais
│       ├── src/
│       │   ├── components/         # Componentes reutilizáveis
│       │   ├── data/               # Dados e tipos usados pela demonstração
│       │   ├── home/               # Site, acesso e módulos da plataforma
│       │   ├── hooks/              # Hooks reutilizáveis
│       │   ├── lib/                # Autenticação, sessão e utilitários
│       │   ├── routes/             # Rotas React Router
│       │   ├── services/           # Cliente HTTP e serviços da API
│       │   ├── types/              # Contratos TypeScript
│       │   └── ui/                 # Componentes de interface
│       ├── package.json
│       └── .env.example
├── package.json
└── package-lock.json
```

## Requisitos e instalação

1. Instale Node.js `22.22.0` ou superior e npm compatível.
2. Abra o terminal na pasta principal do projeto, onde está o `package.json` da raiz (a mesma pasta deste README).
3. Instale as dependências:

```bash
npm install
```

4. Configure a URL da API (opcional para executar apenas o site e a demonstração):

```bash
cp apps/web/.env.example apps/web/.env
```

No Windows PowerShell:

```powershell
Copy-Item apps/web/.env.example apps/web/.env
```

5. Edite `apps/web/.env`:

```env
VITE_API_URL=http://localhost:8080
```

6. Inicie a aplicação:

```bash
npm run dev
```

Acesse `http://localhost:3000`. O script principal foi simplificado para iniciar diretamente a aplicação web, sem envolver o único processo em `concurrently`.

## Scripts

Na raiz:

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

Também é possível executar os scripts diretamente na aplicação web:

```bash
npm run dev --prefix apps/web
npm run build --prefix apps/web
npm run lint --prefix apps/web
npm run typecheck --prefix apps/web
```

## Acesso e autenticação: distinção necessária

O Back-end enviado disponibiliza `POST /api/auth/login`, que recebe `{ "email": "...", "senha": "..." }` e retorna `{ "token": "..." }`.

O Front-end atualizado chama esse endpoint no fluxo **Entrar**. O token é guardado em `sessionStorage` (limitado à sessão do navegador) e o cliente Axios inclui `Authorization: Bearer <token>` nas requisições. Uma resposta `401` limpa o token e encerra a sessão local; uma resposta `403` apresenta o evento de acesso negado sem apagar a sessão.

**Limitação de segurança:** `sessionStorage` é uma escolha de armazenamento no cliente e continua acessível a JavaScript executado na página. Para uma aplicação de produção, o padrão preferível é uma sessão gerenciada pelo servidor com cookie `HttpOnly`, `Secure` e `SameSite`, mediante implementação compatível no Back-end.

O contrato do Back-end fornecido não apresenta endpoint de cadastro de usuário. Por isso, **Criar conta** permanece um cadastro local demonstrativo, marcado como conta local; não cria usuário no banco do servidor. A demonstração também é local e não deve ser confundida com autenticação real.

O login do Back-end retorna somente o JWT, sem nome, empresa, cidade ou perfil do usuário. O Front-end não inventa esses dados: o cabeçalho usa uma identificação provisória derivada do e-mail e informa que o perfil completo depende de endpoint próprio.

## Integração disponível e diferenças de contrato

Endpoints confirmados nos controllers do Back-end enviado:

| Método | Endpoint | Finalidade |
|---|---|---|
| POST | `/api/auth/login` | Autenticar e retornar JWT |
| GET/POST/PUT/DELETE | `/api/vendas` | Consultar e manter lançamentos de vendas |
| GET | `/api/indicadores` | Consultar indicadores agregados |
| GET | `/api/categorias` | Listar categorias |
| GET | `/api/cidades` | Listar cidades permitidas |
| GET | `/api/confeccoes` | Consultar confecções do usuário autenticado |
| POST | `/api/importacoes` | Enviar CSV como multipart, campo `arquivo` |
| GET | `/api/importacoes` | Consultar importações |
| GET/POST | `/api/cenarios` | Consultar e criar cenários |
| POST | `/api/cenarios/simular` | Executar simulação hipotética |
| GET | `/api/health` | Verificar disponibilidade |

### Contratos de API verificados e limites restantes

- `GET /api/indicadores` recebe `inicio` e `fim` no formato `AAAA-MM`; também aceita `categoriaId` e `cidade`. O serviço do Front-end converte os filtros de mês/ano para esse formato e usa os campos reais da resposta (`quantidadeTotal`, `faturamentoTotal`, `faturamentoMedio` e `quantidadeLancamentos`).
- O Back-end não devolve categorias dentro de `/api/indicadores`. Para evitar assumir uma resposta que não existe, o Front-end consulta `GET /api/categorias` e, para cada categoria, chama `/api/indicadores` com `categoriaId`, comparando o período escolhido com o período imediatamente anterior. Se essa consulta falhar, a tela informa que está usando os registros locais.
- `POST /api/vendas` exige `idConfeccao`, `idCategoria`, `mesAno`, `quantidade`, `faturamento`, `origem`, `origemDado` e `nomeFonte`. A tela **Minhas vendas** trabalha com produto, categoria em texto, valor unitário e data. Não foi conectada diretamente ao endpoint para não enviar dados incompatíveis nem criar registros incorretos.
- `POST /api/importacoes` recebe multipart com o campo `arquivo`. A tela CSV desta entrega valida uma prévia e salva as linhas no armazenamento local; ainda não envia o arquivo ao endpoint remoto.
- `POST /api/auth/login` existe e retorna JWT. Não foi encontrado endpoint de cadastro, recuperação de senha, consulta de perfil, organização, convites ou equipe.

Assim, o login remoto e a consulta de indicadores usam contratos confirmados. Cadastro, equipe/convites e lançamentos/importação de vendas permanecem recursos locais até que os endpoints e a adaptação dos modelos sejam implementados no Back-end.

## Dados de demonstração e dados reais

`src/data/demo.ts` contém produtos e vendas fictícias para a experiência de demonstração. Esses dados não representam empresas reais nem devem ser usados como evidência de desempenho comercial. A conta local criada no navegador e o modo demonstração são experiências separadas da autenticação no Back-end.

Antes de apresentar indicadores como reais, a aplicação precisa receber dados do servidor, mostrar a origem e o período consultado e tratar estados de carregamento, erro e ausência de registros.

## Acessibilidade e usabilidade

A revisão deve considerar WCAG 2.1 AA: contraste, foco visível, navegação por teclado, rótulos associados aos campos, nomes acessíveis para botões, mensagens anunciadas por leitores de tela e alternativas textuais para gráficos. Não usar apenas cor para transmitir aumento, queda ou estado.

## Testes e validação

Execute `npm run typecheck`, `npm run lint` e `npm run build` na raiz. Testes de integração dependem do Back-end em execução, banco configurado, CORS e usuário válido cadastrado no ambiente. Não publicar credenciais, tokens, arquivos `.env` ou dados comerciais reais.

## Estado conhecido desta entrega

- Preservados site institucional, imagens, componentes e módulos preexistentes no pacote recebido.
- Simplificada a navegação principal para tarefas de uso cotidiano.
- Adicionado armazenamento de token JWT na sessão e interceptor Axios Bearer.
- Login remoto alinhado ao contrato real de `/api/auth/login`.
- Cadastro local e demonstração continuam explicitamente separados do login remoto.
- O DTO de indicadores foi alinhado ao contrato real e o detalhamento por categoria usa o endpoint de categorias com filtro por ID. Permanecem pendentes a adaptação do cadastro de vendas ao modelo mensal do Back-end, a importação CSV remota, endpoint de cadastro/perfil e APIs de organização/convites.

Consulte `docs/RELATORIO-TECNICO.md`, `docs/REGISTRO-ATUALIZACAO-DEVELOP.md` e `docs/BACKLOG-ISSUES-TRAMA-REVISADO.md` para o registro técnico e a rastreabilidade das issues.


## Área da plataforma — atualização de navegação e funcionalidades

A área interna foi reorganizada em grupos para reduzir a quantidade de opções apresentadas de uma só vez:

- **Visão geral:** Início.
- **Rotina de vendas:** Minhas vendas, Meus produtos.
- **Análises e mercado:** Indicadores, Tendências, Comparar mercado.
- **Acompanhamento:** Relatórios.
- **Administração:** Organização e equipe, Configurações.

### Organização, equipe e níveis de acesso

- Uma conta criada localmente passa a iniciar uma organização e se torna seu **Administrador principal**.
- Uma conta autenticada pela API sem organização vinculada pode abrir **Organização e equipe** e criar o espaço local demonstrativo.
- O administrador principal pode adicionar contas locais para funcionários, informando nome, e-mail e senha inicial.
- O cargo **Funcionário** permite selecionar os módulos que aparecem na navegação dessa conta.
- O cargo **Administrador** libera os módulos de trabalho. A alteração de cargos, promoção de funcionário e remoção de membros continuam reservadas ao administrador principal.
- O administrador principal não pode ser rebaixado nem removido pela interface.
- Funcionários entram com e-mail e senha cadastrados e veem somente os módulos permitidos. No mesmo navegador, o administrador pode sair e testar o acesso de cada conta.
- A organização possui um código de convite de oito caracteres. O administrador principal pode copiá-lo ou gerar outro; a pessoa convidada escolhe **Código da empresa**, informa o código e cria sua conta como Funcionário. Gerar outro código invalida o anterior.

### Melhorias recentes de usabilidade

- O resumo **Um olhar para o seu negócio** usa fundo claro, texto escuro e blocos separados para peças vendidas e valor médio por peça, com contraste reforçado.
- A janela de acesso/cadastro passa a rolar como um único painel em telas menores e baixas; os campos não ficam presos numa coluna sem rolagem.
- **Minhas vendas** foi simplificada: três números de resumo, busca por produto, filtro por categoria e tabela reduzida com os dados essenciais. Cadastro e importação ficam em janelas separadas.
- A importação CSV aceita separador por vírgula ou ponto e vírgula, aspas em campos e valores monetários com vírgula decimal na prévia local.

### Fotos de perfil e imagem da organização

O perfil pessoal permite adicionar ou remover uma foto. A tela **Organização e equipe** permite adicionar, trocar ou remover a imagem da empresa. As imagens são redimensionadas no navegador antes de serem armazenadas localmente.

### Comparar mercado

O módulo apresenta os indicadores da própria confecção ao lado de referências regionais fictícias, com aviso visível de que os números não são estatísticas reais de outras empresas. Também permite simular matematicamente um percentual de impacto sobre o faturamento registrado. Não há acesso a dados privados de concorrentes nem coleta externa de informações.

### Relatórios

Os relatórios podem ser filtrados por mês e categoria. A tela exibe faturamento, quantidade de peças, valor médio por peça, produto com maior faturamento, composição por categoria e tabela de vendas. O usuário pode exportar CSV detalhado ou resumido e utilizar a impressão do navegador para salvar em PDF.

### Configurações

Permite ajustar avisos demonstrativos, textos de ajuda e tela inicial preferida, além de exportar uma cópia local dos dados da conta em JSON. A cópia não inclui hashes de senha nem credenciais.

## Limites importantes desta implementação

As novas funções de organização, equipe, permissões, fotos e preferências são **funcionais no protótipo local**, usando `localStorage` do navegador. As contas locais têm senha derivada com PBKDF2 no cliente, mas isso não equivale a um mecanismo de autenticação seguro do servidor. As permissões controlam a navegação da interface; não são autorização real de API.

O Back-end enviado ainda não contém endpoints nem tabelas próprias para organizações e membros, convites, alteração de papel, permissões por módulo, foto de perfil ou foto da organização. O código de oito caracteres é funcional apenas dentro do armazenamento local compartilhado pelo mesmo navegador; ele não é um convite seguro de servidor e não permite entrada por outro computador ou celular. Por isso:

1. as contas criadas pela interface e os funcionários adicionados não são gravados no banco de dados do Back-end;
2. os dados de equipe e as permissões não sincronizam entre navegadores ou computadores;
3. para produção, o Back-end deverá validar o usuário e a organização em cada requisição e aplicar RBAC/ABAC no servidor; esconder um botão no Front-end nunca deve ser a única proteção;
4. fotos e logos deverão ser enviados para armazenamento controlado pelo servidor, com validação de tipo, tamanho e autorização;
5. o recurso de comparação utiliza referências sintéticas para demonstração, não dados públicos ou privados de concorrentes.

O menu e as novas telas não devem ser considerados substitutos dos endpoints de domínio ainda ausentes. A integração ponta a ponta de vendas, importação e perfis continua sujeita às rotas e aos modelos ainda ausentes. A consulta de indicadores, por outro lado, já foi adaptada aos contratos atuais de `/api/indicadores` e `/api/categorias`.

## Verificação desta atualização

Foi feita uma inspeção estática dos arquivos e dos contratos do Back-end. A tentativa de instalar dependências neste ambiente expirou e o Node disponível é `22.16.0`, abaixo do requisito `22.22.0`; por isso, não foi possível concluir `typecheck`, `lint` ou `build` aqui. O computador de desenvolvimento informado usa Node `26.13.0`; esses três comandos devem ser executados nele antes de atualizar a branch de destino.


## Backlog e rastreabilidade das issues

O documento [`docs/BACKLOG-ISSUES-TRAMA-REVISADO.md`](docs/BACKLOG-ISSUES-TRAMA-REVISADO.md) reúne as 20 issues recebidas, identifica as que estão alinhadas ou fora do escopo atual, descreve lacunas do SRS e contém propostas de novas issues para o trabalho futuro. Os identificadores `NOVA-FE-xx` são rascunhos locais, não números já criados no GitHub. A publicação de cada issue depende da revisão e aprovação da equipe.

Para entender o conteúdo deste pacote e os passos de conferência/atualização direta, consulte [`docs/REGISTRO-ATUALIZACAO-DEVELOP.md`](docs/REGISTRO-ATUALIZACAO-DEVELOP.md).

Para acompanhar os resultados da validação local e as correções de tipagem incluídas depois desses testes, consulte [`docs/VALIDACAO-E-CORRECOES-TIPAGEM-2026-11-20.md`](docs/VALIDACAO-E-CORRECOES-TIPAGEM-2026-11-20.md).


## Planejamento e acompanhamento no GitHub

A documentação de acompanhamento está organizada em:

- `docs/MAPA-COMPLETO-ISSUES-TRAMA.md`: explicação das 20 issues anteriores, classificação por aderência ao produto, decisões de reformulação/fora de escopo e as novas propostas FE-13 a FE-31.
- `docs/BACKLOG-ISSUES-TRAMA-REVISADO.md`: índice rápido do backlog.
- `docs/PLANO-GITHUB-DECISOES-EVOLUCAO-TRAMA.md`: plano de evolução e prioridades.
- `docs/github-issues/`: descrições individuais para criação ou atualização de issues.

Antes de criar novas issues, confira o mapa completo para evitar duplicidades com #18, #19 e #22. Os códigos FE-13 a FE-31 são identificadores internos das propostas, não números oficiais do GitHub.
