package br.com.trama.service;

import br.com.trama.dto.CadastroRequest;
import br.com.trama.dto.ConfeccaoRequest;
import br.com.trama.dto.ConfeccaoResponse;
import br.com.trama.dto.LoginResponse;
import br.com.trama.error.ConflictException;
import br.com.trama.model.Confeccao;
import br.com.trama.model.Usuario;
import br.com.trama.model.enums.PerfilUsuario;
import br.com.trama.repository.ConfeccaoRepository;
import br.com.trama.repository.UsuarioRepository;
import br.com.trama.security.UsuarioPrincipal;
import java.util.Locale;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CadastroService {
    private final UsuarioRepository usuarioRepository;
    private final ConfeccaoRepository confeccaoRepository;
    private final ConfeccaoService confeccaoService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LimiteCadastroService limiteCadastroService;

    public CadastroService(UsuarioRepository usuarioRepository, ConfeccaoRepository confeccaoRepository,
                           ConfeccaoService confeccaoService, PasswordEncoder passwordEncoder,
                           JwtService jwtService, LimiteCadastroService limiteCadastroService) {
        this.usuarioRepository = usuarioRepository;
        this.confeccaoRepository = confeccaoRepository;
        this.confeccaoService = confeccaoService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.limiteCadastroService = limiteCadastroService;
    }

    @Transactional
    public LoginResponse cadastrar(CadastroRequest request, String origem) {
        limiteCadastroService.registrar(origem);
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (usuarioRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ConflictException("Já existe uma conta com este e-mail. Entre ou use outro endereço.");
        }
        ConfeccaoResponse criada = confeccaoService.criar(new ConfeccaoRequest(
                request.nomeConfeccao(), request.cnpj(), request.porte(), request.tipo(), request.cidade()));
        Confeccao confeccao = confeccaoRepository.getReferenceById(criada.idConfeccao());

        Usuario usuario = new Usuario();
        usuario.setNome(request.nome().trim().replaceAll("\\s+", " "));
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        usuario.setPerfil(PerfilUsuario.EMPRESARIO);
        usuario.setConfeccao(confeccao);
        usuarioRepository.saveAndFlush(usuario);
        return new LoginResponse(jwtService.gerarToken(new UsuarioPrincipal(usuario)));
    }
}
