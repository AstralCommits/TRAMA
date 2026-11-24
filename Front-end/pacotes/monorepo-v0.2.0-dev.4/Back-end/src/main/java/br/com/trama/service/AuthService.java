package br.com.trama.service;

import br.com.trama.dto.LoginRequest;
import br.com.trama.dto.LoginResponse;
import br.com.trama.dto.RegistroRequest;
import br.com.trama.dto.UsuarioAutenticadoResponse;
import br.com.trama.error.BadRequestException;
import br.com.trama.model.Cidade;
import br.com.trama.model.Confeccao;
import br.com.trama.model.Usuario;
import br.com.trama.model.enums.PerfilUsuario;
import br.com.trama.model.enums.PorteConfeccao;
import br.com.trama.model.enums.TipoConfeccao;
import br.com.trama.repository.CidadeRepository;
import br.com.trama.repository.ConfeccaoRepository;
import br.com.trama.repository.UsuarioRepository;
import br.com.trama.security.UsuarioPrincipal;
import br.com.trama.security.SenhaBcryptPolicy;
import java.text.Normalizer;
import java.util.Locale;
import java.util.Map;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private static final Map<String, String> CIDADES_PERMITIDAS = Map.of(
            "toritama", "Toritama",
            "caruaru", "Caruaru",
            "santa cruz do capibaribe", "Santa Cruz do Capibaribe");

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final ConfeccaoRepository confeccaoRepository;
    private final CidadeRepository cidadeRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService,
                       UsuarioRepository usuarioRepository, ConfeccaoRepository confeccaoRepository,
                       CidadeRepository cidadeRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.confeccaoRepository = confeccaoRepository;
        this.cidadeRepository = cidadeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public LoginResponse registrar(RegistroRequest request) {
        SenhaBcryptPolicy.validar(request.senha());
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (usuarioRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new BadRequestException("Este e-mail já está cadastrado.");
        }

        String nomeCidade = CIDADES_PERMITIDAS.get(normalizar(request.cidade()));
        if (nomeCidade == null) {
            throw new BadRequestException("Escolha Toritama, Caruaru ou Santa Cruz do Capibaribe.");
        }
        Cidade cidade = cidadeRepository.findByNomeIgnoreCaseAndUf(nomeCidade, "PE")
                .orElseThrow(() -> new BadRequestException("A cidade selecionada não está cadastrada no sistema."));

        Confeccao confeccao = new Confeccao();
        confeccao.setNome(request.nomeConfeccao().trim().replaceAll("\\s+", " "));
        confeccao.setPorte(PorteConfeccao.MICRO);
        confeccao.setTipo(TipoConfeccao.CONFECCAO);
        confeccao.setCidade(cidade);
        confeccao = confeccaoRepository.saveAndFlush(confeccao);

        Usuario usuario = new Usuario();
        usuario.setNome(request.nome().trim().replaceAll("\\s+", " "));
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        usuario.setPerfil(PerfilUsuario.EMPRESARIO);
        usuario.setConfeccao(confeccao);
        usuario = usuarioRepository.saveAndFlush(usuario);

        UsuarioPrincipal principal = new UsuarioPrincipal(usuario);
        return new LoginResponse(jwtService.gerarToken(principal), toResponse(usuario));
    }

    public LoginResponse login(LoginRequest request) {
        SenhaBcryptPolicy.validar(request.senha());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim(), request.senha()));
        UsuarioPrincipal principal = (UsuarioPrincipal) authentication.getPrincipal();
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(principal.getUsername())
                .orElseThrow(() -> new BadRequestException("Não foi possível carregar o usuário autenticado."));
        return new LoginResponse(jwtService.gerarToken(principal), toResponse(usuario));
    }

    @Transactional(readOnly = true)
    public UsuarioAutenticadoResponse atual(UsuarioPrincipal principal) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(principal.getUsername())
                .orElseThrow(() -> new BadRequestException("Usuário autenticado não encontrado."));
        return toResponse(usuario);
    }

    private UsuarioAutenticadoResponse toResponse(Usuario usuario) {
        Confeccao confeccao = usuario.getConfeccao();
        return new UsuarioAutenticadoResponse(
                usuario.getIdUsuario(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil().name(),
                confeccao == null ? null : confeccao.getIdConfeccao(),
                confeccao == null ? null : confeccao.getNome(),
                confeccao == null ? null : confeccao.getCidade().getNome());
    }

    private String normalizar(String valor) {
        return Normalizer.normalize(valor.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "").toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }
}
