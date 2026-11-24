package br.com.trama.auth;

import br.com.trama.model.enums.PorteConfeccao;
import br.com.trama.model.enums.TipoConfeccao;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AuthRegisterRequest(
        @NotBlank @Size(max = 100) String nome,
        @NotBlank @Email @Size(max = 120) String email,
        @NotBlank @Size(min = 8, max = 72) String senha,
        @NotBlank @Size(max = 120) String nomeConfeccao,
        @Pattern(regexp = "^(?:\\d{14}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2})?$",
                message = "Informe um CNPJ com 14 dígitos, com ou sem pontuação.") String cnpj,
        @NotNull PorteConfeccao porte,
        @NotNull TipoConfeccao tipo,
        @NotBlank String cidade) {
}
