package br.com.trama;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.trama.model.Categoria;
import br.com.trama.model.Cidade;
import br.com.trama.model.Confeccao;
import br.com.trama.model.LancamentoMensal;
import br.com.trama.model.Usuario;
import br.com.trama.model.enums.PerfilUsuario;
import br.com.trama.model.enums.OrigemDado;
import br.com.trama.model.enums.OrigemLancamento;
import br.com.trama.model.enums.StatusLancamento;
import br.com.trama.model.enums.PorteConfeccao;
import br.com.trama.model.enums.TipoConfeccao;
import br.com.trama.repository.CategoriaRepository;
import br.com.trama.repository.CidadeRepository;
import br.com.trama.repository.ConfeccaoRepository;
import br.com.trama.repository.ImportacaoRepository;
import br.com.trama.repository.LancamentoMensalRepository;
import br.com.trama.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
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
class JwtAndImportacaoIntegrationTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private CategoriaRepository categoriaRepository;
    @Autowired private CidadeRepository cidadeRepository;
    @Autowired private ConfeccaoRepository confeccaoRepository;
    @Autowired private ImportacaoRepository importacaoRepository;
    @Autowired private LancamentoMensalRepository lancamentoRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Test
    void loginValidatesPasswordAndReturnsBearerToken() throws Exception {
        String email = "admin-" + UUID.randomUUID() + "@trama.test";
        criarAdmin(email, "SenhaTeste@123");
        String body = objectMapper.writeValueAsString(Map.of("email", email, "senha", "SenhaTeste@123"));
        MvcResult result = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andExpect(jsonPath("$.token").isNotEmpty()).andReturn();
        String token = objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
        mockMvc.perform(get("/api/categorias").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void registrationCreatesCompanyAccountAndReturnsValidSession() throws Exception {
        String email = "cadastro-" + UUID.randomUUID() + "@trama.test";
        Map<String, Object> request = Map.of(
                "nome", "Pessoa de teste",
                "email", email,
                "senha", "SenhaTeste@123",
                "nomeConfeccao", "Confecção de teste " + UUID.randomUUID(),
                "cidade", "Caruaru");
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.usuario.email").value(email))
                .andExpect(jsonPath("$.usuario.perfil").value("EMPRESARIO"))
                .andExpect(jsonPath("$.usuario.idConfeccao").isNumber())
                .andReturn();
        String token = objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.nomeConfeccao").isNotEmpty());
    }

    @Test
    void registrationRejectsPasswordThatExceedsBcryptUtf8ByteLimit() throws Exception {
        String email = "senha-bytes-" + UUID.randomUUID() + "@trama.test";
        String senhaComMaisDe72Bytes = "🔐".repeat(19);
        Map<String, Object> request = Map.of(
                "nome", "Pessoa teste",
                "email", email,
                "senha", senhaComMaisDe72Bytes,
                "nomeConfeccao", "Confecção de teste",
                "cidade", "Caruaru");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("A senha deve ocupar no máximo 72 bytes em UTF-8."));
        org.assertj.core.api.Assertions.assertThat(usuarioRepository.findByEmailIgnoreCase(email)).isEmpty();
    }

    @Test
    void loginRejectsIncorrectPassword() throws Exception {
        String email = "admin-" + UUID.randomUUID() + "@trama.test";
        criarAdmin(email, "SenhaCorreta@123");
        String body = objectMapper.writeValueAsString(Map.of("email", email, "senha", "senha-errada"));
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.detail").value("Usuário ou senha inválidos."));
    }

    @Test
    void empresarioWithoutConfectionCannotListSalesIndicatorsOrSimulate() throws Exception {
        String email = "sem-confeccao-" + UUID.randomUUID() + "@trama.test";
        String senha = "SenhaTeste@123";
        Usuario empresario = new Usuario();
        empresario.setNome("Empresário sem confecção");
        empresario.setEmail(email);
        empresario.setSenhaHash(passwordEncoder.encode(senha));
        empresario.setPerfil(PerfilUsuario.EMPRESARIO);
        usuarioRepository.saveAndFlush(empresario);
        String token = token(email, senha);

        mockMvc.perform(get("/api/vendas").header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("A conta empresarial ainda não possui uma confecção vinculada."));
        mockMvc.perform(get("/api/indicadores").header("Authorization", "Bearer " + token)
                        .param("inicio", "2026-10").param("fim", "2026-11"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(post("/api/cenarios/simular").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("percentualImpacto", new BigDecimal("10.00")))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void empresarioCannotImportAnotherConfectionsRows() throws Exception {
        String email = "import-isolado-" + UUID.randomUUID() + "@trama.test";
        String senha = "SenhaTeste@123";
        Confeccao propria = criarConfeccao("Confeccao própria para CSV");
        Confeccao outra = criarConfeccao("Confeccao externa para CSV");
        Usuario empresario = new Usuario();
        empresario.setNome("Empresário importação");
        empresario.setEmail(email);
        empresario.setSenhaHash(passwordEncoder.encode(senha));
        empresario.setPerfil(PerfilUsuario.EMPRESARIO);
        empresario.setConfeccao(propria);
        usuarioRepository.saveAndFlush(empresario);
        long categoryId = categoriaRepository.save(new Categoria("CSV-ISOLADO-" + UUID.randomUUID())).getIdCategoria();
        String token = token(email, senha);
        String csv = "mesAno;quantidade;faturamento;idConfeccao;idCategoria;origemDado;nomeFonte\n"
                + "2026-12;10;100.00;" + outra.getIdConfeccao() + ";" + categoryId + ";ENTREVISTA;Arquivo de outra empresa\n";
        MockMultipartFile file = new MockMultipartFile("arquivo", "outra-empresa.csv", "text/csv",
                csv.getBytes(StandardCharsets.UTF_8));
        mockMvc.perform(multipart("/api/importacoes").file(file)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
        org.assertj.core.api.Assertions.assertThat(lancamentoRepository.existsByConfeccao_IdConfeccaoAndCategoria_IdCategoriaAndMesReferencia(
                outra.getIdConfeccao(), categoryId, LocalDate.of(2026, 12, 1))).isFalse();
    }

    @Test
    void csvImportCreatesImportRecordAndMonthlySales() throws Exception {
        String email = "import-" + UUID.randomUUID() + "@trama.test";
        criarAdmin(email, "SenhaTeste@123");
        long categoryId = categoriaRepository.save(new Categoria("CSV-" + UUID.randomUUID())).getIdCategoria();
        Cidade cidade = cidadeRepository.findByNomeIgnoreCaseAndUf("Caruaru", "PE").orElseThrow();
        Confeccao confeccao = new Confeccao();
        confeccao.setNome("Confecção CSV " + UUID.randomUUID());
        confeccao.setPorte(PorteConfeccao.MICRO);
        confeccao.setTipo(TipoConfeccao.CONFECCAO);
        confeccao.setCidade(cidade);
        long confectionId = confeccaoRepository.save(confeccao).getIdConfeccao();
        String token = token(email, "SenhaTeste@123");
        String csv = "mesAno;quantidade;faturamento;idConfeccao;idCategoria;origemDado;nomeFonte\n"
                + "2026-11;42;1250.00;" + confectionId + ";" + categoryId + ";ENTREVISTA;Entrevista de teste\n";
        MockMultipartFile file = new MockMultipartFile("arquivo", "vendas.csv", "text/csv",
                csv.getBytes(StandardCharsets.UTF_8));
        mockMvc.perform(multipart("/api/importacoes").file(file)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CONCLUIDA"))
                .andExpect(jsonPath("$.qtdLinhas").value(1));
        org.assertj.core.api.Assertions.assertThat(importacaoRepository.count()).isGreaterThan(0);
    }

    @Test
    void csvImportWithDuplicateRowsRollsBackSalesAndRecordsError() throws Exception {
        String email = "import-erro-" + UUID.randomUUID() + "@trama.test";
        criarAdmin(email, "SenhaTeste@123");
        long categoryId = categoriaRepository.save(new Categoria("CSV-ERRO-" + UUID.randomUUID())).getIdCategoria();
        Cidade cidade = cidadeRepository.findByNomeIgnoreCaseAndUf("Caruaru", "PE").orElseThrow();
        Confeccao confeccao = new Confeccao();
        confeccao.setNome("Confecção CSV ERRO " + UUID.randomUUID());
        confeccao.setPorte(PorteConfeccao.MICRO);
        confeccao.setTipo(TipoConfeccao.CONFECCAO);
        confeccao.setCidade(cidade);
        long confectionId = confeccaoRepository.saveAndFlush(confeccao).getIdConfeccao();
        long salesBefore = lancamentoRepository.count();
        String token = token(email, "SenhaTeste@123");
        String csv = "mesAno;quantidade;faturamento;idConfeccao;idCategoria;origemDado;nomeFonte\n"
                + "2026-11;42;1250.00;" + confectionId + ";" + categoryId + ";ENTREVISTA;Entrevista\n"
                + "2026-11;18;500.00;" + confectionId + ";" + categoryId + ";QUESTIONARIO;Questionário\n";
        MockMultipartFile file = new MockMultipartFile("arquivo", "vendas-duplicadas.csv", "text/csv",
                csv.getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(multipart("/api/importacoes").file(file)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());

        org.assertj.core.api.Assertions.assertThat(lancamentoRepository.count()).isEqualTo(salesBefore);
        org.assertj.core.api.Assertions.assertThat(importacaoRepository.findAll().stream()
                .anyMatch(i -> i.getNomeArquivo().equals("vendas-duplicadas.csv")
                        && i.getStatus().name().equals("ERRO"))).isTrue();
    }

    @Test
    void recreatingCancelledMonthlySaleReactivatesItsHistoricalRecord() throws Exception {
        String email = "reativar-venda-" + UUID.randomUUID() + "@trama.test";
        String senha = "SenhaReativar@123";
        criarAdmin(email, senha);
        Confeccao confeccao = criarConfeccao("Confecção reativação manual");
        Categoria categoria = categoriaRepository.saveAndFlush(new Categoria("Reativar-" + UUID.randomUUID()));
        String token = token(email, senha);

        Map<String, Object> firstPayload = Map.of(
                "idConfeccao", confeccao.getIdConfeccao(), "idCategoria", categoria.getIdCategoria(),
                "mesAno", "2026-08", "quantidade", 12, "faturamento", new BigDecimal("600.00"),
                "origem", "MANUAL", "origemDado", "ENTREVISTA", "nomeFonte", "Controle interno");
        MvcResult created = mockMvc.perform(post("/api/vendas").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(firstPayload)))
                .andExpect(status().isCreated()).andReturn();
        long id = objectMapper.readTree(created.getResponse().getContentAsString()).get("idLancamento").asLong();

        mockMvc.perform(delete("/api/vendas/{id}", id).header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        Map<String, Object> replacement = Map.of(
                "idConfeccao", confeccao.getIdConfeccao(), "idCategoria", categoria.getIdCategoria(),
                "mesAno", "2026-08", "quantidade", 18, "faturamento", new BigDecimal("900.00"),
                "origem", "MANUAL", "origemDado", "ENTREVISTA", "nomeFonte", "Controle atualizado");
        mockMvc.perform(post("/api/vendas").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(replacement)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idLancamento").value(id))
                .andExpect(jsonPath("$.status").value("ATIVO"))
                .andExpect(jsonPath("$.quantidade").value(18));
    }

    @Test
    void importingCsvReactivatesCancelledMonthlySale() throws Exception {
        String email = "reativar-csv-" + UUID.randomUUID() + "@trama.test";
        String senha = "SenhaReativarCsv@123";
        criarAdmin(email, senha);
        Confeccao confeccao = criarConfeccao("Confecção reativação CSV");
        Categoria categoria = categoriaRepository.saveAndFlush(new Categoria("Reativar-CSV-" + UUID.randomUUID()));
        String token = token(email, senha);
        Map<String, Object> payload = Map.of(
                "idConfeccao", confeccao.getIdConfeccao(), "idCategoria", categoria.getIdCategoria(),
                "mesAno", "2026-09", "quantidade", 4, "faturamento", new BigDecimal("200.00"),
                "origem", "MANUAL", "origemDado", "ENTREVISTA", "nomeFonte", "Controle inicial");
        MvcResult created = mockMvc.perform(post("/api/vendas").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated()).andReturn();
        long id = objectMapper.readTree(created.getResponse().getContentAsString()).get("idLancamento").asLong();
        mockMvc.perform(delete("/api/vendas/{id}", id).header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        String csv = "mesAno;quantidade;faturamento;idConfeccao;idCategoria;origemDado;nomeFonte\n"
                + "2026-09;9;450.00;" + confeccao.getIdConfeccao() + ";" + categoria.getIdCategoria()
                + ";QUESTIONARIO;Pesquisa atualizada\n";
        MockMultipartFile file = new MockMultipartFile("arquivo", "reativacao.csv", "text/csv",
                csv.getBytes(StandardCharsets.UTF_8));
        MvcResult imported = mockMvc.perform(multipart("/api/importacoes").file(file)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.status").value("CONCLUIDA"))
                .andReturn();
        long importId = objectMapper.readTree(imported.getResponse().getContentAsString()).get("idImportacao").asLong();
        LancamentoMensal reativado = lancamentoRepository.findById(id).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(reativado.getStatus()).isEqualTo(StatusLancamento.ATIVO);
        org.assertj.core.api.Assertions.assertThat(reativado.getQuantidade()).isEqualTo(9);
        org.assertj.core.api.Assertions.assertThat(reativado.getIdImportacao()).isEqualTo(importId);
    }

    @Test
    void manuallyEditingImportedSaleClearsItsImportForeignKey() throws Exception {
        String email = "editar-importada-" + UUID.randomUUID() + "@trama.test";
        String senha = "SenhaEditarImportada@123";
        criarAdmin(email, senha);
        Confeccao confeccao = criarConfeccao("Confecção edição CSV");
        Categoria categoria = categoriaRepository.saveAndFlush(new Categoria("Editar-CSV-" + UUID.randomUUID()));
        String token = token(email, senha);
        String csv = "mesAno;quantidade;faturamento;idConfeccao;idCategoria;origemDado;nomeFonte\n"
                + "2026-10;7;350.00;" + confeccao.getIdConfeccao() + ";" + categoria.getIdCategoria()
                + ";ENTREVISTA;Entrevista inicial\n";
        MockMultipartFile file = new MockMultipartFile("arquivo", "edicao.csv", "text/csv",
                csv.getBytes(StandardCharsets.UTF_8));
        mockMvc.perform(multipart("/api/importacoes").file(file).header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated());
        LancamentoMensal importado = lancamentoRepository
                .findByConfeccao_IdConfeccaoAndCategoria_IdCategoriaAndMesReferencia(
                        confeccao.getIdConfeccao(), categoria.getIdCategoria(), LocalDate.of(2026, 10, 1))
                .orElseThrow();
        org.assertj.core.api.Assertions.assertThat(importado.getIdImportacao()).isNotNull();

        Map<String, Object> manualEdit = Map.of(
                "idConfeccao", confeccao.getIdConfeccao(), "idCategoria", categoria.getIdCategoria(),
                "mesAno", "2026-10", "quantidade", 8, "faturamento", new BigDecimal("420.00"),
                "origem", "MANUAL", "origemDado", "FONTE_SECUNDARIA", "nomeFonte", "Controle revisado");
        mockMvc.perform(put("/api/vendas/{id}", importado.getIdLancamento())
                        .header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(manualEdit)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.origem").value("MANUAL"));
        LancamentoMensal atualizado = lancamentoRepository.findById(importado.getIdLancamento()).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(atualizado.getIdImportacao()).isNull();
    }

    @Test
    void indicatorComparisonUsesAnEqualLengthPreviousWindow() throws Exception {
        String email = "periodo-indicador-" + UUID.randomUUID() + "@trama.test";
        String senha = "SenhaPeriodo@123";
        Confeccao propria = criarConfeccao("Confecção período indicadores");
        Categoria categoria = categoriaRepository.saveAndFlush(new Categoria("Período-" + UUID.randomUUID()));
        Usuario empresario = new Usuario();
        empresario.setNome("Empresário período");
        empresario.setEmail(email);
        empresario.setSenhaHash(passwordEncoder.encode(senha));
        empresario.setPerfil(PerfilUsuario.EMPRESARIO);
        empresario.setConfeccao(propria);
        usuarioRepository.saveAndFlush(empresario);

        criarLancamento(propria, categoria, "2025-10", 1, "50.00");
        criarLancamento(propria, categoria, "2025-11", 1, "50.00");
        criarLancamento(propria, categoria, "2025-12", 1, "100.00");
        criarLancamento(propria, categoria, "2026-01", 1, "100.00");
        criarLancamento(propria, categoria, "2026-02", 2, "200.00");
        criarLancamento(propria, categoria, "2026-03", 3, "300.00");

        String token = token(email, senha);
        mockMvc.perform(get("/api/indicadores").header("Authorization", "Bearer " + token)
                        .param("inicio", "2026-01").param("fim", "2026-03"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.faturamentoTotal").value(600.00))
                .andExpect(jsonPath("$.pecasVendidas").value(6))
                .andExpect(jsonPath("$.faturamentoTotalAnterior").value(200.00))
                .andExpect(jsonPath("$.pecasVendidasAnterior").value(3))
                .andExpect(jsonPath("$.ticketMedioPorPeca").value(100.00));
    }

    @Test
    void empresarioProfileUsesUpdatedRoleAndIsLimitedToItsConfection() throws Exception {
        String email = "empresario-" + UUID.randomUUID() + "@trama.test";
        String senha = "SenhaTeste@123";
        Confeccao propria = criarConfeccao("Própria");
        Confeccao outra = criarConfeccao("Outra");
        Usuario empresario = new Usuario();
        empresario.setNome("Empresário de teste");
        empresario.setEmail(email);
        empresario.setSenhaHash(passwordEncoder.encode(senha));
        empresario.setPerfil(PerfilUsuario.EMPRESARIO);
        empresario.setConfeccao(propria);
        usuarioRepository.saveAndFlush(empresario);
        String token = token(email, senha);
        long categoriaId = categoriaRepository.save(new Categoria("Empresario-" + UUID.randomUUID())).getIdCategoria();
        Map<String, Object> vendaPropria = Map.of("idConfeccao", propria.getIdConfeccao(),
                "idCategoria", categoriaId, "mesAno", "2026-11", "quantidade", 5,
                "faturamento", new BigDecimal("500.00"), "origem", "MANUAL",
                "origemDado", "ENTREVISTA", "nomeFonte", "Entrevista");
        mockMvc.perform(post("/api/vendas").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(vendaPropria)))
                .andExpect(status().isCreated());
        Map<String, Object> vendaOutra = Map.of("idConfeccao", outra.getIdConfeccao(),
                "idCategoria", categoriaId, "mesAno", "2026-12", "quantidade", 5,
                "faturamento", new BigDecimal("500.00"), "origem", "MANUAL",
                "origemDado", "ENTREVISTA", "nomeFonte", "Entrevista");
        mockMvc.perform(post("/api/vendas").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(vendaOutra)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/vendas").header("Authorization", "Bearer " + token)
                        .param("confeccao", String.valueOf(outra.getIdConfeccao())))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].idConfeccao").value(propria.getIdConfeccao()));
        mockMvc.perform(get("/api/confeccoes").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idConfeccao").value(propria.getIdConfeccao()));
        mockMvc.perform(get("/api/confeccoes/{id}", outra.getIdConfeccao())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());

        LancamentoMensal vendaDeOutraConfeccao = new LancamentoMensal();
        vendaDeOutraConfeccao.setMesReferencia(LocalDate.of(2026, 11, 1));
        vendaDeOutraConfeccao.setQuantidade(20);
        vendaDeOutraConfeccao.setFaturamento(new BigDecimal("1500.00"));
        vendaDeOutraConfeccao.setOrigem(OrigemLancamento.MANUAL);
        vendaDeOutraConfeccao.setStatus(StatusLancamento.ATIVO);
        vendaDeOutraConfeccao.setConfeccao(outra);
        vendaDeOutraConfeccao.setCategoria(categoriaRepository.findById(categoriaId).orElseThrow());
        vendaDeOutraConfeccao.setOrigemDado(OrigemDado.ENTREVISTA);
        vendaDeOutraConfeccao.setNomeFonte("Entrevista de outra confecção");
        lancamentoRepository.saveAndFlush(vendaDeOutraConfeccao);

        mockMvc.perform(get("/api/indicadores").header("Authorization", "Bearer " + token)
                        .param("inicio", "2026-11").param("fim", "2026-11"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inicio").value("2026-11"))
                .andExpect(jsonPath("$.fim").value("2026-11"))
                .andExpect(jsonPath("$.faturamentoTotal").value(500.00))
                .andExpect(jsonPath("$.pecasVendidas").value(5))
                .andExpect(jsonPath("$.ticketMedioPorPeca").value(100.00))
                .andExpect(jsonPath("$.categorias[0].categoria").isNotEmpty());
    }

    private Confeccao criarConfeccao(String prefixo) {
        Cidade cidade = cidadeRepository.findByNomeIgnoreCaseAndUf("Caruaru", "PE").orElseThrow();
        Confeccao confeccao = new Confeccao();
        confeccao.setNome(prefixo + " " + UUID.randomUUID());
        confeccao.setPorte(PorteConfeccao.MICRO);
        confeccao.setTipo(TipoConfeccao.CONFECCAO);
        confeccao.setCidade(cidade);
        return confeccaoRepository.saveAndFlush(confeccao);
    }

    private void criarAdmin(String email, String senha) {
        Usuario usuario = new Usuario();
        usuario.setNome("Administrador de teste");
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(senha));
        usuario.setPerfil(PerfilUsuario.ADMIN);
        usuarioRepository.saveAndFlush(usuario);
    }

    private String token(String email, String senha) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of("email", email, "senha", senha));
        MvcResult result = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }
}
