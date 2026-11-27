package br.com.trama.service;

import br.com.trama.dto.CategoriaIndicadorDTO;
import br.com.trama.dto.CategoriaLiderDTO;
import br.com.trama.dto.IndicadorResponseDTO;
import br.com.trama.error.BadRequestException;
import br.com.trama.model.LancamentoMensal;
import br.com.trama.model.enums.StatusLancamento;
import br.com.trama.repository.LancamentoMensalRepository;
import br.com.trama.security.UsuarioPrincipal;
import java.math.BigDecimal;
import java.math.RoundingMode;
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
    static final BigDecimal LIMITE_TENDENCIA = new BigDecimal("5");

    private final LancamentoMensalRepository repository;

    public IndicadorService(LancamentoMensalRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public IndicadorResponseDTO buscarIndicadores(String inicio, String fim, Long categoriaId, String cidade,
                                                   UsuarioPrincipal principal) {
        YearMonth mesInicio = parse(inicio, "início");
        YearMonth mesFim = parse(fim, "fim");
        if (mesFim.isBefore(mesInicio)) throw new BadRequestException("O mês final deve ser igual ou posterior ao mês inicial.");
        long meses = ChronoUnit.MONTHS.between(mesInicio, mesFim) + 1;
        YearMonth anteriorFim = mesInicio.minusMonths(1);
        YearMonth anteriorInicio = mesInicio.minusMonths(meses);
        String cidadeFiltro = cidade == null || cidade.isBlank() ? null : cidade.trim();
        Long idConfeccao = principal != null && principal.getPerfil().name().equals("EMPRESARIO")
                ? principal.getIdConfeccao() : null;

        List<LancamentoMensal> atuais = buscar(mesInicio, mesFim, categoriaId, cidadeFiltro, idConfeccao);
        List<LancamentoMensal> anteriores = buscar(anteriorInicio, anteriorFim, categoriaId, cidadeFiltro, idConfeccao);

        long pecas = somaPecas(atuais);
        BigDecimal faturamento = somaFaturamento(atuais);
        long pecasAnteriores = somaPecas(anteriores);
        BigDecimal faturamentoAnterior = somaFaturamento(anteriores);
        BigDecimal media = atuais.isEmpty() ? BigDecimal.ZERO.setScale(2)
                : faturamento.divide(BigDecimal.valueOf(atuais.size()), 2, RoundingMode.HALF_UP);
        BigDecimal ticketMedio = pecas == 0 ? BigDecimal.ZERO.setScale(2)
                : faturamento.divide(BigDecimal.valueOf(pecas), 2, RoundingMode.HALF_UP);

        List<CategoriaIndicadorDTO> categorias = porCategoria(atuais, anteriores);
        CategoriaLiderDTO lider = categorias.stream()
                .filter(c -> c.faturamento().signum() > 0)
                .max(Comparator.comparing(CategoriaIndicadorDTO::faturamento))
                .map(c -> new CategoriaLiderDTO(c.categoria(), c.faturamento()))
                .orElse(null);

        return new IndicadorResponseDTO(mesInicio.toString(), mesFim.toString(), pecas,
                faturamento, media, atuais.size(), categoriaId, cidade,
                pecas, ticketMedio, anteriorInicio.toString(), anteriorFim.toString(),
                faturamentoAnterior, pecasAnteriores, variacao(faturamento, faturamentoAnterior),
                categorias, lider);
    }

    @Transactional(readOnly = true)
    public List<CategoriaIndicadorDTO> buscarTendencias(String inicio, String fim, String cidade,
                                                        UsuarioPrincipal principal) {
        List<CategoriaIndicadorDTO> categorias = new ArrayList<>(
                buscarIndicadores(inicio, fim, null, cidade, principal).categorias());
        categorias.sort(Comparator.comparing(CategoriaIndicadorDTO::variacaoPercentual,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return categorias;
    }

    static String classificar(BigDecimal variacao) {
        if (variacao == null) return "SEM_BASE";
        if (variacao.compareTo(LIMITE_TENDENCIA) >= 0) return "ALTA";
        if (variacao.compareTo(LIMITE_TENDENCIA.negate()) <= 0) return "QUEDA";
        return "ESTAVEL";
    }

    static BigDecimal variacao(BigDecimal atual, BigDecimal anterior) {
        if (anterior.signum() == 0) return atual.signum() == 0 ? BigDecimal.ZERO.setScale(2) : null;
        return atual.subtract(anterior).multiply(BigDecimal.valueOf(100))
                .divide(anterior, 2, RoundingMode.HALF_UP);
    }

    private List<CategoriaIndicadorDTO> porCategoria(List<LancamentoMensal> atuais, List<LancamentoMensal> anteriores) {
        Map<Long, Acumulado> mapa = new LinkedHashMap<>();
        for (LancamentoMensal l : atuais) acumulado(mapa, l).somarAtual(l);
        for (LancamentoMensal l : anteriores) acumulado(mapa, l).somarAnterior(l);
        return mapa.values().stream().map(a -> {
            BigDecimal variacao = variacao(a.faturamento, a.faturamentoAnterior);
            return new CategoriaIndicadorDTO(a.id, a.nome, a.faturamento.setScale(2, RoundingMode.HALF_UP), a.pecas,
                    a.faturamentoAnterior.setScale(2, RoundingMode.HALF_UP), a.pecasAnteriores,
                    variacao, classificar(variacao));
        }).sorted(Comparator.comparing(CategoriaIndicadorDTO::faturamento).reversed()).toList();
    }

    private Acumulado acumulado(Map<Long, Acumulado> mapa, LancamentoMensal l) {
        return mapa.computeIfAbsent(l.getCategoria().getIdCategoria(),
                id -> new Acumulado(id, l.getCategoria().getNome()));
    }

    private List<LancamentoMensal> buscar(YearMonth inicio, YearMonth fim, Long categoriaId, String cidade, Long idConfeccao) {
        return repository.buscarParaIndicadores(inicio.atDay(1), fim.atEndOfMonth(), categoriaId, cidade,
                idConfeccao, StatusLancamento.ATIVO);
    }

    private static long somaPecas(List<LancamentoMensal> lista) {
        return lista.stream().mapToLong(LancamentoMensal::getQuantidade).sum();
    }

    private static BigDecimal somaFaturamento(List<LancamentoMensal> lista) {
        return lista.stream().map(LancamentoMensal::getFaturamento)
                .reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2, RoundingMode.HALF_UP);
    }

    private YearMonth parse(String valor, String campo) {
        try { return YearMonth.parse(valor); }
        catch (DateTimeParseException | NullPointerException ex) {
            throw new BadRequestException("O mês de " + campo + " deve usar o formato AAAA-MM.");
        }
    }

    private static final class Acumulado {
        final Long id;
        final String nome;
        BigDecimal faturamento = BigDecimal.ZERO;
        BigDecimal faturamentoAnterior = BigDecimal.ZERO;
        long pecas;
        long pecasAnteriores;

        Acumulado(Long id, String nome) { this.id = id; this.nome = nome; }

        void somarAtual(LancamentoMensal l) { faturamento = faturamento.add(l.getFaturamento()); pecas += l.getQuantidade(); }

        void somarAnterior(LancamentoMensal l) {
            faturamentoAnterior = faturamentoAnterior.add(l.getFaturamento());
            pecasAnteriores += l.getQuantidade();
        }
    }
}
