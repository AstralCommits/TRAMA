CREATE TABLE auditoria_equipe (
  id_auditoria INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  acao VARCHAR(30) NOT NULL,
  membro_nome VARCHAR(100) NOT NULL,
  membro_email VARCHAR(120) NOT NULL,
  data_evento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_usuario_responsavel INT NOT NULL,
  id_confeccao INT NOT NULL,
  FOREIGN KEY (id_usuario_responsavel) REFERENCES usuario (id_usuario),
  FOREIGN KEY (id_confeccao) REFERENCES confeccao (id_confeccao),
  CONSTRAINT chk_auditoria_equipe_acao CHECK (acao IN ('MEMBRO_CRIADO','MEMBRO_REMOVIDO','CONVITE_CRIADO','CONVITE_ACEITO','CONVITE_REVOGADO'))
);
