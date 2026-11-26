package br.com.trama;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ObservabilidadeIntegrationTest {
    @Autowired private MockMvc mockMvc;

    @Test
    void healthDoActuatorRespondeSemToken() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void rotaInexistenteResponde404EmVezDe500() throws Exception {
        mockMvc.perform(get("/swagger-ui/inexistente.css"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void geraUmRequestIdQuandoOClienteNaoEnvia() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(header().string("X-Request-Id",
                        org.hamcrest.Matchers.matchesPattern("[0-9a-f-]{36}")));
    }

    @Test
    void devolveORequestIdRecebido() throws Exception {
        mockMvc.perform(get("/api/health").header("X-Request-Id", "teste-123456"))
                .andExpect(header().string("X-Request-Id", "teste-123456"));
    }

    @Test
    void trocaRequestIdInvalidoPorUmNovo() throws Exception {
        mockMvc.perform(get("/api/health").header("X-Request-Id", "<script>"))
                .andExpect(header().string("X-Request-Id",
                        org.hamcrest.Matchers.matchesPattern("[0-9a-f-]{36}")));
    }
}
