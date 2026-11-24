# feat(vendas): registrar origem de entrada e procedência dos dados

**Prioridade:** Crítica  
**Relações/dependências:** Depende da decisão e implementação FE-15; relaciona-se à issue #17.

## Objetivo
Registrar de forma rastreável como o lançamento entrou no sistema e de onde veio a informação comercial.

## Conceitos que não devem ser confundidos
- `origem`: meio de entrada do registro, por exemplo, manual ou importação (usar os valores exatos do enum do Back-end).
- `origemDado`: procedência da informação, por exemplo, entrevista, questionário ou fonte secundária (confirmar enum oficial).
- `nomeFonte`: identificação descritiva da fonte, quando exigida pelo contrato.

## Critérios de aceite
- [ ] Campos e opções correspondem ao contrato real do Back-end.
- [ ] A interface explica a diferença entre origem de entrada e procedência.
- [ ] Campos obrigatórios e limites são validados.
- [ ] Procedência aparece nos detalhes e relatórios quando disponível.
- [ ] Não coletar dados pessoais desnecessários de entrevistados.
- [ ] Importação e cadastro manual preenchem `origem` de forma consistente.
- [ ] Testes cobrem combinações válidas e inválidas.

---
**Nota para publicação:** revisar com a equipe/professor, confirmar contrato atual do Back-end e atribuir labels/responsável no GitHub. O identificador deste arquivo é temporário; o GitHub atribuirá o número oficial.
