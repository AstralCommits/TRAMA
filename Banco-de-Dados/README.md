# Banco de Dados | TRAMA

Banco MySQL `confeccoes` do TRAMA. Os scripts SQL ficam em [`database/`](database) e o minimundo em [`docs/minimundo.md`](docs/minimundo.md). Este README documenta o **backup e a recuperação** do banco (DB-07 / RNF04).

## Backup e recuperação

Os scripts ficam em `scripts/` e os backups em `backups/` (`confeccoes_AAAAMMDD_HHMMSS.sql.gz`).

| Arquivo | Função |
|---|---|
| `scripts/backup_database.sh` | Backup lógico compactado (`.sql.gz`) com timestamp e expurgo de backups com mais de 7 dias |
| `scripts/restore_test.sh` | Teste de restauração do backup em um banco temporário |
| `scripts/backup.env.example` | Modelo de configuração (copie para `scripts/backup.env`, que não é versionado) |

Requisitos: MySQL 8 (`mysqldump` e `mysql` no PATH) e um terminal bash (Linux, WSL ou Git Bash). No Git Bash, se o `mysqldump` não for encontrado, adicione a pasta do MySQL ao PATH:

```bash
export PATH="$PATH:/c/Program Files/MySQL/MySQL Server 8.0/bin"
```

### Configuração

Na pasta `Banco-de-Dados`:

```bash
cp scripts/backup.env.example scripts/backup.env
```

Edite o `scripts/backup.env` com `DB_USER` e `DB_PASS`. Esse arquivo contém a senha e é ignorado pelo Git. Por padrão os backups vão para a pasta `backups/` do repositório; para mudar, defina `BACKUP_DIR`. Os dias de retenção ficam em `RETENTION_DAYS` (padrão 7).

### Execução

```bash
bash scripts/backup_database.sh            # backup + expurgo
bash scripts/backup_database.sh --verify   # backup + expurgo + teste de restore
bash scripts/restore_test.sh               # testa o backup mais recente
```

Para agendar no Linux, use o `cron` (backup diário às 02:00 com teste de restore):

```cron
0 2 * * * bash /caminho/do/repo/Banco-de-Dados/scripts/backup_database.sh --verify >> /var/log/confeccoes_backup.cron.log 2>&1
```

O agendamento está apenas documentado; ele não é instalado automaticamente em nenhum servidor.

### O que o backup garante

- O arquivo só vira `.sql.gz` depois de validado (gzip íntegro, dump completo e com tabelas).
- O expurgo só roda depois de um backup novo válido, então uma falha nunca apaga o último backup bom.
- O teste de restore usa um banco temporário `restore_test_*`, apagado ao final. O banco real nunca é tocado.
- O usuário do teste precisa de permissão para criar e apagar bancos `restore_test_*`.

### Procedimento de recuperação

1. Pare a aplicação para evitar novas escritas.
2. Escolha o backup: `ls -lt backups/confeccoes_*.sql.gz | head`
3. Valide: `bash scripts/restore_test.sh backups/confeccoes_AAAAMMDD_HHMMSS.sql.gz`. Só continue se terminar com `RESTORE TEST: OK`.
4. Se o banco ainda existe, guarde uma cópia do estado atual com `mysqldump` antes de apagar.
5. Recrie o banco vazio:

   ```sql
   DROP DATABASE IF EXISTS confeccoes;
   CREATE DATABASE confeccoes CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
   ```

6. Restaure (o `sed` remove o `DEFINER` original, para funcionar com qualquer usuário):

   ```bash
   gzip -dc backups/confeccoes_AAAAMMDD_HHMMSS.sql.gz \
     | sed -E 's/DEFINER[[:space:]]*=[[:space:]]*`[^`]*`@`[^`]*`//g' \
     | mysql -u root -p --default-character-set=utf8mb4 confeccoes
   ```

7. Confira com `SHOW FULL TABLES;` e `SELECT COUNT(*) FROM lancamento_mensal;`.
8. Reative a aplicação e registre o incidente (horário, backup usado e dados perdidos entre o backup e a falha).

### Erros comuns

| Erro | Solução |
|---|---|
| `Access denied ... SUPER or SET_USER_ID` | Use o `sed` do passo 6 (o `restore_test.sh` já faz isso) |
| `@@GLOBAL.GTID_PURGED ...` | O padrão do script já inclui `--set-gtid-purged=OFF`; confira se `DUMP_OPTS` não foi alterado |
| `Outro backup ja esta em execucao` | Há um backup em andamento; se travou, apague `backups/.backup.lock.d` |

### Pontos de atenção

- Os backups ficam na mesma máquina. Copie os `.sql.gz` para outro disco ou para a nuvem de vez em quando: um backup na mesma máquina não protege contra falha do disco.
- O `cron` está documentado, mas não instalado em nenhum servidor.
