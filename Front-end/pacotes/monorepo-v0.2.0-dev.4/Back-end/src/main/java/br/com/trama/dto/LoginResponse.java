package br.com.trama.dto;

public record LoginResponse(String token, UsuarioAutenticadoResponse usuario) {}
