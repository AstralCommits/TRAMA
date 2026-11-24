# TRAMA — Gestão que conecta o Agreste

Protótipo web de gestão e inteligência comercial pensado para confecções, oficinas e negócios da cadeia têxtil do Agreste pernambucano. A interface reúne uma apresentação institucional e uma área demonstrativa com indicadores, vendas, estoque e operações.

> **Estado do projeto:** protótipo demonstrativo. Os dados são fictícios; não há autenticação real, integração externa nem persistência em banco de dados. As alterações feitas na demonstração ficam em memória e são perdidas ao recarregar ou sair. Não use dados pessoais ou informações comerciais reais.

## Tecnologias

- React 19 e React Router
- Vite
- TypeScript
- Tailwind CSS
- Bun (gerenciador de pacotes recomendado)
- Recharts e Lucide React

## Requisitos

- [Bun](https://bun.sh/) instalado (recomendado para respeitar o `bun.lock`).
- Node.js **22.22.0 ou superior** (requisito do React Router 8.3.0 incluído no projeto).
- Git, caso vá publicar ou clonar o repositório.

## Instalação e execução no Windows

Abra o PowerShell na pasta raiz do projeto (a pasta que contém `package.json` e `bun.lock`).

```powershell
# Instalar as dependências
bun install

# Iniciar o servidor de desenvolvimento
bun run dev
```

O script inicia o React Router na porta `3000` e escuta em `0.0.0.0`, permitindo acesso pela rede local. Mantenha esse terminal aberto enquanto estiver usando o site.

Acesse no próprio computador: <http://localhost:3000>.

### Se o PowerShell bloquear `bun.ps1`

Em alguns Windows, a política de execução do PowerShell bloqueia o atalho `bun`. Use o executável `.cmd` diretamente: abra o PowerShell na pasta raiz e execute:

```powershell
& "$env:APPDATA\npm\bun.cmd" install
& "$env:APPDATA\npm\bun.cmd" run dev
```

Se o comando `.cmd` não existir nesse caminho, confira a instalação do Bun e o caminho indicado por `where.exe bun`.

## Acessar o TRAMA em outro computador pela rede local

Use este procedimento para abrir o protótipo em outro computador conectado à mesma rede Wi-Fi ou cabeada. O computador que inicia o servidor será o **computador servidor**.

### 1. Conectar os computadores à mesma rede

Conecte o computador servidor e o computador que vai acessar o site à mesma rede local. Redes de convidados ou redes com isolamento entre dispositivos podem impedir a comunicação.

### 2. Iniciar o TRAMA no computador servidor

Na pasta raiz do projeto, execute:

```powershell
bun run dev
```

Deixe o terminal aberto. O servidor precisa continuar em execução para que o outro computador consiga acessar o site.

### 3. Descobrir o endereço IPv4 do computador servidor

No computador servidor, abra outro PowerShell e execute:

```powershell
ipconfig
```

Procure o adaptador que está conectado à rede (por exemplo, **Adaptador de LAN sem fio Wi-Fi**) e anote o campo **Endereço IPv4**. Ele costuma ter um formato parecido com `192.168.0.107` ou `192.168.1.25`. Use o endereço exibido no seu computador, não esses exemplos.

### 4. Permitir a porta 3000 no Firewall do Windows (se necessário)

Se o Firewall bloquear o acesso, abra o PowerShell **como administrador** no computador servidor e crie uma regra limitada a redes privadas:

```powershell
New-NetFirewallRule -DisplayName "TRAMA - Desenvolvimento TCP 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Private
```

Não habilite essa regra para redes públicas. Para removê-la depois do teste, execute como administrador:

```powershell
Remove-NetFirewallRule -DisplayName "TRAMA - Desenvolvimento TCP 3000"
```

### 5. Abrir o site no outro computador

No outro computador, abra o navegador e digite `http://` seguido do IPv4 do computador servidor e da porta `3000`. Por exemplo:

```text
http://192.168.0.107:3000
```

Troque `192.168.0.107` pelo IPv4 que apareceu no `ipconfig` do computador servidor.

### Se não abrir

- Confirme que os dois computadores estão na mesma rede.
- Confirme que o terminal do servidor continua aberto e sem erros.
- Confira se o endereço IPv4 foi copiado do adaptador conectado à rede.
- Verifique se a regra do Firewall foi criada para o perfil **Private**.
- Algumas redes de convidados bloqueiam o acesso entre dispositivos.
- O endereço IPv4 pode mudar quando o computador se reconectar à rede; execute `ipconfig` novamente.

> **Segurança:** este é um servidor de desenvolvimento, destinado a testes em uma rede local confiável. Não configure encaminhamento de portas no roteador nem exponha o servidor diretamente à internet. Não use o protótipo para armazenar informações reais ou sensíveis.

## Verificações e build

Na pasta raiz, os scripts disponíveis são:

```powershell
# Gerar a versão de produção
bun run build

# Verificar tipos TypeScript
bun run typecheck

# Executar o lint
bun run lint

# Servir a versão compilada
bun run start
```

O servidor de desenvolvimento (`bun run dev`) é o modo indicado para experimentar a aplicação. Para uma publicação real, configure um ambiente de produção, revise segurança, autenticação, persistência, variáveis de ambiente e integrações antes de utilizar dados verdadeiros.

## Publicar no GitHub

1. Crie um repositório vazio no GitHub.
2. Abra o terminal na pasta raiz do TRAMA.
3. Confira os arquivos que serão enviados:

```powershell
git status --short
```

4. Inicialize o Git e faça o primeiro commit:

```powershell
git init
git add .
git status
git commit -m "Initial commit - TRAMA"
git branch -M main
```

5. Conecte o repositório remoto (substitua pela URL do seu repositório):

```powershell
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

O modelo `apps/web/.env.example` documenta o uso futuro de variáveis; atualmente não há variáveis obrigatórias para executar o protótipo. O `.gitignore` exclui `node_modules`, arquivos `.env`, pastas geradas e backups locais. O arquivo `bun.lock` foi mantido para registrar as versões resolvidas das dependências. **Nunca force o envio de `.env`, senhas, tokens ou chaves privadas.**

## Estrutura principal

```text
TRAMA/
├── apps/
│   └── web/
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   ├── data/
│       │   ├── home/
│       │   ├── hooks/
│       │   ├── lib/
│       │   ├── routes/
│       │   └── ui/
│       ├── package.json
│       ├── react-router.config.ts
│       ├── tsconfig.json
│       └── vite.config.ts
├── .gitignore
├── bun.lock
├── package.json
└── README.md
```

## Observações

- A demonstração usa uma confecção fictícia e dados de exemplo.
- Os dados cadastrados durante uma sessão não são gravados permanentemente.
- O login é apenas uma seleção de perfil de demonstração, não um mecanismo de autenticação.
- O script de pré-visualização específico da plataforma de origem foi mantido como componente inativo porque o código original não estava no arquivo recebido.

## Issues FRONT-06, FRONT-07 e FRONT-08 — estado desta entrega

### FRONT-06 — organização

O pacote recebido já estava extraído em uma única raiz `TRAMA/`, com `package.json` na raiz e aplicação em `apps/web/`. A estrutura foi preservada, sem criar uma segunda pasta de projeto nem duplicar componentes. A conferência da árvore e o build devem ser executados após instalar as dependências.

### FRONT-07 — camada JWT preparada

Foi criado `apps/web/src/lib/api.client.ts`, cliente HTTP centralizado com envio automático de `Authorization: Bearer`, tratamento de erros 401/403 e credenciais de sessão por cookie. O token recebido fica somente em memória e é descartado ao recarregar a página. Foi criado `apps/web/src/lib/auth.tsx` com contexto de sessão e componente `RequireAuth` para páginas privadas.

**Pendência de integração:** este ZIP não contém o Back-end nem documenta endpoints de login, renovação de sessão ou logout. Portanto, o formulário demonstrativo atual continua sendo demonstração e não deve ser tratado como login real. A equipe precisa informar os endpoints, o formato do token/resposta e o mecanismo de sessão antes de conectar o fluxo e aplicar `RequireAuth` às rotas privadas. A autorização deve continuar sendo validada pelo Back-end.

### FRONT-08 — gráficos conectáveis

Foi criado `apps/web/src/home/api-charts.tsx`, com gráfico de linha para faturamento mensal e gráfico de barras para peças por categoria, ambos responsivos e com tooltip, legenda e estados de carregamento, vazio, erro e endpoint não configurado. Os gráficos usam somente os registros retornados pela API; não exibem dados demonstrativos como dados reais.

Configure no `.env` da aplicação os valores `VITE_API_BASE_URL`, `VITE_TRAMA_REVENUE_ENDPOINT` e `VITE_TRAMA_CATEGORY_ENDPOINT` somente depois de confirmar os caminhos reais e o formato JSON com o Back-end. Formatos aceitos pelo normalizador: array de registros ou objeto `{ "data": [...] }`; faturamento aceita `month`/`mes`/`period` e `revenue`/`faturamento`/`total`; categorias aceita `category`/`categoria`/`name` e `pieces`/`quantidade`/`quantity`.

### Limitações conhecidas

- Não foi possível comprovar integração ponta a ponta, autenticação real, autorização administrativa ou persistência porque o Back-end não está incluído no pacote.
- O fluxo institucional e a entrada de demonstração foram preservados.
- O cliente JWT usa token em memória como fallback compatível com a arquitetura atual; para produção, a recomendação é sessão via cookie `HttpOnly`, `Secure` e `SameSite`, configurada pelo servidor.

## Marketplace — novas telas FRONT-06 (#16) e FRONT-05 (#15)

Foram acrescentadas duas rotas demonstrativas independentes dos módulos de inteligência comercial já existentes:

- `http://localhost:3000/catalogo` — catálogo mobile-first com filtro por coleção e drawer responsivo.
- `http://localhost:3000/painel-artesao` — painel com resumo de vendas, valores a receber/repassados, filtro mensal e atualização do status de produção. Para abrir a prévia, entre na demonstração pelo perfil simulado **Artesão**.

O catálogo e o painel usam dados fictícios, separados dos componentes, e compartilham `src/features/shared/ResponsiveDrawer.tsx`. O breakpoint `xs: 360px` foi acrescentado à configuração Tailwind existente. O roteiro de testes manuais e a auditoria estão em `docs/FRONT-06-CATALOGO-RESPONSIVO.md`, `docs/FRONT-05-PAINEL-ARTESAO.md` e `docs/RELATORIO_AUDITORIA_INTEGRACAO_FRONT-05_FRONT-06.md`.

Para executar os testes puros de cálculo do repasse, a partir da raiz `TRAMA/`:

```bash
node --test apps/web/tests/orderFinancials.test.mjs
```

**Limite importante:** a opção “Artesão” é somente um perfil de demonstração mantido na sessão da aba. Não é autenticação. O painel usa pedidos fictícios e atualizações em memória; a API e a autorização reais ainda precisam ser fornecidas pelo Back-end. Não use dados reais nesta prévia.
