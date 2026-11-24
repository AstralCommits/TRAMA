package br.com.trama.dto;
import java.time.LocalDateTime;
public record ConviteEquipeResponse(Long idConvite, String email, String token, LocalDateTime expiraEm, String status) {}
