package br.com.trama.service;

import br.com.trama.dto.CategoriaRequest;
import br.com.trama.dto.CategoriaResponse;
import br.com.trama.error.BadRequestException;
import br.com.trama.error.ResourceNotFoundException;
import br.com.trama.model.Categoria;
import br.com.trama.repository.CategoriaRepository;
import br.com.trama.repository.LancamentoMensalRepository;
import br.com.trama.repository.CenarioConcorrenciaRepository;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoriaService {
    private final CategoriaRepository repository;
    private final LancamentoMensalRepository lancamentos;
    private final CenarioConcorrenciaRepository cenarios;

    public CategoriaService(CategoriaRepository repository, LancamentoMensalRepository lancamentos,
                            CenarioConcorrenciaRepository cenarios) {
        this.repository = repository; this.lancamentos = lancamentos; this.cenarios = cenarios;
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar() {
        return repository.findAllByOrderByNomeAsc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponse buscar(Long id) { return toResponse(getEntity(id)); }

    @Transactional
    public CategoriaResponse criar(CategoriaRequest request) {
        String nome = normalizarNome(request.nome());
        if (repository.existsByNomeIgnoreCase(nome)) {
            throw new BadRequestException("Categoria já cadastrada");
        }
        Categoria categoria = new Categoria(nome);
        return toResponse(repository.save(categoria));
    }

    @Transactional
    public CategoriaResponse atualizar(Long id, CategoriaRequest request) {
        Categoria categoria = getEntity(id);
        String nome = normalizarNome(request.nome());
        if (repository.existsByNomeIgnoreCaseAndIdCategoriaNot(nome, id)) {
            throw new BadRequestException("Categoria já cadastrada");
        }
        categoria.setNome(nome);
        return toResponse(repository.save(categoria));
    }

    @Transactional
    public void excluir(Long id) {
        Categoria categoria = getEntity(id);
        if (lancamentos.existsByCategoria_IdCategoria(id) || cenarios.existsByCategoria_IdCategoria(id)) {
            throw new BadRequestException("Esta categoria possui lançamentos ou cenários vinculados e não pode ser excluída.");
        }
        try {
            repository.delete(categoria);
            repository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("A categoria está vinculada a outros registros e não pode ser excluída.");
        }
    }

    private Categoria getEntity(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));
    }

    private String normalizarNome(String nome) { return nome.trim().replaceAll("\\s+", " "); }
    private CategoriaResponse toResponse(Categoria c) { return new CategoriaResponse(c.getIdCategoria(), c.getNome()); }
}
