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
@Table(name = "auditoria_equipe")
public class AuditoriaEquipe {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "id_auditoria") private Long idAuditoria;
    @Column(name = "acao", nullable = false, length = 30) private String acao;
    @Column(name = "membro_nome", nullable = false, length = 100) private String membroNome;
    @Column(name = "membro_email", nullable = false, length = 120) private String membroEmail;
    @Column(name = "data_evento", nullable = false) private LocalDateTime dataEvento;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "id_usuario_responsavel", nullable = false) private Usuario responsavel;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "id_confeccao", nullable = false) private Confeccao confeccao;
    public Long getIdAuditoria() { return idAuditoria; }
    public String getAcao() { return acao; } public void setAcao(String value) { acao = value; }
    public String getMembroNome() { return membroNome; } public void setMembroNome(String value) { membroNome = value; }
    public String getMembroEmail() { return membroEmail; } public void setMembroEmail(String value) { membroEmail = value; }
    public LocalDateTime getDataEvento() { return dataEvento; } public void setDataEvento(LocalDateTime value) { dataEvento = value; }
    public Usuario getResponsavel() { return responsavel; } public void setResponsavel(Usuario value) { responsavel = value; }
    public Confeccao getConfeccao() { return confeccao; } public void setConfeccao(Confeccao value) { confeccao = value; }
}
