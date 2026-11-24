package br.com.trama.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "convite_equipe")
public class ConviteEquipe {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "id_convite") private Long idConvite;
    @Column(name = "email", nullable = false, length = 120) private String email;
    @Column(name = "token_hash", nullable = false, unique = true, length = 64) private String tokenHash;
    @Column(name = "criado_em", nullable = false) private LocalDateTime criadoEm;
    @Column(name = "expira_em", nullable = false) private LocalDateTime expiraEm;
    @Column(name = "utilizado_em") private LocalDateTime utilizadoEm;
    @Column(name = "revogado_em") private LocalDateTime revogadoEm;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "id_confeccao", nullable = false) private Confeccao confeccao;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "id_usuario_criador", nullable = false) private Usuario criador;
    public Long getIdConvite() { return idConvite; }
    public String getEmail() { return email; } public void setEmail(String value) { email = value; }
    public String getTokenHash() { return tokenHash; } public void setTokenHash(String value) { tokenHash = value; }
    public LocalDateTime getCriadoEm() { return criadoEm; } public void setCriadoEm(LocalDateTime value) { criadoEm = value; }
    public LocalDateTime getExpiraEm() { return expiraEm; } public void setExpiraEm(LocalDateTime value) { expiraEm = value; }
    public LocalDateTime getUtilizadoEm() { return utilizadoEm; } public void setUtilizadoEm(LocalDateTime value) { utilizadoEm = value; }
    public LocalDateTime getRevogadoEm() { return revogadoEm; } public void setRevogadoEm(LocalDateTime value) { revogadoEm = value; }
    public Confeccao getConfeccao() { return confeccao; } public void setConfeccao(Confeccao value) { confeccao = value; }
    public Usuario getCriador() { return criador; } public void setCriador(Usuario value) { criador = value; }
}
