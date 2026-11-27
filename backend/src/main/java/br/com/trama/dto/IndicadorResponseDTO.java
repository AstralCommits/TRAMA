package br.com.trama.dto;

import java.math.BigDecimal;
import java.util.List;

public record IndicadorResponseDTO(
        String inicio,
        String fim,
        Long quantidadeTotal,
        BigDecimal faturamentoTotal,
        BigDecimal faturamentoMedio,
        long quantidadeLancamentos,
        Long categoriaId,
        String cidade,
        long pecasVendidas,
        BigDecimal ticketMedio,
        String inicioAnterior,
        String fimAnterior,
        BigDecimal faturamentoTotalAnterior,
        long pecasVendidasAnterior,
        BigDecimal variacaoPercentual,
        List<CategoriaIndicadorDTO> categorias,
        CategoriaLiderDTO categoriaLider
) {}
