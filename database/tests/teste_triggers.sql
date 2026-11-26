USE confeccoes;

CALL inserir_lancamento('2026-03-15', 360, 25200.00, 4, 4, 'ENTREVISTA');
SET @id_novo = LAST_INSERT_ID();
SELECT * FROM lancamento_mensal WHERE id_lancamento = @id_novo;
CALL atualizar_lancamento(10, 350, 24500.00, 5);
CALL cancelar_lancamento(8, 4);
CALL excluir_lancamento(@id_novo, 1);
SELECT * FROM historico_lancamento;
