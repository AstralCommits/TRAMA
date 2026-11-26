package br.com.trama.service;

import br.com.trama.dto.LoginRequest;
import br.com.trama.dto.LoginResponse;
import br.com.trama.dto.UsuarioLogadoResponse;
import br.com.trama.error.ResourceNotFoundException;
import br.com.trama.model.Confeccao;
import br.com.trama.model.Usuario;
import br.com.trama.repository.UsuarioRepository;
import br.com.trama.security.UsuarioPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final LoginAttemptService loginAttemptService;
    private final UsuarioRepository usuarioRepository;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService,
                       LoginAttemptService loginAttemptService, UsuarioRepository usuarioRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.loginAttemptService = loginAttemptService;
        this.usuarioRepository = usuarioRepository;
    }

    public LoginResponse login(LoginRequest request) {
        loginAttemptService.verificar(request.email());
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.senha()));
        } catch (BadCredentialsException ex) {
            loginAttemptService.registrarFalha(request.email());
            throw ex;
        }
        loginAttemptService.registrarSucesso(request.email());
        UsuarioPrincipal usuario = (UsuarioPrincipal) authentication.getPrincipal();
        return new LoginResponse(jwtService.gerarToken(usuario));
    }

    @Transactional(readOnly = true)
    public UsuarioLogadoResponse usuarioLogado(UsuarioPrincipal principal) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
        Confeccao confeccao = usuario.getConfeccao();
        UsuarioLogadoResponse.ConfeccaoDoUsuario resumo = confeccao == null ? null
                : new UsuarioLogadoResponse.ConfeccaoDoUsuario(confeccao.getIdConfeccao(), confeccao.getNome(),
                        confeccao.getCidade().getNome(), confeccao.getCidade().getUf());
        return new UsuarioLogadoResponse(usuario.getIdUsuario(), usuario.getNome(), usuario.getEmail(),
                usuario.getPerfil(), resumo);
    }
}
