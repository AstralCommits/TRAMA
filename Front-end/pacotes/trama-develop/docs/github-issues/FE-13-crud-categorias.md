# feat(categorias): integrar CRUD administrativo de categorias

**Prioridade:** Alta  
**Relações/dependências:** Integração com `/api/categorias`; relaciona-se às issues #5 e #17.

## Objetivo
Permitir consultar e administrar as categorias utilizadas nos registros de vendas, utilizando o Back-end como fonte oficial.

## Contexto
A TRAMA analisa vendas por categoria. A lista de categorias não deve ser mantida apenas em arrays locais na versão integrada.

## Escopo
- Listar categorias da API.
- Cadastrar, editar e excluir quando os métodos estiverem disponíveis no controller.
- Validar nome e duplicidade conforme as regras reais do Back-end/SRS.
- Atualizar filtros e análises após alterações confirmadas.

## Critérios de aceite
- [ ] A listagem usa a API e distingue carregamento, vazio e erro.
- [ ] Criar/editar/excluir usa os métodos realmente suportados pelo Back-end.
- [ ] Campos obrigatórios e limites seguem o contrato oficial.
- [ ] Nome duplicado e erros 400 são apresentados em linguagem simples.
- [ ] Ações de escrita são exibidas apenas a usuários autorizados.
- [ ] A interface não declara sucesso antes da resposta positiva do servidor.
- [ ] Filtros de vendas, indicadores e relatórios refletem as categorias atualizadas.

## Fora do escopo
Criar categorias fictícias em produção ou incluir filtros de técnica artesanal/catálogo.

## Dependências
Confirmar contrato, permissões e métodos disponíveis em `/api/categorias`.

---
**Nota para publicação:** revisar com a equipe/professor, confirmar contrato atual do Back-end e atribuir labels/responsável no GitHub. O identificador deste arquivo é temporário; o GitHub atribuirá o número oficial.
