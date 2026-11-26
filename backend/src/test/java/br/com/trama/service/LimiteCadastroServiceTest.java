package br.com.trama.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.trama.error.TooManyRequestsException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class LimiteCadastroServiceTest {

    @Test
    void bloqueiaOCadastroQuePassaDoLimiteEPorOrigem() {
        LimiteCadastroService limite = new LimiteCadastroService(2, Duration.ofHours(1),
                new Relogio(Instant.parse("2026-11-26T12:00:00Z")));
        limite.registrar("10.0.0.1");
        limite.registrar("10.0.0.1");
        assertThatThrownBy(() -> limite.registrar("10.0.0.1")).isInstanceOf(TooManyRequestsException.class);
        assertThatCode(() -> limite.registrar("10.0.0.2")).doesNotThrowAnyException();
    }

    @Test
    void liberaDeNovoDepoisDaJanela() {
        Relogio relogio = new Relogio(Instant.parse("2026-11-26T12:00:00Z"));
        LimiteCadastroService limite = new LimiteCadastroService(1, Duration.ofHours(1), relogio);
        limite.registrar("10.0.0.1");
        assertThatThrownBy(() -> limite.registrar("10.0.0.1")).isInstanceOf(TooManyRequestsException.class);
        relogio.avancar(Duration.ofHours(1));
        assertThatCode(() -> limite.registrar("10.0.0.1")).doesNotThrowAnyException();
    }

    private static final class Relogio extends Clock {
        private Instant agora;

        Relogio(Instant agora) {
            this.agora = agora;
        }

        void avancar(Duration duracao) {
            agora = agora.plus(duracao);
        }

        @Override public ZoneOffset getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return agora; }
    }
}
