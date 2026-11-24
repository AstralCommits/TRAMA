package br.com.trama.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.trama.model.Categoria;
import br.com.trama.model.Cidade;
import br.com.trama.model.Usuario;
import br.com.trama.model.enums.PerfilUsuario;
import br.com.trama.repository.CategoriaRepository;
import br.com.trama.repository.CidadeRepository;
import br.com.trama.repository.UsuarioRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class DadosIniciaisServiceTest {
    @Mock private CidadeRepository cidades;
    @Mock private CategoriaRepository categorias;
    @Mock private UsuarioRepository usuarios;
    @Mock private PasswordEncoder passwordEncoder;

    @Test
    void provisionsAdministratorOnlyWithExplicitCredentialsAndStoresBCryptHash() throws Exception {
        when(cidades.findByNomeIgnoreCaseAndUf(anyString(), anyString())).thenReturn(Optional.empty());
        when(categorias.findByNomeIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(usuarios.findByEmailIgnoreCase("admin@trama.test")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("SenhaForte123!" )).thenReturn("$2a$10$hash-de-teste");
        when(usuarios.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CommandLineRunner runner = new DadosIniciaisService().garantirDadosDeReferencia(
                cidades, categorias, usuarios, passwordEncoder,
                "admin@trama.test", "SenhaForte123!");
        runner.run();

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarios).save(captor.capture());
        Usuario admin = captor.getValue();
        assertEquals("admin@trama.test", admin.getEmail());
        assertEquals(PerfilUsuario.ADMIN, admin.getPerfil());
        assertEquals("$2a$10$hash-de-teste", admin.getSenhaHash());
        assertNotNull(admin.getNome());
    }

    @Test
    void rejectsPartialAdministratorCredentials() {
        CommandLineRunner runner = new DadosIniciaisService().garantirDadosDeReferencia(
                cidades, categorias, usuarios, passwordEncoder,
                "admin@trama.test", "");

        assertThrows(IllegalStateException.class, runner::run);
        verify(usuarios, never()).save(any(Usuario.class));
    }
}
