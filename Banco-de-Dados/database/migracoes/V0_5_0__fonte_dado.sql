USE confeccoes;

ALTER TABLE lancamento_mensal DROP CHECK chk_lanc_fonte;

ALTER TABLE lancamento_mensal RENAME COLUMN origem_dado TO fonte_dado;

ALTER TABLE lancamento_mensal
    MODIFY COLUMN fonte_dado VARCHAR(20) NOT NULL,
    ADD CONSTRAINT chk_lanc_fonte CHECK (fonte_dado IN ('ENTREVISTA','QUESTIONARIO','FONTE_SECUNDARIA'));
