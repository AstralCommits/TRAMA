package br.com.trama.controller;

import br.com.trama.dto.IndicadorResponseDTO;
import br.com.trama.service.IndicadorService;
import br.com.trama.security.UsuarioPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/indicadores")
public class IndicadorController {

    private final IndicadorService indicadorService;

    public IndicadorController(IndicadorService indicadorService) {
        this.indicadorService = indicadorService;
    }

    @GetMapping
    public ResponseEntity<IndicadorResponseDTO> buscarIndicadores(
            @RequestParam String inicio,
            @RequestParam String fim,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) String cidade,
            @AuthenticationPrincipal UsuarioPrincipal principal) {

        return ResponseEntity.ok(
                indicadorService.buscarIndicadores(inicio, fim, categoriaId, cidade, principal)
        );
    }
}
