TRAMA — novas funcionalidades

Arquivos alterados:
- Frontend/apps/web/src/data/demo.ts
- Frontend/apps/web/src/home/workspace.tsx

Novo arquivo:
- Frontend/apps/web/src/home/new-features.tsx

O que foi adicionado:
- Simulador de Impacto da Concorrência, com percentual de 0 a 100%, fórmula visível,
  comparação de faturamento, diferença em reais e cenários salvos.
- Gerenciamento de Categorias (limite de 50 caracteres e prevenção de duplicidade).
- Gerenciamento de Confecções (Toritama, Caruaru e Santa Cruz do Capibaribe).
- Lançamento mensal de vendas usando as categorias e confecções cadastradas.
- Os três módulos administrativos aparecem apenas para o perfil Administrador.
- Dados persistidos no localStorage por conta/navegador, seguindo o padrão já usado
  pelo projeto. Isso não é persistência em servidor/backend.

Para testar:
1. Extraia o projeto completo.
2. Abra a pasta Frontend/apps/web no terminal.
3. Use Node.js >= 22.22.0 (versão exigida no package.json).
4. Execute npm ci e depois npm run dev.
5. Entre na demonstração com perfil Administrador para visualizar todos os módulos.

O build e o typecheck passam na main e rodam na CI do front-end (.github/workflows/front-end.yml).
