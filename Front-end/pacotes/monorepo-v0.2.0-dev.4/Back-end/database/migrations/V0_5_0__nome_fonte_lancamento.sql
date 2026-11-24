ALTER TABLE lancamento_mensal
    ADD COLUMN nome_fonte VARCHAR(200) NOT NULL
    DEFAULT 'Fonte não informada (registro legado)';
