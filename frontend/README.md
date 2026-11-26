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

O workflow [`frontend.yml`](../.github/workflows/frontend.yml) roda os quatro em todo Pull Request que altera esta pasta.

## Como entrar

- **Cadastrar-se:** cria uma conta com nome, e-mail, confecção, cidade e senha.
- **Entrar:** com um usuário do TRAMA, usa a API e o banco. Com uma conta criada no navegador, os dados ficam só nele.
- **Entrar na demonstração:** abre a Confecção Fio do Agreste com dados fictícios.

As contas locais guardam a senha com PBKDF2 e salt (Web Crypto). Isso permite testar o fluxo, mas não substitui a autenticação no servidor.

## Módulos da área de gestão

| Módulo | Dados |
|---|---|
| Visão Geral, Tendências por Categoria, Relatórios | API (`GET /api/vendas`) |
| Dashboard de Indicadores | API (`GET /api/indicadores`) |
| Análise de Tendências | API (`GET /api/indicadores/tendencias`) |
| Dados de Vendas e Lançamento de Vendas | API (`/api/vendas` e `/api/importacoes`) |
| Gerenciamento de Categorias e de Confecções | API (`/api/categorias` e `/api/confeccoes`) |
| Simulador de Impacto da Concorrência | API (`/api/cenarios`) |
| Estoque, Produção, Vendas e Pedidos, Financeiro, Clientes e Fornecedores, Cadastros, Agenda, Equipe, Configurações, Cenário da Concorrência e Simulador de Cenários Comparativos | Só no navegador (a tela avisa) |

Na Análise de Tendências, uma variação de +5% ou mais conta como alta, de −5% ou menos como queda, e o que fica no meio como estável. A Comparação de Produtos não aparece para usuários da API, porque o banco guarda o total mensal por categoria e confecção.

A sessão da API termina quando o token vence ou é recusado, e a tela volta para o login.

## Limites desta versão

Recuperação de senha, permissões de equipe de verdade e sincronização entre dispositivos ainda não existem. As telas que funcionam só no navegador são um CRUD local simplificado.

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
