package br.com.trama.auth;

import br.com.trama.security.JwtAuthenticationFilter;
import br.com.trama.security.JwtService;
import br.com.trama.security.TramaUserPrincipal;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final SecureRandom RANDOM = new SecureRandom();
    private final AuthService authService;
    private final JwtService jwtService;
    private final long tokenHours;
    private final boolean cookieSecure;
    private final String sameSite;
    private final br.com.trama.security.TramaUserDetailsService userDetailsService;

    public AuthController(AuthService authService, JwtService jwtService,
                          @Value("${trama.auth.token-hours:12}") long tokenHours,
                          @Value("${trama.auth.cookie-secure:false}") boolean cookieSecure,
                          @Value("${trama.auth.cookie-same-site:Lax}") String sameSite,
                          br.com.trama.security.TramaUserDetailsService userDetailsService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.tokenHours = Math.max(1, tokenHours);
        this.cookieSecure = cookieSecure;
        this.sameSite = sameSite;
        this.userDetailsService = userDetailsService;
    }

    @GetMapping("/csrf")
    public ResponseEntity<Map<String, String>> csrf(HttpServletResponse response) {
        byte[] random = new byte[32];
        RANDOM.nextBytes(random);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(random);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie("XSRF-TOKEN", token, false, Duration.ofHours(tokenHours), "/"));
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        return ResponseEntity.ok(Map.of("csrfToken", token));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthUserResponse> registrar(@Valid @RequestBody AuthRegisterRequest request,
                                                       HttpServletResponse response) {
        AuthUserResponse user = authService.registrar(request);
        emitirSessao(user, response);
        return ResponseEntity.status(201).body(user);
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/users")
    public ResponseEntity<AuthUserResponse> registrarFuncionario(
            @Valid @RequestBody AuthAdminRegisterRequest request) {
        return ResponseEntity.status(201).body(authService.registrarFuncionario(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthUserResponse> entrar(@Valid @RequestBody AuthLoginRequest request,
                                                   HttpServletResponse response) {
        AuthUserResponse user = authService.entrar(request);
        emitirSessao(user, response);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/me")
    public AuthUserResponse atual(@AuthenticationPrincipal TramaUserPrincipal principal) {
        return authService.atual(principal);
    }

    @PutMapping("/profile")
    public AuthUserResponse perfil(@AuthenticationPrincipal TramaUserPrincipal principal,
                                   @Valid @RequestBody AuthProfileRequest request) {
        return authService.perfil(principal, request);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> sair(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie(JwtAuthenticationFilter.ACCESS_COOKIE, "", true, Duration.ZERO, "/api"));
        response.addHeader(HttpHeaders.SET_COOKIE, cookie("XSRF-TOKEN", "", false, Duration.ZERO, "/"));
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        return ResponseEntity.noContent().build();
    }

    private void emitirSessao(AuthUserResponse user, HttpServletResponse response) {
        var principal = authServicePrincipal(user);
        String jwt = jwtService.gerarToken(principal);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie(JwtAuthenticationFilter.ACCESS_COOKIE, jwt, true,
                Duration.ofHours(tokenHours), "/api"));
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
    }

    private org.springframework.security.core.userdetails.UserDetails authServicePrincipal(AuthUserResponse user) {
        return userDetailsService.loadUserByUsername(user.email());
    }

    private String cookie(String name, String value, boolean httpOnly, Duration age, String path) {
        return ResponseCookie.from(name, value)
                .httpOnly(httpOnly).secure(cookieSecure).path(path)
                .sameSite(sameSite).maxAge(age).build().toString();
    }
}
