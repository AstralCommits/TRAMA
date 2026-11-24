package br.com.trama.dto;

import java.math.BigDecimal;

public record FaturamentoMensalDTO(String mes, Long quantidade, BigDecimal faturamento) {}
