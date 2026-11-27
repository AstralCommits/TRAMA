package br.com.trama;

import static org.assertj.core.api.Assertions.assertThat;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
class MigracoesMySqlTest {

    @Container
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("confeccoes")
            .withCommand("--character-set-server=utf8mb4", "--collation-server=utf8mb4_0900_ai_ci",
                    "--log-bin-trust-function-creators=1");

    @DynamicPropertySource
    static void banco(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.MySQLDialect");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.flyway.enabled", () -> "true");
    }

    @Autowired private Flyway flyway;
    @Autowired private JdbcTemplate jdbc;

    @Test
    void todasAsMigracoesForamAplicadasEAsEntidadesBatemComOBanco() {
        assertThat(flyway.info().pending()).isEmpty();
        assertThat(flyway.info().applied()).hasSizeGreaterThanOrEqualTo(7);
        assertThat(contar("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'confeccoes' "
                + "AND table_type = 'BASE TABLE' AND table_name <> 'flyway_schema_history'")).isEqualTo(11);
        assertThat(contar("SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'confeccoes'"))
                .isEqualTo(3);
        assertThat(contar("SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'confeccoes'"))
                .isEqualTo(7);
        assertThat(contar("SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'confeccoes'"))
                .isEqualTo(2);
    }

    @Test
    void triggersGravamOHistoricoDeAlteracaoEExclusao() {
        Long idCidade = jdbc.queryForObject("SELECT id_cidade FROM cidade WHERE nome = 'Caruaru'", Long.class);
        jdbc.update("INSERT INTO confeccao (nome, porte, tipo, id_cidade) VALUES ('Teste Flyway', 'MICRO', 'CONFECCAO', ?)",
                idCidade);
        Long idConfeccao = jdbc.queryForObject("SELECT id_confeccao FROM confeccao WHERE nome = 'Teste Flyway'", Long.class);
        Long idCategoria = jdbc.queryForObject("SELECT MIN(id_categoria) FROM categoria", Long.class);

        jdbc.update("CALL inserir_lancamento('2026-03-15', 10, 1000.00, ?, ?, 'ENTREVISTA')", idConfeccao, idCategoria);
        Long idLancamento = jdbc.queryForObject(
                "SELECT id_lancamento FROM lancamento_mensal WHERE id_confeccao = ?", Long.class, idConfeccao);
        jdbc.update("UPDATE lancamento_mensal SET quantidade = 12 WHERE id_lancamento = ?", idLancamento);
        jdbc.update("DELETE FROM lancamento_mensal WHERE id_lancamento = ?", idLancamento);

        assertThat(jdbc.queryForList("SELECT acao FROM historico_lancamento WHERE id_lancamento = ? ORDER BY id_historico",
                String.class, idLancamento)).containsExactly("UPDATE", "DELETE");
    }

    private Integer contar(String sql) {
        return jdbc.queryForObject(sql, Integer.class);
    }
}
