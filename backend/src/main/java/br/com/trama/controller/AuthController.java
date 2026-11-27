package br.com.trama.controller;

import br.com.trama.dto.LoginRequest;
import br.com.trama.dto.LoginResponse;
import br.com.trama.dto.UsuarioLogadoResponse;
import br.com.trama.security.UsuarioPrincipal;
import br.com.trama.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticação")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @SecurityRequirements
    @Operation(summary = "Autentica um usuário e retorna um JWT Bearer")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    @Operation(summary = "Retorna o usuário autenticado, com o perfil e a confecção dele")
    public UsuarioLogadoResponse me(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return authService.usuarioLogado(principal);
    }
}
