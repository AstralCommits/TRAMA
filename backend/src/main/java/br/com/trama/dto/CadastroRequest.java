package br.com.trama.dto;

import br.com.trama.model.enums.PorteConfeccao;
import br.com.trama.model.enums.TipoConfeccao;
import br.com.trama.validation.TextoSeguro;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CadastroRequest(
        @NotBlank(message = "Informe seu nome.")
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
        @Pattern(regexp = TextoSeguro.SEM_HTML, message = TextoSeguro.MENSAGEM)
        String nome,

        @NotBlank(message = "Informe o e-mail.")
        @Email(message = "E-mail inválido.")
        @Size(max = 120, message = "O e-mail deve ter no máximo 120 caracteres.")
        String email,

        @NotBlank(message = "Informe a senha.")
        @Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres.")
        String senha,

        @NotBlank(message = "Informe o nome da confecção.")
        @Size(max = 120, message = "O nome da confecção deve ter no máximo 120 caracteres.")
        @Pattern(regexp = TextoSeguro.SEM_HTML, message = TextoSeguro.MENSAGEM)
        String nomeConfeccao,

        @Pattern(regexp = "^(?:\\d{14}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2})?$",
                 message = "Informe um CNPJ com 14 dígitos, com ou sem pontuação.")
        String cnpj,

        @NotNull(message = "Informe o porte da confecção.")
        PorteConfeccao porte,

        @NotNull(message = "Informe o tipo de estabelecimento.")
        TipoConfeccao tipo,

        @NotBlank(message = "Informe a cidade.")
        @Size(max = 80, message = "A cidade deve ter no máximo 80 caracteres.")
        String cidade) {
}
