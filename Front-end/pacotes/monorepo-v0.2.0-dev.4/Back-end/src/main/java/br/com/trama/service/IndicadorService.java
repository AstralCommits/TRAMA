package br.com.trama.service;

import br.com.trama.dto.CategoriaLiderDTO;
import br.com.trama.dto.IndicadorCategoriaDTO;
import br.com.trama.dto.IndicadorResponseDTO;
import br.com.trama.error.BadRequestException;
import br.com.trama.model.LancamentoMensal;
import br.com.trama.model.enums.StatusLancamento;
import br.com.trama.repository.LancamentoMensalRepository;
import br.com.trama.security.UsuarioPrincipal;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IndicadorService {
    private final LancamentoMensalRepository repository;

    public IndicadorService(LancamentoMensalRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public IndicadorResponseDTO buscarIndicadores(String inicio, String fim, Long categoriaId, String cidade,
                                                   UsuarioPrincipal principal) {
        YearMonth mesInicio = parse(inicio, "início");
        YearMonth mesFim = parse(fim, "fim");
        if (mesFim.isBefore(mesInicio)) {
            throw new BadRequestException("O mês final deve ser igual ou posterior ao mês inicial.");
        }

        Long idConfeccao = principal != null && (principal.getPerfil().name().equals("EMPRESARIO") || principal.getPerfil().name().equals("FUNCIONARIO"))
                ? principal.getIdConfeccao() : null;
        if (principal != null && (principal.getPerfil().name().equals("EMPRESARIO") || principal.getPerfil().name().equals("FUNCIONARIO")) && idConfeccao == null) {
            throw new BadRequestException("A conta ainda não possui uma confecção vinculada.");
        }

        long quantidadeMeses = ChronoUnit.MONTHS.between(mesInicio, mesFim) + 1;
        YearMonth mesAnteriorFim = mesInicio.minusMonths(1);
        YearMonth mesAnteriorInicio = mesAnteriorFim.minusMonths(quantidadeMeses - 1);
        String cidadeFiltro = cidade == null || cidade.isBlank() ? null : cidade.trim();

        List<LancamentoMensal> atuais = repository.buscarParaIndicadores(
                mesInicio.atDay(1), mesFim.atEndOfMonth(), categoriaId, cidadeFiltro, idConfeccao,
                StatusLancamento.ATIVO);
        List<LancamentoMensal> anteriores = repository.buscarParaIndicadores(
                mesAnteriorInicio.atDay(1), mesAnteriorFim.atEndOfMonth(), categoriaId, cidadeFiltro, idConfeccao,
                StatusLancamento.ATIVO);

        Totais totalAtual = somar(atuais);
        Totais totalAnterior = somar(anteriores);
        Map<String, TotaisCategoria> porCategoria = new LinkedHashMap<>();
        acumularCategorias(porCategoria, atuais, true);
        acumularCategorias(porCategoria, anteriores, false);

        List<IndicadorCategoriaDTO> categorias = porCategoria.entrySet().stream()
                .map(entry -> {
                    TotaisCategoria valores = entry.getValue();
                    return new IndicadorCategoriaDTO(entry.getKey(), valores.faturamento,
                            valores.quantidade, valores.faturamentoAnterior, valores.quantidadeAnterior,
                            variacao(valores.faturamento, valores.faturamentoAnterior));
                })
                .sorted(Comparator.comparing(IndicadorCategoriaDTO::faturamento).reversed())
                .toList();

        CategoriaLiderDTO lider = categorias.stream()
                .filter(item -> item.faturamento().compareTo(BigDecimal.ZERO) > 0)
                .findFirst()
                .map(item -> new CategoriaLiderDTO(item.categoria(), item.faturamento()))
                .orElse(null);

        BigDecimal ticketMedio = totalAtual.quantidade == 0
                ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : totalAtual.faturamento.divide(BigDecimal.valueOf(totalAtual.quantidade), 2, RoundingMode.HALF_UP);

        return new IndicadorResponseDTO(mesInicio.toString(), mesFim.toString(), totalAtual.quantidade,
                totalAtual.faturamento, totalAtual.quantidade, totalAnterior.faturamento,
                totalAnterior.quantidade, ticketMedio, categorias, lider, atuais.size(), categoriaId, cidadeFiltro);
    }

    private Totais somar(List<LancamentoMensal> lancamentos) {
        Totais total = new Totais();
        for (LancamentoMensal item : lancamentos) {
            total.quantidade += item.getQuantidade();
            total.faturamento = total.faturamento.add(item.getFaturamento());
        }
        total.faturamento = total.faturamento.setScale(2, RoundingMode.HALF_UP);
        return total;
    }

    private void acumularCategorias(Map<String, TotaisCategoria> mapa, List<LancamentoMensal> lancamentos,
                                    boolean atual) {
        for (LancamentoMensal lancamento : lancamentos) {
            String nome = lancamento.getCategoria().getNome();
            TotaisCategoria valores = mapa.computeIfAbsent(nome, ignored -> new TotaisCategoria());
            if (atual) {
                valores.quantidade += lancamento.getQuantidade();
                valores.faturamento = valores.faturamento.add(lancamento.getFaturamento());
            } else {
                valores.quantidadeAnterior += lancamento.getQuantidade();
                valores.faturamentoAnterior = valores.faturamentoAnterior.add(lancamento.getFaturamento());
            }
        }
    }

    private Double variacao(BigDecimal atual, BigDecimal anterior) {
        if (anterior.compareTo(BigDecimal.ZERO) == 0) return atual.compareTo(BigDecimal.ZERO) == 0 ? 0.0 : null;
        return atual.subtract(anterior).multiply(BigDecimal.valueOf(100))
                .divide(anterior, 2, RoundingMode.HALF_UP).doubleValue();
    }

    private YearMonth parse(String valor, String campo) {
        try { return YearMonth.parse(valor); }
        catch (DateTimeParseException | NullPointerException ex) {
            throw new BadRequestException("O mês de " + campo + " deve usar o formato AAAA-MM.");
        }
    }

    private static final class Totais {
        private long quantidade;
        private BigDecimal faturamento = BigDecimal.ZERO;
    }

    private static final class TotaisCategoria {
        private long quantidade;
        private long quantidadeAnterior;
        private BigDecimal faturamento = BigDecimal.ZERO;
        private BigDecimal faturamentoAnterior = BigDecimal.ZERO;
    }
}
