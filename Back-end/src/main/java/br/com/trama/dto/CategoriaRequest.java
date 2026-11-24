package br.com.trama.dto;

import br.com.trama.validation.TextoSeguro;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoriaRequest(
        @NotBlank(message = "O nome da categoria é obrigatório.")
        @Size(max = 50, message = "O nome da categoria deve ter no máximo 50 caracteres.")
        @Pattern(regexp = TextoSeguro.SEM_HTML, message = TextoSeguro.MENSAGEM)
        String nome) {
}
