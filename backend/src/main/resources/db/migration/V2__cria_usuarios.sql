CREATE TABLE usuario (
    id_usuario INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(10) NOT NULL,
    id_confeccao INT NULL,
    FOREIGN KEY (id_confeccao) REFERENCES confeccao (id_confeccao),
    CONSTRAINT chk_usuario_perfil CHECK (perfil IN ('ADMIN','EMPRESARIO')),
    CONSTRAINT chk_usuario_perfil_confeccao CHECK (
        (perfil = 'ADMIN' AND id_confeccao IS NULL)
        OR (perfil = 'EMPRESARIO' AND id_confeccao IS NOT NULL)
    )
);
