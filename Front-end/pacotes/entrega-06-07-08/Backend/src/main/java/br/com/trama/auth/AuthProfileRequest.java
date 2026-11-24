package br.com.trama.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthProfileRequest(
        @NotBlank @Size(max = 100) String nome,
        @NotBlank @Email @Size(max = 120) String email,
        @Size(max = 120) String nomeConfeccao,
        String cidade) {
}
