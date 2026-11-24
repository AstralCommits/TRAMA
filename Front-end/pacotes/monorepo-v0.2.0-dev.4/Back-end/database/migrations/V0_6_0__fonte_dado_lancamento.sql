ALTER TABLE lancamento_mensal
    ADD COLUMN fonte_dado VARCHAR(20) NULL;

UPDATE lancamento_mensal
SET fonte_dado = 'FONTE_SECUNDARIA'
WHERE fonte_dado IS NULL;

ALTER TABLE lancamento_mensal
    MODIFY COLUMN fonte_dado VARCHAR(20) NOT NULL;

ALTER TABLE lancamento_mensal
    ADD CONSTRAINT chk_lanc_fonte_dado
    CHECK (fonte_dado IN ('ENTREVISTA', 'QUESTIONARIO', 'FONTE_SECUNDARIA', 'DEMONSTRACAO'));
