package br.com.trama.dto;

import java.math.BigDecimal;

public record CategoriaIndicadorDTO(
        Long idCategoria,
        String categoria,
        BigDecimal faturamento,
        long pecasVendidas,
        BigDecimal faturamentoAnterior,
        long pecasVendidasAnterior,
        BigDecimal variacaoPercentual,
        String classificacao
) {}
