package br.com.trama.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;

import br.com.trama.model.enums.StatusImportacao;
import java.time.LocalDateTime;

public record ImportacaoResponse(
        @Schema(requiredMode = RequiredMode.REQUIRED) Long idImportacao,
        @Schema(requiredMode = RequiredMode.REQUIRED) String nomeArquivo,
        @Schema(requiredMode = RequiredMode.REQUIRED) LocalDateTime dataImportacao,
        Integer qtdLinhas,
        @Schema(requiredMode = RequiredMode.REQUIRED) StatusImportacao status,
        Long idUsuario
) {}
