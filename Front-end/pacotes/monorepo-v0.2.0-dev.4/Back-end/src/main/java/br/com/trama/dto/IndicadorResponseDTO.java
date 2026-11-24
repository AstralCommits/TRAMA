package br.com.trama.dto;

import java.math.BigDecimal;
import java.util.List;

public record IndicadorResponseDTO(
        String inicio,
        String fim,
        Long quantidadeTotal,
        BigDecimal faturamentoTotal,
        Long pecasVendidas,
        BigDecimal faturamentoTotalAnterior,
        Long pecasVendidasAnterior,
        BigDecimal ticketMedioPorPeca,
        List<IndicadorCategoriaDTO> categorias,
        CategoriaLiderDTO categoriaLider,
        long quantidadeLancamentos,
        Long categoriaId,
        String cidade
) {}
