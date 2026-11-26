# TRAMA | Front-end

Interface web do [TRAMA](../README.md). Os comandos deste documento rodam dentro da pasta `frontend/`, onde fica o `package.json`.

A aplicação junta o site institucional e a área de gestão. O site é a porta de entrada: cadastro, login ou demonstração levam ao painel.

## Tecnologias

- React 19 e React Router 8 (com renderização no servidor)
- Vite 8 e Tailwind CSS 3
- TypeScript
- Vitest para os testes e oxlint para o lint

## Como rodar

Precisa do Node.js 22.22.0 ou superior.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Depois, abra `http://localhost:3000`. Use `localhost`, não `127.0.0.1`, por causa do CORS da API.

Para usar a API, o `.env` precisa ter:

```env
VITE_API_URL=http://localhost:8080
```

Para subir banco, API e front juntos, use o `docker compose` da [raiz do repositório](../README.md#como-rodar).

### Outros comandos

| Comando | O que faz |
|---|---|
| `npm run lint` | Lint com o oxlint |
| `npm run typecheck` | Gera os tipos das rotas e confere o TypeScript |
| `npm test` | Testes com o Vitest |
| `npm run build` | Build de produção |
| `npm run api:types` | Gera `src/types/api.gen.ts` a partir do contrato [`docs/api/openapi.json`](../docs/api/openapi.json) |

O workflow [`frontend.yml`](../.github/workflows/frontend.yml) roda os quatro em todo Pull Request que altera esta pasta e confere se os tipos gerados estão iguais ao contrato.

## Como entrar

- **Entrar:** com um usuário do TRAMA, pela API. O front pede o token em `POST /api/auth/login` e os dados do usuário em `GET /api/auth/me`. Os usuários são criados pelo administrador.
- **Entrar na demonstração:** abre a Confecção Fio do Agreste com dados fictícios, guardados só no navegador.

Não existem mais contas criadas no navegador. Na primeira abertura depois da atualização, o front apaga as contas e senhas antigas que tinham ficado no `localStorage`.

## Módulos da área de gestão

| Módulo | Dados |
|---|---|
| Visão Geral, Tendências por Categoria, Relatórios | API (`GET /api/vendas`) |
| Dashboard de Indicadores | API (`GET /api/indicadores`) |
| Análise de Tendências | API (`GET /api/indicadores/tendencias`) |
| Dados de Vendas e Lançamento de Vendas | API (`/api/vendas` e `/api/importacoes`) |
| Gerenciamento de Categorias e de Confecções | API (`/api/categorias` e `/api/confeccoes`) |
| Simulador de Impacto da Concorrência | API (`/api/cenarios`) |
| Estoque, Produção, Vendas e Pedidos, Financeiro, Clientes e Fornecedores, Cadastros, Agenda, Equipe, Configurações, Cenário da Concorrência, Simulador de Cenários Comparativos e Comparação de Produtos | Só na demonstração |

Quem entra pela API vê só os módulos da SRS, todos ligados ao banco. O empresário não vê os cadastros de categorias e confecções. A regra fica em [`src/lib/modules.ts`](src/lib/modules.ts).

Na Análise de Tendências, uma variação de +5% ou mais conta como alta, de −5% ou menos como queda, e o que fica no meio como estável.

A sessão da API termina quando o token vence ou é recusado, e a tela volta para o login.

## Limites desta versão

Recuperação de senha e cadastro de usuários pela tela ainda não existem: o administrador cria os usuários no banco. Os módulos que existem só na demonstração são um CRUD local simplificado.

## Estrutura

```
frontend/
├── src/                rotas, telas e componentes
├── public/images/      logo e imagens do site
├── assets/             arquivos originais da identidade visual
├── .env.example        modelo de configuração
├── Dockerfile          imagem usada pelo docker compose
├── package.json
└── vite.config.ts      junto com react-router.config.ts, vitest.config.ts e tailwind.config.js
```

## Mais informações

- [Relatório de implementação e testes](../docs/frontend/relatorio-implementacao-e-testes.md)
- [Pacotes de entrega antigos](../docs/frontend/pacotes-de-entrega.md)

## Equipe

Maria Nicolle, Júlio Cesar Braga e Gyovanna Gabrielly.
