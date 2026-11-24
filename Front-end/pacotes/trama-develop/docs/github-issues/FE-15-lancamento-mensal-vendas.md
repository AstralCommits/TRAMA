# feat(vendas): adaptar lançamento ao DTO mensal do backend

**Prioridade:** Crítica  
**Relações/dependências:** Bloqueia a integração correta de vendas; depende de categorias e confecções.

## Objetivo
Adaptar a tela Minhas vendas ao contrato mensal de vendas do Back-end.

## Contexto
A tela atual usa produto, categoria em texto, quantidade, preço unitário e data diária. O DTO documentado no pacote exige `idConfeccao`, `idCategoria`, `mesAno`, `quantidade`, `faturamento` e campos de origem. Não enviar o formato local diretamente para esse endpoint.

## Decisão necessária antes da implementação
A equipe deve confirmar uma das opções:
1. O usuário registra diretamente totais mensais por confecção/categoria; ou
2. O front mantém lançamentos detalhados e agrega os dados mensalmente antes de enviar, com regra de agregação documentada.

Não misturar os dois modelos sem explicação.

## Critérios de aceite
- [ ] Selecionar confecção e categoria pelos IDs da API.
- [ ] Informar mês/ano, quantidade e faturamento conforme DTO.
- [ ] Enviar exatamente os nomes e tipos do contrato vigente.
- [ ] Consultar e atualizar registros conforme métodos suportados.
- [ ] Tratar duplicidade por confecção + categoria + mês, se essa regra estiver no Back-end.
- [ ] Atualizar indicadores após confirmação do servidor.
- [ ] Distinguir dados locais/demo dos dados persistidos.
- [ ] Incluir testes do mapeamento DTO e do fluxo principal.

## Fora do escopo
Enviar produto, preço unitário e data diária para campos que não existem no DTO mensal.

---
**Nota para publicação:** revisar com a equipe/professor, confirmar contrato atual do Back-end e atribuir labels/responsável no GitHub. O identificador deste arquivo é temporário; o GitHub atribuirá o número oficial.
