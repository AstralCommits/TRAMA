USE confeccoes;

SELECT cidade,
       SUM(faturamento) AS faturamento_total,
       SUM(quantidade)  AS quantidade_total
FROM vw_lancamentos
GROUP BY cidade
ORDER BY faturamento_total DESC;

SELECT categoria,
       SUM(faturamento) AS faturamento_total,
       SUM(quantidade)  AS quantidade_total
FROM vw_lancamentos
GROUP BY categoria
ORDER BY faturamento_total DESC;

SELECT mes_referencia,
       SUM(faturamento) AS faturamento_total
FROM vw_lancamentos
GROUP BY mes_referencia
ORDER BY mes_referencia;

SELECT confeccao,
       SUM(faturamento) AS faturamento_total,
       SUM(quantidade)  AS quantidade_total
FROM vw_lancamentos
GROUP BY id_confeccao, confeccao
HAVING SUM(faturamento) > 50000
ORDER BY faturamento_total DESC;

SELECT * FROM vw_lancamentos
ORDER BY cidade, confeccao, mes_referencia;

SELECT c.nome AS confeccao, ci.nome AS cidade, ci.uf, u.nome AS usuario, u.email
FROM confeccao c
INNER JOIN cidade ci ON c.id_cidade = ci.id_cidade
LEFT JOIN usuario u  ON c.id_confeccao = u.id_confeccao;

SELECT cat.nome AS categoria, l.id_lancamento, l.faturamento
FROM categoria cat
LEFT JOIN lancamento_mensal l ON cat.id_categoria = l.id_categoria;

SELECT i.id_importacao, i.nome_arquivo, i.data_importacao, i.qtd_linhas,
       i.imp_status, u.nome AS usuario, c.nome AS confeccao
FROM importacao i
INNER JOIN usuario u   ON i.id_usuario = u.id_usuario
LEFT JOIN confeccao c  ON u.id_confeccao = c.id_confeccao;

SELECT r.id_relatorio, r.tipo, r.periodo_inicio, r.periodo_fim,
       u.nome AS usuario, cc.nome AS cenario
FROM relatorio r
INNER JOIN usuario u                ON r.id_usuario = u.id_usuario
LEFT JOIN cenario_concorrencia cc   ON r.id_cenario = cc.id_cenario;

SELECT e.id_entrevista, e.data, c.nome AS confeccao, ci.nome AS cidade, ci.uf,
       cat.nome AS categoria_percebida, e.achou_algo_novo, e.resumo
FROM entrevista e
INNER JOIN confeccao c   ON e.id_confeccao = c.id_confeccao
INNER JOIN cidade ci     ON c.id_cidade = ci.id_cidade
LEFT JOIN categoria cat  ON e.id_categoria_percebida = cat.id_categoria
ORDER BY e.data;

SELECT cc.nome AS cenario, cc.percentual_impacto,
       cat.nome AS categoria, u.nome AS usuario
FROM cenario_concorrencia cc
INNER JOIN usuario u    ON cc.id_usuario = u.id_usuario
LEFT JOIN categoria cat ON cc.id_categoria = cat.id_categoria
ORDER BY cc.percentual_impacto DESC;

SELECT cat.nome AS categoria, ci.nome AS cidade, ir.variacao_percentual, ir.tendencia
FROM item_relatorio ir
INNER JOIN categoria cat ON ir.id_categoria = cat.id_categoria
LEFT JOIN cidade ci      ON ir.id_cidade = ci.id_cidade
ORDER BY ir.tendencia, ir.variacao_percentual DESC;

-- DB-04: vendas por polo regional
SELECT * FROM vw_vendas_polo_regional
ORDER BY faturamento_total DESC;

SELECT SUM(faturamento_total) AS faturamento_polos,
       SUM(volume_itens)      AS itens_polos,
       SUM(qtd_lancamentos)   AS lancamentos_polos
FROM vw_vendas_polo_regional;

SHOW INDEX FROM confeccao;
SHOW INDEX FROM lancamento_mensal;

EXPLAIN SELECT * FROM vw_vendas_polo_regional;

EXPLAIN ANALYZE SELECT * FROM vw_vendas_polo_regional;

-- DB-04: teste de desempenho da view vw_vendas_polo_regional
DROP PROCEDURE IF EXISTS teste_desempenho_polo_regional;

DELIMITER $$
CREATE PROCEDURE teste_desempenho_polo_regional()
BEGIN
    DECLARE v_idx INT;
    DECLARE v_cidades INT;
    DECLARE v_linhas INT;
    DECLARE v_fat_view DECIMAL(14,2);
    DECLARE v_lanc_view INT;
    DECLARE v_fat_base DECIMAL(14,2);
    DECLARE v_lanc_base INT;
    DECLARE v_inicio DATETIME(6);
    DECLARE v_micro BIGINT;

    SELECT COUNT(*) INTO v_idx
    FROM information_schema.statistics
    WHERE table_schema = 'confeccoes'
      AND ((table_name = 'confeccao'          AND index_name = 'idx_confeccao_cidade')
        OR (table_name = 'lancamento_mensal'  AND index_name = 'idx_lancamento_mes_categoria'))
      AND seq_in_index = 1;

    SELECT COUNT(*) INTO v_cidades FROM cidade;

    SET v_inicio = NOW(6);
    SELECT COUNT(*), SUM(faturamento_total), SUM(qtd_lancamentos)
      INTO v_linhas, v_fat_view, v_lanc_view
    FROM vw_vendas_polo_regional;
    SET v_micro = TIMESTAMPDIFF(MICROSECOND, v_inicio, NOW(6));

    SELECT SUM(faturamento), COUNT(*) INTO v_fat_base, v_lanc_base
    FROM lancamento_mensal WHERE lanc_status = 'ATIVO';

    SELECT
        IF(v_idx = 2, 'OK', 'FALHA')                         AS indices_presentes,
        IF(v_linhas = v_cidades, 'OK', 'FALHA')              AS um_registro_por_municipio,
        IF(v_fat_view = v_fat_base, 'OK', 'FALHA')           AS faturamento_confere,
        IF(v_lanc_view = v_lanc_base, 'OK', 'FALHA')         AS lancamentos_conferem,
        IF(v_micro < 100000, 'OK', 'FALHA')                  AS resposta_abaixo_de_100ms,
        v_micro                                              AS tempo_microsegundos;
END $$
DELIMITER ;

CALL teste_desempenho_polo_regional();
DROP PROCEDURE teste_desempenho_polo_regional;
