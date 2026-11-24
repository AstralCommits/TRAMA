package br.com.trama.repository;

import br.com.trama.model.Usuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    @EntityGraph(attributePaths = {"confeccao", "confeccao.cidade"})
    Optional<Usuario> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<Usuario> findAllByConfeccao_IdConfeccaoOrderByNomeAsc(Long idConfeccao);
    boolean existsByConfeccao_IdConfeccao(Long idConfeccao);
}
