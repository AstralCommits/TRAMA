# feat(confeccoes): integrar cadastro e manutenção de confecções

**Prioridade:** Alta  
**Relações/dependências:** Depende de `/api/confeccoes` e `/api/cidades`; relaciona-se às issues #5, #17 e à reformulação de #18.

## Objetivo
Disponibilizar o cadastro e a consulta das confecções que pertencem ao domínio da TRAMA.

## Contexto
A tela local de Organização e equipe não substitui o cadastro de confecção no Back-end. O SRS e os contratos devem definir os campos obrigatórios; não presumir CNPJ obrigatório sem decisão formal.

## Critérios de aceite
- [ ] Listar confecções retornadas pela API.
- [ ] Criar/editar/excluir somente se o Back-end oferecer essas operações.
- [ ] Usar IDs retornados pelo servidor nos registros de venda.
- [ ] Selecionar cidade a partir de `/api/cidades` ou lista oficial acordada.
- [ ] Validar nome, cidade e demais campos conforme contrato.
- [ ] Tratar duplicidade, vínculos e erros do servidor.
- [ ] Restringir operações administrativas conforme autorização do Back-end.
- [ ] Não confundir perfil local da organização com registro oficial de confecção.

## Fora do escopo
Cadastro corporativo genérico, CNPJ obrigatório sem requisito e dados de marketplace.


## Relação com a issue antiga #18
A issue #18 está aberta e descreve cadastro corporativo com CNPJ. A recomendação é **reescrever a própria #18** para cadastro de confecção, usando os campos suportados pelo Back-end. Este arquivo FE-14 é uma descrição alternativa pronta para essa reformulação. Não abra FE-14 como issue separada se a #18 for reaproveitada.


---
**Nota para publicação:** revisar com a equipe/professor, confirmar contrato atual do Back-end e atribuir labels/responsável no GitHub. O identificador deste arquivo é temporário; o GitHub atribuirá o número oficial.
