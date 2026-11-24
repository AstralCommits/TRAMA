package br.com.trama;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.trama.model.Usuario;
import br.com.trama.model.enums.PerfilUsuario;
import br.com.trama.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CadastrosEVendasIntegrationTest {
    private static final String SENHA = "SenhaTeste@123";

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private String admin;

    @BeforeEach
    void entrarComoAdmin() throws Exception {
        String email = "admin-cad-" + UUID.randomUUID() + "@trama.test";
        Usuario usuario = new Usuario();
        usuario.setNome("Admin cadastros");
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(SENHA));
        usuario.setPerfil(PerfilUsuario.ADMIN);
        usuarioRepository.saveAndFlush(usuario);
        admin = token(email);
    }

    @Test
    void categoriaCrudCompleto() throws Exception {
        String nome = "Cat-" + UUID.randomUUID().toString().substring(0, 8);
        long id = idDe(enviar(post("/api/categorias"), Map.of("nome", nome), 201), "idCategoria");

        mockMvc.perform(auth(get("/api/categorias/{id}", id))).andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value(nome));
        mockMvc.perform(auth(get("/api/categorias"))).andExpect(status().isOk());
        enviar(put("/api/categorias/{id}", id), Map.of("nome", nome + "-2"), 200);
        enviar(post("/api/categorias"), Map.of("nome", nome + "-2"), 400);
        mockMvc.perform(auth(delete("/api/categorias/{id}", id))).andExpect(status().isNoContent());
        mockMvc.perform(auth(get("/api/categorias/{id}", id))).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void confeccaoCrudValidaCidadeECnpj() throws Exception {
        Map<String, Object> body = confeccao("Confecção " + UUID.randomUUID(), "Santa Cruz do Capibaribe");
        long id = idDe(enviar(post("/api/confeccoes"), body, 201), "idConfeccao");

        mockMvc.perform(auth(get("/api/confeccoes/{id}", id))).andExpect(status().isOk())
                .andExpect(jsonPath("$.cidade").value("Santa Cruz do Capibaribe"));
        mockMvc.perform(auth(get("/api/confeccoes"))).andExpect(status().isOk());

        body.put("cidade", "toritama");
        enviar(put("/api/confeccoes/{id}", id), body, 200);

        Map<String, Object> cidadeInvalida = confeccao("Fora do polo " + UUID.randomUUID(), "Recife");
        enviar(post("/api/confeccoes"), cidadeInvalida, 400);

        mockMvc.perform(auth(delete("/api/confeccoes/{id}", id))).andExpect(status().isNoContent());
        mockMvc.perform(auth(delete("/api/confeccoes/{id}", id))).andExpect(status().isNotFound());
    }

    @Test
    void vendaCriaBuscaAtualizaFiltraECancela() throws Exception {
        long categoria = idDe(enviar(post("/api/categorias"),
                Map.of("nome", "Venda-" + UUID.randomUUID().toString().substring(0, 8)), 201), "idCategoria");
        long confeccao = idDe(enviar(post("/api/confeccoes"),
                confeccao("Confecção venda " + UUID.randomUUID(), "Caruaru"), 201), "idConfeccao");

        Map<String, Object> venda = venda(confeccao, categoria, "2026-08", 30, "900.00");
        long id = idDe(enviar(post("/api/vendas"), venda, 201), "idLancamento");

        mockMvc.perform(auth(get("/api/vendas/{id}", id))).andExpect(status().isOk())
                .andExpect(jsonPath("$.quantidade").value(30));
        mockMvc.perform(auth(get("/api/vendas").param("categoria", String.valueOf(categoria))
                        .param("confeccao", String.valueOf(confeccao)).param("mesAno", "2026-08")))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].idLancamento").value(id));

        enviar(put("/api/vendas/{id}", id), venda(confeccao, categoria, "2026-08", 35, "1050.00"), 200);
        enviar(post("/api/vendas"), venda(confeccao, categoria, "2026-08", 1, "10.00"), 400);

        mockMvc.perform(auth(get("/api/indicadores").param("inicio", "2026-08").param("fim", "2026-08")
                        .param("categoria", String.valueOf(categoria))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.quantidadeTotal").value(35));

        mockMvc.perform(auth(delete("/api/vendas/{id}", id))).andExpect(status().isNoContent());
    }

    @Test
    void cenarioDeConcorrenciaCriaListaESimula() throws Exception {
        long categoria = idDe(enviar(post("/api/categorias"),
                Map.of("nome", "Cen-" + UUID.randomUUID().toString().substring(0, 8)), 201), "idCategoria");
        Map<String, Object> cenario = new HashMap<>();
        cenario.put("nome", "Nova concorrente");
        cenario.put("descricao", "Loja nova no polo");
        cenario.put("categoriaId", categoria);
        cenario.put("percentualImpacto", new BigDecimal("12.50"));
        enviar(post("/api/cenarios"), cenario, 201);
        mockMvc.perform(auth(get("/api/cenarios"))).andExpect(status().isOk());
        enviar(post("/api/cenarios/simular"),
                Map.of("categoriaId", categoria, "percentualImpacto", new BigDecimal("10")), 200);

        cenario.put("percentualImpacto", new BigDecimal("150"));
        enviar(post("/api/cenarios"), cenario, 400);
    }

    @Test
    void cidadesPermitidasSaoListadas() throws Exception {
        mockMvc.perform(auth(get("/api/cidades"))).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    void errosDaApiSeguemProblemDetails() throws Exception {
        mockMvc.perform(auth(get("/api/categorias/{id}", "abc")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.title").exists());
        mockMvc.perform(auth(patch("/api/categorias")))
                .andExpect(status().isMethodNotAllowed());
        mockMvc.perform(auth(post("/api/categorias")).contentType(MediaType.APPLICATION_JSON).content("{nome"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(auth(post("/api/categorias")).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors.nome").exists());
        mockMvc.perform(auth(get("/api/indicadores")))
                .andExpect(status().isBadRequest());
        mockMvc.perform(auth(get("/api/indicadores").param("inicio", "2026-13").param("fim", "2026-12")))
                .andExpect(status().isBadRequest());
    }

    private Map<String, Object> confeccao(String nome, String cidade) {
        Map<String, Object> body = new HashMap<>();
        body.put("nome", nome);
        body.put("cnpj", null);
        body.put("porte", "MICRO");
        body.put("tipo", "CONFECCAO");
        body.put("cidade", cidade);
        return body;
    }

    private Map<String, Object> venda(long confeccao, long categoria, String mes, int qtd, String fat) {
        Map<String, Object> body = new HashMap<>();
        body.put("idConfeccao", confeccao);
        body.put("idCategoria", categoria);
        body.put("mesAno", mes);
        body.put("quantidade", qtd);
        body.put("faturamento", new BigDecimal(fat));
        body.put("origem", "MANUAL");
        body.put("origemDado", "QUESTIONARIO");
        body.put("nomeFonte", "Questionário de teste");
        return body;
    }

    private MvcResult enviar(MockHttpServletRequestBuilder req, Object body, int esperado) throws Exception {
        return mockMvc.perform(auth(req).contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().is(esperado)).andReturn();
    }

    private long idDe(MvcResult result, String campo) throws Exception {
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get(campo).asLong();
    }

    private MockHttpServletRequestBuilder auth(MockHttpServletRequestBuilder req) {
        return req.header("Authorization", "Bearer " + admin);
    }

    private String token(String email) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of("email", email, "senha", SENHA));
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }
}
