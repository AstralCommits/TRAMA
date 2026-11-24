package br.com.trama.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record ConviteAceiteRequest(@NotBlank @Size(max = 100) String nome, @NotBlank @Size(min = 8, max = 72) String senha, @NotBlank String token) {}
