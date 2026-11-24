package br.com.trama.dto;

import java.time.LocalDateTime;

public record FiltroSalvoResponse(Long idFiltro, String nome, String contexto, String configuracaoJson, LocalDateTime atualizadoEm) {}
