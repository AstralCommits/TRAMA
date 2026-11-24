# Decisão de escopo — issues oficiais #17 e #18

**Decisão confirmada pela responsável pelo projeto em 23/11/2026:** manter o TRAMA como plataforma de inteligência de vendas para confecções do Polo Têxtil do Agreste Pernambucano. O produto não será transformado em marketplace.

## O que faz parte do TRAMA

- Organizar lançamentos mensais agregados de vendas por confecção, categoria e mês.
- Importar e consultar esses dados com origem e procedência identificadas.
- Exibir indicadores, tendências e comparações com base nos dados disponíveis.
- Permitir cenários hipotéticos claramente identificados como simulações, nunca previsões.
- Apoiar relatórios e decisões de gestão das confecções.

## Tratamento das issues

| Issue | Requisito original | Decisão para o produto TRAMA |
|---|---|---|
| #17 | Integração de produtos, artesãos e cotações, incluindo endpoints de catálogo/marketplace | **Fora do escopo.** O cliente HTTP e a autenticação JWT são usados nas rotas reais do TRAMA; não serão criadas APIs de produtos, artesãos ou cotações. |
| #18 | Cadastro de empresa compradora com razão social, nome fantasia, e-mail corporativo e CNPJ | **Fora do escopo.** O cadastro do TRAMA é de usuário/empresário vinculado a uma confecção. Não será criada uma entidade de empresa compradora. |

## Efeito sobre o backlog e o GitHub

- A decisão encerra a dúvida de produto para esta entrega; #17 e #18 não são bloqueios para concluir as funcionalidades pertencentes ao escopo TRAMA.
- Os estados das issues no GitHub não são alterados por este documento. Na consulta registrada em 23/11/2026, ambas estavam abertas.
- Não marcar essas issues como implementadas/concluídas no GitHub. O grupo pode solicitar ao responsável pelo repositório que as classifique como fora do escopo ou as mova para um backlog separado, conforme o processo adotado.
- A integração HTTP/JWT com os endpoints existentes do TRAMA continua sendo requisito do produto e deve ser validada normalmente.

## Limite importante

O catálogo demonstrativo preservado por compatibilidade com a implementação já existente da issue #19 não representa marketplace: não deve permitir compra, cotação, pedido nem alegar integração com catálogo de produtos da API. Caso não seja necessário na apresentação institucional do TRAMA, sua presença deve ser avaliada separadamente sem remover código já existente sem revisão.
