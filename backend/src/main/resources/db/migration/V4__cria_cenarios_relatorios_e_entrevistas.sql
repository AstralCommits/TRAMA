CREATE TABLE cenario_concorrencia (
    id_cenario INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    percentual_impacto DECIMAL(5,2) NOT NULL,
    descricao VARCHAR(300) NULL,
    id_usuario INT NOT NULL,
    id_categoria INT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario),
    FOREIGN KEY (id_categoria) REFERENCES categoria (id_categoria),
    CONSTRAINT chk_cenario_impacto CHECK (percentual_impacto BETWEEN 0 AND 100)
);

CREATE INDEX idx_cenario_usuario_nome ON cenario_concorrencia (id_usuario, nome);

CREATE TABLE relatorio (
    id_relatorio INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL,
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    limiar_tendencia DECIMAL(5,2) NULL,
    data_geracao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,
    id_cenario INT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario),
    FOREIGN KEY (id_cenario) REFERENCES cenario_concorrencia (id_cenario),
    CONSTRAINT chk_relatorio_tipo CHECK (tipo IN ('REGIONAL','CATEGORIA_PERIODO','TENDENCIA','CENARIO')),
    CONSTRAINT chk_relatorio_periodo CHECK (periodo_fim >= periodo_inicio)
);

CREATE INDEX idx_relatorio_usuario_data ON relatorio (id_usuario, data_geracao);

CREATE TABLE item_relatorio (
    id_item INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_cidade INT NULL,
    quantidade INT NOT NULL,
    faturamento DECIMAL(12,2) NOT NULL,
    variacao_percentual DECIMAL(7,2) NULL,
    tendencia VARCHAR(10) NULL,
    id_relatorio INT NOT NULL,
    id_categoria INT NULL,
    FOREIGN KEY (id_relatorio) REFERENCES relatorio (id_relatorio),
    FOREIGN KEY (id_categoria) REFERENCES categoria (id_categoria),
    FOREIGN KEY (id_cidade) REFERENCES cidade (id_cidade),
    CONSTRAINT chk_item_tendencia CHECK (tendencia IS NULL OR tendencia IN ('ALTA','QUEDA','ESTAVEL'))
);

CREATE TABLE entrevista (
    id_entrevista INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    data DATE NOT NULL,
    resumo TEXT NOT NULL,
    achou_algo_novo VARCHAR(3) NOT NULL,
    id_confeccao INT NOT NULL,
    id_categoria_percebida INT NULL,
    FOREIGN KEY (id_confeccao) REFERENCES confeccao (id_confeccao),
    FOREIGN KEY (id_categoria_percebida) REFERENCES categoria (id_categoria),
    CONSTRAINT chk_entrevista_novo CHECK (achou_algo_novo IN ('SIM','NAO'))
);
