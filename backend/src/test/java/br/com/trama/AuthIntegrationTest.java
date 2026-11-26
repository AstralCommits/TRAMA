package br.com.trama;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.trama.model.Cidade;
import br.com.trama.model.Confeccao;
import br.com.trama.model.Usuario;
import br.com.trama.model.enums.PerfilUsuario;
import br.com.trama.model.enums.PorteConfeccao;
import br.com.trama.model.enums.TipoConfeccao;
import br.com.trama.repository.CidadeRepository;
import br.com.trama.repository.ConfeccaoRepository;
import br.com.trama.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {
    private static final String SENHA = "SenhaTeste@123";

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private CidadeRepository cidadeRepository;
    @Autowired private ConfeccaoRepository confeccaoRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Test
    void meRetornaOAdministradorSemConfeccao() throws Exception {
        String email = "admin-me-" + UUID.randomUUID() + "@trama.test";
        criarUsuario(email, PerfilUsuario.ADMIN, null);
        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token(email)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.nome").value("Usuário de teste"))
                .andExpect(jsonPath("$.perfil").value("ADMIN"))
                .andExpect(jsonPath("$.confeccao").doesNotExist());
    }

    @Test
    void meRetornaOEmpresarioComAPropriaConfeccao() throws Exception {
        String email = "empresario-me-" + UUID.randomUUID() + "@trama.test";
        Confeccao confeccao = criarConfeccao();
        criarUsuario(email, PerfilUsuario.EMPRESARIO, confeccao);
        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token(email)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.perfil").value("EMPRESARIO"))
                .andExpect(jsonPath("$.confeccao.idConfeccao").value(confeccao.getIdConfeccao()))
                .andExpect(jsonPath("$.confeccao.nome").value(confeccao.getNome()))
                .andExpect(jsonPath("$.confeccao.cidade").value("Caruaru"))
                .andExpect(jsonPath("$.confeccao.uf").value("PE"));
    }

    @Test
    void meSemTokenRetorna401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginBloqueiaDepoisDeCincoSenhasErradas() throws Exception {
        String email = "bloqueio-" + UUID.randomUUID() + "@trama.test";
        criarUsuario(email, PerfilUsuario.ADMIN, null);
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(login(email, "senha-errada"))
                    .andExpect(status().isUnauthorized());
        }
        mockMvc.perform(login(email, SENHA))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.instance").value("/api/auth/login"));
    }

    @Test
    void loginCertoZeraAsFalhasAnteriores() throws Exception {
        String email = "zera-" + UUID.randomUUID() + "@trama.test";
        criarUsuario(email, PerfilUsuario.ADMIN, null);
        for (int i = 0; i < 4; i++) {
            mockMvc.perform(login(email, "senha-errada")).andExpect(status().isUnauthorized());
        }
        mockMvc.perform(login(email, SENHA)).andExpect(status().isOk());
        for (int i = 0; i < 4; i++) {
            mockMvc.perform(login(email, "senha-errada")).andExpect(status().isUnauthorized());
        }
        mockMvc.perform(login(email, SENHA)).andExpect(status().isOk());
    }

    private org.springframework.test.web.servlet.RequestBuilder login(String email, String senha) throws Exception {
        return post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("email", email, "senha", senha)));
    }

    private String token(String email) throws Exception {
        MvcResult result = mockMvc.perform(login(email, SENHA)).andExpect(status().isOk()).andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    private Confeccao criarConfeccao() {
        Cidade cidade = cidadeRepository.findByNomeIgnoreCaseAndUf("Caruaru", "PE").orElseThrow();
        Confeccao confeccao = new Confeccao();
        confeccao.setNome("Confecção " + UUID.randomUUID());
        confeccao.setPorte(PorteConfeccao.MICRO);
        confeccao.setTipo(TipoConfeccao.CONFECCAO);
        confeccao.setCidade(cidade);
        return confeccaoRepository.saveAndFlush(confeccao);
    }

    private void criarUsuario(String email, PerfilUsuario perfil, Confeccao confeccao) {
        Usuario usuario = new Usuario();
        usuario.setNome("Usuário de teste");
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(SENHA));
        usuario.setPerfil(perfil);
        usuario.setConfeccao(confeccao);
        usuarioRepository.saveAndFlush(usuario);
    }
}
