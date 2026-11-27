package br.com.trama.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;

public record LoginResponse(
        @Schema(requiredMode = RequiredMode.REQUIRED) String token
) {
}
