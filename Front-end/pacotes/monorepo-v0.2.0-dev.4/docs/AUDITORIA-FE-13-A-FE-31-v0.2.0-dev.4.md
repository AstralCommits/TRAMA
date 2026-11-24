# Auditoria das issues FE-13 a FE-31 — v0.2.0-dev.4

Legenda: **Implementado no código** = alteração realizada; **Validação pendente** = depende de executar teste no ambiente; **Parcial** = ainda existe requisito funcional/manual não coberto.

| Issue | Situação nesta entrega | Evidência / pendência |
|---|---|---|
| FE-13 | Implementado no código | CRUD administrativo de categorias, validação de vínculos e proteção de exclusão; executar API/Browser. |
| FE-14 | Implementado no código | CRUD administrativo de confecções e edição da própria confecção pelo empresário; validar MySQL e permissões. |
| FE-15 | Implementado no código / testes adicionados; execução pendente | CRUD mensal conectado; lançamento cancelado pode ser reativado por novo cadastro ou CSV; edição manual remove FK de importação anterior. Executar os novos testes Maven e validar no MySQL. |
| FE-16 | Implementado no código | Origem e procedência separadas; schema e migrações presentes; validar importação e exportação com dados reais. |
| FE-17 | Implementado no código | Pré-visualização, cabeçalho e validações preliminares no navegador; servidor continua fazendo validação definitiva; testar arquivos válidos/inválidos. |
| FE-18 | Implementado no código | Cenários com listar/criar/editar/excluir e simular; validar propriedade e persistência em API real. |
| FE-19 | Implementado no código / validação assistiva pendente | Indicadores com alternativa tabular e fórmulas documentadas; conferir contraste, semântica, leitor de tela e consistência com SQL. |
| FE-20 | Implementado no código | Filtros por período/categoria/cidade nos indicadores e tendências; testar combinação e consistência entre telas. |
| FE-21 | Implementado no código / matriz de execução pendente | Mensagens específicas para 400/401/403/404/409/413/429/5xx, timeout, cancelamento e falha de rede; sem retry automático. Ainda falta executar a matriz contra respostas reais da API. |
| FE-22 | Implementado no código / validação manual pendente | Hook comum aplicado aos diálogos modais, com foco inicial, contenção de Tab, Escape configurável e restauração do foco; ainda falta teste em navegador/teclado, leitor de tela e auditoria WCAG AA. |
| FE-23 | Implementado no código | Exportação CSV e impressão/Salvar PDF; conferir conteúdo e layout nos navegadores suportados. |
| FE-24 | Testes adicionados; execução pendente | Testes de equipe/convites, perfil, filtros, cenários e isolamento foram adicionados; Maven/JUnit não pôde ser executado nesta sessão. |
| FE-25 | Parcial / validação pendente | CSS responsivo existente e revisado; faltam testes em dispositivos, navegadores, zoom e desempenho. |
| FE-26 | Implementado no código | Histórico de importações conectado; testar sucesso, erro, arquivo vazio, duplicidade e escopo de funcionário. |
| FE-27 | Implementado no código / validação de compreensão pendente | Fórmulas e explicações de indicadores preservadas; validar compreensão com usuários do público-alvo. |
| FE-28 | Implementado no código | Filtros salvos no servidor por usuário/contexto para contas reais; demo usa localStorage; testar isolamento e persistência após novo login. |
| FE-29 | Implementado no código / validação pendente | Perfil FUNCIONARIO, convites de token único, validade 72h, revogação, aceite e auditoria; envio de e-mail é manual e testes Maven/MySQL pendentes. |
| FE-30 | Parcial / validação pendente | Impressão e estilos responsivos presentes; falta validar impressão real, zoom, viewport e quebras de página. |
| FE-31 | Implementado no código / validação pendente | Escopo server-side para empresário e funcionário, permissões de equipe e convites; executar testes de autorização com tokens distintos e MySQL. |

## Observações importantes

- Os IDs FE-13 a FE-31 são identificadores internos do backlog e não significam que issues do GitHub foram alteradas ou fechadas.
- Não houve alteração remota no GitHub.
- Não declarar as 19 issues como integralmente concluídas sem os testes pendentes e a revisão dos critérios oficiais de aceite.
