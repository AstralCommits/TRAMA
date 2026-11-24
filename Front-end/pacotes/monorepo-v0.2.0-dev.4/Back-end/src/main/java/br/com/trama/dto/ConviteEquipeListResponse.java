package br.com.trama.dto;
import java.time.LocalDateTime;
public record ConviteEquipeListResponse(Long idConvite, String email, LocalDateTime criadoEm, LocalDateTime expiraEm, String status) {}
