# Schema MySQL e migrações do Back-end

O Back-end usa o schema `confeccoes`, mantido no repositório Banco-de-Dados. No perfil `dev`, Hibernate executa `ddl-auto: validate`; não cria tabelas nem aplica migrações automaticamente.

## Alinhamento requerido pelo mapeamento JPA

A tabela `lancamento_mensal` precisa conter, além dos campos de mês, quantidade, faturamento, origem, status e vínculos:

- `fonte_dado VARCHAR(20) NOT NULL`, aceitando `ENTREVISTA`, `QUESTIONARIO`, `FONTE_SECUNDARIA` e `DEMONSTRACAO`;
- `nome_fonte VARCHAR(200) NOT NULL`.

O `database/schema.sql` e `database/banco_completo.sql` do pacote integrado já incluem os dois campos e seus dados demonstrativos. O script `schema_reference.sql` é apenas referência técnica, não é script de atualização de banco existente.

## Migrações manuais para bases antigas

Faça backup e inspecione `SHOW COLUMNS FROM lancamento_mensal;` antes de alterar qualquer banco. Não execute uma migração se a coluna ou constraint correspondente já existir.

- `V0_4_0__perfil_empresario_e_impacto.sql`: somente bases antigas que ainda têm o perfil `CONFECCAO` e não têm as constraints correspondentes. Não executar se o banco já usa `ADMIN`/`EMPRESARIO` e `chk_cenario_impacto`.
- `V0_5_0__nome_fonte_lancamento.sql`: somente se `nome_fonte` ainda não existir.
- `V0_6_0__fonte_dado_lancamento.sql`: somente se `fonte_dado` ainda não existir. O script preenche registros antigos com `FONTE_SECUNDARIA` e cria a constraint; revise a classificação dos dados legados.

Para uma base que não possui nenhuma das duas colunas, aplicar V0.5 e depois V0.6. Para uma base nova criada pelo schema atualizado, não aplicar V0.5 nem V0.6.

Os scripts de `Banco-de-Dados/database/schema.sql` e `banco_completo.sql` podem conter comandos de recriação (`DROP DATABASE`). Use apenas em desenvolvimento/ambiente descartável depois de conferir o conteúdo e fazer backup. Não execute em produção.


## Migrações adicionais de integração (dev.4)

- `V0_7_0__equipe_funcionarios.sql`: amplia o perfil para `FUNCIONARIO` e mantém a regra de vínculo obrigatório à confecção. Aplique apenas se a constraint ainda não aceitar esse perfil.
- `V0_8_0__filtros_salvos.sql`: cria filtros persistentes e privados por usuário.
- `V0_9_0__auditoria_equipe.sql`: registra criação e remoção de acessos de funcionários.

Em banco novo, use o `schema.sql` atualizado do repositório Banco-de-Dados; não aplique migrações que recriam tabelas já presentes. Em banco existente, faça backup, verifique tabelas/constraints e aplique apenas as extensões ausentes.

- `V0_10_0__convites_equipe.sql`: cria convites de uso único, com hash do token, validade de 72 horas e revogação. O envio por e-mail não é automático; o responsável compartilha o token por canal seguro.
