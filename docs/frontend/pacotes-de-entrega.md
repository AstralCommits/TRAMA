# Pacotes de entrega

A equipe do Front entregou várias versões do projeto como arquivos `.zip`. Elas ficaram descompactadas em `Front-end/pacotes/` até a reorganização do repositório, quando saíram da árvore principal para não duplicar o código. Cada pacote é uma versão paralela e tem funcionalidades que ainda não foram integradas ao app em `frontend/`.

| Pacote | Autor | Data | Conteúdo | O que só existe nele |
|---|---|---|---|---|
| `entrega-06-07-08` | Júlio Cesar | 09/11 | Back-end e Front-end | `services/authService.ts` |
| `trama-develop` | Maria Nicolle | 22/11 | Front-end | Relatórios, comparação de mercado, organização e configurações |
| `monorepo-v0.2.0-dev.4` | Maria Nicolle | 23/11 | Front-end, Back-end e Banco de Dados | Relatórios e cenários mensais, gestão de categorias e equipe; no Back-end, equipe, convites e filtros salvos (29 arquivos). O Banco deste pacote não tem as DB-01/DB-03, o Docker nem o SQLite |

## Como consultar

Os pacotes continuam no histórico do Git, no commit `58dffe3`.

Ver no GitHub: [Front-end/pacotes no commit 58dffe3](https://github.com/AstralCommits/TRAMA/tree/58dffe3/Front-end/pacotes).

Trazer um pacote para a sua cópia local, numa branch de trabalho:

```bash
git checkout 58dffe3 -- Front-end/pacotes/trama-develop
```

Os pacotes `front-05-06-marketplace` e `us02-rest` foram retirados antes, em 24/11/2026, porque são funções de marketplace, fora do escopo do TRAMA. Eles estão no histórico da branch `front-end/develop`.

## Novas-Funcionalidades

A pasta `Novas-Funcionalidades/` tinha três arquivos do front (`demo.ts`, `new-features.tsx` e `workspace.tsx`). As versões em `frontend/src/` já incluem esse código e a integração com a API, então a pasta também saiu da árvore. As notas dessa entrega estão em [`../historico/novas-funcionalidades.md`](../historico/novas-funcionalidades.md).
