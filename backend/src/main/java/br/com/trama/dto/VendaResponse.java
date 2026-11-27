package br.com.trama.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;

import br.com.trama.model.enums.OrigemDado;
import br.com.trama.model.enums.OrigemLancamento;
import br.com.trama.model.enums.StatusLancamento;
import java.math.BigDecimal;

public record VendaResponse(
        @Schema(requiredMode = RequiredMode.REQUIRED) Long idLancamento,
        @Schema(requiredMode = RequiredMode.REQUIRED) String mesAno,
        @Schema(requiredMode = RequiredMode.REQUIRED) Integer quantidade,
        @Schema(requiredMode = RequiredMode.REQUIRED) BigDecimal faturamento,
        @Schema(requiredMode = RequiredMode.REQUIRED) OrigemLancamento origem,
        @Schema(requiredMode = RequiredMode.REQUIRED) OrigemDado origemDado,
        @Schema(requiredMode = RequiredMode.REQUIRED) String nomeFonte,
        @Schema(requiredMode = RequiredMode.REQUIRED) StatusLancamento status,
        @Schema(requiredMode = RequiredMode.REQUIRED) Long idConfeccao,
        @Schema(requiredMode = RequiredMode.REQUIRED) String confeccao,
        @Schema(requiredMode = RequiredMode.REQUIRED) Long idCategoria,
        @Schema(requiredMode = RequiredMode.REQUIRED) String categoria) {
}
