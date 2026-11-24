package br.com.trama.repository;

import br.com.trama.model.ConviteEquipe;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConviteEquipeRepository extends JpaRepository<ConviteEquipe, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from ConviteEquipe c where c.tokenHash = :hash")
    Optional<ConviteEquipe> findByTokenHashForUpdate(@Param("hash") String hash);
    List<ConviteEquipe> findAllByConfeccao_IdConfeccaoOrderByCriadoEmDesc(Long idConfeccao);
    Optional<ConviteEquipe> findByIdConviteAndConfeccao_IdConfeccao(Long idConvite, Long idConfeccao);
}
