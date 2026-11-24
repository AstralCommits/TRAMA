package br.com.trama.controller;

import br.com.trama.dto.EquipeAuditoriaResponse;
import br.com.trama.dto.ConviteEquipeRequest;
import br.com.trama.dto.ConviteAceiteRequest;
import br.com.trama.dto.ConviteEquipeResponse;
import br.com.trama.dto.ConviteEquipeListResponse;
import br.com.trama.dto.EquipeMembroResponse;
import br.com.trama.security.UsuarioPrincipal;
import br.com.trama.service.EquipeService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/equipe")
public class EquipeController {
    private final EquipeService service;
    public EquipeController(EquipeService service) { this.service = service; }
    @GetMapping("/membros")
    public List<EquipeMembroResponse> listar(@AuthenticationPrincipal UsuarioPrincipal principal) { return service.listar(principal); }
    @GetMapping("/convites")
    public List<ConviteEquipeListResponse> convites(@AuthenticationPrincipal UsuarioPrincipal principal) { return service.listarConvites(principal); }
    @PostMapping("/convites")
    public ResponseEntity<ConviteEquipeResponse> criarConvite(@Valid @RequestBody ConviteEquipeRequest request, @AuthenticationPrincipal UsuarioPrincipal principal) { return ResponseEntity.ok(service.criarConvite(request, principal)); }
    @DeleteMapping("/convites/{id}")
    public ResponseEntity<Void> revogarConvite(@PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal principal) { service.revogarConvite(id, principal); return ResponseEntity.noContent().build(); }
    @PostMapping("/convites/aceitar")
    public ResponseEntity<EquipeMembroResponse> aceitarConvite(@Valid @RequestBody ConviteAceiteRequest request) { return ResponseEntity.status(201).body(service.aceitarConvite(request)); }
    @GetMapping("/auditoria")
    public List<EquipeAuditoriaResponse> auditoria(@AuthenticationPrincipal UsuarioPrincipal principal) { return service.listarAuditoria(principal); }
    @DeleteMapping("/membros/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal principal) { service.excluir(id, principal); return ResponseEntity.noContent().build(); }
}
