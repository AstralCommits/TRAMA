package br.com.trama;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.trama.model.Cidade;
import br.com.trama.model.Categoria;
import br.com.trama.model.Confeccao;
import br.com.trama.model.Usuario;
import br.com.trama.model.enums.PerfilUsuario;
import br.com.trama.model.enums.PorteConfeccao;
import br.com.trama.model.enums.TipoConfeccao;
import br.com.trama.repository.CidadeRepository;
import br.com.trama.repository.CategoriaRepository;
import br.com.trama.repository.ConfeccaoRepository;
import br.com.trama.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.JsonNode;
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
class EquipeAndCadastrosIntegrationTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper mapper;
    @Autowired private UsuarioRepository usuarios;
    @Autowired private CidadeRepository cidades;
    @Autowired private CategoriaRepository categorias;
    @Autowired private ConfeccaoRepository confeccoes;
    @Autowired private PasswordEncoder encoder;

    @Test
    void ownerCanCreateAndRemoveEmployeeScopedToOwnCompany() throws Exception {
        String ownerEmail = "owner-" + UUID.randomUUID() + "@trama.test";
        String ownerPassword = "SenhaOwner@123";
        Confeccao company = createCompany("Empresa equipe");
        createUser(ownerEmail, ownerPassword, PerfilUsuario.EMPRESARIO, company);
        String ownerToken = login(ownerEmail, ownerPassword);

        String memberEmail = "funcionario-" + UUID.randomUUID() + "@trama.test";
        Map<String, Object> inviteRequest = Map.of("email", memberEmail);
        MvcResult invite = mockMvc.perform(post("/api/equipe/convites").header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(inviteRequest)))
                .andExpect(status().isOk()).andReturn();
        String inviteToken = mapper.readTree(invite.getResponse().getContentAsString()).get("token").asText();
        Map<String, Object> acceptRequest = Map.of("nome", "Funcionário de teste", "senha", "SenhaFunc@123", "token", inviteToken);
        MvcResult created = mockMvc.perform(post("/api/equipe/convites/aceitar").contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(acceptRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.perfil").value("FUNCIONARIO"))
                .andReturn();
        long memberId = mapper.readTree(created.getResponse().getContentAsString()).get("idUsuario").asLong();
        String memberToken = login(memberEmail, "SenhaFunc@123");

        mockMvc.perform(get("/api/confeccoes").header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].idConfeccao").value(company.getIdConfeccao()));
        Categoria category = categorias.saveAndFlush(new Categoria("Equipe-" + UUID.randomUUID()));
        Map<String, Object> sale = Map.of("idConfeccao", company.getIdConfeccao(), "idCategoria", category.getIdCategoria(),
                "mesAno", "2026-12", "quantidade", 3, "faturamento", 90.00, "origem", "MANUAL",
                "origemDado", "FONTE_SECUNDARIA", "nomeFonte", "Controle da empresa");
        mockMvc.perform(post("/api/vendas").header("Authorization", "Bearer " + memberToken)
                        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(sale)))
                .andExpect(status().isCreated());
        mockMvc.perform(get("/api/indicadores").header("Authorization", "Bearer " + memberToken)
                        .param("inicio", "2026-12").param("fim", "2026-12"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.faturamentoTotal").value(90.00));
        mockMvc.perform(get("/api/equipe/membros").header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/equipe/membros").header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].email").value(memberEmail));
        mockMvc.perform(delete("/api/equipe/membros/{id}", memberId).header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/equipe/auditoria").header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].acao").value("MEMBRO_REMOVIDO"))
                .andExpect(jsonPath("$[1].acao").value("CONVITE_ACEITO"));
    }

    @Test
    void invitationTokenIsSingleUseAndCreatesScopedEmployeeAccount() throws Exception {
        String ownerEmail = "invite-owner-" + UUID.randomUUID() + "@trama.test";
        Confeccao company = createCompany("Empresa convite");
        createUser(ownerEmail, "SenhaInvite@123", PerfilUsuario.EMPRESARIO, company);
        String ownerToken = login(ownerEmail, "SenhaInvite@123");
        String invitedEmail = "convidado-" + UUID.randomUUID() + "@trama.test";
        Map<String, Object> invitationRequest = Map.of("email", invitedEmail);
        MvcResult created = mockMvc.perform(post("/api/equipe/convites").header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(invitationRequest)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.status").value("PENDENTE")).andReturn();
        String token = mapper.readTree(created.getResponse().getContentAsString()).get("token").asText();
        Map<String, Object> accept = Map.of("nome", "Pessoa convidada", "senha", "SenhaConvidado@123", "token", token);
        mockMvc.perform(post("/api/equipe/convites/aceitar").contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(accept)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.email").value(invitedEmail))
                .andExpect(jsonPath("$.perfil").value("FUNCIONARIO"));
        String memberToken = login(invitedEmail, "SenhaConvidado@123");
        mockMvc.perform(get("/api/confeccoes").header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].idConfeccao").value(company.getIdConfeccao()));
        mockMvc.perform(post("/api/equipe/convites/aceitar").contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(accept)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void businessOwnerCanUpdateOnlyItsOwnCompany() throws Exception {
        String email = "profile-" + UUID.randomUUID() + "@trama.test";
        String password = "SenhaProfile@123";
        Confeccao company = createCompany("Nome antigo");
        createUser(email, password, PerfilUsuario.EMPRESARIO, company);
        String token = login(email, password);
        Map<String, Object> payload = Map.of("nome", "Confecção atualizada", "cnpj", "12345678000199",
                "porte", "PEQUENA", "tipo", "FACCAO", "cidade", "Caruaru");
        mockMvc.perform(put("/api/confeccoes/minha").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(payload)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.nome").value("Confecção atualizada"))
                .andExpect(jsonPath("$.cidade").value("Caruaru"));
        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.nomeConfeccao").value("Confecção atualizada"));
    }

    @Test
    void savedFiltersArePrivateToTheAuthenticatedUser() throws Exception {
        String emailOne = "filter-one-" + UUID.randomUUID() + "@trama.test";
        String emailTwo = "filter-two-" + UUID.randomUUID() + "@trama.test";
        createUser(emailOne, "SenhaFilter@123", PerfilUsuario.ADMIN, null);
        createUser(emailTwo, "SenhaFilter@123", PerfilUsuario.ADMIN, null);
        String tokenOne = login(emailOne, "SenhaFilter@123");
        String tokenTwo = login(emailTwo, "SenhaFilter@123");
        Map<String, Object> payload = Map.of("nome", "Meu período", "contexto", "dashboard", "configuracaoJson", "{\"startMonth\":1,\"endMonth\":3}");
        MvcResult created = mockMvc.perform(post("/api/filtros-salvos").header("Authorization", "Bearer " + tokenOne)
                        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(payload)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.nome").value("Meu período")).andReturn();
        long id = mapper.readTree(created.getResponse().getContentAsString()).get("idFiltro").asLong();
        mockMvc.perform(get("/api/filtros-salvos").header("Authorization", "Bearer " + tokenTwo).param("contexto", "dashboard"))
                .andExpect(status().isOk()).andExpect(jsonPath("$").isEmpty());
        mockMvc.perform(delete("/api/filtros-salvos/{id}", id).header("Authorization", "Bearer " + tokenTwo))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/filtros-salvos").header("Authorization", "Bearer " + tokenOne).param("contexto", "dashboard"))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].nome").value("Meu período"));
    }

    @Test
    void adminCanManageCategoriesAndConfectionsAndDeleteUnlinkedRecords() throws Exception {
        String email = "admin-cadastros-" + UUID.randomUUID() + "@trama.test";
        createUser(email, "SenhaAdmin@123", PerfilUsuario.ADMIN, null);
        String token = login(email, "SenhaAdmin@123");
        MvcResult categoryCreated = mockMvc.perform(post("/api/categorias").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(Map.of("nome", "Categoria " + UUID.randomUUID()))))
                .andExpect(status().isCreated()).andReturn();
        long categoryId = mapper.readTree(categoryCreated.getResponse().getContentAsString()).get("idCategoria").asLong();
        mockMvc.perform(put("/api/categorias/{id}", categoryId).header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(Map.of("nome", "Categoria atualizada " + UUID.randomUUID()))))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/categorias/{id}", categoryId).header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        Map<String, Object> companyPayload = Map.of("nome", "Confecção admin " + UUID.randomUUID(), "cnpj", "",
                "porte", "MICRO", "tipo", "CONFECCAO", "cidade", "Caruaru");
        MvcResult companyCreated = mockMvc.perform(post("/api/confeccoes").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(companyPayload)))
                .andExpect(status().isCreated()).andReturn();
        long companyId = mapper.readTree(companyCreated.getResponse().getContentAsString()).get("idConfeccao").asLong();
        Map<String, Object> companyUpdated = Map.of("nome", "Confecção admin atualizada " + UUID.randomUUID(), "cnpj", "",
                "porte", "PEQUENA", "tipo", "FACCAO", "cidade", "Toritama");
        mockMvc.perform(put("/api/confeccoes/{id}", companyId).header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(companyUpdated)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.cidade").value("Toritama"));
        mockMvc.perform(delete("/api/confeccoes/{id}", companyId).header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }

    @Test
    void ownerCanRevokeInvitationAndRevokedTokenCannotBeAccepted() throws Exception {
        String ownerEmail = "revoke-owner-" + UUID.randomUUID() + "@trama.test";
        Confeccao company = createCompany("Empresa revogar convite");
        createUser(ownerEmail, "SenhaRevogar@123", PerfilUsuario.EMPRESARIO, company);
        String ownerToken = login(ownerEmail, "SenhaRevogar@123");
        MvcResult created = mockMvc.perform(post("/api/equipe/convites").header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(Map.of("email", "revogado-" + UUID.randomUUID() + "@trama.test"))))
                .andExpect(status().isOk()).andReturn();
        JsonNode invite = mapper.readTree(created.getResponse().getContentAsString());
        long inviteId = invite.get("idConvite").asLong(); String token = invite.get("token").asText();
        mockMvc.perform(delete("/api/equipe/convites/{id}", inviteId).header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isNoContent());
        mockMvc.perform(post("/api/equipe/convites/aceitar").contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("nome", "Não deve entrar", "senha", "SenhaNaoEntra@123", "token", token))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void employeeCannotManageTeamOrEditCompany() throws Exception {
        Confeccao company = createCompany("Empresa sem permissão");
        String email = "funcionario-sem-permissao-" + UUID.randomUUID() + "@trama.test";
        createUser(email, "SenhaFunc@123", PerfilUsuario.FUNCIONARIO, company);
        String token = login(email, "SenhaFunc@123");
        Map<String, Object> payload = Map.of("nome", "Tentativa", "cnpj", "", "porte", "MICRO", "tipo", "CONFECCAO", "cidade", "Caruaru");
        mockMvc.perform(put("/api/confeccoes/minha").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(payload)))
                .andExpect(status().isForbidden());
    }

    private Confeccao createCompany(String name) {
        Cidade city = cidades.findByNomeIgnoreCaseAndUf("Caruaru", "PE").orElseThrow();
        Confeccao company = new Confeccao(); company.setNome(name + " " + UUID.randomUUID());
        company.setPorte(PorteConfeccao.MICRO); company.setTipo(TipoConfeccao.CONFECCAO); company.setCidade(city);
        return confeccoes.saveAndFlush(company);
    }
    private void createUser(String email, String password, PerfilUsuario role, Confeccao company) {
        Usuario user = new Usuario(); user.setNome("Pessoa teste"); user.setEmail(email);
        user.setSenhaHash(encoder.encode(password)); user.setPerfil(role); user.setConfeccao(company);
        usuarios.saveAndFlush(user);
    }
    private String login(String email, String password) throws Exception {
        Map<String, Object> body = Map.of("email", email, "senha", password);
        MvcResult result = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(body)))
                .andExpect(status().isOk()).andReturn();
        JsonNode json = mapper.readTree(result.getResponse().getContentAsString());
        return json.get("token").asText();
    }
}
