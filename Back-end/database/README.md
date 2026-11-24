# Scripts de banco usados pelo Back-end

O esquema oficial do TRAMA fica em [`Banco-de-Dados/database`](../../Banco-de-Dados/database). Para subir o banco, use o `banco_completo.sql` ou o `docker-compose.yml` de lá.

- `schema_reference.sql`: cópia de referência do esquema que as entidades JPA esperam.
- `migrations/V0_4_0__perfil_empresario_e_impacto.sql`: só para bancos antigos, criados antes do perfil EMPRESARIO.

A antiga `V0_5_0__nome_fonte_lancamento.sql` foi retirada: as colunas `fonte_dado` e `nome_fonte` agora vêm do próprio banco (`Banco-de-Dados/database/migracoes/V0_5_0__fonte_dado.sql`). Não rode as duas no mesmo banco.
