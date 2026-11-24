# Segurança da Informação — TRAMA (ISO/IEC 27001)

| Campo | Informação |
|---|---|
| Versão | 1.0 — 09/11/2026 |
| Responsável | Gabriela Olegário (segurança da aplicação) com apoio de Jamile Keiller (dados) |
| Abrangência | Código, repositórios, banco de demonstração e dados de entrevistas do PI |

A ISO/IEC 27001 pede três documentos centrais: **política de segurança**, **análise de riscos** e **plano de continuidade**. Abaixo, em escala de projeto acadêmico.

## 1. Política de Segurança da Informação

1. **Objetivo.** Proteger a confidencialidade dos dados de entrevistados, a integridade dos dados de vendas e a disponibilidade do sistema na apresentação.
2. **Dados pessoais (LGPD).** Não guardar nome, CPF, telefone ou endereço de entrevistados. Confecções reais podem ser representadas por persona. Termo de consentimento assinado antes de cada entrevista e guardado fora do repositório.
3. **Segredos.** Nenhuma senha, chave JWT ou credencial real no código. Segredos ficam em variáveis de ambiente ou `.env` (no `.gitignore`); o repositório guarda apenas `.env.example`. As credenciais `trama/trama` do Docker valem só para a máquina local.
4. **Acesso.** Repositórios na organização AstralCommits com acesso por pessoa; docentes com permissão de escrita; 2FA ativo nas contas do GitHub da equipe. Na aplicação, perfis ADMIN e EMPRESARIO com menor privilégio (RF09).
5. **Senhas de usuários.** Sempre com BCrypt; nunca registradas em log.
6. **Desenvolvimento seguro.** Validação de entrada na API (Bean Validation, HTTP 400), consultas parametrizadas (JPA), CORS restrito às origens do Front, dependências atualizadas.
7. **Incidentes.** Qualquer integrante que perceber um segredo exposto avisa o grupo no Teams no mesmo dia; o segredo é trocado e o commit é corrigido.
8. **Revisão.** Esta política é revisada a cada entrega (16/11 e 23/11).

## 2. Inventário de ativos

| Ativo | Classificação | Onde fica | Dono |
|---|---|---|---|
| Código-fonte | Interno (repositórios públicos) | GitHub | Cada frente |
| Base de vendas simulada | Interna | MySQL (Docker) | Jamile, Júlia |
| Respostas de entrevistas/questionários | **Confidencial** | Drive da equipe (fora do GitHub) | Toda a equipe |
| Contas de usuário da aplicação | Confidencial | Tabela `usuario` | Gabriela |
| Segredo JWT, senhas do banco | **Secreto** | Variáveis de ambiente | Gabriela, Ester |

## 3. Análise de riscos

Probabilidade (P) e impacto (I) de 1 a 3; risco = P × I (≥ 6 = alto).

| ID | Risco | P | I | Risco | Controle existente | Tratamento | Responsável | Prazo |
|---|---|---|---|---|---|---|---|---|
| R01 | Chave JWT fixa no código permite forjar token de ADMIN | 3 | 3 | **9** | — | Ler de `TRAMA_JWT_SECRET`; trocar a chave | Gabriela | 13/11 |
| R02 | API sem validação do token (qualquer rota bloqueada ou, se liberada, aberta) | 3 | 3 | **9** | — | `JwtAuthenticationFilter` + testes 401/403 | Gabriela | 13/11 |
| R03 | Exposição de dados de entrevistados | 1 | 3 | 3 | Tabela `entrevista` sem nome | Manter respostas brutas fora do GitHub | Toda a equipe | contínuo |
| R04 | Perda do banco de demonstração | 2 | 2 | 4 | Docker recria a partir do script | Backup antes da apresentação (seção 4) | Júlia | 22/11 |
| R05 | Senhas `root`/`trama` no `docker-compose.yml` | 2 | 1 | 2 | Banco só local | Ler de `.env` com `.env.example` | Jamile | 20/11 |
| R06 | Falha da demonstração ao vivo (rede, porta, versão) | 2 | 3 | **6** | — | Ensaio 22/11 em 2 máquinas + vídeo de contingência | Toda a equipe | 22/11 |
| R07 | Conta do GitHub de integrante comprometida | 1 | 2 | 2 | — | 2FA obrigatório | Jamile | 16/11 |
| R08 | Injeção de SQL | 1 | 3 | 3 | JPA com parâmetros | Não concatenar SQL nas queries | Ester, Gabriela | contínuo |
| R09 | CORS aberto a qualquer origem | 1 | 2 | 2 | Origens configuradas em `trama.cors` | Manter lista fechada | Ester | contínuo |

## 4. Plano de continuidade (apresentações de 16/11 e 23/11)

| Situação | Ação | Tempo-alvo |
|---|---|---|
| Notebook principal falha | Segunda máquina já com os três repositórios e o banco | 5 min |
| Docker não sobe | API no perfil `sqlite` (`extensao.db`) ou `local` (H2) | 5 min |
| Sem internet | Imagens Docker e dependências baixadas no dia anterior | — |
| Tudo falha | Vídeo gravado da jornada completa (gravar em 22/11) | imediato |

**Backup do banco** (antes de cada apresentação):

```bash
docker compose exec -T mysql mysqldump -utrama -ptrama confeccoes > backups/confeccoes-AAAA-MM-DD.sql
```

Restauração: `docker compose exec -T mysql mysql -utrama -ptrama confeccoes < backups/arquivo.sql`.

## 5. Declaração de aplicabilidade (controles selecionados)

| Controle (Anexo A, resumo) | Aplicável | Como |
|---|---|---|
| Política de segurança | Sim | Seção 1 |
| Controle de acesso | Sim | Perfis ADMIN/EMPRESARIO; acesso aos repositórios |
| Gestão de segredos / criptografia | Sim | Variáveis de ambiente; BCrypt; HTTPS em produção |
| Desenvolvimento seguro | Sim | Validação, JPA, revisão em PR |
| Backup | Sim | Seção 4 |
| Proteção de dados pessoais | Sim | LGPD, seção 1 item 2 |
| Segurança física, RH, fornecedores | Não | Fora do escopo de projeto acadêmico |
