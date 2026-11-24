# TRAMA — Site institucional + plataforma de gestão

O projeto reúne o site institucional original do TRAMA e a área de gestão na mesma aplicação. O site continua sendo a porta de entrada; cadastro, login ou demonstração levam ao painel integrado.

## Como executar no Windows

Abra o PowerShell **na pasta onde está este `package.json`**. Nesta versão, o `package.json` fica diretamente na raiz do projeto, sem precisar entrar em outra pasta `TRAMA`.

```powershell
npm.cmd install
Copy-Item .\apps\web\.env.example .\apps\web\.env
npm.cmd run dev --prefix apps/web
```

Acesse `http://localhost:3000` e mantenha o PowerShell aberto enquanto utiliza o sistema.

Requisito indicado pelo projeto: Node.js `22.22.0` ou superior.

### Atualizar uma instalação anterior sem perder as dependências

Pare o servidor (`Ctrl + C`), extraia **o conteúdo deste ZIP** diretamente na pasta que já contém o `package.json` (a pasta `TRAMA` dentro de `TRAMA-FRONTEND-ATUALIZADO`) e aceite substituir os arquivos. Não extraia criando outra pasta dentro dela. O `node_modules` e o `.env` existentes podem permanecer. Depois, nessa mesma pasta, execute `npm.cmd run dev --prefix apps/web`. Só rode `npm.cmd install` caso o npm informe que falta alguma dependência.

## Fluxo de entrada

- **Cadastrar-se:** cria uma conta com nome, e-mail, nome da confecção, cidade e senha; ao concluir, abre a área de gestão.
- **Entrar:** valida o e-mail e a senha da conta cadastrada neste navegador.
- **Entrar na demonstração:** mantém o fluxo de duas etapas do site original e abre a Confecção Fio do Agreste com dados de exemplo.

Nesta entrega, cadastro, login e persistência são locais ao navegador. A senha não é salva em texto puro: é derivada com PBKDF2 e salt usando Web Crypto. Isso torna o fluxo testável agora, mas **não substitui autenticação de servidor**. A conta não é compartilhada entre dispositivos ou navegadores.

## O que foi preservado

O site institucional original continua na página inicial, incluindo a navegação, apresentação, método, benefícios e as chamadas para entrar ou se cadastrar. A entrada pela demonstração continua com as perguntas de perfil e cidade.

Os módulos antigos permanecem na área de gestão:

1. Visão Geral
2. Dados de Vendas
3. Tendências por Categoria
4. Comparação de Produtos
5. Cenário da Concorrência
6. Estoque
7. Produção
8. Vendas e Pedidos
9. Financeiro
10. Clientes e Fornecedores
11. Relatórios e Indicadores
12. Agenda e Notificações
13. Equipe e Permissões
14. Configurações

## Funcionalidades acrescentadas e integradas

- **Dashboard de Indicadores:** faturamento total, peças vendidas, categoria líder, filtros por mês/ano/cidade e gráfico por categoria. Usa as vendas registradas na conta quando não há backend configurado.
- **Análise de Tendências:** compara o período selecionado com o período imediatamente anterior; classifica variação `>= +5%` como alta, `<= -5%` como queda e valores intermediários como estáveis. Sem período anterior, mostra “Sem base”.
- **Simulador de Cenários Comparativos:** preserva a simulação matemática que já existia em Cenário da Concorrência e deixa o acesso explícito no menu.
- **Cadastros:** permite criar, editar e excluir registros administrativos simplificados.
- **Persistência local:** vendas, estoque e registros operacionais são separados por conta e continuam disponíveis após recarregar ou fechar o navegador.

A demonstração usa registros fictícios, sempre identificados como demonstração. Uma conta nova começa sem vendas e sem cadastros operacionais de exemplo, para não misturar dados fictícios com os dados informados pela empresa.

## Integração com o backend

O front-end mantém um cliente Axios centralizado e pode consultar `GET /api/indicadores`. Para ativar a integração, configure `VITE_API_URL` no arquivo `apps/web/.env`, por exemplo:

```env
VITE_API_URL=http://localhost:8080
```

O endpoint deve aceitar `mesInicial`, `anoInicial`, `mesFinal`, `anoFinal` e `cidade` como parâmetros. A resposta esperada inclui:

```json
{
  "faturamentoTotal": 0,
  "pecasVendidas": 0,
  "faturamentoTotalAnterior": 0,
  "pecasVendidasAnterior": 0,
  "categorias": [
    {
      "categoria": "Jeans",
      "faturamento": 0,
      "pecasVendidas": 0,
      "faturamentoAnterior": 0,
      "pecasVendidasAnterior": 0,
      "variacaoPercentual": 0
    }
  ],
  "categoriaLider": { "categoria": "Jeans", "faturamento": 0 }
}
```

Para a análise de tendências, o front envia também `incluirVariacao=true`; a API deve devolver `variacaoPercentual` numérico por categoria. Quando a API estiver configurada mas indisponível, o painel informa o problema e continua exibindo os registros locais.

## Limites desta versão

Esta versão já permite criar conta local, entrar, cadastrar vendas e manter os registros no mesmo navegador. Para uso real por várias pessoas, acesso de equipe com permissões efetivas, recuperação de senha, banco compartilhado, backup e sincronização, ainda é necessário implementar/conectar o backend Spring Boot e a autenticação no servidor. A tela Equipe e Permissões e os cadastros operacionais existentes são CRUD local simplificado, não controle de acesso corporativo.

## Atualização visual e perfil da conta

Esta versão incorpora a identidade visual enviada para o TRAMA:

- `apps/web/public/images/trama-logo.png`: logo em PNG com fundo transparente, usada no cabeçalho institucional, no menu lateral da plataforma e no rodapé. A primeira dobra do site voltou à composição centralizada da versão original, com título, apresentação e botões de entrada.
- `apps/web/public/images/agreste-header.jpg`: faixa panorâmica regional usada no topo do site.
- A primeira dobra do site mantém a composição original; as seções institucionais seguem responsivas e a área interna ganhou ícones e agrupamento visual nos módulos, sem remover funcionalidades.
- O cabeçalho da área de gestão agora possui um menu de conta com acesso a **Meu perfil**, **Configurações** e **Sair da conta**.
- Em **Meu perfil**, o usuário pode editar nome, e-mail, empresa e cidade. A edição é persistida na conta local e reflete imediatamente na sessão.

### Aplicar a atualização sem reinstalar as dependências

Se você já instalou as dependências desta versão, extraia o pacote de correção sobre a pasta do projeto que contém o `package.json`, mantendo a estrutura `apps/web/...` e aceitando substituir os arquivos. Depois, execute:

```powershell
npm.cmd run dev --prefix apps/web
```

Não é necessário executar `npm install` novamente, pois esta atualização não acrescenta dependências.

## Integração REST — US02, UC01/UC02 e RNF01

A SPA utiliza uma instância Axios central em `apps/web/src/services/api.ts`.
Configure `VITE_API_URL` em `apps/web/.env` com a URL base do backend (por exemplo, `http://localhost:8080`). O cliente envia `Accept` e `Content-Type` como JSON, aplica timeout de 15 segundos e anexa `Authorization: Bearer <token>` quando existe um JWT salvo por `setAccessToken()` em `apps/web/src/lib/auth.client.ts`. O logout remove esse token.

Serviços REST implementados:

| Domínio | Serviço | Rotas utilizadas |
|---|---|---|
| Produtos | `services/produtosService.ts` | `GET/POST /api/produtos`, `GET/PUT/DELETE /api/produtos/:id` |
| Artesãos | `services/artesaosService.ts` | `GET/POST /api/artesaos`, `GET/PUT/DELETE /api/artesaos/:id` |
| Cotações | `services/cotacoesService.ts` | `GET/POST /api/cotacoes`, `GET /api/cotacoes/:id` |
| Empresas clientes | `services/empresasService.ts` | `POST /api/empresas` |

O catálogo da página institucional executa `GET /api/produtos` ao carregar e apresenta os estados de carregamento, erro, catálogo vazio e cards. A seção de artesanato consulta `GET /api/artesaos` e conserva os dados demonstrativos como fallback visual quando a API não responde.

O formulário `CadastroEmpresaComponent` é acessível a partir de **Cadastrar-se → Cadastrar empresa cliente ou compradora**. Ele envia `razaoSocial`, `nomeFantasia`, `emailCorporativo`, `telefone` (somente dígitos) e `cnpj` (14 caracteres sem máscara) para `POST /api/empresas`. Como o contrato OpenAPI do backend não acompanha este repositório, esses nomes de campos e a rota `/api/empresas` representam o contrato REST adotado pela implementação e devem ser alinhados caso o backend use nomes ou rotas diferentes.

A validação do CNPJ aceita o formato numérico legado e o formato alfanumérico atual, mantendo as duas últimas posições numéricas. Os dígitos verificadores são calculados pelo módulo 11 com a conversão ASCII menos 48 indicada pela Receita Federal. A máscara visual é `XX.XXX.XXX/XXXX-00`.

