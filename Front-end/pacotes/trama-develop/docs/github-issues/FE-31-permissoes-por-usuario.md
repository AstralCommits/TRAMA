# feat(auth): centralizar permissões e configurar acessos individuais

**Prioridade:** Alta  
**Relações/dependências:** Nova necessidade; depende de decisão de produto e contrato de autorização do Back-end. Relaciona-se a #8 e FE-29.

## Objetivo
Permitir que a administração configure, de forma clara e consistente, o que cada usuário pode visualizar e executar na TRAMA.

## Estado observado
A tela Organização e equipe já permite selecionar módulos para funcionários, e `workspace.tsx` filtra itens de navegação. Entretanto, os dados ficam no navegador e as permissões são baseadas em rótulos de módulos. Isso é protótipo de interface, não controle de segurança de produção.

## Proposta técnica
- Definir chaves estáveis no código, por exemplo `dashboard.read`, `sales.read`, `sales.create`, `sales.update`, `sales.delete`, `products.read`, `analytics.read`, `reports.read`, `reports.export`, `team.read`, `team.manage`, `settings.manage`.
- Separar papel (Administrador principal, Administrador, Funcionário) de permissões específicas.
- Definir matriz padrão por papel e permitir exceções individuais aprovadas.
- Usar uma função central `can(user, permission)`/equivalente para controlar navegação, páginas, botões e ações.
- Negar por padrão quando a permissão não estiver explicitamente concedida.
- Atualizar a interface imediatamente após salvar e refletir a alteração na sessão.
- Manter as permissões locais identificadas como demonstração até integração com servidor.

## Critérios de aceite do Front-end
- [ ] Existe catálogo central de permissões com chaves estáveis, descrição e módulo relacionado.
- [ ] Papéis padrão são definidos em um único lugar.
- [ ] Administrador principal não pode ser removido/rebaixado por usuário comum.
- [ ] Administrador e funcionário têm permissões conforme matriz aprovada.
- [ ] Administrador principal pode alterar permissões individuais quando permitido pela política.
- [ ] A tela explica a consequência de cada permissão em linguagem simples.
- [ ] Navegação, rota e ações respeitam o mesmo catálogo central.
- [ ] Acesso negado tem mensagem clara e não deixa conteúdo protegido visível.
- [ ] A interface não trata armazenamento local como autorização segura.
- [ ] Testes unitários cobrem matriz padrão, exceções e negação por padrão.

## Dependência obrigatória para produção
- [ ] Back-end retorna permissões efetivas do usuário ou endpoint equivalente.
- [ ] Back-end valida a permissão em cada endpoint e operação.
- [ ] Back-end valida vínculo do usuário com a organização dos dados.
- [ ] Alterações de papel/permissão são persistidas e auditadas.
- [ ] Testes provam que chamar a API diretamente não contorna as permissões.

## Fora do escopo
Confiar apenas em ocultar botões, usar nome do módulo como chave de permissão ou salvar permissões de produção exclusivamente em `localStorage`.


## Limite de segurança e dependência
A configuração na interface e a filtragem de menu/rotas melhoram a experiência, mas não impedem chamadas diretas à API. Para produção, esta tarefa depende da FE-29 ou de uma implementação equivalente no Back-end que valide cada operação e o vínculo do usuário com a organização.


---
**Nota para publicação:** revisar com a equipe/professor, confirmar contrato atual do Back-end e atribuir labels/responsável no GitHub. O identificador deste arquivo é temporário; o GitHub atribuirá o número oficial.
