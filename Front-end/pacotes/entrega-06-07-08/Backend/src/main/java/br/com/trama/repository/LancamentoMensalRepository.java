package br.com.trama.repository;

import br.com.trama.model.LancamentoMensal;
import br.com.trama.model.enums.StatusLancamento;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LancamentoMensalRepository extends JpaRepository<LancamentoMensal, Long> {
    boolean existsByConfeccao_IdConfeccaoAndCategoria_IdCategoriaAndMesReferencia(
            Long idConfeccao, Long idCategoria, LocalDate mesReferencia);

    boolean existsByConfeccao_IdConfeccaoAndCategoria_IdCategoriaAndMesReferenciaAndIdLancamentoNot(
            Long idConfeccao, Long idCategoria, LocalDate mesReferencia, Long idLancamento);

    @Query("""
            SELECT l FROM LancamentoMensal l
            WHERE l.status = :status
              AND (:idCategoria IS NULL OR l.categoria.idCategoria = :idCategoria)
              AND (:idConfeccao IS NULL OR l.confeccao.idConfeccao = :idConfeccao)
              AND (:mesReferencia IS NULL OR l.mesReferencia = :mesReferencia)
            ORDER BY l.mesReferencia DESC, l.idLancamento DESC
            """)
    List<LancamentoMensal> buscarComFiltros(
            @Param("idCategoria") Long idCategoria,
            @Param("idConfeccao") Long idConfeccao,
            @Param("mesReferencia") LocalDate mesReferencia,
            @Param("status") StatusLancamento status);

    @Query("""
            SELECT l.categoria.idCategoria,
                   l.categoria.nome,
                   COALESCE(SUM(l.quantidade), 0L),
                   COALESCE(SUM(l.faturamento), 0.0)
            FROM LancamentoMensal l
            WHERE l.status = :status
              AND (:categoriaId IS NULL OR l.categoria.idCategoria = :categoriaId)
              AND (:cidade IS NULL OR LOWER(l.confeccao.cidade.nome) = LOWER(:cidade))
              AND (:confeccaoId IS NULL OR l.confeccao.idConfeccao = :confeccaoId)
              AND l.mesReferencia >= :inicio
              AND l.mesReferencia <= :fim
            GROUP BY l.categoria.idCategoria, l.categoria.nome
            ORDER BY l.categoria.nome
            """)
    List<Object[]> agregarIndicadores(
            @Param("categoriaId") Long categoriaId,
            @Param("cidade") String cidade,
            @Param("confeccaoId") Long confeccaoId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim,
            @Param("status") StatusLancamento status);

    @Query("""
            SELECT YEAR(l.mesReferencia), MONTH(l.mesReferencia),
                   COALESCE(SUM(l.quantidade), 0L),
                   COALESCE(SUM(l.faturamento), 0.0)
            FROM LancamentoMensal l
            WHERE l.status = :status
              AND (:categoriaId IS NULL OR l.categoria.idCategoria = :categoriaId)
              AND (:cidade IS NULL OR LOWER(l.confeccao.cidade.nome) = LOWER(:cidade))
              AND (:confeccaoId IS NULL OR l.confeccao.idConfeccao = :confeccaoId)
              AND l.mesReferencia >= :inicio
              AND l.mesReferencia <= :fim
            GROUP BY YEAR(l.mesReferencia), MONTH(l.mesReferencia)
            ORDER BY YEAR(l.mesReferencia), MONTH(l.mesReferencia)
            """)
    List<Object[]> agregarFaturamentoMensal(
            @Param("categoriaId") Long categoriaId,
            @Param("cidade") String cidade,
            @Param("confeccaoId") Long confeccaoId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim,
            @Param("status") StatusLancamento status);

}
