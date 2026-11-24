# Issue oficial #18 — [FRONT-08] Tela de Cadastro e Validação Reativa de CNPJ de Empresas

**Repositório:** `AstralCommits/Front-end`  
**Estado consultado em 23/11/2026:** `open`  
**Decisão para o escopo TRAMA:** fora do escopo do produto.  
**Fonte:** https://github.com/AstralCommits/Front-end/issues/18

## Escopo registrado na issue original

Cadastrar uma empresa compradora com razão social, nome fantasia, e-mail corporativo, telefone e CNPJ com máscara e validação dos dígitos verificadores, utilizando endpoint de cadastro de empresa.

## Avaliação para o TRAMA

O TRAMA cadastra uma conta de empresário/responsável vinculada a uma confecção e opera dados agregados de vendas dessa confecção. O produto não possui o papel de empresa compradora, fluxo de compra ou entidade de comprador corporativo.

## Decisão

O cadastro de comprador corporativo e seu endpoint estão **fora do escopo do TRAMA**. Não será criada uma segunda entidade de empresa compradora nem fluxo de marketplace para atender a esta issue. Os dados empresariais da confecção continuam sendo mantidos pelos fluxos próprios do TRAMA.

A issue original permanece `open` no GitHub conforme a consulta registrada. Este pacote não a fecha nem afirma que seus critérios originais foram implementados. Consulte a [decisão formal de escopo](../DECISAO-DE-ESCOPO-ISSUES-17-18.md) e a [issue original](https://github.com/AstralCommits/Front-end/issues/18).
