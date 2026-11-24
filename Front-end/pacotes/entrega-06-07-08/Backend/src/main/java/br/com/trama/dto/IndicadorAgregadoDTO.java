package br.com.trama.dto;

import java.math.BigDecimal;

public record IndicadorAgregadoDTO(
        Long categoriaId,
        String categoria,
        Long quantidadeAtual,
        BigDecimal faturamentoAtual,
        Long quantidadeAnterior,
        BigDecimal faturamentoAnterior,
        BigDecimal variacaoPercentual,
        String tendencia
) {
}
