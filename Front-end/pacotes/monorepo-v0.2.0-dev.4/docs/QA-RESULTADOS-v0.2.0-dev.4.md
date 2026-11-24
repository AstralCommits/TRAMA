# Resultados de QA — TRAMA v0.2.0-dev.4

## Verificações executadas nesta revisão

- `npm run qa:static`: verificação estrutural aprovada e **49/49 contratos estáticos** aprovados.
- Inventários: **19/19** issues internas FE-13 a FE-31 e **22/22** issues oficiais #1 a #22.
- TypeScript Compiler API: **104 arquivos TS/TSX, 0 erros de parsing** (não equivale a typecheck).
- Node `--check`: 5 arquivos JS/MJS, 0 erros.
- YAML: 6 arquivos, 0 erros.
- Schemas SQL principal e de referência têm SHA-256 idêntico.
- A decisão de escopo #17/#18 está documentada: marketplace fora do produto TRAMA; estados remotos não alterados.

Consulte `evidencias/` para as saídas utilizadas.

## Gates não aprovados / não executados

- Instalação limpa npm não concluiu devido a erro DNS ao consultar o registry; Node disponível v22.16.0, inferior ao requisito >=22.22.0.
- `npm run typecheck`: não inicia porque `react-router` não está instalado.
- `npm run lint`: não inicia porque `oxlint` não está instalado.
- `npm run build`: não inicia porque `react-router` não está instalado.
- `npm run verify:backend`: Maven ausente; o wrapper não conseguiu baixar Maven 3.9.9 porque `archive.apache.org` não resolveu no DNS.
- JUnit, MySQL/migrações reais, fluxos em browser, responsividade, impressão, leitor de tela e auditoria WCAG 2.1 AA ainda não foram executados.

## Interpretação

As 49 verificações são estáticas/contratuais. A leitura sintática não verifica tipos TypeScript, resolução de imports, compilação, runtime, execução de queries SQL ou renderização no navegador. Os testes Java adicionados não podem ser considerados aprovados antes de executar a suíte Maven.

## Conclusão

O pacote está melhorado e passou nas verificações estáticas disponíveis, mas **não está liberado como 100% pronto**. A aprovação depende dos gates de instalação, typecheck, lint, build, Maven/JUnit, MySQL e browser descritos em `QA-REVISAO-FINAL-2026-11-23.md`.
