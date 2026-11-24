package br.com.trama.dto;

public record UsuarioAutenticadoResponse(
        Long idUsuario,
        String nome,
        String email,
        String perfil,
        Long idConfeccao,
        String nomeConfeccao,
        String cidade
) {}
