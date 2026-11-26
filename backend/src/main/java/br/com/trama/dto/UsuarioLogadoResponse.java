package br.com.trama.dto;

import br.com.trama.model.enums.PerfilUsuario;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;

public record UsuarioLogadoResponse(
        @Schema(requiredMode = RequiredMode.REQUIRED) Long idUsuario,
        @Schema(requiredMode = RequiredMode.REQUIRED) String nome,
        @Schema(requiredMode = RequiredMode.REQUIRED) String email,
        @Schema(requiredMode = RequiredMode.REQUIRED) PerfilUsuario perfil,
        @Schema(nullable = true) ConfeccaoDoUsuario confeccao) {

    public record ConfeccaoDoUsuario(
            @Schema(requiredMode = RequiredMode.REQUIRED) Long idConfeccao,
            @Schema(requiredMode = RequiredMode.REQUIRED) String nome,
            @Schema(requiredMode = RequiredMode.REQUIRED) String cidade,
            @Schema(requiredMode = RequiredMode.REQUIRED) String uf) {
    }
}
