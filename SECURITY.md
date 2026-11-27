# Política de segurança

## Versões atendidas

| Versão | Recebe correções |
|---|---|
| `main` | Sim |
| Branches antigas (`back-end/`, `front-end/`, `banco-de-dados/`, `novas-funcionalidades/`) | Não |

## Como relatar uma falha

Não abra uma issue pública para falhas de segurança.

Use a aba **Security** do repositório, em **Report a vulnerability**. O relato fica visível só para a equipe. Descreva:

- o que foi encontrado e onde (arquivo, endpoint ou tela);
- como reproduzir;
- o impacto esperado.

A equipe responde em até 7 dias e avisa quando a correção entrar na `main`.

## Cuidados no desenvolvimento

- Senhas, tokens e o segredo do JWT nunca entram no repositório. Use o `.env` a partir do [`.env.example`](.env.example).
- Os usuários de demonstração do banco têm senha pública e servem só para desenvolvimento.
- A política completa de segurança da informação está em [docs/seguranca](docs/seguranca/seguranca-informacao-27001.md).
