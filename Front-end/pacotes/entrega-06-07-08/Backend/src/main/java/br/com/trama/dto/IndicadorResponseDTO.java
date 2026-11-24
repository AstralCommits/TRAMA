package br.com.trama.dto;

import java.math.BigDecimal;
import java.util.List;

public record IndicadorResponseDTO(
        String inicio,
        String fim,
        String inicioComparacao,
        String fimComparacao,
        String cidade,
        Long categoriaId,
        Long totalQuantidade,
        BigDecimal totalFaturamento,
        Long totalQuantidadeAnterior,
        BigDecimal totalFaturamentoAnterior,
        List<IndicadorAgregadoDTO> indicadores,
        List<FaturamentoMensalDTO> faturamentoMensal,
        String mensagem) {
}
