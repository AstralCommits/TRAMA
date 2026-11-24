package br.com.trama;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {"trama.admin.email=admin-auth-test@trama.local", "trama.admin.password=SenhaForteDeTeste123!"})
@ActiveProfiles("local")
@AutoConfigureMockMvc
class AuthIntegrationTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper mapper;

    @Test
    void publicRegistrationCreatesServerAccountAndHttpOnlyCookie() throws Exception {
        String email = "cadastro-" + UUID.randomUUID() + "@trama.local";
        var csrf = mockMvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andReturn();
        Cookie csrfCookie = csrf.getResponse().getCookie("XSRF-TOKEN");
        String token = mapper.readTree(csrf.getResponse().getContentAsString()).get("csrfToken").asText();
        var response = mockMvc.perform(post("/api/auth/register")
                        .cookie(csrfCookie).header("X-XSRF-TOKEN", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of(
                                "nome", "Usuária Teste", "email", email, "senha", "SenhaForte123!",
                                "nomeConfeccao", "Confecção Teste", "porte", "MICRO",
                                "tipo", "CONFECCAO", "cidade", "Caruaru"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.perfil").value("CONFECCAO"))
                .andReturn();
        Cookie access = response.getResponse().getCookie("TRAMA_ACCESS_TOKEN");
        org.junit.jupiter.api.Assertions.assertNotNull(access);
        org.junit.jupiter.api.Assertions.assertTrue(access.isHttpOnly());
        mockMvc.perform(get("/api/auth/me").cookie(access))
                .andExpect(status().isOk()).andExpect(jsonPath("$.email").value(email));
    }

    @Test
    void protectedEndpointRejectsAnonymousRequest() throws Exception {
        mockMvc.perform(get("/api/vendas")).andExpect(status().isUnauthorized());
    }

    @Test
    void invalidCredentialsAreRejected() throws Exception {
        var csrf = mockMvc.perform(get("/api/auth/csrf")).andReturn();
        Cookie csrfCookie = csrf.getResponse().getCookie("XSRF-TOKEN");
        String token = mapper.readTree(csrf.getResponse().getContentAsString()).get("csrfToken").asText();
        mockMvc.perform(post("/api/auth/login").cookie(csrfCookie).header("X-XSRF-TOKEN", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("email", "nao-existe@trama.local", "senha", "senha-incorreta"))))
                .andExpect(status().isUnauthorized());
    }
}
