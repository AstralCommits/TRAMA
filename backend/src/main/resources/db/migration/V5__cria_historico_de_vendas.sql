CREATE TABLE historico_lancamento (
    id_historico INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_lancamento INT NOT NULL,
    acao VARCHAR(10) NOT NULL,
    origem VARCHAR(10) NOT NULL,
    mes_referencia DATE NOT NULL,
    id_confeccao INT NOT NULL,
    id_categoria INT NOT NULL,
    quantidade_antiga INT NOT NULL,
    faturamento_antigo DECIMAL(12,2) NOT NULL,
    status_antigo VARCHAR(10) NOT NULL,
    quantidade_nova INT NULL,
    faturamento_novo DECIMAL(12,2) NULL,
    status_novo VARCHAR(10) NULL,
    id_usuario INT NULL,
    data_alteracao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_hist_acao   CHECK (acao IN ('UPDATE','DELETE')),
    CONSTRAINT chk_hist_origem CHECK (origem IN ('MANUAL','IMPORTACAO'))
);

CREATE INDEX idx_historico_lancamento ON historico_lancamento (id_lancamento, data_alteracao);

CREATE INDEX idx_historico_data ON historico_lancamento (data_alteracao, origem);
