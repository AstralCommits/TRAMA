package br.com.trama.service;

import br.com.trama.error.TooManyRequestsException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class LoginAttemptService {
    private final int maxTentativas;
    private final Duration bloqueio;
    private final Clock clock;
    private final Map<String, Tentativas> tentativas = new ConcurrentHashMap<>();

    @Autowired
    public LoginAttemptService(
            @Value("${trama.login.max-tentativas:5}") int maxTentativas,
            @Value("${trama.login.bloqueio-minutos:15}") long bloqueioMinutos) {
        this(maxTentativas, Duration.ofMinutes(bloqueioMinutos), Clock.systemUTC());
    }

    LoginAttemptService(int maxTentativas, Duration bloqueio, Clock clock) {
        this.maxTentativas = maxTentativas;
        this.bloqueio = bloqueio;
        this.clock = clock;
    }

    public void verificar(String email) {
        Tentativas atual = tentativas.get(chave(email));
        if (atual == null) {
            return;
        }
        Instant agora = clock.instant();
        if (atual.expirou(agora, bloqueio)) {
            tentativas.remove(chave(email));
            return;
        }
        if (atual.falhas() >= maxTentativas) {
            Duration restante = Duration.between(agora, atual.primeiraFalha().plus(bloqueio));
            throw new TooManyRequestsException(
                    "Muitas tentativas de login sem sucesso. Tente de novo em alguns minutos.", restante);
        }
    }

    public void registrarFalha(String email) {
        Instant agora = clock.instant();
        tentativas.compute(chave(email), (chave, atual) ->
                atual == null || atual.expirou(agora, bloqueio)
                        ? new Tentativas(1, agora)
                        : new Tentativas(atual.falhas() + 1, atual.primeiraFalha()));
    }

    public void registrarSucesso(String email) {
        tentativas.remove(chave(email));
    }

    private static String chave(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private record Tentativas(int falhas, Instant primeiraFalha) {
        boolean expirou(Instant agora, Duration bloqueio) {
            return !agora.isBefore(primeiraFalha.plus(bloqueio));
        }
    }
}
