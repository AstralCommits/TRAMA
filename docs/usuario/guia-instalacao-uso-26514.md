# Guia de Instalação e Manual do Usuário — TRAMA (ISO/IEC/IEEE 26514)

| Campo | Informação |
|---|---|
| Versão | 1.0 — 09/11/2026 (capturas de tela entram após a integração de 16/11) |
| Público | Parte A: quem vai instalar e rodar (equipe, professores, banca). Parte B: quem vai usar (ADMIN e EMPRESARIO) |

---

## Parte A — Guia de instalação

### A.1 Pré-requisitos

| Ferramenta | Versão | Para quê |
|---|---|---|
| Git | qualquer recente | Baixar os repositórios |
| Docker Desktop | 4.x | Subir o MySQL 8 |
| JDK | 21 | Rodar a API |
| Node.js | 22 ou superior | Rodar o Front-end |

Portas livres: **3307** (MySQL), **8080** (API), **3000** (Front-end).

### A.2 Baixar o código

```bash
mkdir trama && cd trama
git clone https://github.com/AstralCommits/Banco-de-Dados.git
git clone https://github.com/AstralCommits/Back-end.git
git clone https://github.com/AstralCommits/Front-end.git
```

### A.3 Subir o banco

```bash
cd Banco-de-Dados
docker compose up -d --wait
```

Na primeira vez o Docker baixa a imagem e carrega `database/banco_completo.sql` (tabelas, procedures, triggers, índices e dados de exemplo). Para recomeçar do zero: `docker compose down -v` e `docker compose up -d`.

### A.4 Subir a API

Linux/macOS:

```bash
cd ../Back-end/Backend
export SPRING_PROFILES_ACTIVE=dev
export DB_URL="jdbc:mysql://localhost:3307/confeccoes?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Recife"
export DB_USERNAME=trama DB_PASSWORD=trama
export TRAMA_JWT_SECRET="troque-por-uma-frase-longa-de-32-caracteres-ou-mais"
mvn spring-boot:run
```

Windows (PowerShell):

```powershell
cd ..\Back-end\Backend
$env:SPRING_PROFILES_ACTIVE="dev"
$env:DB_URL="jdbc:mysql://localhost:3307/confeccoes?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Recife"
$env:DB_USERNAME="trama"; $env:DB_PASSWORD="trama"
$env:TRAMA_JWT_SECRET="troque-por-uma-frase-longa-de-32-caracteres-ou-mais"
.\mvnw.cmd spring-boot:run
```

Sem Docker: omita as variáveis `DB_*` e use o perfil `local` (H2 em memória).

Conferir: `http://localhost:8080/api/health` → `{"status":"UP", ...}`. Documentação da API: `http://localhost:8080/swagger-ui.html` (quando o Swagger for incluído).

### A.5 Subir o Front-end

```bash
cd ../../Front-end
git checkout develop
cd Frontend/apps/web
cp .env.example .env          # Windows: Copy-Item .env.example .env
# no .env: VITE_API_URL=http://localhost:8080
npm install
npm run dev
```

Abrir `http://localhost:3000`.

### A.6 Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| API para com "Schema-validation: missing column" | Banco criado antes da v0.4.0 | `docker compose down -v && docker compose up -d` ou rodar `database/migracoes/V0_4_0__origem_dado_nome_fonte.sql` |
| API: "Communications link failure" | Porta errada | Conferir `DB_URL` com porta **3307** |
| Telas com "Não foi possível conectar à API" | API parada ou `.env` sem `VITE_API_URL` | Subir a API; conferir o `.env` e reiniciar `npm run dev` |
| Toda chamada responde 401 | Sessão expirada | Sair e entrar de novo |
| `Port 3307 is already allocated` | Outro MySQL rodando | Parar o outro ou definir `MYSQL_PORT` antes do `docker compose up` |

---

## Parte B — Manual do usuário

### B.1 Perfis

| Perfil | Pode |
|---|---|
| ADMIN | Tudo: cadastros, vendas, cenários e consultas |
| EMPRESARIO | Consultar dashboard, tendências e cenários |

Usuários de demonstração (só para a apresentação; senhas no README da API, nunca reais).

### B.2 Entrar

1. Abra o TRAMA e clique em **Entrar**.
2. Informe e-mail e senha.
3. Você cai no **Dashboard**. Se errar a senha, aparece "E-mail ou senha inválidos".

### B.3 Consultar o dashboard (EMPRESARIO e ADMIN)

1. Escolha **mês/ano inicial**, **mês/ano final** e, se quiser, a **cidade**.
2. Os cards mostram **faturamento total**, **peças vendidas** e **categoria líder**; o gráfico mostra o faturamento por categoria.
3. Se não houver vendas no período: "Não há dados para o período selecionado". Amplie o período.

### B.4 Ver tendências

1. No dashboard, clique em **Tendências** (ou na categoria no gráfico).
2. Cada categoria aparece com a variação em relação ao período anterior de mesmo tamanho:
   - **ALTA** — subiu 5% ou mais;
   - **QUEDA** — caiu 5% ou mais;
   - **ESTÁVEL** — variou menos de 5%;
   - **Sem base** — não houve vendas no período anterior para comparar.
3. A lista vem ordenada do maior crescimento para o menor.

### B.5 Simular a concorrência

1. Abra **Cenários**.
2. Escolha a categoria e o período.
3. Arraste o controle de **impacto da concorrência** (0% a 100%).
4. A tela mostra o faturamento real, o hipotético e a diferença, junto com a fórmula:
   **faturamento hipotético = faturamento real × (1 − impacto ÷ 100)**.
   Exemplo: R$ 20.000 com 30% de impacto → R$ 14.000 (perda de R$ 6.000).
5. ADMIN: dê um nome e clique em **Salvar cenário**. Os cenários salvos ficam na lista abaixo.

### B.6 Cadastros (somente ADMIN)

| Cadastro | Campos | Regras |
|---|---|---|
| Categoria | Nome (até 50 caracteres) | Não pode repetir |
| Confecção | Nome, cidade, porte, tipo | Cidade: Toritama, Caruaru ou Santa Cruz do Capibaribe |
| Venda mensal | Confecção, categoria, mês/ano, quantidade, faturamento, origem do dado, nome da fonte | Uma venda por confecção + categoria + mês; valores não podem ser negativos |

Ao salvar, aparece uma confirmação. Se algum campo estiver errado, a mensagem diz qual.

### B.7 Sair

Clique no seu nome no topo e em **Sair**.

### B.8 Privacidade

O TRAMA não guarda nome de entrevistados: só cidade, porte da confecção ou nome fictício de persona (LGPD).
