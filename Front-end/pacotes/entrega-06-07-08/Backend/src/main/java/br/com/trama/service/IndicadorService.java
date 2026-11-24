package br.com.trama.service;

import br.com.trama.dto.FaturamentoMensalDTO;
import br.com.trama.dto.IndicadorAgregadoDTO;
import br.com.trama.dto.IndicadorResponseDTO;
import br.com.trama.error.BadRequestException;
import br.com.trama.model.enums.StatusLancamento;
import br.com.trama.repository.LancamentoMensalRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IndicadorService {
    public static final String MENSAGEM_SEM_DADOS = "Não há dados para o período selecionado";
    private static final BigDecimal LIMITE_TENDENCIA = new BigDecimal("5.00");
    private final LancamentoMensalRepository lancamentoMensalRepository;

    public IndicadorService(LancamentoMensalRepository lancamentoMensalRepository) {
        this.lancamentoMensalRepository = lancamentoMensalRepository;
    }

    @Transactional(readOnly = true)
    public IndicadorResponseDTO buscarIndicadores(String inicioTexto, String fimTexto,
                                                  Long categoriaId, String cidade, Long confeccaoId) {
        YearMonth inicio = converterMes(inicioTexto, "inicio");
        YearMonth fim = converterMes(fimTexto, "fim");
        if (inicio.isAfter(fim)) throw new BadRequestException("O mês inicial não pode ser posterior ao mês final.");
        if (categoriaId != null && categoriaId <= 0) throw new BadRequestException("categoriaId deve ser maior que zero.");
        if (confeccaoId != null && confeccaoId <= 0) throw new BadRequestException("confeccaoId deve ser maior que zero.");

        long quantidadeMeses = ChronoUnit.MONTHS.between(inicio, fim) + 1;
        if (quantidadeMeses > 60) throw new BadRequestException("O período máximo de consulta é de 60 meses.");
        String cidadeFiltro = (cidade == null || cidade.isBlank()) ? null : cidade.trim();
        YearMonth inicioAnterior = inicio.minusMonths(quantidadeMeses);
        YearMonth fimAnterior = inicio.minusMonths(1);

        List<Object[]> atuais = consultar(categoriaId, cidadeFiltro, confeccaoId, inicio, fim);
        List<Object[]> anteriores = consultar(categoriaId, cidadeFiltro, confeccaoId, inicioAnterior, fimAnterior);
        Map<Long, DadosAgregados> mapaAtual = converterResultados(atuais);
        Map<Long, DadosAgregados> mapaAnterior = converterResultados(anteriores);

        TreeSet<Long> ids = new TreeSet<>();
        ids.addAll(mapaAtual.keySet());
        ids.addAll(mapaAnterior.keySet());
        List<IndicadorAgregadoDTO> indicadores = new ArrayList<>();
        long totalQuantidade = 0L;
        BigDecimal totalFaturamento = BigDecimal.ZERO;
        long totalQuantidadeAnterior = 0L;
        BigDecimal totalFaturamentoAnterior = BigDecimal.ZERO;

        for (Long id : ids) {
            DadosAgregados atual = mapaAtual.getOrDefault(id, DadosAgregados.vazio());
            DadosAgregados anterior = mapaAnterior.getOrDefault(id, DadosAgregados.vazio());
            BigDecimal variacaoExata = calcularVariacao(anterior.faturamento(), atual.faturamento());
            BigDecimal variacao = variacaoExata == null ? null : variacaoExata.setScale(1, RoundingMode.HALF_UP);
            String nomeCategoria = atual.nomeCategoria() != null ? atual.nomeCategoria() : anterior.nomeCategoria();
            indicadores.add(new IndicadorAgregadoDTO(id, nomeCategoria,
                    atual.quantidade(), atual.faturamento(), anterior.quantidade(), anterior.faturamento(),
                    variacao, classificarTendencia(variacaoExata)));
            totalQuantidade += atual.quantidade();
            totalFaturamento = totalFaturamento.add(atual.faturamento());
            totalQuantidadeAnterior += anterior.quantidade();
            totalFaturamentoAnterior = totalFaturamentoAnterior.add(anterior.faturamento());
        }

        List<FaturamentoMensalDTO> serie = consultarSerieMensal(categoriaId, cidadeFiltro, confeccaoId, inicio, fim);
        return new IndicadorResponseDTO(inicio.toString(), fim.toString(), inicioAnterior.toString(),
                fimAnterior.toString(), cidadeFiltro, categoriaId, totalQuantidade,
                totalFaturamento.setScale(2, RoundingMode.HALF_UP), totalQuantidadeAnterior,
                totalFaturamentoAnterior.setScale(2, RoundingMode.HALF_UP), indicadores, serie,
                atuais.isEmpty() ? MENSAGEM_SEM_DADOS : null);
    }

    private List<Object[]> consultar(Long categoriaId, String cidade, Long confeccaoId, YearMonth inicio, YearMonth fim) {
        return lancamentoMensalRepository.agregarIndicadores(categoriaId, cidade, confeccaoId,
                inicio.atDay(1), fim.atEndOfMonth(), StatusLancamento.ATIVO);
    }

    private List<FaturamentoMensalDTO> consultarSerieMensal(Long categoriaId, String cidade,
                                                            Long confeccaoId, YearMonth inicio, YearMonth fim) {
        List<Object[]> linhas = lancamentoMensalRepository.agregarFaturamentoMensal(
                categoriaId, cidade, confeccaoId, inicio.atDay(1), fim.atEndOfMonth(), StatusLancamento.ATIVO);
        Map<YearMonth, DadosMes> porMes = new LinkedHashMap<>();
        for (Object[] linha : linhas) {
            YearMonth mes = YearMonth.of(((Number) linha[0]).intValue(), ((Number) linha[1]).intValue());
            Long quantidade = linha[2] == null ? 0L : ((Number) linha[2]).longValue();
            BigDecimal faturamento = linha[3] == null ? BigDecimal.ZERO : new BigDecimal(linha[3].toString());
            porMes.put(mes, new DadosMes(quantidade, faturamento));
        }
        List<FaturamentoMensalDTO> serie = new ArrayList<>();
        for (YearMonth mes = inicio; !mes.isAfter(fim); mes = mes.plusMonths(1)) {
            DadosMes dados = porMes.getOrDefault(mes, new DadosMes(0L, BigDecimal.ZERO));
            serie.add(new FaturamentoMensalDTO(mes.toString(), dados.quantidade(),
                    dados.faturamento().setScale(2, RoundingMode.HALF_UP)));
        }
        return serie;
    }

    private Map<Long, DadosAgregados> converterResultados(List<Object[]> resultados) {
        Map<Long, DadosAgregados> mapa = new LinkedHashMap<>();
        for (Object[] linha : resultados) {
            Long id = ((Number) linha[0]).longValue();
            String nome = (String) linha[1];
            Long quantidade = linha[2] == null ? 0L : ((Number) linha[2]).longValue();
            BigDecimal faturamento = linha[3] == null ? BigDecimal.ZERO : new BigDecimal(linha[3].toString());
            mapa.put(id, new DadosAgregados(nome, quantidade, faturamento.setScale(2, RoundingMode.HALF_UP)));
        }
        return mapa;
    }

    private BigDecimal calcularVariacao(BigDecimal anterior, BigDecimal atual) {
        if (anterior == null || anterior.compareTo(BigDecimal.ZERO) == 0) return null;
        return atual.subtract(anterior).multiply(new BigDecimal("100")).divide(anterior, 6, RoundingMode.HALF_UP);
    }

    private String classificarTendencia(BigDecimal variacao) {
        if (variacao == null) return "SEM_BASE";
        if (variacao.compareTo(LIMITE_TENDENCIA) >= 0) return "ALTA";
        if (variacao.compareTo(LIMITE_TENDENCIA.negate()) <= 0) return "QUEDA";
        return "ESTAVEL";
    }

    private YearMonth converterMes(String valor, String campo) {
        try { return YearMonth.parse(valor); }
        catch (DateTimeParseException | NullPointerException ex) {
            throw new BadRequestException("Parâmetro '" + campo + "' inválido. Use o formato AAAA-MM.");
        }
    }

    private record DadosAgregados(String nomeCategoria, Long quantidade, BigDecimal faturamento) {
        private static DadosAgregados vazio() { return new DadosAgregados(null, 0L, BigDecimal.ZERO); }
    }
    private record DadosMes(Long quantidade, BigDecimal faturamento) {}
}
