# fix(reports): melhorar e validar responsividade dos relatórios em celular

**Prioridade:** Alta  
**Relações/dependências:** Nova necessidade identificada na revisão do ZIP; relacionada a #16, #22 e #25.

## Objetivo
Garantir que a área de Relatórios seja utilizável em celulares, sem cortes, sobreposição ou necessidade de ampliar a página.

## Estado observado
O CSS já possui media queries para filtros, métricas e colunas dos relatórios. Portanto, a tarefa não é simplesmente adicionar `@media`; é validar o comportamento real e corrigir os pontos que ainda prejudicam o uso em telas pequenas. A tabela atual deve receber atenção especial.

## Escopo
- Filtros por período, categoria e tipo de arquivo.
- Cartões de indicadores.
- Barras por categoria.
- Ranking de produtos.
- Tabela de vendas.
- Ações de exportar CSV e imprimir/salvar PDF.

## Critérios de aceite
- [ ] Testar larguras de 360, 390 e 430 px, além de tablet e desktop.
- [ ] Não existir rolagem horizontal na página inteira.
- [ ] Filtros empilharem em uma coluna, com labels e controles legíveis.
- [ ] Métricas reorganizarem sem textos/valores cortados.
- [ ] Barras e ranking manterem nome, valor e hierarquia legíveis.
- [ ] Tabela virar cartões em telas pequenas OU usar rolagem horizontal confinada ao bloco, com indicação visual.
- [ ] Botões terem área de toque adequada e não saírem da tela.
- [ ] Zoom de 200% não ocultar ações ou informações essenciais.
- [ ] Impressão/PDF preservar cabeçalho, totais e dados necessários.
- [ ] Anexar capturas de tela e matriz de dispositivos/navegadores.

## Fora do escopo
Redesenhar toda a identidade visual ou trocar a biblioteca de gráficos sem justificativa.

---
**Nota para publicação:** revisar com a equipe/professor, confirmar contrato atual do Back-end e atribuir labels/responsável no GitHub. O identificador deste arquivo é temporário; o GitHub atribuirá o número oficial.
