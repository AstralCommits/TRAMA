# Relatório técnico — TRAMA Front-end reorganizado

## Base analisada

- Front-end: `TRAMA-FRONTEND-DEVELOP-ATUALIZADO.zip` recebido nesta conversa.
- Back-end: `Back-end-develop.zip` recebido nesta conversa.
- Requisitos: SRS da TRAMA no formato IEEE 830, também fornecido nesta conversa.
- Stack: React 19, TypeScript, React Router, Axios, CSS próprio; Back-end separado em Java/Spring Boot.

## Objetivo

Ampliar a área demonstrativa sem perder a simplicidade de navegação. Foram priorizadas análises comerciais, relatórios melhores, identidade da organização, gestão de equipe e permissões de visualização por módulo. A proposta original de inteligência de vendas foi mantida; a TRAMA não foi transformada em marketplace nem em ERP genérico.

## Arquivos criados

- `apps/web/src/home/organization.tsx`: criação/perfil de organização, imagem da empresa, contas de equipe, cargos e permissões locais.
- `apps/web/src/home/reports.tsx`: relatórios filtráveis, ranking por produto, análise por categoria, CSV e impressão/PDF pelo navegador.
- `apps/web/src/home/market-comparison.tsx`: comparação demonstrativa com referências sintéticas e simulador de impacto.
- `apps/web/src/home/settings.tsx`: preferências locais e exportação de cópia JSON sem credenciais.
- `apps/web/src/lib/image.client.ts`: redimensionamento/compressão de imagens no navegador.
- `apps/web/src/lib/workspace-modules.ts`: lista compartilhada de módulos, disponível no SSR e no navegador.

## Arquivos modificados

- `apps/web/src/home/workspace.tsx`: navegação reorganizada em grupos, filtro de módulos por permissões, atalhos na página inicial e novas telas conectadas.
- `apps/web/src/home/demo-entry.tsx`: layout de acesso e cadastro redesenhado, com hierarquia visual e descrição mais clara dos modos.
- `apps/web/src/home/profile-dialog.tsx`: inclusão de foto de perfil.
- `apps/web/src/lib/auth.client.ts`: modelo de organização/usuário, criação de organização, contas locais de equipe, autenticação dessas contas, promoção a administrador e atribuição de módulos.
- `apps/web/src/data/demo.ts`: rótulos atualizados dos módulos.
- `apps/web/src/index.css`: estilos responsivos para as telas novas e ajustes da plataforma.
- `apps/web/src/routes/home.tsx`: descrição institucional atualizada.
- `package.json`: scripts raiz direcionados diretamente a `apps/web`, evitando envolver o processo único do servidor em `concurrently`.
- `README.md`: instalação, navegação, funcionalidades e limitações locais documentadas.
- `docs/BACKLOG-ISSUES-TRAMA-REVISADO.md`: backlog e rascunhos de novas issues.
- `docs/REGISTRO-ATUALIZACAO-DEVELOP.md`: registro da entrega e instruções para atualização direta da branch.

## Funcionalidades implementadas no protótipo

1. Navegação agrupada: Início, Minhas vendas, Meus produtos, Indicadores, Tendências, Comparar mercado, Relatórios, Organização e equipe e Configurações.
2. Criação de organização: nome, cidade e imagem/logo; conta criadora vira administrador principal.
3. Equipe: cadastro local de funcionários e administradores com e-mail e senha inicial.
4. Permissões de funcionário: seleção de módulos visíveis para cada pessoa.
5. Promoção: o administrador principal pode mudar funcionário para Administrador; administradores não podem promover outras pessoas nem remover o dono.
6. Perfil pessoal: foto de perfil com redimensionamento antes de armazenar.
7. Comparação regional: referências fictícias identificadas como demonstrativas; não há alegação de acesso a dados comerciais de terceiros.
8. Relatórios: filtros por período/categoria, indicadores, ranking, tabela, exportação CSV e impressão do navegador.
9. Configurações: preferências locais e exportação JSON sem hashes de senha.
10. Acesso/cadastro: modal em duas áreas visuais, textos mais objetivos, rolagem corrigida em telas pequenas e suporte a autenticação de contas de equipe criadas localmente.
11. Convites locais: código de oito caracteres gerado para a organização; administrador copia ou renova, e a nova conta pode ingressar como Funcionário pelo fluxo Código da empresa.
12. Indicadores: query `inicio`/`fim` AAAA-MM e resposta tipada conforme o DTO real; tendências agrupadas por categoria usam GET `/api/categorias` mais consultas filtradas por `categoriaId` no endpoint de indicadores.

## Regras de acesso no protótipo

- Administrador principal: controle da organização, criação/remoção de membros, edição de cargos e promoção para Administrador.
- Administrador: acesso aos módulos de trabalho e consulta da organização; não pode alterar cargos ou remover membros.
- Funcionário: vê apenas os módulos liberados pelo administrador principal.
- O administrador principal não pode ser rebaixado ou removido pela tela.

Para testar uma conta de funcionário no mesmo navegador, o administrador principal deve criar o cadastro de equipe, sair e entrar com o e-mail/senha inicial cadastrados. Após alterar o cargo ou permissões de uma conta, o membro deve sair e entrar novamente para carregar o novo perfil.

## Limitações do Back-end e riscos conhecidos

A análise do Back-end enviado encontrou login JWT e endpoints de vendas, indicadores, categorias, cidades, confecções, importações e cenários, mas não encontrou endpoints/tabelas para organização multiempresa e equipe. Portanto, organização, contas de funcionário, papéis, permissões e fotos desta atualização são **locais/demonstrativos**.

A filtragem de módulos ocorre na interface e não protege endpoints. Não utilizar este modelo local como controle de acesso em produção. Para produção, implementar no Back-end:

- organização/tenant e vínculo obrigatório entre organização, membros e dados comerciais;
- convite/cadastro de membros e vínculo de autenticação;
- papéis e permissões guardados no banco e verificados em cada endpoint;
- autorização por organização para vendas, categorias, relatórios e cenários;
- atualização de perfil e upload seguro de logo/foto;
- auditoria de promoção/rebaixamento, remoção e alterações de permissões.

A comparação regional usa números sintéticos embutidos para ilustrar o conceito. Ela não consulta concorrentes reais, dados públicos nem bases de mercado. Uma comparação real exige fonte legítima, metodologia, recorte temporal e anonimização adequados.

O contrato de indicadores foi corrigido. A diferença entre o formulário de venda (produto, quantidade, preço e data) e o DTO mensal do Back-end permanece: o front não envia esses campos diretamente para evitar gravações incompatíveis. O CSV atual continua sendo prévia/importação local, não a chamada multipart da API. Cadastro remoto, perfil e equipe também continuam sem endpoints no Back-end.

## Testes e validação

- Inspeção dos ZIPs do Front-end, Back-end e SRS.
- Verificação estática da árvore e dos contratos existentes no Back-end.
- Inspeção estática dos arquivos alterados e conferência dos DTOs/controllers usados pelos serviços.
- Análise de sintaxe/transpilação dos 101 arquivos TypeScript/TSX e análise sintática de `index.css`, sem erros.
- `npm ci` expirou durante a instalação neste ambiente; não ficaram dependências suficientes para executar `typecheck`, `lint` ou `build`.
- O runtime disponível aqui é Node `22.16.0`, abaixo do requisito `22.22.0`; o computador de desenvolvimento informado usa Node `26.13.0`. A validação completa deve ser executada nessa máquina antes de atualizar a branch de destino.
- Testes visuais, responsivos, fluxo de criação de organização, login de funcionário e promoção precisam ser executados no navegador local antes de atualizar a branch de destino.

## O que foi preservado

- Site institucional, header e identidade visual TRAMA existentes.
- Componentes de vendas, indicadores e tendências que já estavam implementados.
- Cliente Axios e fluxo de login JWT já criado.
- Identidade visual regional, logotipo, header e componentes base.
- Dependências já declaradas; esta atualização não requer novo pacote npm.
