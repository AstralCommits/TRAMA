# Issue oficial #8 — [FRONT-07] Configuração de Cliente HTTP (Axios/Fetch) com Interceptor de Autenticação JWT

**Repositório:** `AstralCommits/Front-end`  
**Estado consultado:** `closed`  
**Motivo de fechamento:** `completed`  
**Fonte:** https://github.com/AstralCommits/Front-end/issues/8

## Escopo registrado

Configurar camada HTTP centralizada e envio do token JWT Bearer nas requisições autenticadas.

## Critério de aceite registrado/sintetizado

As requisições protegidas devem enviar credencial conforme o contrato de autenticação.

## Relação com a consolidação TRAMA v0.2.0-dev.4

O contrato atual do Back-end usa sessão JWT em cookie HttpOnly e CSRF; consultar README antes de assumir Bearer no navegador.

> Este arquivo é um registro de integração para o monorepositório. Consulte a issue original no GitHub para o texto integral, comentários e histórico. O estado “closed” não substitui a validação técnica do código.
