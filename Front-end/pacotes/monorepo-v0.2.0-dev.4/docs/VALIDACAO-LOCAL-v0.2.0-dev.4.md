# Guia de validação local — TRAMA v0.2.0-dev.4

## Requisitos

- Node.js 22.22.0 ou superior (confirmar com `node --version`).
- Java 21 (confirmar com `java -version`).
- Acesso ao npm registry na primeira instalação e ao Apache Maven para o Maven Wrapper.
- MySQL 8 em uma base de teste/staging para validar o dialeto, constraints e migrações reais.
- Navegador Chromium/Chrome ou Firefox para os testes de interface.

## 1. Instalação e validação do Front-end

Na raiz do monorepositório, execute nesta ordem:

```powershell
npm ci --prefix Frontend
npm run qa:static
npm run typecheck
npm run lint
npm run build
```

`qa:static` valida a árvore, o inventário de issues e os contratos estáticos. Ele não substitui o typecheck, lint, build ou testes E2E.

## 2. Testes completos do Back-end

Na raiz:

```powershell
npm run verify:backend
```

Ou diretamente:

```powershell
cd .\Back-end
.\mvnw.cmd --batch-mode --no-transfer-progress clean verify
```

Guarde e confira `Back-end/target/surefire-reports`. Os testes atuais usam H2 em modo compatível com MySQL; eles não substituem validação com servidor MySQL real.

## 3. Matriz de integração HTTP

Use uma base e contas de teste. Para cada erro, confirme que a interface mostra uma mensagem compreensível, mantém os dados digitados quando apropriado e não repete automaticamente operações de gravação: 

| Caso | Como provocar em ambiente de teste | Resultado esperado |
|---|---|---|
| 400 / 422 | Enviar formulário com campo inválido pela interface/API de teste | Mensagem de validação e correção indicada |
| 401 | Fazer chamada protegida sem token ou com token expirado | Sessão inválida é comunicada; token expirado é removido e login volta a ser necessário |
| 403 | Acessar função sem permissão | Ação negada, sem alterar dados |
| 404 | Consultar identificador inexistente | Mensagem de registro não encontrado |
| 409 | Tentar duplicar lançamento mensal/confecção/categoria | Conflito informado; nenhum duplicado é criado |
| 413 | Enviar CSV acima do limite configurado | Arquivo recusado com orientação |
| 429 | Exceder limite de solicitações em ambiente de teste | Orientação para aguardar |
| 5xx | Simular indisponibilidade/erro interno no ambiente de teste | Mensagem genérica segura; sem detalhes internos sensíveis |
| Timeout/rede | Interromper a API ou conexão | Mensagem de conexão/tempo excedido; sem retry automático de escrita |

## 4. Banco de Dados MySQL

1. Faça backup da base de teste.
2. Leia `Banco-de-Dados/README.md` e `Back-end/database/README.md`.
3. Aplique schema e migrações somente em base descartável/staging.
4. Execute `SHOW TABLES`, `SHOW COLUMNS` e confirme constraints, índices e FKs.
5. Teste com duas confecções distintas, um perfil ADMIN, dois empresários e um FUNCIONARIO.
6. Confirme que usuário de uma confecção não lê nem altera dados de outra, mesmo adulterando IDs na requisição.
7. Não execute scripts de recriação ou `DROP DATABASE` em base com dados reais.

## 5. Fluxos ponta a ponta no navegador

- Cadastro, login, sessão atual, logout e expiração de JWT.
- CRUD de categorias e confecções, observando perfil autorizado.
- Criar, editar, cancelar e consultar lançamentos agregados por confecção/categoria/mês.
- Importar CSV válido, inválido, vazio, duplicado e com outra confecção; confirmar atomicidade e histórico.
- Conferir indicadores, tendências e filtros com valores calculados diretamente no MySQL.
- Criar, editar, excluir e simular cenários; confirmar que os resultados são apresentados como hipóteses, nunca previsões.
- Salvar filtros com dois usuários e confirmar isolamento após sair e entrar novamente.
- Gerar, aceitar, expirar e revogar convite; confirmar uso único e permissões do funcionário.
- Exportar CSV, conferir acentos, separador, filtros, totais e origem/procedência.
- Usar impressão/Salvar PDF, formato A4, margens, cabeçalho, totais e quebra de tabelas.

## 6. Responsividade e acessibilidade

- Conferir larguras 360, 390, 768, 1024 e 1440 px; zoom de 200%; não permitir rolagem horizontal da página toda.
- Navegar só com teclado: ordem do foco, foco visível, Tab/Shift+Tab, Escape quando permitido, retorno do foco ao controle que abriu o diálogo.
- Conferir diálogos durante operações em andamento: não fechar acidentalmente enquanto uma gravação estiver ocupada.
- Conferir nomes acessíveis de campos, botões, títulos, mensagens `role=alert` e `role=status`.
- Medir contraste de texto e componentes; testar ao menos um leitor de tela (NVDA ou VoiceOver) nas telas principais.
- Não declarar WCAG 2.1 AA sem auditoria dos critérios aplicáveis e registro dos resultados.

## 7. Gate para liberar commit/push

A liberação exige todos estes resultados aprovados: instalação limpa; `qa:static`; typecheck; lint; build; Maven `clean verify`; migrações e persistência MySQL; autorização com múltiplas contas; fluxos ponta a ponta; impressão/responsividade; teclado/leitor de tela/contraste. Registre versão, data, ambiente e evidência. Se qualquer etapa falhar ou não for executada, a entrega continua **não liberada**.

## 8. Limites de escopo

As partes de marketplace das issues oficiais #17/#18 estão fora do escopo confirmado do TRAMA; consulte `DECISAO-DE-ESCOPO-ISSUES-17-18.md`. Estoque, produção, pedidos, financeiro, CRM e agenda não devem ser tratados como persistência real enquanto não tiverem API própria integrada.
