# feat(cenarios): integrar simulação de 0 a 100% e cenários salvos

**Prioridade:** Alta  
**Relações/dependências:** Depende de `/api/cenarios` e `/api/cenarios/simular`; relaciona-se à issue #4.

## Objetivo
Completar a simulação hipotética e permitir salvar/consultar cenários no servidor.

## Critérios de aceite
- [ ] Permitir percentual entre 0% e 100%, inclusive.
- [ ] Validar a entrada e explicar o significado do percentual.
- [ ] Enviar os parâmetros conforme o contrato oficial.
- [ ] Exibir faturamento-base, valor hipotético, diferença em R$ e diferença percentual.
- [ ] Mostrar fórmula e período utilizados.
- [ ] Salvar cenário nomeado via POST `/api/cenarios`.
- [ ] Listar cenários salvos via GET `/api/cenarios`.
- [ ] Tratar erro, vazio e carregamento.
- [ ] Exibir aviso de que o resultado é hipótese matemática, não previsão.
- [ ] Não sugerir acesso a dados privados de concorrentes.

---
**Nota para publicação:** revisar com a equipe/professor, confirmar contrato atual do Back-end e atribuir labels/responsável no GitHub. O identificador deste arquivo é temporário; o GitHub atribuirá o número oficial.
