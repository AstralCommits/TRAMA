# Issues oficiais do GitHub — inventário em 23/11/2026

Fonte: repositório `AstralCommits/Front-end`. Este inventário é separado do backlog interno FE-13 a FE-31. Os IDs FE-13..FE-31 não são números de issues GitHub.

| GitHub | Título | Estado em 23/11/2026 | Link |
|---:|---|---|---|
| #1 | [FRONT-01] Inicialização da Aplicação SPA em React (Vite/TS) com Roteamento e Layout Base | Fechada | [Abrir](https://github.com/AstralCommits/Front-end/issues/1) |
| #2 | [FRONT-02] Tela de Dashboard de Indicadores com Cards e Gráficos de Vendas (RF05) | Fechada | [Abrir](https://github.com/AstralCommits/Front-end/issues/2) |
| #3 | [FRONT-03] Tela de Visualização e Classificação de Tendências por Categoria (RF06, RNF04) | Fechada | [Abrir](https://github.com/AstralCommits/Front-end/issues/3) |
| #4 | [FRONT-04] Interface Interativa para Simulação de Cenário Comparativo de Concorrência (RF07, RNF03) | Fechada | [Abrir](https://github.com/AstralCommits/Front-end/issues/4) |
| #5 | [FRONT-05] Formulários de Gestão e Cadastro para Administrador com Validações Amigáveis (RF01 a RF03) | Fechada | [Abrir](https://github.com/AstralCommits/Front-end/issues/5) |
| #6 | Trama | Fechada | [Abrir](https://github.com/AstralCommits/Front-end/issues/6) |
| #7 | [FRONT-06] Restauração e Extração do Pacote TRAMA_GitHub.zip para a Árvore do Repositório | Fechada | [Abrir](https://github.com/AstralCommits/Front-end/issues/7) |
| #8 | [FRONT-07] Configuração de Cliente HTTP (Axios/Fetch) com Interceptor de Autenticação JWT | Fechada | [Abrir](https://github.com/AstralCommits/Front-end/issues/8) |
| #9 | [FRONT-08] Integração de Gráficos Interativos de Vendas e Tendência com Recharts | Fechada | [Abrir](https://github.com/AstralCommits/Front-end/issues/9) |
| #10 | Front 06, 07 e 08 | Fechada | [Abrir](https://github.com/AstralCommits/Front-end/issues/10) |
| #11 | [FRONT-01] Vitrine de artesanato com galeria de imagens e zoom | Fechada | [Abrir](https://github.com/AstralCommits/Front-end/issues/11) |
| #12 | [FRONT-02] Tela de cadastro e validação de CNPJ corporativo | Fechada | [Abrir](https://github.com/AstralCommits/Front-end/issues/12) |
| #13 | [FRONT-03] Filtro de produtos por técnica artesanal | Fechada | [Abrir](https://github.com/AstralCommits/Front-end/issues/13) |
| #14 | [FRONT-04] Modal de solicitação de orçamento personalizado para empresas | Fechada | [Abrir](https://github.com/AstralCommits/Front-end/issues/14) |
| #15 | [FRONT-05] Painel de controle do artesão com histórico de vendas | Fechada | [Abrir](https://github.com/AstralCommits/Front-end/issues/15) |
| #16 | [FRONT-06] Responsividade mobile do catálogo para compras via smartphone | Fechada | [Abrir](https://github.com/AstralCommits/Front-end/issues/16) |
| #17 | [FRONT-07] Integração de Clientes Axios com os Endpoints Spring Boot | Aberta | [Abrir](https://github.com/AstralCommits/Front-end/issues/17) |
| #18 | [FRONT-08] Tela de Cadastro e Validação Reativa de CNPJ de Empresas | Aberta | [Abrir](https://github.com/AstralCommits/Front-end/issues/18) |
| #19 | [FRONT-09] Filtros Multicritério Avançados por Técnica Artesanal e Polo Têxtil | Fechada | [Abrir](https://github.com/AstralCommits/Front-end/issues/19) |
| #20 | [FRONT-10] Modal Interativo de Solicitação de Cotação de Encomendas em Lote | Fechada (não planejada) | [Abrir](https://github.com/AstralCommits/Front-end/issues/20) |
| #21 | [FRONT-11] Componente de Galeria de Fotos com Zoom e Preview de Amostras | Fechada (não planejada) | [Abrir](https://github.com/AstralCommits/Front-end/issues/21) |
| #22 | [FRONT-12] Conformidade de Acessibilidade e Contraste WCAG 2.1 AA | Fechada | [Abrir](https://github.com/AstralCommits/Front-end/issues/22) |

## Issues #17 e #18 — decisão de escopo confirmada

A responsável pelo projeto confirmou em 23/11/2026 que o TRAMA deve permanecer uma plataforma de inteligência de vendas para confecções, sem se transformar em marketplace.

- **#17:** a integração HTTP/JWT com os endpoints existentes do TRAMA faz parte do produto. Endpoints de produtos, artesãos e cotações pertencem ao domínio marketplace e ficam fora do escopo.
- **#18:** cadastro de empresa compradora/CNPJ corporativo pertence ao domínio de marketplace e fica fora do escopo. O cadastro do TRAMA continua vinculado a empresário e confecção.
- As duas issues estavam abertas na consulta registrada. Este pacote não altera o status delas e não as apresenta como concluídas. Recomenda-se que o responsável pelo repositório registre a classificação `out of scope` ou transfira os requisitos para um backlog separado, se aplicável.

A decisão detalhada e seus limites estão em [`DECISAO-DE-ESCOPO-ISSUES-17-18.md`](DECISAO-DE-ESCOPO-ISSUES-17-18.md). A existência dessas issues abertas não bloqueia a conclusão das funcionalidades que fazem parte do escopo aprovado do TRAMA.

## Issue #19 preservada do develop

- #19 / FRONT-09 está fechada e a implementação foi trazida para `Frontend/apps/web/src/home/artisan-catalog.tsx`, `institutional.tsx` e `index.css` nesta consolidação.
- O catálogo usa itens locais demonstrativos e não deve ser apresentado como integração real com API.
- Critério original: [issue #19](https://github.com/AstralCommits/Front-end/issues/19).

## Outras observações sobre o estado oficial

- As issues #20 e #21 estão fechadas com motivo `not_planned` no GitHub; isso não significa que suas funcionalidades foram implementadas.
- A issue #22 está fechada com motivo `completed`, mas seu corpo ainda contém itens de checklist desmarcados. A conformidade WCAG 2.1 AA desta versão continua exigindo auditoria real de teclado, contraste e leitor de tela.
- As issues #11–#16 pertencem ao conjunto de marketplace/artesanato e devem ser lidas em seu escopo original; alguns dos fluxos de marketplace não fazem parte do sistema de inteligência comercial para confecções.

## Aviso para integração

Não feche/reabra issues automaticamente por causa deste pacote. O inventário registra o estado observado no GitHub na data indicada. A implementação e o estado da issue são coisas diferentes. Para #17 e #18, siga a decisão de escopo registrada; não implemente marketplace no TRAMA.
