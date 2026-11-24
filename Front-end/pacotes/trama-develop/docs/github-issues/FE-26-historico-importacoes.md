# feat(importacao): exibir histórico e detalhes de importações

**Prioridade:** Média  
**Relações/dependências:** Depende de GET `/api/importacoes` e do formato de resposta.

## Objetivo
Permitir consultar importações anteriores sem duplicar a tela de cadastro de vendas.

## Critérios de aceite
- [ ] Listar arquivo, data, status e totais retornados pelo servidor.
- [ ] Mostrar erros por linha quando a API fornecer esses detalhes.
- [ ] Diferenciar processamento, concluído e falha conforme enum oficial.
- [ ] Filtrar histórico por período/status se suportado.
- [ ] Não inventar campos que a API não retorna.

---
**Nota para publicação:** revisar com a equipe/professor, confirmar contrato atual do Back-end e atribuir labels/responsável no GitHub. O identificador deste arquivo é temporário; o GitHub atribuirá o número oficial.
