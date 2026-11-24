package br.com.trama.auth;

import br.com.trama.dto.ConfeccaoRequest;
import br.com.trama.error.BadRequestException;
import br.com.trama.model.Usuario;
import br.com.trama.model.enums.PerfilUsuario;
import br.com.trama.repository.UsuarioRepository;
import br.com.trama.security.TramaUserPrincipal;
import br.com.trama.service.ConfeccaoService;
import jakarta.transaction.Transactional;
import java.util.Locale;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final ConfeccaoService confeccaoService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthService(UsuarioRepository usuarioRepository,
                       ConfeccaoService confeccaoService,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager) {
        this.usuarioRepository = usuarioRepository;
        this.confeccaoService = confeccaoService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthUserResponse registrar(AuthRegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (request.senha().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw new BadRequestException("A senha não pode ultrapassar 72 bytes em UTF-8.");
        }
        if (usuarioRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new BadRequestException("Já existe uma conta cadastrada com este e-mail.");
        }

        var confeccao = confeccaoService.criar(new ConfeccaoRequest(
                request.nomeConfeccao(), request.cnpj(), request.porte(), request.tipo(), request.cidade()));

        Usuario usuario = new Usuario();
        usuario.setNome(request.nome().trim());
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        usuario.setPerfil(PerfilUsuario.CONFECCAO);

        usuario.setConfeccao(confeccaoService.getEntidade(confeccao.idConfeccao()));
        return AuthUserResponse.from(usuarioRepository.saveAndFlush(usuario));
    }

    @Transactional
    public AuthUserResponse registrarFuncionario(AuthAdminRegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (request.senha().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw new BadRequestException("A senha não pode ultrapassar 72 bytes em UTF-8.");
        }
        if (usuarioRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new BadRequestException("Já existe uma conta cadastrada com este e-mail.");
        }
        Usuario usuario = new Usuario();
        usuario.setNome(request.nome().trim());
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(request.senha()));

        usuario.setPerfil(PerfilUsuario.CONFECCAO);
        usuario.setConfeccao(confeccaoService.getEntidade(request.idConfeccao()));
        return AuthUserResponse.from(usuarioRepository.saveAndFlush(usuario));
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public AuthUserResponse entrar(AuthLoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.senha()));
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadCredentialsException("E-mail ou senha incorretos."));
        return AuthUserResponse.from(usuario);
    }

    @Transactional
    public AuthUserResponse perfil(TramaUserPrincipal principal, AuthProfileRequest request) {
        Usuario usuario = usuarioRepository.findById(principal.getIdUsuario())
                .orElseThrow(() -> new BadCredentialsException("Usuário não encontrado."));
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        usuarioRepository.findByEmailIgnoreCase(email).ifPresent(existing -> {
            if (!existing.getIdUsuario().equals(usuario.getIdUsuario())) {
                throw new BadRequestException("Este e-mail já está associado a outra conta.");
            }
        });
        usuario.setNome(request.nome().trim());
        usuario.setEmail(email);

        if (usuario.getConfeccao() != null) {
            var confeccao = usuario.getConfeccao();
            String nomeConfeccao = request.nomeConfeccao() == null || request.nomeConfeccao().isBlank()
                    ? confeccao.getNome() : request.nomeConfeccao().trim();
            String cidade = request.cidade() == null || request.cidade().isBlank()
                    ? confeccao.getCidade().getNome() : request.cidade();
            confeccaoService.atualizar(confeccao.getIdConfeccao(), new ConfeccaoRequest(
                    nomeConfeccao, confeccao.getCnpj(), confeccao.getPorte(), confeccao.getTipo(), cidade));
        }
        return AuthUserResponse.from(usuarioRepository.saveAndFlush(usuario));
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public AuthUserResponse atual(TramaUserPrincipal principal) {
        Usuario usuario = usuarioRepository.findById(principal.getIdUsuario())
                .orElseThrow(() -> new BadCredentialsException("Usuário não encontrado."));
        return AuthUserResponse.from(usuario);
    }
}
