package br.com.trama.service;

import br.com.trama.dto.FiltroSalvoRequest;
import br.com.trama.dto.FiltroSalvoResponse;
import br.com.trama.error.BadRequestException;
import br.com.trama.error.ResourceNotFoundException;
import br.com.trama.model.FiltroSalvo;
import br.com.trama.model.Usuario;
import br.com.trama.repository.FiltroSalvoRepository;
import br.com.trama.repository.UsuarioRepository;
import br.com.trama.security.UsuarioPrincipal;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FiltroSalvoService {
    private final FiltroSalvoRepository filtros; private final UsuarioRepository usuarios; private final ObjectMapper mapper;
    public FiltroSalvoService(FiltroSalvoRepository filtros, UsuarioRepository usuarios, ObjectMapper mapper) { this.filtros = filtros; this.usuarios = usuarios; this.mapper = mapper; }
    @Transactional(readOnly = true) public List<FiltroSalvoResponse> listar(String contexto, UsuarioPrincipal principal) {
        validarContexto(contexto); return filtros.findAllByUsuario_IdUsuarioAndContextoOrderByNomeAsc(principal.getIdUsuario(), contexto).stream().map(this::response).toList();
    }
    @Transactional public FiltroSalvoResponse salvar(FiltroSalvoRequest request, UsuarioPrincipal principal) {
        validarContexto(request.contexto()); validarJson(request.configuracaoJson());
        Usuario usuario = usuarios.findById(principal.getIdUsuario()).orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
        String nome = request.nome().trim();
        FiltroSalvo filtro = filtros.findByUsuario_IdUsuarioAndContextoAndNomeIgnoreCase(principal.getIdUsuario(), request.contexto(), nome).orElseGet(FiltroSalvo::new);
        filtro.setUsuario(usuario); filtro.setNome(nome); filtro.setContexto(request.contexto()); filtro.setConfiguracaoJson(request.configuracaoJson()); filtro.setAtualizadoEm(LocalDateTime.now());
        return response(filtros.save(filtro));
    }
    @Transactional public void excluir(Long id, UsuarioPrincipal principal) {
        FiltroSalvo filtro = filtros.findByIdFiltroAndUsuario_IdUsuario(id, principal.getIdUsuario()).orElseThrow(() -> new ResourceNotFoundException("Filtro salvo não encontrado.")); filtros.delete(filtro);
    }
    private void validarContexto(String contexto) { if (contexto == null || !List.of("dashboard", "tendencias").contains(contexto)) throw new BadRequestException("Contexto de filtro inválido."); }
    private void validarJson(String json) { try { JsonNode node = mapper.readTree(json); if (node == null || !node.isObject()) throw new BadRequestException("A configuração do filtro deve ser um objeto JSON."); } catch (com.fasterxml.jackson.core.JsonProcessingException ex) { throw new BadRequestException("A configuração do filtro contém JSON inválido."); } }
    private FiltroSalvoResponse response(FiltroSalvo f) { return new FiltroSalvoResponse(f.getIdFiltro(), f.getNome(), f.getContexto(), f.getConfiguracaoJson(), f.getAtualizadoEm()); }
}
