# feat(auth): implementar organizações, membros e autorização no backend

**Prioridade:** Planejamento / Alta se multiusuário for aprovado  
**Relações/dependências:** Issue coordenada com o repositório Back-end; dependência crítica para FE-31.

## Objetivo
Implementar persistência e autorização real de usuários, organizações e permissões no servidor.

## Contexto
A implementação atual de organização/equipe/convite é local e controla principalmente a navegação. Isso não protege endpoints.

## Escopo mínimo do Back-end
- [ ] Modelo de organização/tenant e vínculo entre usuário e organização.
- [ ] Convites com token aleatório, expiração, uso único e invalidação.
- [ ] Papéis e permissões persistidos no banco.
- [ ] Autorização em cada endpoint, além da autenticação JWT.
- [ ] Isolamento por organização em vendas, categorias, relatórios e cenários.
- [ ] Política de criação, promoção, remoção e recuperação de conta.
- [ ] Auditoria das mudanças administrativas.
- [ ] Testes impedindo acesso cruzado entre organizações.

## Observação
Esta issue deve ser criada no repositório Back-end ou dividida em tarefas de backend. Não resolver apenas ocultando botões no React.


## Repositório de destino
Esta é uma tarefa de Back-end ou coordenada com o repositório Back-end. Não deve ser publicada como implementação exclusiva do Front-end. A FE-31 depende da autorização real que esta tarefa (ou equivalente) disponibilizar.


---
**Nota para publicação:** revisar com a equipe/professor, confirmar contrato atual do Back-end e atribuir labels/responsável no GitHub. O identificador deste arquivo é temporário; o GitHub atribuirá o número oficial.
