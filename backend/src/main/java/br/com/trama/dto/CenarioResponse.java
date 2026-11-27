package br.com.trama.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;

import java.math.BigDecimal;

public record CenarioResponse(
        @Schema(requiredMode = RequiredMode.REQUIRED) Long idCenario,
        @Schema(requiredMode = RequiredMode.REQUIRED) String nome,
        String descricao,
        Long categoriaId,
        @Schema(requiredMode = RequiredMode.REQUIRED) BigDecimal percentualImpacto
) {
}
