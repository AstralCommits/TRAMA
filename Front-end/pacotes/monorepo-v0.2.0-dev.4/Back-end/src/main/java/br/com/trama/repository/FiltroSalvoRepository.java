package br.com.trama.repository;

import br.com.trama.model.FiltroSalvo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FiltroSalvoRepository extends JpaRepository<FiltroSalvo, Long> {
    List<FiltroSalvo> findAllByUsuario_IdUsuarioAndContextoOrderByNomeAsc(Long idUsuario, String contexto);
    Optional<FiltroSalvo> findByIdFiltroAndUsuario_IdUsuario(Long idFiltro, Long idUsuario);
    Optional<FiltroSalvo> findByUsuario_IdUsuarioAndContextoAndNomeIgnoreCase(Long idUsuario, String contexto, String nome);
}
