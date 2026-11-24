package br.com.trama;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.trama.model.Categoria;
import br.com.trama.model.Cidade;
import br.com.trama.model.Confeccao;
import br.com.trama.model.Usuario;
import br.com.trama.model.enums.PerfilUsuario;
import br.com.trama.model.enums.PorteConfeccao;
import br.com.trama.model.enums.TipoConfeccao;
import br.com.trama.repository.CategoriaRepository;
import br.com.trama.repository.CidadeRepository;
import br.com.trama.repository.ConfeccaoRepository;
import br.com.trama.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SegurancaXssIntegrationTest {
    private static final String SCRIPT = "<script>alert('xss')</script>";

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private CategoriaRepository categoriaRepository;
    @Autowired private CidadeRepository cidadeRepository;
    @Autowired private ConfeccaoRepository confeccaoRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private String token;

    @BeforeEach
    void autenticarAdmin() throws Exception {
        String email = "seguranca-" + UUID.randomUUID() + "@trama.test";
        Usuario usuario = new Usuario();
        usuario.setNome("Administrador segurança");
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode("SenhaTeste@123"));
        usuario.setPerfil(PerfilUsuario.ADMIN);
        usuarioRepository.saveAndFlush(usuario);
        String body = objectMapper.writeValueAsString(Map.of("email", email, "senha", "SenhaTeste@123"));
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andReturn();
        token = objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    void categoriaComScriptNoNomeEhRecusadaComBadRequest() throws Exception {
        postJson("/api/categorias", Map.of("nome", SCRIPT))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.nome").exists());
    }

    @Test
    void categoriaComNomeComumContinuaSendoAceita() throws Exception {
        postJson("/api/categorias", Map.of("nome", "Jeans & Moda " + UUID.randomUUID().toString().substring(0, 8)))
                .andExpect(status().isCreated());
    }

    @Test
    void cenarioComHtmlMaliciosoNaDescricaoEhRecusado() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("nome", "Concorrência importados");
        body.put("descricao", "<img src=x onerror=alert(document.cookie)>");
        body.put("percentualImpacto", new BigDecimal("10.00"));
        postJson("/api/cenarios", body)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.descricao").exists());
    }

    @Test
    void cenarioComLinkJavascriptNoNomeEhRecusado() throws Exception {
        postJson("/api/cenarios", Map.of("nome", "javascript:alert(1)", "percentualImpacto", 5))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.nome").exists());
    }

    @Test
    void confeccaoComScriptNoNomeEhRecusada() throws Exception {
        postJson("/api/confeccoes", Map.of("nome", "Confecção " + SCRIPT, "porte", "MICRO",
                "tipo", "CONFECCAO", "cidade", "Caruaru"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.nome").exists());
    }

    @Test
    void vendaComScriptNoNomeDaFonteEhRecusada() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("idConfeccao", 1);
        body.put("idCategoria", 1);
        body.put("mesAno", "2026-11");
        body.put("quantidade", 10);
        body.put("faturamento", new BigDecimal("100.00"));
        body.put("origem", "MANUAL");
        body.put("origemDado", "ENTREVISTA");
        body.put("nomeFonte", SCRIPT);
        postJson("/api/vendas", body)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.nomeFonte").exists());
    }

    @Test
    void importacaoCsvComScriptNaFonteEhRecusada() throws Exception {
        long categoriaId = categoriaRepository.save(new Categoria("XSS-" + UUID.randomUUID())).getIdCategoria();
        Cidade cidade = cidadeRepository.findByNomeIgnoreCaseAndUf("Caruaru", "PE").orElseThrow();
        Confeccao confeccao = new Confeccao();
        confeccao.setNome("Confecção XSS " + UUID.randomUUID());
        confeccao.setPorte(PorteConfeccao.MICRO);
        confeccao.setTipo(TipoConfeccao.CONFECCAO);
        confeccao.setCidade(cidade);
        long confeccaoId = confeccaoRepository.save(confeccao).getIdConfeccao();
        String csv = "mesAno;quantidade;faturamento;idConfeccao;idCategoria;origemDado;nomeFonte\n"
                + "2026-11;5;300.00;" + confeccaoId + ";" + categoriaId + ";ENTREVISTA;" + SCRIPT + "\n";
        MockMultipartFile file = new MockMultipartFile("arquivo", "vendas-xss.csv", "text/csv",
                csv.getBytes(StandardCharsets.UTF_8));
        mockMvc.perform(multipart("/api/importacoes").file(file)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());
    }

    @Test
    void respostasTrazemHeadersDeSegurancaEstritos() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("Content-Security-Policy",
                        org.hamcrest.Matchers.containsString("frame-ancestors 'none'")))
                .andExpect(header().string("Referrer-Policy", "no-referrer"));
    }

    private org.springframework.test.web.servlet.ResultActions postJson(String url, Object body) throws Exception {
        return mockMvc.perform(post(url)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));
    }
}
