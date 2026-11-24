# Issue oficial #17 — [FRONT-07] Integração de Clientes Axios com os Endpoints Spring Boot

**Repositório:** `AstralCommits/Front-end`  
**Estado consultado em 23/11/2026:** `open`  
**Decisão para o escopo TRAMA:** parcialmente relacionada; requisitos de marketplace fora do escopo.  
**Fonte:** https://github.com/AstralCommits/Front-end/issues/17

## Escopo registrado na issue original

Configurar `VITE_API_URL`, interceptor de autenticação e consumo dos endpoints `/api/produtos`, `/api/artesaos` e cotações, com estados de loading/sucesso/erro.

## Avaliação para o TRAMA

- **Pertence ao TRAMA:** cliente HTTP configurável, autenticação Bearer/JWT, tratamento de sessão e integração com os endpoints reais de categorias, confecções, vendas mensais, indicadores, importações, cenários, equipe e filtros salvos. Esses contratos são verificados separadamente no QA do monorepositório.
- **Não pertence ao TRAMA:** catálogo de produtos, cadastro/consulta de artesãos e cotações. Esses endpoints não existem no Back-end entregue e não serão inventados, pois transformariam o produto em marketplace.

## Decisão

A parte de catálogo/marketplace desta issue está **fora do escopo do TRAMA**. A integração de HTTP/JWT com a API TRAMA continua obrigatória e deve passar pelos testes próprios do projeto.

A issue original permanece `open` no GitHub conforme a consulta registrada. Este pacote não a fecha nem afirma que todos os critérios originais foram implementados. Consulte a [decisão formal de escopo](../DECISAO-DE-ESCOPO-ISSUES-17-18.md) e a [issue original](https://github.com/AstralCommits/Front-end/issues/17).
