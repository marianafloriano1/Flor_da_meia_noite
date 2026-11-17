# TASK-015 — Etapa 002: Pré-condições e decisões

Data: 2026-11-16
Branch local: `task/TASK-015-capacidade-prontida-lancamento`
Base integrada: `ff14822`
Status da TASK-015: IN_PROGRESS (Etapa 003 — planejamento)
Status original da Etapa 002: EXECUTADA — BLOQUEADA
Status vigente da Etapa 002: CONCLUÍDA
GATE-002: APROVADO por decisões formais da responsável (adendo abaixo)

## DoR e evidências antes das decisões formais (registro histórico)

| Critério | Estado | Evidência / pendência |
|---|---|---|
| Dependências concluídas | PASS | TASK-003 a TASK-014 constam DONE no controle vigente; os fechamentos de TASK-012 (`c37f436`), TASK-013 (`bd163f7`) e TASK-014 (`4a4f1b3`) estão integrados e sua ancestralidade foi confirmada em GATE-001. |
| Rastreabilidade | PASS COM RESSALVA | README, TASKS e ADR-001..005 existem; a TASK-015 aponta para todos RF/RNF e UCs, mas ainda requer matriz critério→requisito na Etapa 003. |
| Critérios mensuráveis | BLOCKED | Carga: o volume e a duração propostos (1.000 sessões; 10 min de rampa, 30 min sustentada, 10 min de encerramento) aguardam aprovação; faltam mistura percentual de fluxos e limites de erro/latência. Imagens: o limite proposto de 2 s aguarda definição de dispositivo, rede, cache, métrica e método reproduzível. |
| Escopo e proibições | PASS | TASKS.md limita mudanças a scripts/config de carga, correções necessárias, runbooks e checklist; proíbe PII real, pagamentos reais em carga, publicação sem autorização e requisitos novos. |
| Ambiente/validação | BLOCKED | Node v22.15.0 e npm 11.6.1 disponíveis; Docker Engine 29.9.2 respondeu a `docker info` somente leitura com `docker-desktop`/`Docker Desktop`. O comando exigiu acesso elevado ao pipe. `node_modules/` ausente, `supabase` CLI não encontrado no PATH e não há `.env` neste clone. `supabase/config.toml` existe. Nenhum serviço foi iniciado. |
| Decisões externas/custos | PENDING | Nenhum ambiente gerenciado ou billing foi autorizado nesta etapa. Uma medição representativa de produção pode depender de ambiente/recursos e custo a aprovar; execução local sintética não deve ser descrita como medição de produção. |

## Proposta técnica registrada antes da aprovação (histórica)

Para evitar uso de dados/serviços pagos, uma primeira rodada poderia usar 1.000 sessões virtuais sintéticas, rampa de 10 minutos, sustentação de 30 minutos e encerramento gradual de 10 minutos, sem pagamentos nem envio externo. Esta proposta aguarda aprovação. Ainda precisam ser definidos a mistura percentual dos fluxos e os limites aceitáveis de erro e latência, incluindo percentis e métricas aplicáveis.

Para imagens, o limite proposto de 2 segundos ainda não é reproduzível: faltam dispositivo de referência, condições de rede, política de cache (frio, aquecido ou ambos), métrica de aceite e método de medição. Reportar p50/p95/p99 é uma possibilidade técnica, não uma decisão aprovada.

Estes valores são somente uma proposta para destravar o planejamento; não são baseline aprovado, garantia de capacidade ou autorização para iniciar uma carga.

## Ambiente verificado antes da decisão (registro histórico)

- **Recomendação:** stack local sintética, sem custo, para iniciar a validação. Isso não equivale a aprovação formal nem autoriza iniciar a stack nesta etapa.
- **Alternativa:** avaliar ambiente gerenciado somente após decisão prévia sobre custos. Nenhum serviço foi contratado, provisionado ou configurado.
- **Ambiente confirmado:** Node.js `22.15.0`, npm `11.6.1` e Docker Engine `29.9.2`; `node_modules` ausente, Supabase CLI indisponível no PATH e nenhum `.env` neste clone. A stack Supabase não foi inicializada; instalação, testes e operações de dados não foram executados.

## Estado dos gates antes das decisões formais (registro histórico)

- **Consolidação vigente:** GATE-001 APROVADO (preservado); Etapa 002 EXECUTADA com resultado BLOQUEADA; GATE-002 BLOQUEADO; TASK-015 BLOCKED; Etapas 003–006 NÃO INICIADAS. A Etapa 003 não está habilitada.
- GATE-001: APROVADO — recontextualização concluída após integração das dependências.
- GATE-002: BLOQUEADO — decisões de aceitação para carga e medição de imagens aguardam a responsável; ambiente local é recomendado, mas não formalmente escolhido, e alternativa gerenciada depende de decisão de custos.
- GATE-003 a GATE-007: PENDENTES; não iniciados.

TASK-015 permanece BLOCKED; não foi marcada READY/IN_PROGRESS. Nenhuma implementação ou teste de carga foi iniciado.

## Menor ação necessária da responsável

A responsável precisa decidir: (1) perfil de carga — aprovar/substituir a proposta de volume/duração, definir mistura percentual dos fluxos e limites de erro/latência; (2) dispositivo, condições de rede, política de cache, métrica de aceite e método para imagens; (3) aprovar a recomendação de ambiente local sintético sem custo ou decidir se quer avaliar ambiente gerenciado, com custos sujeitos a aprovação prévia.

Depois da decisão, preparar/declarar os meios de validação (dependências e Supabase local isolado, se escolhido) e reavaliar GATE-002. Nenhum serviço foi ligado ou alterado para obter este relatório.

## Verificações desta etapa

- `node --version`: v22.15.0 — PASS.
- `npm --version`: 11.6.1 — PASS.
- `docker info --format ...`: 29.9.2, `docker-desktop`, sem erros do servidor; leitura executada com autorização elevada — PASS.
- Supabase CLI: NOT FOUND no PATH; não instalada.
- Dependências do projeto: NOT INSTALLED (`node_modules/` ausente); `npm ci` NOT RUN.
- Supabase stack/status, testes, migrations, carga, aplicação, billing e operações de dados: NOT RUN.
- `git diff --check`: PASS.

==================================================
TASK: TASK-015
ETAPA: 002
STATUS DA ETAPA: BLOQUEADA
==================================================
GATE DA ETAPA: BLOQUEADO
GATES TOTAIS: 7
GATES CONCLUÍDOS: 1
GATES PENDENTES: 5
GATES BLOQUEADOS: 1
PROBLEMAS ENCONTRADOS:
- Carga: mistura percentual dos fluxos e limites de erro/latência não definidos; a proposta de volume/duração ainda não foi aprovada.
- Imagens: dispositivo, rede, cache, métrica e método de medição ainda não definidos.
- Ambiente: opção local sintética é recomendação não aprovada; a alternativa gerenciada depende de decisão de custo. Supabase CLI e dependências estão ausentes e a stack não foi iniciada.
CORREÇÕES REALIZADAS:
- Checklist DoR e proposta técnica documentados; nenhum serviço ou dado foi alterado.
PENDÊNCIAS:
- Aprovação/definição do perfil de carga, incluindo mistura de fluxos e limites de erro/latência.
- Definição reproduzível do critério de imagens (dispositivo, rede, cache, métrica e método).
- Escolha do ambiente local sintético ou decisão sobre avaliação gerenciada e custos; preparar o ambiente após decisão e autorização aplicável.
TESTES RELACIONADOS:
- NOT RUN; nenhum teste funcional ou de carga foi executado.
PRÓXIMA ETAPA: Etapa 003 — Planejamento (não habilitada; depende de decisão e reavaliação do GATE-002)
PRÓXIMA ETAPA HABILITADA: NÃO
MOTIVO: GATE-002 bloqueado por decisões de aceitação e ambiente pendentes.
==================================================

## Adendo — decisões aprovadas e reavaliação do GATE-002 (2026-11-15)

**Fonte:** aprovação explícita da responsável no documento “TASK-015 — Aprovação das decisões do DoR, desbloqueio do GATE-002 e avanço para a Etapa 003”. O registro de bloqueio acima é histórico e não representa o status vigente.

### Decisões formais

| Tema | Decisão aprovada | Limite da aprovação |
|---|---|---|
| Carga | 1.000 sessões sintéticas simultâneas; rampa de 10 min, sustentação de 30 min e encerramento de 10 min (50 min). Mix: catálogo 35%, detalhes/imagens 25%, carrinho/cotação/checkout 20%, consulta de pedidos 10%, operações administrativas/estoque 10%. Erros totais ≤1%; HTTP 5xx ≤0,1%; p95 de operações críticas ≤2 s; registrar p50/p95/p99; nenhuma inconsistência de estoque/preço/pedido nem duplicidade indevida. | São critérios para execução futura; nenhuma carga ou desempenho foi medido/aprovado. Pagamentos e efeitos externos reais continuam proibidos. |
| Imagens | Android intermediário com 4 GB RAM e Chrome estável disponível na execução; rede 4G simulada (10 Mbps download, 2 Mbps upload, 100 ms); medir cache frio e aquecido separadamente, do início da requisição até a imagem estar disponível para renderização; aceite p95 ≤2 s no cache frio e registrar também cache aquecido. | Critério futuro; nenhum ensaio ou resultado de imagem foi produzido nesta etapa. |
| Ambiente | Primeira rodada em stack local sintética sem custo. Sem infraestrutura contratada, billing, dados reais de clientes ou credenciais de produção; resultados devem ser identificados como locais e não demonstram capacidade de produção. | Avaliação de ambiente gerenciado está fora desta aprovação e exige decisão específica de custos. |

Responsável pela decisão: responsável pelo projeto. Escopo: critérios de planejamento e aceite da TASK-015. As decisões aprovam os parâmetros; não atestam execução ou resultado.

### Reavaliação dos critérios obrigatórios

| Critério | Estado vigente | Fundamentação |
|---|---|---|
| Dependências | PASS | TASK-003 a TASK-014 estão DONE no controle e as integrações de TASK-012/013/014 permanecem na ancestralidade confirmada em GATE-001. |
| Rastreabilidade | PASS para planejamento | RF/RNF, UCs e ADR-001..005 estão identificados; a matriz critério→requisito será detalhada na Etapa 003. |
| Critérios mensuráveis | PASS | Perfil, mistura, limites e cenário de medição de imagens aprovados acima. |
| Escopo, dados e proibições | PASS | A validação aprovada é local, sintética, sem pagamentos reais, dados reais, publicação ou infraestrutura gerenciada. |
| Ambiente | PASS para iniciar planejamento; preparação operacional antes da execução | Docker Engine 29.9.2 foi confirmado no registro anterior; Node/npm também estão disponíveis. `node_modules` e Supabase CLI no PATH estão ausentes e não há `.env`; a CLI consta como dependência de desenvolvimento do projeto. Instalação e inicialização não são necessárias para planejar, permanecem pré-requisitos antes de validações que as exijam e não foram realizadas. |
| Decisões externas/custos | PASS no escopo aprovado | A alternativa local sintética foi escolhida; nenhum custo gerenciado foi autorizado. Uma eventual avaliação gerenciada continua fora de escopo. |

**Resultado vigente:** GATE-001 APROVADO e preservado; Etapa 002 CONCLUÍDA; GATE-002 APROVADO; TASK-015 IN_PROGRESS para planejamento; Etapa 003 autorizada/iniciada. Etapas 004–006 permanecem NÃO INICIADAS. GATE-003 ainda será avaliado ao concluir o plano. Nenhuma validação funcional, carga, teste de imagem, instalação, stack, migration ou operação de dados foi executada.
