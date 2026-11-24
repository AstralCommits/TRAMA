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
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;

@Entity
@Table(name = "filtro_salvo", uniqueConstraints = @UniqueConstraint(name = "uk_filtro_usuario_contexto_nome", columnNames = {"id_usuario", "contexto", "nome"}))
public class FiltroSalvo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "id_filtro") private Long idFiltro;
    @Column(name = "nome", nullable = false, length = 60) private String nome;
    @Column(name = "contexto", nullable = false, length = 30) private String contexto;
    @Column(name = "configuracao_json", nullable = false, length = 4000) private String configuracaoJson;
    @Column(name = "atualizado_em", nullable = false) private LocalDateTime atualizadoEm;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "id_usuario", nullable = false) private Usuario usuario;
    public Long getIdFiltro() { return idFiltro; }
    public String getNome() { return nome; } public void setNome(String value) { nome = value; }
    public String getContexto() { return contexto; } public void setContexto(String value) { contexto = value; }
    public String getConfiguracaoJson() { return configuracaoJson; } public void setConfiguracaoJson(String value) { configuracaoJson = value; }
    public LocalDateTime getAtualizadoEm() { return atualizadoEm; } public void setAtualizadoEm(LocalDateTime value) { atualizadoEm = value; }
    public Usuario getUsuario() { return usuario; } public void setUsuario(Usuario value) { usuario = value; }
}
