package br.com.trama.dto;

import java.math.BigDecimal;

public record IndicadorCategoriaDTO(
        String categoria,
        BigDecimal faturamento,
        Long pecasVendidas,
        BigDecimal faturamentoAnterior,
        Long pecasVendidasAnterior,
        Double variacaoPercentual
) {}
