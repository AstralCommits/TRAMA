ALTER TABLE usuario MODIFY COLUMN perfil VARCHAR(12) NOT NULL;
ALTER TABLE usuario DROP CHECK chk_usuario_perfil;
ALTER TABLE usuario DROP CHECK chk_usuario_perfil_confeccao;
ALTER TABLE usuario ADD CONSTRAINT chk_usuario_perfil CHECK (perfil IN ('ADMIN','EMPRESARIO','FUNCIONARIO'));
ALTER TABLE usuario ADD CONSTRAINT chk_usuario_perfil_confeccao CHECK (
  (perfil = 'ADMIN' AND id_confeccao IS NULL) OR
  (perfil IN ('EMPRESARIO','FUNCIONARIO') AND id_confeccao IS NOT NULL)
);
