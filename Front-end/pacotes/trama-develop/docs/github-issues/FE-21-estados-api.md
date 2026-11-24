# feat(api): padronizar carregamento, erros e sessão expirada

**Prioridade:** Alta  
**Relações/dependências:** Relaciona-se às issues #8 e #17.

## Objetivo
Padronizar feedback de todas as telas que consomem a API.

## Critérios de aceite
- [ ] Estado de carregamento por seção/ação.
- [ ] Estado vazio com orientação útil.
- [ ] Erros de validação 400 com mensagens compreensíveis.
- [ ] 401 encerra/renova sessão conforme estratégia oficial e retorna ao acesso.
- [ ] 403 informa falta de autorização sem revelar dados.
- [ ] Falha de rede oferece nova tentativa quando segura.
- [ ] Operações mutáveis não são repetidas automaticamente sem idempotência.
- [ ] Sucesso só é informado após confirmação do servidor.
- [ ] Logs não expõem token, senha ou dados comerciais sensíveis.

---
**Nota para publicação:** revisar com a equipe/professor, confirmar contrato atual do Back-end e atribuir labels/responsável no GitHub. O identificador deste arquivo é temporário; o GitHub atribuirá o número oficial.
