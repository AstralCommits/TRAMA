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
