CREATE TABLE filtro_salvo (
  id_filtro INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(60) NOT NULL,
  contexto VARCHAR(30) NOT NULL,
  configuracao_json VARCHAR(4000) NOT NULL,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_usuario INT NOT NULL,
  CONSTRAINT uk_filtro_usuario_contexto_nome UNIQUE (id_usuario, contexto, nome),
  CONSTRAINT chk_filtro_contexto CHECK (contexto IN ('dashboard','tendencias')),
  FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);
