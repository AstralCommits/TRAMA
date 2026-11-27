SET NAMES utf8mb4;

USE confeccoes;

ALTER TABLE lancamento_mensal DROP CHECK chk_lanc_fonte;

ALTER TABLE lancamento_mensal
    RENAME COLUMN fonte_dado TO origem_dado;

ALTER TABLE lancamento_mensal
    MODIFY COLUMN origem_dado VARCHAR(30) NOT NULL,
    ADD COLUMN nome_fonte VARCHAR(200) NOT NULL DEFAULT 'Fonte não informada' AFTER origem_dado,
    ADD CONSTRAINT chk_lanc_fonte CHECK (origem_dado IN ('ENTREVISTA','QUESTIONARIO','FONTE_SECUNDARIA'));

