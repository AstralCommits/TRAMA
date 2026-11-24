package br.com.trama.security;

import br.com.trama.error.BadRequestException;
import java.nio.charset.StandardCharsets;

public final class SenhaBcryptPolicy {
    private static final int LIMITE_BYTES = 72;

    private SenhaBcryptPolicy() {}

    public static boolean cabeNoLimite(String senha) {
        return senha == null || senha.getBytes(StandardCharsets.UTF_8).length <= LIMITE_BYTES;
    }

    public static void validar(String senha) {
        if (!cabeNoLimite(senha)) {
            throw new BadRequestException("A senha deve ocupar no máximo 72 bytes em UTF-8.");
        }
    }
}
