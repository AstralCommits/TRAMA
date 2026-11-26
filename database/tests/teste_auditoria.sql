USE confeccoes;

SELECT * FROM vw_historico_lancamento;
CALL relatorio_historico_periodo(CURDATE(), CURDATE(), NULL);
CALL relatorio_historico_periodo(CURDATE(), CURDATE(), 'MANUAL');
CALL relatorio_alteracoes_por_usuario(CURDATE(), CURDATE(), NULL);
CALL relatorio_alteracoes_por_confeccao(CURDATE(), CURDATE(), 'MANUAL');
