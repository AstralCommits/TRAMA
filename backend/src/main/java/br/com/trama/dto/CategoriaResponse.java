package br.com.trama.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;

public record CategoriaResponse(@Schema(requiredMode = RequiredMode.REQUIRED) Long idCategoria, @Schema(requiredMode = RequiredMode.REQUIRED) String nome) {
}
