package br.com.trama;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ContratoOpenApiTest {
    private static final Path CONTRATO = Path.of("..", "docs", "api", "openapi.json");

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Test
    void contratoVersionadoEstaIgualAoDaApi() throws Exception {
        String atual = normalizar(mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8));

        if (Boolean.getBoolean("trama.contrato.atualizar")) {
            Files.createDirectories(CONTRATO.getParent());
            Files.writeString(CONTRATO, atual, StandardCharsets.UTF_8);
        }

        assertThat(Files.exists(CONTRATO))
                .as("Gere o contrato com: mvn test -Dtest=ContratoOpenApiTest -Dtrama.contrato.atualizar=true")
                .isTrue();
        String versionado = normalizar(Files.readString(CONTRATO, StandardCharsets.UTF_8));
        assertThat(atual)
                .as("A API mudou. Atualize docs/api/openapi.json com: "
                        + "mvn test -Dtest=ContratoOpenApiTest -Dtrama.contrato.atualizar=true "
                        + "e depois rode npm run api:types no frontend.")
                .isEqualTo(versionado);
    }

    private String normalizar(String json) throws Exception {
        JsonNode raiz = objectMapper.readTree(json);
        if (raiz instanceof ObjectNode objeto) {
            objeto.remove("servers");
        }
        Object ordenado = objectMapper.treeToValue(raiz, Object.class);
        return objectMapper.copy()
                .enable(SerializationFeature.INDENT_OUTPUT)
                .enable(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS)
                .writeValueAsString(ordenado)
                .replace("\r\n", "\n") + "\n";
    }
}
