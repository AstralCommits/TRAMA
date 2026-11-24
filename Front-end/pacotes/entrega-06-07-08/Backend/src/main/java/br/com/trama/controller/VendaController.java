package br.com.trama.controller;

import br.com.trama.dto.VendaRequest;
import br.com.trama.dto.VendaResponse;
import br.com.trama.security.TramaUserPrincipal;
import br.com.trama.service.VendaService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/vendas")
public class VendaController {
    private final VendaService service;
    public VendaController(VendaService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<VendaResponse> criar(@Valid @RequestBody VendaRequest request,
                                               @AuthenticationPrincipal TramaUserPrincipal principal) {
        validarAcesso(request.idConfeccao(), principal);
        VendaResponse response = service.criar(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(response.idLancamento()).toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    public List<VendaResponse> listar(@RequestParam(required = false) Long categoria,
                                      @RequestParam(required = false) Long confeccao,
                                      @RequestParam(required = false) String mesAno,
                                      @AuthenticationPrincipal TramaUserPrincipal principal) {
        Long filtroConfeccao = confeccao;
        if (!principal.isAdmin()) {
            validarAcesso(confeccao == null ? principal.getIdConfeccao() : confeccao, principal);
            filtroConfeccao = principal.getIdConfeccao();
        }
        return service.listar(categoria, filtroConfeccao, mesAno);
    }

    @GetMapping("/{id}")
    public VendaResponse buscar(@PathVariable Long id, @AuthenticationPrincipal TramaUserPrincipal principal) {
        VendaResponse response = service.buscar(id);
        validarAcesso(response.idConfeccao(), principal);
        return response;
    }

    @PutMapping("/{id}")
    public VendaResponse atualizar(@PathVariable Long id, @Valid @RequestBody VendaRequest request,
                                   @AuthenticationPrincipal TramaUserPrincipal principal) {
        VendaResponse atual = service.buscar(id);
        validarAcesso(atual.idConfeccao(), principal);
        validarAcesso(request.idConfeccao(), principal);
        if (!principal.isAdmin() && !atual.idConfeccao().equals(request.idConfeccao())) {
            throw new AccessDeniedException("Não é permitido transferir um lançamento para outra confecção.");
        }
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelar(@PathVariable Long id,
                                          @AuthenticationPrincipal TramaUserPrincipal principal) {
        validarAcesso(service.buscar(id).idConfeccao(), principal);
        service.cancelar(id);
        return ResponseEntity.noContent().build();
    }

    private void validarAcesso(Long confeccaoId, TramaUserPrincipal principal) {
        if (!principal.isAdmin() && (principal.getIdConfeccao() == null
                || !principal.getIdConfeccao().equals(confeccaoId))) {
            throw new AccessDeniedException("Acesso restrito aos dados da própria confecção.");
        }
    }
}
