# Registro de validação e correções de tipagem — 20/11/2026

## Resultado informado no computador de desenvolvimento

A execução local dos comandos apresentou os seguintes resultados:

| Verificação | Resultado antes desta correção |
|---|---|
| `npm install` | Concluído; 414 pacotes auditados e nenhuma vulnerabilidade encontrada |
| `npm run typecheck` | Falhou com dois erros TS2322, em `auth.client.ts` e `home.tsx` |
| `npm run lint` | Concluído sem erros; apresentou um aviso de variável não utilizada |
| `npm run build` | Concluído; as versões de cliente e servidor foram compiladas |

## O que foi corrigido neste pacote

1. **`apps/web/src/lib/auth.client.ts`** — a função que deriva o hash da senha agora copia o salt para um `ArrayBuffer` próprio antes de chamar a Web Crypto API. Isso evita a incompatibilidade entre `Uint8Array<ArrayBufferLike>` e `BufferSource` apontada pelo TypeScript 7. A quantidade de iterações, o algoritmo PBKDF2 e o SHA-256 foram mantidos.
2. **`apps/web/src/routes/home.tsx`** — a lista de correspondências de rotas é filtrada para remover entradas `undefined` antes de ser enviada à função de SEO. Isso atende ao tipo esperado por `SeoArgs` sem alterar os metadados da página.
3. **`apps/web/src/home/market-comparison.tsx`** — foi removida a variável `comparisonWidth`, que não era utilizada e gerava o aviso do Oxlint.

## O que ainda precisa ser conferido

As alterações acima foram aplicadas ao código-fonte deste pacote. Não foi possível executar novamente a instalação e os testes automatizados neste ambiente de preparação, pois a instalação offline não encontrou todos os pacotes no cache local. Portanto, **não se declara que o `typecheck` já passou**: ele precisa ser repetido no computador de desenvolvimento, com as dependências que já foram instaladas nele.

Como não houve alteração nas dependências, não é necessário executar `npm install` novamente apenas por causa dessas três correções. Depois de substituir os arquivos pelos desta versão, execute na raiz do projeto, um comando por vez:

```powershell
npm run typecheck
npm run lint
npm run build
```

## Avisos de dependências observados

- O aviso de descontinuação do Recharts 2.15.4 não impediu a compilação. A atualização para Recharts 3 deve ser feita separadamente, após avaliar as mudanças de compatibilidade e testar os gráficos.
- O aviso de script de instalação do `esbuild` foi exibido pelo npm. Como o `build` informado foi concluído, esse aviso não bloqueou a compilação observada.
- A mensagem de pacotes que procuram financiamento é informativa.

## Limites do registro

Este documento registra os resultados enviados pelo usuário e as correções incluídas no pacote. Não representa execução dos comandos no computador do usuário após a aplicação das alterações, nem substitui os testes de integração com o Back-end.
