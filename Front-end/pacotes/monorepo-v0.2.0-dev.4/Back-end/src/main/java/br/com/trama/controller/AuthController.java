package br.com.trama.controller;

import br.com.trama.dto.LoginRequest;
import br.com.trama.dto.LoginResponse;
import br.com.trama.dto.RegistroRequest;
import br.com.trama.dto.UsuarioAutenticadoResponse;
import br.com.trama.security.UsuarioPrincipal;
import br.com.trama.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticação")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/login")
    @SecurityRequirements
    @Operation(summary = "Autentica um usuário e retorna JWT e dados básicos da conta")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    @SecurityRequirements
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cria uma conta empresarial e sua confecção vinculada")
    public LoginResponse registrar(@Valid @RequestBody RegistroRequest request) {
        return authService.registrar(request);
    }

    @GetMapping("/me")
    @Operation(summary = "Retorna os dados da conta autenticada")
    public UsuarioAutenticadoResponse atual(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return authService.atual(principal);
    }
}
