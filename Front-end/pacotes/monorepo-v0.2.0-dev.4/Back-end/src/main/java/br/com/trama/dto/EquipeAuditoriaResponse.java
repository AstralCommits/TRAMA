package br.com.trama.dto;

import java.time.LocalDateTime;
public record EquipeAuditoriaResponse(Long idAuditoria, String acao, String membroNome, String membroEmail, LocalDateTime dataEvento) {}
