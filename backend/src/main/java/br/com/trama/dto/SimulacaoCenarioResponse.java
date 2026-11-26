package br.com.trama.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;

import java.math.BigDecimal;

public record SimulacaoCenarioResponse(

        @Schema(requiredMode = RequiredMode.REQUIRED) BigDecimal faturamentoReal,
        @Schema(requiredMode = RequiredMode.REQUIRED) BigDecimal faturamentoHipotetico,
        @Schema(requiredMode = RequiredMode.REQUIRED) BigDecimal diferencaReais,
        @Schema(requiredMode = RequiredMode.REQUIRED) BigDecimal diferencaPercentual
) {
}
