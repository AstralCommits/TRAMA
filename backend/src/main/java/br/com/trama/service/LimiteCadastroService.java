package br.com.trama.service;

import br.com.trama.error.TooManyRequestsException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class LimiteCadastroService {
    private final int maxPorJanela;
    private final Duration janela;
    private final Clock clock;
    private final Map<String, Contagem> contagens = new ConcurrentHashMap<>();

    @Autowired
    public LimiteCadastroService(@Value("${trama.cadastro.max-por-hora:5}") int maxPorHora) {
        this(maxPorHora, Duration.ofHours(1), Clock.systemUTC());
    }

    LimiteCadastroService(int maxPorJanela, Duration janela, Clock clock) {
        this.maxPorJanela = maxPorJanela;
        this.janela = janela;
        this.clock = clock;
    }

    public void registrar(String origem) {
        Instant agora = clock.instant();
        contagens.entrySet().removeIf(entrada -> entrada.getValue().expirou(agora, janela));
        Contagem atual = contagens.compute(origem == null ? "" : origem, (chave, contagem) ->
                contagem == null || contagem.expirou(agora, janela)
                        ? new Contagem(1, agora)
                        : new Contagem(contagem.total() + 1, contagem.inicio()));
        if (atual.total() > maxPorJanela) {
            throw new TooManyRequestsException(
                    "Muitos cadastros a partir desta conexão. Tente de novo mais tarde.",
                    Duration.between(agora, atual.inicio().plus(janela)));
        }
    }

    private record Contagem(int total, Instant inicio) {
        boolean expirou(Instant agora, Duration janela) {
            return !agora.isBefore(inicio.plus(janela));
        }
    }
}
