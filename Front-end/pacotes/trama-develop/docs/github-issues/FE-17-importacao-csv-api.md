# feat(importacao): integrar pré-validação CSV ao backend

**Prioridade:** Alta  
**Relações/dependências:** Depende do layout CSV oficial e de `/api/importacoes`; relaciona-se às issues #5 e #17.

## Objetivo
Transformar a prévia CSV local em um fluxo de importação confirmado pelo servidor.

## Critérios de aceite
- [ ] Disponibilizar modelo CSV compatível com o DTO vigente.
- [ ] Validar arquivo vazio, extensão, cabeçalhos, campos, tipos e valores.
- [ ] Exibir prévia com linhas válidas e inválidas antes do envio.
- [ ] Enviar `multipart/form-data` usando o campo `arquivo`.
- [ ] Exibir resultado confirmado pelo servidor e erros por linha, quando retornados.
- [ ] Consultar histórico via GET `/api/importacoes`.
- [ ] Evitar duplicidade conforme regra oficial.
- [ ] Não mostrar importação concluída antes da resposta da API.
- [ ] Distinguir erro de validação local de erro retornado pelo servidor.

## Fora do escopo
Salvar apenas no navegador e apresentar isso como importação concluída no Back-end.

---
**Nota para publicação:** revisar com a equipe/professor, confirmar contrato atual do Back-end e atribuir labels/responsável no GitHub. O identificador deste arquivo é temporário; o GitHub atribuirá o número oficial.
