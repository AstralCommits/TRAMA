package br.com.trama.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistroRequest(
        @NotBlank(message = "Informe seu nome.")
        @Size(max = 100, message = "O nome deve ter até 100 caracteres.")
        String nome,

        @NotBlank(message = "Informe o e-mail.")
        @Email(message = "E-mail inválido.")
        @Size(max = 120, message = "O e-mail deve ter até 120 caracteres.")
        String email,

        @NotBlank(message = "Informe a senha.")
        @Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres.")
        String senha,

        @NotBlank(message = "Informe o nome da confecção.")
        @Size(max = 120, message = "O nome da confecção deve ter até 120 caracteres.")
        String nomeConfeccao,

        @NotBlank(message = "Informe a cidade.")
        String cidade
) {}
