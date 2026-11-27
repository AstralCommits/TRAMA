package br.com.trama.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;

import br.com.trama.model.enums.PorteConfeccao;
import br.com.trama.model.enums.TipoConfeccao;

public record ConfeccaoResponse(
        @Schema(requiredMode = RequiredMode.REQUIRED) Long idConfeccao,
        @Schema(requiredMode = RequiredMode.REQUIRED) String nome,
        String cnpj,
        @Schema(requiredMode = RequiredMode.REQUIRED) PorteConfeccao porte,
        @Schema(requiredMode = RequiredMode.REQUIRED) TipoConfeccao tipo,
        @Schema(requiredMode = RequiredMode.REQUIRED) Long idCidade,
        @Schema(requiredMode = RequiredMode.REQUIRED) String cidade,
        @Schema(requiredMode = RequiredMode.REQUIRED) String uf) {
}
