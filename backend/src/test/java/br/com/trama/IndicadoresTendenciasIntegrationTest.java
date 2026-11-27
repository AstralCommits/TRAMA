package br.com.trama;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.trama.model.Categoria;
import br.com.trama.model.Cidade;
import br.com.trama.model.Confeccao;
import br.com.trama.model.LancamentoMensal;
import br.com.trama.model.Usuario;
import br.com.trama.model.enums.OrigemDado;
import br.com.trama.model.enums.OrigemLancamento;
import br.com.trama.model.enums.PerfilUsuario;
import br.com.trama.model.enums.PorteConfeccao;
import br.com.trama.model.enums.StatusLancamento;
import br.com.trama.model.enums.TipoConfeccao;
import br.com.trama.repository.CategoriaRepository;
import br.com.trama.repository.CidadeRepository;
import br.com.trama.repository.ConfeccaoRepository;
import br.com.trama.repository.LancamentoMensalRepository;
import br.com.trama.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
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

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class IndicadoresTendenciasIntegrationTest {
    private static final String SENHA = "SenhaTeste@123";

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private CategoriaRepository categoriaRepository;
    @Autowired private CidadeRepository cidadeRepository;
    @Autowired private ConfeccaoRepository confeccaoRepository;
    @Autowired private LancamentoMensalRepository lancamentoRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private String token;
    private Confeccao confeccao;
    private Categoria jeans;
    private Categoria praia;
    private Categoria infantil;

    @BeforeEach
    void preparar() throws Exception {
        Cidade toritama = cidadeRepository.findByNomeIgnoreCaseAndUf("Toritama", "PE").orElseThrow();
        confeccao = new Confeccao();
        confeccao.setNome("Tendência " + UUID.randomUUID());
        confeccao.setPorte(PorteConfeccao.PEQUENA);
        confeccao.setTipo(TipoConfeccao.CONFECCAO);
        confeccao.setCidade(toritama);
        confeccao = confeccaoRepository.saveAndFlush(confeccao);

        String sufixo = UUID.randomUUID().toString().substring(0, 6);
        jeans = categoriaRepository.save(new Categoria("Jeans-" + sufixo));
        praia = categoriaRepository.save(new Categoria("Praia-" + sufixo));
        infantil = categoriaRepository.save(new Categoria("Infantil-" + sufixo));

        venda(jeans, 2025, 1, 10, "1000.00");
        venda(jeans, 2025, 2, 12, "1200.00");
        venda(praia, 2025, 1, 10, "1000.00");
        venda(praia, 2025, 2, 8, "800.00");
        venda(infantil, 2025, 1, 5, "500.00");
        venda(infantil, 2025, 2, 5, "510.00");

        String email = "empresario-tend-" + UUID.randomUUID() + "@trama.test";
        Usuario usuario = new Usuario();
        usuario.setNome("Empresário tendências");
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(SENHA));
        usuario.setPerfil(PerfilUsuario.EMPRESARIO);
        usuario.setConfeccao(confeccao);
        usuarioRepository.saveAndFlush(usuario);
        String body = objectMapper.writeValueAsString(Map.of("email", email, "senha", SENHA));
        String resposta = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        token = objectMapper.readTree(resposta).get("token").asText();
    }

    @Test
    void indicadoresTrazemTicketMedioComparacaoECategoriaLider() throws Exception {
        mockMvc.perform(get("/api/indicadores").header("Authorization", "Bearer " + token)
                        .param("inicio", "2025-02").param("fim", "2025-02").param("cidade", "Toritama"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pecasVendidas").value(25))
                .andExpect(jsonPath("$.faturamentoTotal").value(2510.00))
                .andExpect(jsonPath("$.ticketMedio").value(100.40))
                .andExpect(jsonPath("$.inicioAnterior").value("2025-01"))
                .andExpect(jsonPath("$.faturamentoTotalAnterior").value(2500.00))
                .andExpect(jsonPath("$.pecasVendidasAnterior").value(25))
                .andExpect(jsonPath("$.variacaoPercentual").value(0.40))
                .andExpect(jsonPath("$.categorias.length()").value(3))
                .andExpect(jsonPath("$.categorias[0].categoria").value(jeans.getNome()))
                .andExpect(jsonPath("$.categoriaLider.categoria").value(jeans.getNome()));
    }

    @Test
    void tendenciasClassificamAltaQuedaEEstavel() throws Exception {
        mockMvc.perform(get("/api/indicadores/tendencias").header("Authorization", "Bearer " + token)
                        .param("inicio", "2025-02").param("fim", "2025-02"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].categoria").value(jeans.getNome()))
                .andExpect(jsonPath("$[0].variacaoPercentual").value(20.00))
                .andExpect(jsonPath("$[0].classificacao").value("ALTA"))
                .andExpect(jsonPath("$[1].categoria").value(infantil.getNome()))
                .andExpect(jsonPath("$[1].classificacao").value("ESTAVEL"))
                .andExpect(jsonPath("$[2].categoria").value(praia.getNome()))
                .andExpect(jsonPath("$[2].variacaoPercentual").value(-20.00))
                .andExpect(jsonPath("$[2].classificacao").value("QUEDA"));
    }

    @Test
    void categoriaSemPeriodoAnteriorFicaSemBase() throws Exception {
        mockMvc.perform(get("/api/indicadores/tendencias").header("Authorization", "Bearer " + token)
                        .param("inicio", "2025-01").param("fim", "2025-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].classificacao").value("SEM_BASE"))
                .andExpect(jsonPath("$[0].variacaoPercentual").doesNotExist());
    }

    @Test
    void tendenciasValidamPeriodo() throws Exception {
        mockMvc.perform(get("/api/indicadores/tendencias").header("Authorization", "Bearer " + token)
                        .param("inicio", "2025-03").param("fim", "2025-01"))
                .andExpect(status().isBadRequest());
    }

    private void venda(Categoria categoria, int ano, int mes, int quantidade, String faturamento) {
        LancamentoMensal l = new LancamentoMensal();
        l.setMesReferencia(LocalDate.of(ano, mes, 1));
        l.setQuantidade(quantidade);
        l.setFaturamento(new BigDecimal(faturamento));
        l.setOrigem(OrigemLancamento.MANUAL);
        l.setStatus(StatusLancamento.ATIVO);
        l.setConfeccao(confeccao);
        l.setCategoria(categoria);
        l.setOrigemDado(OrigemDado.QUESTIONARIO);
        l.setNomeFonte("Questionário de teste");
        lancamentoRepository.saveAndFlush(l);
    }
}
