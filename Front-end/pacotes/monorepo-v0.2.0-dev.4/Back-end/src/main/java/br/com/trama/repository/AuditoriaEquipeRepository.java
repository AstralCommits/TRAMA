package br.com.trama.repository;

import br.com.trama.model.AuditoriaEquipe;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditoriaEquipeRepository extends JpaRepository<AuditoriaEquipe, Long> {
    List<AuditoriaEquipe> findTop50ByConfeccao_IdConfeccaoOrderByDataEventoDescIdAuditoriaDesc(Long idConfeccao);
}
