CREATE TABLE convite_equipe (
  id_convite INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(120) NOT NULL,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expira_em DATETIME NOT NULL,
  utilizado_em DATETIME NULL,
  revogado_em DATETIME NULL,
  id_confeccao INT NOT NULL,
  id_usuario_criador INT NOT NULL,
  INDEX idx_convite_confeccao (id_confeccao, criado_em),
  FOREIGN KEY (id_confeccao) REFERENCES confeccao (id_confeccao),
  FOREIGN KEY (id_usuario_criador) REFERENCES usuario (id_usuario)
);
