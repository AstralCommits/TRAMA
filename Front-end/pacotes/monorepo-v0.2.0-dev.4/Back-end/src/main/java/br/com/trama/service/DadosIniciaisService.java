package br.com.trama.service;

import br.com.trama.model.Categoria;
import br.com.trama.model.Cidade;
import br.com.trama.model.Usuario;
import br.com.trama.model.enums.PerfilUsuario;
import br.com.trama.repository.UsuarioRepository;
import br.com.trama.repository.CategoriaRepository;
import br.com.trama.repository.CidadeRepository;
import br.com.trama.security.SenhaBcryptPolicy;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile({"local", "test", "dev"})
public class DadosIniciaisService {
    @Bean
    CommandLineRunner garantirDadosDeReferencia(
            CidadeRepository cidadeRepository,
            CategoriaRepository categoriaRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            @Value("${trama.admin-bootstrap.email:}") String adminEmail,
            @Value("${trama.admin-bootstrap.password:}") String adminPassword) {
        return args -> {
            List<String> cidades = List.of("Toritama", "Caruaru", "Santa Cruz do Capibaribe");
            for (String nome : cidades) {
                if (cidadeRepository.findByNomeIgnoreCaseAndUf(nome, "PE").isEmpty()) {
                    cidadeRepository.save(new Cidade(nome, "PE"));
                }
            }

            List<String> categorias = List.of("Jeans", "Moda Feminina", "Moda Masculina", "Moda Infantil", "Moda Praia", "Moletom");
            for (String nome : categorias) {
                if (categoriaRepository.findByNomeIgnoreCase(nome).isEmpty()) {
                    categoriaRepository.save(new Categoria(nome));
                }
            }

            boolean emailInformado = adminEmail != null && !adminEmail.isBlank();
            boolean senhaInformada = adminPassword != null && !adminPassword.isBlank();
            if (emailInformado != senhaInformada) {
                throw new IllegalStateException(
                        "Para provisionar o administrador, informe TRAMA_ADMIN_EMAIL e TRAMA_ADMIN_PASSWORD juntos.");
            }
            if (emailInformado) {
                if (adminPassword.length() < 12 || adminPassword.length() > 72
                        || !SenhaBcryptPolicy.cabeNoLimite(adminPassword)) {
                    throw new IllegalStateException("A senha do administrador deve ter entre 12 e 72 caracteres e no máximo 72 bytes em UTF-8.");
                }
                String email = adminEmail.trim().toLowerCase(java.util.Locale.ROOT);
                Usuario admin = usuarioRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
                    Usuario novo = new Usuario();
                    novo.setNome("Administrador TRAMA");
                    novo.setEmail(email);
                    novo.setPerfil(PerfilUsuario.ADMIN);
                    return novo;
                });
                if (admin.getPerfil() != PerfilUsuario.ADMIN || admin.getConfeccao() != null) {
                    throw new IllegalStateException(
                            "O e-mail configurado para o administrador já pertence a uma conta não administrativa.");
                }
                if (admin.getSenhaHash() == null || !passwordEncoder.matches(adminPassword, admin.getSenhaHash())) {
                    admin.setSenhaHash(passwordEncoder.encode(adminPassword));
                    usuarioRepository.save(admin);
                }
            }
        };
    }
}
