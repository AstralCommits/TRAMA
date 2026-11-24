# feat(filtros): aplicar filtros analíticos por período, categoria e cidade

**Prioridade:** Alta  
**Relações/dependências:** Depende de `/api/indicadores`, `/api/categorias` e `/api/cidades`; reformula #19.

## Objetivo
Oferecer filtros consistentes para consultar e comparar dados comerciais.

## Critérios de aceite
- [ ] Filtrar por mês/ano inicial e final no formato da API.
- [ ] Filtrar por categoria usando ID oficial.
- [ ] Filtrar por cidade usando valores permitidos pelo contrato.
- [ ] Validar período inicial posterior ao final.
- [ ] Mostrar filtros ativos e permitir limpar.
- [ ] Preservar filtros ao navegar entre análises quando apropriado.
- [ ] Manter dashboard, tendências e relatórios coerentes com o mesmo recorte.
- [ ] Não apresentar filtro local como se tivesse sido aplicado no servidor.


## Relação com a issue antiga #19
A issue #19 está aberta, mas descreve filtros de catálogo por técnica artesanal. A recomendação é reescrever a própria #19 para filtros de vendas por período, categoria e cidade. Este arquivo FE-20 é uma descrição alternativa; não crie ambas como tarefas paralelas para o mesmo resultado.


---
**Nota para publicação:** revisar com a equipe/professor, confirmar contrato atual do Back-end e atribuir labels/responsável no GitHub. O identificador deste arquivo é temporário; o GitHub atribuirá o número oficial.
