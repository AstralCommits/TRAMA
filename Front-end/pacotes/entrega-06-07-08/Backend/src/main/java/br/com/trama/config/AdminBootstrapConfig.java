package br.com.trama.config;

import br.com.trama.model.Usuario;
import br.com.trama.model.enums.PerfilUsuario;
import br.com.trama.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminBootstrapConfig {
    @Bean
    CommandLineRunner provisionarAdministrador(
            UsuarioRepository usuarios,
            PasswordEncoder encoder,
            @Value("${trama.admin.email:}") String email,
            @Value("${trama.admin.password:}") String password,
            @Value("${trama.admin.name:Administrador TRAMA}") String name) {
        return args -> {
            if (email == null || email.isBlank() || password == null || password.isBlank()) return;
            String normalizedEmail = email.trim().toLowerCase(java.util.Locale.ROOT);
            if (usuarios.findByEmailIgnoreCase(normalizedEmail).isPresent()) return;
            if (password.length() < 12) {
                throw new IllegalStateException("TRAMA_ADMIN_PASSWORD deve ter pelo menos 12 caracteres.");
            }
            Usuario admin = new Usuario();
            admin.setNome(name == null || name.isBlank() ? "Administrador TRAMA" : name.trim());
            admin.setEmail(normalizedEmail);
            admin.setSenhaHash(encoder.encode(password));
            admin.setPerfil(PerfilUsuario.ADMIN);
            admin.setConfeccao(null);
            usuarios.saveAndFlush(admin);
        };
    }
}
