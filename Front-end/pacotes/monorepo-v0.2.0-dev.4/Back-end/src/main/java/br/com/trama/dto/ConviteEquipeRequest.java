package br.com.trama.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record ConviteEquipeRequest(@NotBlank @Email @Size(max = 120) String email) {}
