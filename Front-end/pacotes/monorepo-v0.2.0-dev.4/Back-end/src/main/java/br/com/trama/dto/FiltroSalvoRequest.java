package br.com.trama.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FiltroSalvoRequest(
    @NotBlank @Size(max = 60) String nome,
    @NotBlank @Size(max = 30) String contexto,
    @NotBlank @Size(max = 4000) String configuracaoJson
) {}
