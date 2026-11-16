# TASK-013 — Etapa 002: Pré-condições e decisões

**Data:** 2026-11-13
**Branch:** task/TASK-013-seguranca-recuperacao
**HEAD:** 68ba912
**Etapa anterior:** GATE-001 APROVADO em docs/reports/TASK-013-etapa-001-recontextualizacao.md
**Escopo:** avaliação documental do DoR. Sem implementação, testes, provisionamento, billing, migrations ou operações de dados.

## Resultado original da avaliação inicial (antes das decisões complementares)

**Etapa 002: BLOQUEADA. GATE-002: BLOQUEADO / NÃO APROVADO.** A avaliação documental foi concluída, mas faltam condições obrigatórias do DoR. As propostas comparativas constam em docs/reports/TASK-013-proposta-tecnica-backup-recuperacao-2026-11-13.md e docs/reports/TASK-013-analise-tecnica-opcoes-gate-002-2026-11-13.md. São subsídios, não decisões aprovadas.

## DoR da avaliação inicial (antes das decisões complementares)

| Critério | Estado | Evidência |
|---|---|---|
| Dependências TASK-001/002/003/005 | APROVADO | TASKS.md marca DONE; commits/ancestralidade registrados no relatório da Etapa 001. |
| IDs RNF/ADR e rastreabilidade | APROVADO | RNF-003..006/008..011 e ADR-001/002/005 referenciados no backlog e existentes. |
| Decisões anteriores preservadas | APROVADO | SLO 99,5%; Supabase sa-east-1; backup diário/30 dias de referência; logs/30 dias de referência; RPO ≤24h; retenção legal sem exclusão indiscriminada; R$100/mês hipotético. Nenhuma decisão foi alterada. |
| Critérios testáveis e regras necessárias | BLOQUEADO | Falta escolher consistência DB/Storage e definir SLI/janela/alertas. Prazos legais por categoria dependem de jurídico/contabilidade antes de automatizar descarte. |
| Escopo permitido/proibido | APROVADO para esta avaliação | O trabalho permaneceu documental; não houve ação operacional ou fora do escopo. |
| Ambiente, dados sintéticos e meios de validação | BLOQUEADO | Stack local/CI não comprova backups/PITR/log drains gerenciados. Não existe ambiente gerenciado isolado autorizado/provisionado para restore e observabilidade. |
| Decisões externas essenciais | BLOQUEADO | Não foram escolhidos grau de independência/destinos, retenção de logs, região do runtime nem limites/orçamento real; não há autorização de billing/provisionamento. |

**Contagem:** 4 aprovados, 0 pendentes simples, 3 bloqueados. A regra oficial exige 100% dos itens obrigatórios aprovados e zero bloqueios; GATE-002 não pode passar.

## RTO — verificação do backlog

RTO máximo de 24 horas **é critério oficial**, não valor numérico ainda por decidir: TASKS.md define no objetivo RTO ≤24h e no aceite “RTO avaliado ≤24h”; README registra RNF-003 como máximo de 24h. O limite está definido, mas não foi comprovado: falta exercício cronometrado de restauração. RPO ≤24h e SLO 99,5% também permanecem metas aprovadas, não medições.

## Pendências e menor resolução

| Tema | O que ainda é necessário |
|---|---|
| Backup DB e Storage | A responsável escolhe o nível de independência (outro projeto, conta ou provedor), destino/região e método de consistência (janela de escrita ou objetos imutáveis/reconciliação). Confirmar viabilidade e custo para 30 dias. |
| Logs | Definir classes, destino e mecanismo para 30 dias; Log Drain/destino externo tem custo variável. |
| SLO | Definir SLI (fluxo, sucesso/latência, janela, manutenção e alertas) antes de medir 99,5%. |
| Retenção legal | A responsável fornece dados da entidade/operação; advogado/contador valida prazos e holds por categoria antes de purge automático. |
| Runtime | Escolher região Cloud Run após benchmark, estimativa e avaliação de residência; isso não altera a região Supabase aprovada. |
| Ambiente gerenciado | Autorizar conta/plano/limites e eventual billing; depois criar ambiente isolado com dados sintéticos e executar restore/validações. R$100 não autoriza gasto. |

O aceite da TASK requer backup automático e independente, restore documentado, RTO avaliado ≤24h, RPO medido/aprovado, dashboards/alertas, rollback, budget alerts e ambientes isolados. Nenhuma dessas evidências operacionais foi criada nesta avaliação. As opções e fórmulas de custo estão nos relatórios citados, sem volumes ou custos totais inventados.

## Gates e sequência

| GATE | Estado |
|---|---|
| GATE-001 | APROVADO — preservado |
| GATE-002 | BLOQUEADO |
| GATE-003 | PENDENTE — não iniciado |
| GATE-004 | PENDENTE — não iniciado |
| GATE-005 | PENDENTE — não iniciado |
| GATE-006 | PENDENTE — não iniciado; nenhum teste manual executado |
| GATE-007 | PENDENTE — não iniciado |

Etapas 003–006 não foram iniciadas. A próxima ação é resolver as decisões e autorizações acima; então reavaliar GATE-002. Não há etapa seguinte habilitada agora.

## Operações e alterações

- Consultados: AGENTS.md, TASKS.md, README/RNF-003, prompt oficial da Etapa 002, relatórios da Etapa 001/DoR e proposta técnica.
- Git confirmou branch task/TASK-013-seguranca-recuperacao e HEAD 68ba912.
- Testes, migrations, SQL, serviços, billing, provisionamento e restore: NOT RUN.
- GATE-001 e decisões aprovadas preservados.
- Alterações desta execução: este relatório novo e linha de rastreabilidade em TASKS.md; nenhum código/dado alterado. Sem commit/push/merge.

## Resultado obrigatório

==================================================
TASK: TASK-013
ETAPA: 002
STATUS DA ETAPA: BLOQUEADA
==================================================
GATE DA ETAPA: BLOQUEADO
GATES TOTAIS: 7
GATES CONCLUÍDOS: 1
GATES PENDENTES: 5
GATES BLOQUEADOS: 1
PROBLEMAS ENCONTRADOS:
- Faltam decisões/autorização para backup independente DB+Storage, consistência, logs, região runtime e ambiente gerenciado.
- SLI e retenção legal por categoria permanecem sem definição/validação.
- RTO ≤24h é requisito oficial, mas sem restauração medida.
CORREÇÕES REALIZADAS:
- Confirmado no backlog e RNF-003 que RTO ≤24h é critério vigente, separando requisito de comprovação.
- Registrado o DoR sem alterar decisões ou aprovar gate.
PENDÊNCIAS:
- Resolver decisões, validação jurídica/contábil e autorização de ambiente/billing listadas neste relatório.
TESTES RELACIONADOS:
- NOT RUN; nenhum teste repetido/executado.
PRÓXIMA ETAPA: 003 — Planejamento
PRÓXIMA ETAPA HABILITADA: NÃO
MOTIVO: GATE-002 está bloqueado; o DoR exige zero bloqueios.
==================================================

## Adendo — decisões aprovadas e reavaliação do GATE-002 (2026-11-13)

A responsável aprovou formalmente as decisões operacionais registradas em `docs/architecture/TASK-013-backup-recuperacao.md`: dump diário PostgreSQL custom/transacional e sincronização independente de manifestos Storage; janela coordenada 03:00 BRT e manifesto/checksums SHA-256; retenção de 30 dias para logs operacionais; alinhamento regional; RTO ≤24 h, RPO ≤24 h e SLI de sucesso de backup ≥99% em janela móvel de 30 dias; retenção operacional de logs por 30 dias e diretriz de cinco anos para registros transacionais/fiscais com suporte a anonimização; validação somente em Supabase local/CLI/Docker, sem cobrança nesta etapa. Isso registra as aprovações da responsável, não resultados técnicos.

A decisão não transforma as alternativas de destino S3/R2/artefato criptografado em serviço, conta, região ou orçamento selecionado. O texto aprovado cita sincronização de manifestos, mas não confirma expressamente cópia dos bytes de Storage. Restore requer os bytes; essa cobertura não pode ser presumida. A ordem dump→sincronização também não é atomicidade distribuída: o plano precisa reconciliar referências do snapshot com cópias externas preservadas (sem propagação de exclusão) e checksums válidos. A janela e o manifesto permanecem aprovados; estes controles são critérios técnicos para o plano e os testes.

### Reavaliação objetiva do DoR

| Critério | Estado atual | Evidência/razão |
|---|---|---|
| Dependências TASK-001/002/003/005 | APROVADO | Registro e ancestralidade já documentados na Etapa 001. |
| IDs RNF/ADR e rastreabilidade | APROVADO | Relatório anterior; não alterado. |
| Decisões de política da responsável | APROVADO | Arquitetura TASK-013 acima, decisão datada de 2026-11-13. R$100/mês continua hipótese. |
| Requisitos testáveis | PARCIAL | Limites RTO/RPO e SLI de backup estão definidos, mas SLI/janela para medir disponibilidade do SLO de 99,5% segue separado e não especificado. O SLI de jobs de backup não comprova disponibilidade da aplicação. |
| Ferramentas/ambiente de validação local | BLOQUEADO | Supabase CLI existe em `node_modules/.bin/supabase.cmd`, mas a verificação de 2026-11-13 retornou que Docker não conectou a `dockerDesktopLinuxEngine` (pipe Linux inexistente). Nenhuma stack foi iniciada ou alterada. Portanto, o ambiente local autorizado não está disponível neste momento. |
| Billing/provisionamento externo | APROVADO para o escopo de planejamento/validação local | A responsável limitou a validação a ambiente local sem billing e condicionou promoção paga a aprovação financeira específica. Nenhum serviço foi contratado ou ativado. |
| Retenção legal | APROVADO como diretriz operacional, NÃO como parecer jurídico | Cinco anos foi aprovado como política de planejamento; jurídico/contabilidade deve validar aplicabilidade por categoria antes de descarte automático de dados reais. |
| Região | APROVADO como princípio de alinhamento | Supabase em São Paulo (`sa-east-1`) previamente aprovado; Cloud Run usa código regional próprio (`southamerica-east1`). Não há ambiente Cloud Run provisionado nem deployment validado. |

**Resultado desta reavaliação: Etapa 002 e GATE-002 permanecem BLOQUEADOS / NÃO APROVADOS.** O DoR oficial exige meios de validação disponíveis e 100% dos critérios obrigatórios aprovados. Há três itens concretos: Docker Engine não responde; o SLI/janela para o SLO de disponibilidade de 99,5% não foi definido (o SLI aprovado de jobs é distinto); e não está explícito se a cópia independente inclui bytes de Storage, necessários para restore. A autorização de executar Docker futuramente não demonstra que o Engine está operacional.

**Etapa 003 não iniciada:** o prompt oficial exige GATE-002 aprovado como dependência. Não foram criados plano de implementação nem status de desbloqueio. Próximas ações mínimas: disponibilizar Docker Engine local sem reset/recriação; definir/documentar o SLI de disponibilidade (separado do SLI de backup); e confirmar explicitamente que os bytes dos objetos Storage integram a cópia independente. Então reavaliar GATE-002. Nenhum teste, migration, backup, restore ou operação de dados foi executado nesta reavaliação.

## Adendo — confirmação de ambiente, SLI e cópia binária integral (2026-11-14)

### Validação de ferramentas

- `docker info --format 'ServerVersion={{.ServerVersion}}'` → **PASS**; `ServerVersion=29.9.2`. O daemon Docker respondeu neste host. Nenhum container/stack foi iniciado ou modificado.
- `supabase --version` → **NOT RUN WITH SUCCESS**; o PowerShell retornou que `supabase` não é reconhecido como comando.
- `Get-Command supabase` não localizou instalação global; `Test-Path node_modules` e `Test-Path node_modules/.bin/supabase.cmd` retornaram `False` neste worktree. `package.json` declara a dependência `supabase`, mas não há instalação local. Nenhuma dependência foi instalada.

### Decisões complementares aprovadas

A responsável aprovou em 2026-11-14 a definição do SLI de disponibilidade mensal de 99,5% e confirmou que a cópia independente inclui fisicamente todos os bytes dos objetos de todos os buckets, além dos metadados `storage.objects` no dump. Cada objeto deve ter SHA-256 no manifesto e o hash deve ser novamente verificado durante restore. Esses são requisitos aprovados; ainda não há backup ou restore executado.

O SLO de disponibilidade e o indicador de recuperação são distintos. Disponibilidade: janela móvel de 30 dias, health checks HTTP e requisições válidas, com falhas 5xx/timeouts atribuíveis à aplicação/banco no numerador de erro. Rotas efetivamente encontradas no código incluem `/api/health/db` e `/api/catalog`; a rota literal `/api/health` citada como exemplo não foi encontrada. Para 30 dias fixos, orçamento de erro de 0,5% = 3h36m; o valor aproximado de 3h39m informado não é o cálculo exato dessa janela. Backup: ≥99% de jobs diários íntegros por checksum em janela móvel de 30 dias; RPO≤24h e RTO≤24h continuam metas que dependem de restore medido.

### DoR reavaliado

| Critério | Estado atual | Evidência |
|---|---|---|
| Dependências e rastreabilidade | APROVADO | GATE-001 e referências anteriores preservados. |
| Decisões operacionais | APROVADO | Relatório de arquitetura, incluindo as aprovações de 13 e 14/11/2026. Custos pagos continuam sujeitos a aprovação financeira; R$100/mês é hipotético. |
| Critérios de recuperação/monitoramento | APROVADO para planejamento | RTO/RPO, SLI de backup e SLI/SLO de disponibilidade definidos e separados. Metas ainda não medidas. |
| Escopo Storage restaurável | APROVADO como requisito | Cópia física integral dos bytes e SHA-256 por objeto explicitamente confirmados. A inclusão de `storage.objects` no dump deve ser verificada no archive durante implementação. |
| Ambiente local | BLOQUEADO | Docker Engine PASS (29.9.2), mas Supabase CLI ausente deste host/worktree; não é possível operar/validar a stack local agora sem instalar/disponibilizar a CLI. |
| Retenção legal | APROVADO como diretriz operacional | Cinco anos continua decisão de planejamento, não parecer jurídico geral; validação por categoria antes de purge de dados reais. |

**Resultado atual: GATE-002 permanece BLOQUEADO exclusivamente pela disponibilidade da Supabase CLI no worktree/host.** Docker está operacional e os critérios de SLI e cópia integral de Storage foram formalizados. O DoR exige meios de validação disponíveis; por isso não marco GATE-002 como APROVADO até a CLI ser disponibilizada e sua versão confirmada. Nenhuma dependência foi instalada nem stack local iniciada.

**Etapa 003 permanece não iniciada:** o prompt oficial a condiciona à aprovação de GATE-002. Próximo passo mínimo: instalar as dependências já declaradas no projeto (sem alterar o lockfile) ou disponibilizar a Supabase CLI por mecanismo aprovado e então executar `supabase --version`; reavaliar o gate. Nenhum teste, migration, backup, restore, serviço pago ou operação de dados foi executado.

## Adendo final — DoR concluído e GATE-002 aprovado (2026-11-14)

### Validação do ambiente local

- `docker info --format 'ServerVersion={{.ServerVersion}}'` → **PASS**, `ServerVersion=29.9.2`; Docker Engine respondeu.
- `npm ci` → **PASS**, instalou 336 pacotes do lockfile; `package-lock.json` permaneceu inalterado. O audit automático informou 2 vulnerabilidades moderadas em dependências; não foram investigadas nem corrigidas nesta etapa e devem ser revistas no gate de segurança aplicável.
- `supabase --version` (resolvido pelo `node_modules/.bin` local) → **PASS**, `2.122.0`.
- Nenhuma stack Supabase foi iniciada; não foram executados migrations, testes, backups, restores ou operações de dados.

### Decisões completadas

Em 2026-11-14, a responsável aprovou a definição do SLI de disponibilidade mensal de 99,5% e a cópia integral dos bytes de todos os objetos binários de cada bucket, além dos metadados Storage no dump. O manifesto terá SHA-256 por arquivo, verificado byte a byte durante restore. O SLI de backup (≥99% de jobs íntegros em janela móvel de 30 dias) permanece separado do SLO de disponibilidade.

Para disponibilidade, utilizar observações periódicas de health-checks HTTP e requisições válidas; falha significa 5xx ou timeout atribuível à aplicação/banco. Fórmula: `(observações elegíveis - falhas atribuíveis) / observações elegíveis`. O código tem `/api/health/db` e `/api/catalog`; a rota `/api/health` sem `/db` não existe nesta branch. Em 30 dias fixos, 99,5% equivale a orçamento de erro de 3h36m; 3h39m era aproximação não exata. Nenhum SLI/SLO foi medido.

### Reavaliação final do DoR

| Critério obrigatório | Estado | Evidência |
|---|---|---|
| Dependências TASK-001/002/003/005 | APROVADO | GATE-001 e rastreabilidade preservados na Etapa 001. |
| IDs RNF/ADR e critérios testáveis | APROVADO | RNF-003..006/008..011; RTO/RPO e SLIs separados, fórmulas, janelas e procedimentos aprovados/documentados. |
| Decisões operacionais e regras pendentes | APROVADO | Destino independente em alternativas aprovadas, retenção, janela, região, custos e limites documentados; promoção paga exige autorização financeira. A política de cinco anos é diretriz operacional, com validação jurídica por categoria antes de purge de dados reais. |
| Cópia/restauração de Storage | APROVADO como requisito de desenho | Cópia física integral e SHA-256 por objeto confirmados pela responsável em 14/11; metadados no dump devem ser verificados no archive durante implementação. |
| Ambiente e meios de validação | APROVADO | Docker Engine 29.9.2 e Supabase CLI 2.122.0 operacionais; stack isolada ainda não iniciada, conforme apropriado para o DoR. |
| Escopo, segurança e billing | APROVADO | Testes autorizados somente em stack local sintética; nenhum serviço pago/produção autorizado. |

**Resultado: DoR 100% atendido; GATE-002: APROVADO; Etapa 002: APROVADA.** A aprovação certifica prontidão e decisões; não afirma que backups, restore, SLO, RPO ou RTO foram executados/medidos.

A primeira avaliação bloqueada e a reavaliação intermediária de 14/11 permanecem preservadas como histórico. Esta seção é a conclusão posterior, baseada no Docker ativo, na instalação local do lockfile e nas decisões complementares recebidas em 14/11.

## Adendo final — GATE-002 aprovado e início da Etapa 003 (2026-11-14)

**Validações do ambiente:** `docker info --format 'ServerVersion={{.ServerVersion}}'` retornou `ServerVersion=29.9.2` (PASS). `npm ci` instalou 336 dependências do `package-lock.json` sem alterar o lockfile (PASS); a auditoria automática reportou 2 vulnerabilidades moderadas, não investigadas nesta etapa. `supabase --version`, usando o binário local do projeto, retornou `2.122.0` (PASS). Nenhuma stack foi iniciada, nenhum teste/backup/restore/migration foi executado e nenhum dado foi modificado.

**Critérios e decisões:** a responsável definiu o SLI de disponibilidade (99,5% em 30 dias, probes e requisições válidas, com 5xx/timeouts atribuíveis) e confirmou cópia física de todos os bytes Storage, SHA-256 por objeto e verificação no restore. A separação em relação ao SLI de backup, os endpoints existentes, o orçamento de erro exato (3h36m/30 dias) e as ressalvas jurídicas/financeiras foram documentados na arquitetura. RTO/RPO/SLO permanecem metas não medidas; isso é critério de implementação/teste posterior, não pendência do DoR.

**Decisão:** DoR completo com ferramentas locais operacionais, decisões de negócio necessárias registradas, escopo/validação testáveis e sem serviço pago ou externo necessário para iniciar o planejamento. **GATE-002: APROVADO; Etapa 002: APROVADA.** A decisão aprova prontidão, não resultados de restore, RPO/RTO ou disponibilidade.

**Etapa 003:** iniciada e concluída como planejamento documental; relatório `docs/reports/TASK-013-etapa-003-planejamento.md`; **GATE-003: APROVADO** conforme critérios do prompt oficial. TASK-013 passa a `IN_PROGRESS`; GATE-004 a GATE-007 permanecem pendentes. Etapa 004 não iniciada. Sem commit/push/merge.
