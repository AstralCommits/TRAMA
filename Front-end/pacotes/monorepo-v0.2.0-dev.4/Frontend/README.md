# TRAMA — Front-end integrado (v0.2.0-dev.4)

O Front-end reúne o site institucional e a área de gestão da TRAMA. A aplicação usa React, TypeScript, React Router e Axios. O projeto foi alinhado ao Back-end Spring Boot e ao modelo de dados mensal do Banco de Dados.

## Requisitos

- Node.js **22.22.0 ou superior**.
- npm compatível com a versão do Node instalada.
- Back-end ativo em `http://localhost:8080` para utilizar contas reais.

## Instalação e execução no Windows

Abra o PowerShell na pasta `Frontend`, onde fica o `package.json`:

```powershell
node --version
npm ci
Copy-Item .\apps\web\.env.example .\apps\web\.env
npm run dev
```

Acesse `http://localhost:3000`. Para executar apenas o site, use `npm run dev --prefix apps/web`.

No arquivo `apps/web/.env`, a URL padrão já é `http://localhost:8080`; altere apenas quando o Back-end estiver em outro endereço:

```env
VITE_API_URL=http://localhost:8080
```

O servidor do Back-end deve permitir a origem do Front-end em CORS. A configuração padrão do Back-end aceita `http://localhost:3000` e `http://localhost:5173`.

## Fluxos de acesso

- **Criar conta:** envia nome, e-mail, senha, nome da confecção e cidade para `POST /api/auth/register`. O Back-end cria a confecção vinculada e retorna um JWT com os dados básicos da conta.
- **Entrar:** envia e-mail e senha para `POST /api/auth/login`.
- **Restaurar sessão:** consulta `GET /api/auth/me` usando o token Bearer antes de abrir a área autenticada. Uma resposta 401 limpa a sessão e devolve o usuário à entrada.
- **Demonstração:** permanece separada da conta real. Usa dados fictícios locais, identificados como demonstração, e não envia esses registros para o Back-end.

O token é mantido em `sessionStorage`, no escopo da sessão do navegador. Esta implementação não usa cookie HttpOnly, refresh token, recuperação de senha ou verificação de e-mail. O Front-end não armazena a senha da conta real.

## Contrato oficial de vendas

A TRAMA registra **lançamentos mensais agregados por confecção, categoria e mês**. Não registra, no Back-end atual, notas diárias nem vendas individuais por produto.

Cada lançamento contém:

- `idConfeccao` e `idCategoria`;
- `mesAno` no formato `AAAA-MM`;
- `quantidade` de peças e `faturamento` do mês;
- `origem`: `MANUAL` ou `IMPORTACAO`;
- `origemDado`: `ENTREVISTA`, `QUESTIONARIO`, `FONTE_SECUNDARIA` ou `DEMONSTRACAO`;
- `nomeFonte`, que identifica a fonte/controle utilizado.

A origem informa como o registro entrou no sistema; a procedência informa de onde veio a informação. O Back-end mantém a unicidade de um lançamento ativo por confecção/categoria/mês e rejeita duplicidades.

## Funcionalidades integradas

| Módulo | Integração disponível nesta versão |
|---|---|
| Cadastro e login | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Dados de vendas | Listar, criar, editar e cancelar lançamentos em `/api/vendas` |
| Categorias | Consulta de catálogo; CRUD administrativo de categorias e confecções na área Cadastros |
| Confecção | Cadastro vinculado; consulta; edição do cadastro próprio pelo responsável; CRUD administrativo |
| Importação CSV | Envia multipart no campo `arquivo` para `POST /api/importacoes` e consulta histórico em `GET /api/importacoes` |
| Dashboard e tendências | `GET /api/indicadores`, com `inicio`, `fim` (`AAAA-MM`) e cidade da conta; cálculo agregado por categoria |
| Comparação de categorias | Compara faturamento e peças vendidas entre duas categorias no período escolhido, incluindo o período anterior equivalente; não compara produtos individuais |
| Cenários | Lista, cria, edita e exclui em `/api/cenarios`; simula em `/api/cenarios/simular` |
| Relatórios | Filtra lançamentos reais, exporta CSV e oferece impressão/Salvar PDF do navegador |
| Filtros salvos | Persistência por usuário no servidor para contas reais; localStorage isolado por sessão de demonstração |
| Equipe | Convites com token de uso único por 72 horas, aceitação de convite, gestão de membros e auditoria; compartilhamento manual do token |

### Formato do CSV mensal

O modelo baixado na tela de Dados de Vendas usa cabeçalho separado por ponto e vírgula:

```csv
mesAno;quantidade;faturamento;idConfeccao;idCategoria;origemDado;nomeFonte
2026-11;120;8500.00;1;2;FONTE_SECUNDARIA;Controle próprio da confecção
```

O ID da confecção deve ser o da conta autenticada e o ID da categoria deve existir no catálogo. O servidor valida o vínculo, o mês, a fonte, as duplicidades e a transação inteira. Um arquivo com linha inválida não deve ser considerado importado parcialmente.

### Indicadores

O ticket médio por peça é `faturamento total ÷ quantidade total de peças`. A comparação usa o período de igual duração imediatamente anterior. Sem faturamento anterior, a variação é apresentada como “Sem base”; não se inventa percentual.

### Cenários

A simulação aplica o percentual escolhido ao faturamento histórico dos lançamentos mensais ativos (ou da categoria selecionada). O resultado é hipotético; não é previsão e não usa dados privados de concorrentes. O cenário não deve ser interpretado como uma previsão de vendas nem como uma medição real do comportamento de concorrentes.

## Limites de escopo e funcionalidades não oferecidas

Os módulos principais integrados são Visão Geral, Dados de Vendas, Tendências, Comparação de Categorias, Cenário da Concorrência e Relatórios. Cadastros administrativos de categorias/confecções e gestão da equipe são exibidos apenas aos perfis autorizados.

O TRAMA não oferece nesta versão estoque, produção, pedidos, financeiro, CRM, fornecedores, agenda/notificações nem marketplace. Também não registra vendas individuais por produto; por isso, a comparação analítica é feita entre categorias. Não há endpoints de produtos, artesãos ou cotações. O catálogo cultural preservado da issue #19 é demonstrativo local, sem transações. Relatórios são gerados a partir dos lançamentos consultados; não existe armazenamento separado de relatórios. A edição do nome/e-mail do usuário não está disponível; o responsável pode editar os dados da própria confecção.

Filtros salvos de dashboard e tendências são sincronizados pelo servidor para contas reais; preferências de interface continuam locais no navegador. O catálogo de categorias é compartilhado entre confecções; a administração do catálogo exige perfil `ADMIN`. As rotas de equipe incluem listagem, convites, aceite, revogação/gestão e auditoria. Convites não são enviados por e-mail automaticamente: o token é compartilhado manualmente pelo responsável e expira em 72 horas.

## Testes e verificações

Na pasta `Frontend`, execute:

```powershell
npm run qa:all-contracts
npm run typecheck
npm run lint
npm run build
```

`qa:all-contracts` verifica os contratos do Front-end e, quando as pastas irmãs `Back-end/` e `Banco-de-Dados/` estão presentes (pacote integrado), verifica também os contratos cruzados. Em um clone isolado do repositório Front-end, as verificações externas são marcadas como SKIP; não substitui o build, testes de navegador ou integração real com MySQL.

## Identidade visual e ativos

O projeto preserva os ativos regionais existentes em `apps/web/public/images`, incluindo `agreste-header.jpg` e `trama-logo.png`. O cabeçalho panorâmico fornecido pela equipe permanece como asset do site; não foi substituído por imagem gerada.


## Catálogo demonstrativo (issue oficial #19)

A seção Artesanato usa filtros locais por técnica e município, com contador, estado vazio e limpeza dos filtros. Seus registros são demonstrativos e não vêm de um endpoint de produtos/artesãos. Não confundir essa seção institucional com a área de gestão de vendas mensais das confecções.
