package br.com.trama.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;

public record CidadeResponse(@Schema(requiredMode = RequiredMode.REQUIRED) Long idCidade, @Schema(requiredMode = RequiredMode.REQUIRED) String nome, @Schema(requiredMode = RequiredMode.REQUIRED) String uf) {
}
