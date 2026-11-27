SET NAMES utf8mb4;

DROP DATABASE IF EXISTS confeccoes;
CREATE DATABASE IF NOT EXISTS confeccoes CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE confeccoes;

CREATE TABLE cidade (
    id_cidade INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL UNIQUE,
    uf CHAR(2) NOT NULL,
    CONSTRAINT chk_cidade_agreste CHECK (
        uf = 'PE' AND nome IN ('Toritama', 'Caruaru', 'Santa Cruz do Capibaribe')
    )
);

CREATE TABLE confeccao (
    id_confeccao INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    cnpj VARCHAR(14) NULL UNIQUE,
    porte VARCHAR(10) NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    id_cidade INT NOT NULL,
    FOREIGN KEY (id_cidade) REFERENCES cidade (id_cidade),
    CONSTRAINT chk_confeccao_porte CHECK (porte IN ('MICRO','PEQUENA','MEDIA')),
    CONSTRAINT chk_confeccao_tipo  CHECK (tipo IN ('CONFECCAO','FACCAO'))
);

CREATE INDEX idx_confeccao_cidade ON confeccao (id_cidade);

CREATE TABLE categoria (
    id_categoria INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

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

CREATE TABLE importacao (
    id_importacao INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome_arquivo VARCHAR(150) NOT NULL,
    data_importacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    qtd_linhas INT NULL,
    imp_status VARCHAR(10) NOT NULL,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario),
    CONSTRAINT chk_imp_status CHECK (imp_status IN ('CONCLUIDA','ERRO'))
);

CREATE TABLE lancamento_mensal (
    id_lancamento INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    mes_referencia DATE NOT NULL,
    quantidade INT NOT NULL,
    faturamento DECIMAL(12,2) NOT NULL,
    origem VARCHAR(10) NOT NULL,
    fonte_dado VARCHAR(20) NOT NULL,
    nome_fonte VARCHAR(200) NOT NULL DEFAULT 'Fonte não informada',
    lanc_status VARCHAR(10) NOT NULL DEFAULT 'ATIVO',
    id_confeccao INT NOT NULL,
    id_categoria INT NOT NULL,
    id_importacao INT NULL,

    UNIQUE (id_confeccao, id_categoria, mes_referencia),
    FOREIGN KEY (id_confeccao) REFERENCES confeccao (id_confeccao),
    FOREIGN KEY (id_categoria) REFERENCES categoria (id_categoria),
    FOREIGN KEY (id_importacao) REFERENCES importacao (id_importacao),
    CONSTRAINT chk_lanc_dia1      CHECK (DAY(mes_referencia) = 1),
    CONSTRAINT chk_lanc_origem    CHECK (origem IN ('MANUAL','IMPORTACAO')),
    CONSTRAINT chk_lanc_fonte     CHECK (fonte_dado IN ('ENTREVISTA','QUESTIONARIO','FONTE_SECUNDARIA')),
    CONSTRAINT chk_lanc_status    CHECK (lanc_status IN ('ATIVO','CANCELADO')),
    CONSTRAINT chk_lanc_quant     CHECK (quantidade >= 0),
    CONSTRAINT chk_lanc_fatur     CHECK (faturamento >= 0)
);

CREATE INDEX idx_lancamento_mes_categoria ON lancamento_mensal
    (mes_referencia, id_categoria, id_confeccao, lanc_status, quantidade, faturamento);

CREATE INDEX idx_lancamento_confeccao ON lancamento_mensal (id_confeccao);

CREATE OR REPLACE VIEW vw_lancamentos AS
SELECT l.id_lancamento,
       l.mes_referencia,
       l.quantidade,
       l.faturamento,
       l.origem,
       l.fonte_dado,
       l.nome_fonte,
       l.lanc_status,
       c.id_confeccao,
       c.nome AS confeccao,
       cat.id_categoria,
       cat.nome AS categoria,
       ci.nome AS cidade,
       ci.uf
FROM lancamento_mensal l
INNER JOIN confeccao c   ON l.id_confeccao = c.id_confeccao
INNER JOIN categoria cat ON l.id_categoria = cat.id_categoria
INNER JOIN cidade ci     ON c.id_cidade = ci.id_cidade
WHERE l.lanc_status = 'ATIVO';

-- DB-04: analitica de faturamento e vendas por polo regional.
-- municipio_id e o alias de cidade.id_cidade; o indice equivalente e confeccao(id_cidade).
-- As 3 cidades cadastradas (Toritama, Caruaru e Santa Cruz do Capibaribe) sao os polos.
-- A main nao tem tabela de pedidos, entao a contagem vem dos lancamentos ativos.
CREATE OR REPLACE VIEW vw_vendas_polo_regional AS
SELECT ci.id_cidade AS municipio_id,
       ci.nome AS municipio,
       ci.uf,
       COALESCE(v.faturamento_total, 0) AS faturamento_total,
       COALESCE(v.volume_itens, 0) AS volume_itens,
       COALESCE(v.qtd_lancamentos, 0) AS qtd_lancamentos,
       ROUND(COALESCE(v.faturamento_total, 0) / NULLIF(v.volume_itens, 0), 2) AS ticket_medio_item
FROM cidade ci
LEFT JOIN (
    SELECT c.id_cidade,
           SUM(x.faturamento) AS faturamento_total,
           SUM(x.quantidade) AS volume_itens,
           SUM(x.qtd_lancamentos) AS qtd_lancamentos
    FROM (
        SELECT id_confeccao,
               SUM(faturamento) AS faturamento,
               SUM(quantidade) AS quantidade,
               COUNT(*) AS qtd_lancamentos
        FROM lancamento_mensal
        WHERE lanc_status = 'ATIVO'
        GROUP BY id_confeccao
    ) x
    INNER JOIN confeccao c ON c.id_confeccao = x.id_confeccao
    GROUP BY c.id_cidade
) v ON v.id_cidade = ci.id_cidade;

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

DROP PROCEDURE IF EXISTS inserir_lancamento;
DROP PROCEDURE IF EXISTS atualizar_lancamento;
DROP PROCEDURE IF EXISTS cancelar_lancamento;
DROP PROCEDURE IF EXISTS excluir_lancamento;

DELIMITER $$
CREATE PROCEDURE inserir_lancamento(
    IN p_mes_referencia DATE,
    IN p_quantidade INT,
    IN p_faturamento DECIMAL(12,2),
    IN p_id_confeccao INT,
    IN p_id_categoria INT,
    IN p_fonte_dado VARCHAR(20)
)
BEGIN
    INSERT INTO lancamento_mensal
    (mes_referencia, quantidade, faturamento, origem, fonte_dado, lanc_status,
     id_confeccao, id_categoria, id_importacao)
    VALUES
    (DATE_FORMAT(p_mes_referencia, '%Y-%m-01'), p_quantidade, p_faturamento,
     'MANUAL', p_fonte_dado, 'ATIVO', p_id_confeccao, p_id_categoria, NULL);
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE atualizar_lancamento(
    IN p_id_lancamento INT,
    IN p_quantidade INT,
    IN p_faturamento DECIMAL(12,2),
    IN p_id_usuario INT
)
BEGIN
    IF (SELECT lanc_status FROM lancamento_mensal
        WHERE id_lancamento = p_id_lancamento) = 'CANCELADO' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Lancamento cancelado nao pode ser atualizado.';
    END IF;

    SET @id_usuario = p_id_usuario;
    UPDATE lancamento_mensal
    SET quantidade = p_quantidade,
        faturamento = p_faturamento
    WHERE id_lancamento = p_id_lancamento;
    SET @id_usuario = NULL;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE cancelar_lancamento(
    IN p_id_lancamento INT,
    IN p_id_usuario INT
)
BEGIN
    SET @id_usuario = p_id_usuario;
    UPDATE lancamento_mensal
    SET lanc_status = 'CANCELADO'
    WHERE id_lancamento = p_id_lancamento;
    SET @id_usuario = NULL;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE excluir_lancamento(
    IN p_id_lancamento INT,
    IN p_id_usuario INT
)
BEGIN
    SET @id_usuario = p_id_usuario;
    DELETE FROM lancamento_mensal
    WHERE id_lancamento = p_id_lancamento;
    SET @id_usuario = NULL;
END $$
DELIMITER ;

DROP TRIGGER IF EXISTS trg_historico_lancamento_update;
DROP TRIGGER IF EXISTS trg_historico_lancamento_delete;

DELIMITER $$
CREATE TRIGGER trg_historico_lancamento_update
AFTER UPDATE ON lancamento_mensal
FOR EACH ROW
BEGIN
    INSERT INTO historico_lancamento
    (id_lancamento, acao, origem, mes_referencia, id_confeccao, id_categoria,
     quantidade_antiga, faturamento_antigo, status_antigo,
     quantidade_nova, faturamento_novo, status_novo, id_usuario)
    VALUES
    (OLD.id_lancamento, 'UPDATE', OLD.origem, OLD.mes_referencia, OLD.id_confeccao, OLD.id_categoria,
     OLD.quantidade, OLD.faturamento, OLD.lanc_status,
     NEW.quantidade, NEW.faturamento, NEW.lanc_status, @id_usuario);
END $$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_historico_lancamento_delete
AFTER DELETE ON lancamento_mensal
FOR EACH ROW
BEGIN
    INSERT INTO historico_lancamento
    (id_lancamento, acao, origem, mes_referencia, id_confeccao, id_categoria,
     quantidade_antiga, faturamento_antigo, status_antigo, id_usuario)
    VALUES
    (OLD.id_lancamento, 'DELETE', OLD.origem, OLD.mes_referencia, OLD.id_confeccao, OLD.id_categoria,
     OLD.quantidade, OLD.faturamento, OLD.lanc_status, @id_usuario);
END $$
DELIMITER ;

CREATE OR REPLACE VIEW vw_historico_lancamento AS
SELECT h.id_historico,
       h.data_alteracao,
       h.acao,
       h.origem,
       h.id_lancamento,
       h.mes_referencia,
       h.id_confeccao,
       c.nome AS confeccao,
       ci.nome AS cidade,
       ci.uf,
       h.id_categoria,
       cat.nome AS categoria,
       h.quantidade_antiga,
       h.quantidade_nova,
       h.quantidade_nova - h.quantidade_antiga AS diferenca_quantidade,
       h.faturamento_antigo,
       h.faturamento_novo,
       h.faturamento_novo - h.faturamento_antigo AS diferenca_faturamento,
       h.status_antigo,
       h.status_novo,
       h.id_usuario,
       COALESCE(u.nome, 'Nao identificado') AS usuario
FROM historico_lancamento h
LEFT JOIN confeccao c   ON h.id_confeccao = c.id_confeccao
LEFT JOIN cidade ci     ON c.id_cidade = ci.id_cidade
LEFT JOIN categoria cat ON h.id_categoria = cat.id_categoria
LEFT JOIN usuario u     ON h.id_usuario = u.id_usuario;

DROP PROCEDURE IF EXISTS relatorio_historico_periodo;
DROP PROCEDURE IF EXISTS relatorio_alteracoes_por_usuario;
DROP PROCEDURE IF EXISTS relatorio_alteracoes_por_confeccao;

DELIMITER $$
CREATE PROCEDURE relatorio_historico_periodo(
    IN p_inicio DATE,
    IN p_fim DATE,
    IN p_origem VARCHAR(10)
)
BEGIN
    SELECT data_alteracao, acao, origem, id_lancamento, mes_referencia,
           confeccao, categoria,
           quantidade_antiga, quantidade_nova,
           faturamento_antigo, faturamento_novo, diferenca_faturamento,
           status_antigo, status_novo, usuario
    FROM vw_historico_lancamento
    WHERE data_alteracao >= p_inicio
      AND data_alteracao < p_fim + INTERVAL 1 DAY
      AND (p_origem IS NULL OR origem = p_origem)
    ORDER BY data_alteracao DESC, id_historico DESC;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE relatorio_alteracoes_por_usuario(
    IN p_inicio DATE,
    IN p_fim DATE,
    IN p_origem VARCHAR(10)
)
BEGIN
    SELECT usuario,
           COUNT(*) AS total_alteracoes,
           SUM(acao = 'UPDATE' AND status_novo = status_antigo) AS correcoes,
           SUM(acao = 'UPDATE' AND status_novo = 'CANCELADO' AND status_antigo = 'ATIVO') AS cancelamentos,
           SUM(acao = 'DELETE') AS exclusoes,
           SUM(CASE WHEN acao = 'DELETE' OR (status_antigo = 'ATIVO' AND status_novo = 'CANCELADO')
                    THEN -faturamento_antigo
                    ELSE diferenca_faturamento END) AS impacto_faturamento,
           MAX(data_alteracao) AS ultima_alteracao
    FROM vw_historico_lancamento
    WHERE data_alteracao >= p_inicio
      AND data_alteracao < p_fim + INTERVAL 1 DAY
      AND (p_origem IS NULL OR origem = p_origem)
    GROUP BY id_usuario, usuario
    ORDER BY total_alteracoes DESC;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE relatorio_alteracoes_por_confeccao(
    IN p_inicio DATE,
    IN p_fim DATE,
    IN p_origem VARCHAR(10)
)
BEGIN
    SELECT confeccao,
           cidade,
           uf,
           COUNT(*) AS total_alteracoes,
           COUNT(DISTINCT id_lancamento) AS lancamentos_alterados,
           SUM(acao = 'UPDATE' AND status_novo = status_antigo) AS correcoes,
           SUM(acao = 'UPDATE' AND status_novo = 'CANCELADO' AND status_antigo = 'ATIVO') AS cancelamentos,
           SUM(acao = 'DELETE') AS exclusoes,
           SUM(CASE WHEN acao = 'DELETE' OR (status_antigo = 'ATIVO' AND status_novo = 'CANCELADO')
                    THEN -faturamento_antigo
                    ELSE diferenca_faturamento END) AS impacto_faturamento
    FROM vw_historico_lancamento
    WHERE data_alteracao >= p_inicio
      AND data_alteracao < p_fim + INTERVAL 1 DAY
      AND (p_origem IS NULL OR origem = p_origem)
    GROUP BY id_confeccao, confeccao, cidade, uf
    ORDER BY total_alteracoes DESC;
END $$
DELIMITER ;
