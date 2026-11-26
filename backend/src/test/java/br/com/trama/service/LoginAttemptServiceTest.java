package br.com.trama.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.trama.error.TooManyRequestsException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class LoginAttemptServiceTest {
    private static final String EMAIL = "Pessoa@Trama.Test";

    @Test
    void liberaDeNovoDepoisDoTempoDeBloqueio() {
        RelogioAjustavel relogio = new RelogioAjustavel(Instant.parse("2026-11-26T12:00:00Z"));
        LoginAttemptService service = new LoginAttemptService(3, Duration.ofMinutes(15), relogio);
        for (int i = 0; i < 3; i++) {
            service.registrarFalha(EMAIL);
        }
        assertThatThrownBy(() -> service.verificar("pessoa@trama.test"))
                .isInstanceOf(TooManyRequestsException.class);

        relogio.avancar(Duration.ofMinutes(15));
        assertThatCode(() -> service.verificar(EMAIL)).doesNotThrowAnyException();
    }

    @Test
    void falhasAbaixoDoLimiteNaoBloqueiam() {
        LoginAttemptService service = new LoginAttemptService(3, Duration.ofMinutes(15),
                new RelogioAjustavel(Instant.parse("2026-11-26T12:00:00Z")));
        service.registrarFalha(EMAIL);
        service.registrarFalha(EMAIL);
        assertThatCode(() -> service.verificar(EMAIL)).doesNotThrowAnyException();
    }

    private static final class RelogioAjustavel extends Clock {
        private Instant agora;

        RelogioAjustavel(Instant agora) {
            this.agora = agora;
        }

        void avancar(Duration duracao) {
            agora = agora.plus(duracao);
        }

        @Override public ZoneOffset getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(java.time.ZoneId zone) { return this; }
        @Override public Instant instant() { return agora; }
    }
}
