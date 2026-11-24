package br.com.trama.controller;

import br.com.trama.dto.FiltroSalvoRequest;
import br.com.trama.dto.FiltroSalvoResponse;
import br.com.trama.security.UsuarioPrincipal;
import br.com.trama.service.FiltroSalvoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/filtros-salvos")
public class FiltroSalvoController {
    private final FiltroSalvoService service;
    public FiltroSalvoController(FiltroSalvoService service) { this.service = service; }
    @GetMapping public List<FiltroSalvoResponse> listar(@RequestParam String contexto, @AuthenticationPrincipal UsuarioPrincipal principal) { return service.listar(contexto, principal); }
    @PostMapping public ResponseEntity<FiltroSalvoResponse> salvar(@Valid @RequestBody FiltroSalvoRequest request, @AuthenticationPrincipal UsuarioPrincipal principal) { return ResponseEntity.ok(service.salvar(request, principal)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> excluir(@PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal principal) { service.excluir(id, principal); return ResponseEntity.noContent().build(); }
}
