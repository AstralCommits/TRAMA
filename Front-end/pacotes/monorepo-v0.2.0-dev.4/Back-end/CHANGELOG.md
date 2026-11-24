# Changelog — Pacote de Ester

- BACK-01 a BACK-04: estrutura inicial, entidades, CRUD e lançamentos mensais (já existentes no commit histórico `3f56d09`).
- BACK-08 (#12): tratamento global Problem Details / RFC 7807.
- BACK-09 (#13): importação CSV transacional.
- BD #17: perfil `EMPRESARIO`, isolamento por confecção e impacto 0–100.
- Ajuste de integração: `fonte_dado` do schema atual e migração complementar para `nome_fonte` (RF04).

OpenAPI, testes ampliados, JaCoCo/SonarQube e GitHub Actions estão no pacote de sobreposição de Gabriela.


## v0.2.0-dev.4 — integração TRAMA

### Adicionado / alterado
- Cadastro empresarial no servidor com criação de confecção vinculada e resposta JWT + dados da conta.
- Endpoint `GET /api/auth/me` para validar a sessão.
- Contrato de indicadores mensais com categorias, comparação com período anterior e ticket médio por peça.
- Verificações de vínculo empresarial ao consultar vendas, indicadores, confecções, cenários e importar CSV.
- Migração complementar para `fonte_dado` e teste de integração para cadastro, escopo empresarial e CSV.

### Validação pendente
- A suíte Maven/JUnit e a integração contra MySQL real ainda precisam ser executadas no ambiente de desenvolvimento da equipe.


## v0.2.0-dev.4 — cadastros, filtros e equipe

- CRUD administrativo de categorias/confecções e atualização da confecção pelo responsável.
- Perfil FUNCIONARIO e isolamento por confecção.
- Convites de equipe com token de uso único, validade, revogação, aceite e auditoria.
- Persistência de filtros salvos por usuário.
- CRUD de cenários e testes de integração adicionais.
