package br.com.trama.service;

import br.com.trama.dto.EquipeMembroResponse;
import br.com.trama.error.BadRequestException;
import br.com.trama.error.ResourceNotFoundException;
import br.com.trama.model.Usuario;
import br.com.trama.model.AuditoriaEquipe;
import br.com.trama.dto.EquipeAuditoriaResponse;
import br.com.trama.dto.ConviteEquipeRequest;
import br.com.trama.dto.ConviteAceiteRequest;
import br.com.trama.dto.ConviteEquipeResponse;
import br.com.trama.dto.ConviteEquipeListResponse;
import br.com.trama.model.ConviteEquipe;
import br.com.trama.repository.ConviteEquipeRepository;
import java.security.SecureRandom;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import br.com.trama.repository.AuditoriaEquipeRepository;
import java.time.LocalDateTime;
import br.com.trama.model.enums.PerfilUsuario;
import br.com.trama.repository.UsuarioRepository;
import br.com.trama.security.UsuarioPrincipal;
import br.com.trama.security.SenhaBcryptPolicy;
import java.util.List;
import java.util.Locale;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EquipeService {
    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final AuditoriaEquipeRepository auditoria;
    private final ConviteEquipeRepository convites;
    private final SecureRandom random = new SecureRandom();
    public EquipeService(UsuarioRepository usuarios, PasswordEncoder encoder, AuditoriaEquipeRepository auditoria,
                         ConviteEquipeRepository convites) {
        this.usuarios = usuarios; this.encoder = encoder; this.auditoria = auditoria; this.convites = convites;
    }

    @Transactional(readOnly = true)
    public List<EquipeMembroResponse> listar(UsuarioPrincipal principal) {
        Long idConfeccao = exigirEmpresario(principal);
        return usuarios.findAllByConfeccao_IdConfeccaoOrderByNomeAsc(idConfeccao).stream()
            .filter(u -> u.getPerfil() == PerfilUsuario.FUNCIONARIO)
            .map(this::response).toList();
    }

    @Transactional
    public void excluir(Long id, UsuarioPrincipal principal) {
        Long idConfeccao = exigirEmpresario(principal);
        Usuario membro = usuarios.findById(id).orElseThrow(() -> new ResourceNotFoundException("Membro não encontrado."));
        if (membro.getPerfil() != PerfilUsuario.FUNCIONARIO || membro.getConfeccao() == null || !idConfeccao.equals(membro.getConfeccao().getIdConfeccao())) throw new ResourceNotFoundException("Membro não encontrado.");
        Usuario responsavel = usuarios.findById(principal.getIdUsuario()).orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada."));
        registrarAuditoria("MEMBRO_REMOVIDO", membro, responsavel);
        usuarios.delete(membro);
    }

    @Transactional
    public ConviteEquipeResponse criarConvite(ConviteEquipeRequest request, UsuarioPrincipal principal) {
        Long idConfeccao = exigirEmpresario(principal);
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (usuarios.existsByEmailIgnoreCase(email)) throw new BadRequestException("Este e-mail já possui uma conta na TRAMA.");
        Usuario responsavel = usuarios.findById(principal.getIdUsuario()).orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada."));
        if (responsavel.getConfeccao() == null || !idConfeccao.equals(responsavel.getConfeccao().getIdConfeccao())) throw new org.springframework.security.access.AccessDeniedException("O vínculo da conta mudou. Entre novamente.");
        byte[] bytes = new byte[32]; random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        ConviteEquipe convite = new ConviteEquipe(); convite.setEmail(email); convite.setTokenHash(hashToken(token));
        convite.setCriadoEm(LocalDateTime.now()); convite.setExpiraEm(LocalDateTime.now().plusHours(72));
        convite.setConfeccao(responsavel.getConfeccao()); convite.setCriador(responsavel);
        ConviteEquipe saved = convites.save(convite);
        registrarAuditoria("CONVITE_CRIADO", null, responsavel, email);
        return new ConviteEquipeResponse(saved.getIdConvite(), saved.getEmail(), token, saved.getExpiraEm(), "PENDENTE");
    }

    @Transactional(readOnly = true)
    public List<ConviteEquipeListResponse> listarConvites(UsuarioPrincipal principal) {
        Long idConfeccao = exigirEmpresario(principal); LocalDateTime now = LocalDateTime.now();
        return convites.findAllByConfeccao_IdConfeccaoOrderByCriadoEmDesc(idConfeccao).stream().map(item -> {
            String status = item.getUtilizadoEm() != null ? "UTILIZADO" : item.getRevogadoEm() != null ? "REVOGADO" : item.getExpiraEm().isBefore(now) ? "EXPIRADO" : "PENDENTE";
            return new ConviteEquipeListResponse(item.getIdConvite(), item.getEmail(), item.getCriadoEm(), item.getExpiraEm(), status);
        }).toList();
    }

    @Transactional
    public void revogarConvite(Long id, UsuarioPrincipal principal) {
        Long idConfeccao = exigirEmpresario(principal);
        ConviteEquipe convite = convites.findByIdConviteAndConfeccao_IdConfeccao(id, idConfeccao)
                .orElseThrow(() -> new ResourceNotFoundException("Convite não encontrado."));
        if (convite.getUtilizadoEm() != null) throw new BadRequestException("Um convite já utilizado não pode ser revogado.");
        convite.setRevogadoEm(LocalDateTime.now()); convites.save(convite);
        Usuario responsavel = usuarios.findById(principal.getIdUsuario()).orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada."));
        registrarAuditoria("CONVITE_REVOGADO", null, responsavel, convite.getEmail());
    }

    @Transactional
    public EquipeMembroResponse aceitarConvite(ConviteAceiteRequest request) {
        SenhaBcryptPolicy.validar(request.senha());
        String hash = hashToken(request.token());
        ConviteEquipe convite = convites.findByTokenHashForUpdate(hash)
                .orElseThrow(() -> new ResourceNotFoundException("Convite inválido ou não encontrado."));
        LocalDateTime now = LocalDateTime.now();
        if (convite.getRevogadoEm() != null || convite.getUtilizadoEm() != null || !convite.getExpiraEm().isAfter(now))
            throw new BadRequestException("Este convite expirou, foi revogado ou já foi utilizado.");
        if (usuarios.existsByEmailIgnoreCase(convite.getEmail())) throw new BadRequestException("Este e-mail já possui uma conta na TRAMA.");
        Usuario membro = new Usuario(); membro.setNome(request.nome().trim().replaceAll("\\s+", " "));
        membro.setEmail(convite.getEmail()); membro.setSenhaHash(encoder.encode(request.senha()));
        membro.setPerfil(PerfilUsuario.FUNCIONARIO); membro.setConfeccao(convite.getConfeccao());
        Usuario salvo = usuarios.saveAndFlush(membro); convite.setUtilizadoEm(now); convites.save(convite);
        registrarAuditoria("CONVITE_ACEITO", salvo, convite.getCriador());
        return response(salvo);
    }

    private String hashToken(String token) {
        try { byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (java.security.NoSuchAlgorithmException ex) { throw new IllegalStateException("SHA-256 indisponível.", ex); }
    }

    @Transactional(readOnly = true)
    public List<EquipeAuditoriaResponse> listarAuditoria(UsuarioPrincipal principal) {
        Long idConfeccao = exigirEmpresario(principal);
        return auditoria.findTop50ByConfeccao_IdConfeccaoOrderByDataEventoDescIdAuditoriaDesc(idConfeccao).stream()
                .map(item -> new EquipeAuditoriaResponse(item.getIdAuditoria(), item.getAcao(), item.getMembroNome(), item.getMembroEmail(), item.getDataEvento())).toList();
    }

    private void registrarAuditoria(String acao, Usuario membro, Usuario responsavel) {
        registrarAuditoria(acao, membro, responsavel, membro.getEmail());
    }
    private void registrarAuditoria(String acao, Usuario membro, Usuario responsavel, String email) {
        AuditoriaEquipe evento = new AuditoriaEquipe(); evento.setAcao(acao);
        evento.setMembroNome(membro == null ? "Convite" : membro.getNome());
        evento.setMembroEmail(email); evento.setDataEvento(LocalDateTime.now());
        evento.setResponsavel(responsavel); evento.setConfeccao(responsavel.getConfeccao()); auditoria.save(evento);
    }

    private Long exigirEmpresario(UsuarioPrincipal principal) {
        if (principal == null || principal.getPerfil() != PerfilUsuario.EMPRESARIO) {
            throw new org.springframework.security.access.AccessDeniedException("Somente o responsável pode gerenciar a equipe.");
        }
        if (principal.getIdConfeccao() == null) throw new BadRequestException("A conta ainda não possui uma confecção vinculada.");
        Usuario responsavel = usuarios.findById(principal.getIdUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada."));
        if (responsavel.getConfeccao() == null || !principal.getIdConfeccao().equals(responsavel.getConfeccao().getIdConfeccao())) {
            throw new org.springframework.security.access.AccessDeniedException("O vínculo da conta mudou. Entre novamente.");
        }
        return principal.getIdConfeccao();
    }
    private EquipeMembroResponse response(Usuario u) { return new EquipeMembroResponse(u.getIdUsuario(), u.getNome(), u.getEmail(), u.getPerfil().name()); }
}
