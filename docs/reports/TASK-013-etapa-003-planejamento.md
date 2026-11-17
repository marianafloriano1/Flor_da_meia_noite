# TASK-013 — Etapa 003: Planejamento

**Data:** 2026-11-14
**Branch:** `task/TASK-013-seguranca-recuperacao`
**HEAD de referência:** `68ba912` (alterações locais não commitadas)
**Gate predecessor:** GATE-002 APROVADO em `docs/reports/TASK-013-etapa-002-pre-condicoes-2026-11-13.md`
**Escopo:** planejamento documental; nenhuma implementação, stack, migration, backup, restore, teste ou serviço foi executado.

## 1. Estado e base do plano

A TASK-013 permanece `IN_PROGRESS`. GATE-001 e GATE-002 estão aprovados; as decisões de backup, Storage binário, retenção, métricas, região e limite de billing estão registradas em `docs/architecture/TASK-013-backup-recuperacao.md`. A Etapa 003 transforma essas decisões em um plano rastreável de implementação e evidência. A aprovação deste plano não autoriza produção, consumo pago ou execução da Etapa 004.

Ambiente confirmado para validações locais futuras: Docker Engine `29.9.2`, Supabase CLI `2.122.0`; dependências instaladas via `npm ci` a partir do lockfile. O projeto declara Supabase local em `supabase/config.toml` e scripts `supabase:start`, `supabase:status` e `supabase:stop`. A stack não foi iniciada nesta etapa.

## 2. Escopo e guardrails

**Allowed Changes da implementação futura:** pipeline/runtime OCI, jobs de backup, cópia externa, dashboards/alertas, runbooks, gestão de secrets, políticas de Storage/database e custos.

**Forbidden:** deploy ou acesso a dados reais sem autorização; alegar RPO/RTO/SLO atendidos sem medição; desligar auditoria/RLS; incluir segredos ou PII em repositório/logs; executar testes contra produção; contratar ou ativar serviço pago sem aprovação financeira específica.

**Escopo documental da Etapa 003:** novos relatórios e plano. Nenhuma alteração funcional ou infraestrutura é autorizada nesta etapa.

## 3. Arquitetura planejada

1. **Job de backup diário, 03:00 BRT:** dump PostgreSQL custom com `pg_dump --format=custom --single-transaction`, cifrado antes da saída do ambiente; exportação completa dos bytes de todos os buckets Storage para destino independente, acompanhada do inventário/metadados. Não usar `supabase db dump` sem validar seu escopo de schemas; o artefato deve conter os metadados `storage.objects` requeridos.
2. **Manifesto de backup-set:** ID imutável por execução; timestamps UTC/BRT; commit/schema/migration version; ferramenta/versão; nome/tamanho/checksum SHA-256 do dump; para cada objeto: bucket, chave, MIME, tamanho e SHA-256. Sem token, segredo, CPF completo ou URL assinada.
3. **Consistência:** cópia append-only, sem propagar exclusões; preservar objetos por todo o período de retenção. Reconciliar o snapshot do banco com bytes disponíveis no destino; revalidar hash. Marcar conjunto incompleto se faltar objeto ou checksum; nunca contar job incompleto como sucesso. A verificação de `storage.objects` no archive é obrigatória.
4. **Destino e faturamento:** interface de destino independente, compatível com as alternativas aprovadas (S3/R2 ou artefato criptografado isolado). Destino comercial concreto, conta e região exata ficam atrás de aprovação financeira/de infraestrutura; validação nesta tarefa usa apenas stack local sintética e artefato local criptografado.
5. **Restore:** restaurar DB e Storage juntos em stack descartável isolada; validar schema/migrations, referências, bytes/checksums, login sintético e consulta ao catálogo. O runbook mede RTO de início do exercício até serviço restaurado/health-check válido; RPO é diferença entre o marcador sintético mais recente confirmado e o último marcador recuperado.
6. **Observabilidade:** separar SLO de disponibilidade (99,5%, 30 dias) do SLI de backup (≥99% jobs íntegros, 30 dias) e do RTO/RPO. Probes HTTP e requisições válidas observam 5xx/timeouts atribuíveis à aplicação/banco. Implementar métricas, alertas de job atrasado/falha/checksum/RPO em risco e dashboard; não declarar metas medidas até executar janela de observação/restore.
7. **Logs e retenção:** classes app/Auth/outbox/backup com export/rotação e retenção de 30 dias; segredos/PII minimizados. Diretriz operacional de cinco anos para registros transacionais/fiscais; nenhuma purge real automática antes de validação jurídico-contábil por categoria e regra de hold/anonimização.
8. **Região e runtime:** projeto Supabase em `sa-east-1`; alvo Cloud Run em São Paulo `southamerica-east1`, conforme mapeamento do provedor. Nenhum serviço é criado nesta etapa. Imagem OCI deve ser reproduzível, identificada por digest, com rollback para digest anterior.

## 4. Matriz critério → artefato → validação futura

| Critério de aceite | Arquivos/áreas planejados (novos ou alterações futuras) | Evidência/gate de validação |
|---|---|---|
| Backup automático independente DB + Storage | `scripts/task013/backup.mjs`; configuração de job/scheduler no diretório de infraestrutura aprovado; `package.json` scripts; `docs/architecture/TASK-013-backup-recuperacao.md` | Execução local em stack sintética; artefato cifrado, manifesto, checksums e inventário de objetos; destino independente só após aprovação paga. |
| Dump recuperável e metadados completos | script de dump; documentação de esquema; migrations aplicadas | Inspecionar conteúdo do custom archive e confirmar `storage.objects`/extensões necessárias; restore em DB descartável. |
| Cópia íntegra dos bytes de todos os buckets | adapter em `scripts/task013/storage/`; manifesto | Comparar contagem/tamanho/hash origem→cópia→restore; injetar hash incorreto e confirmar rejeição. |
| RPO ≤24h e RTO ≤24h | `docs/runbooks/TASK-013-backup-restore.md`; marcador sintético e relatório | Cronometrar restore ponta a ponta; calcular lag do marcador; registrar resultados reais sem alegação antes do teste. |
| Disponibilidade 99,5%/30d e backup SLI ≥99%/30d | `docs/observability/TASK-013-slo.md`; config de probe/dashboard/alerta | Testes unitários da fórmula/limites e validação de telemetria; janela real ainda precisa ser observada. Probes em `/api/health/db` e `/api/catalog`. |
| Logs 30 dias, minimização, acesso | config de export/rotação; runbook de acesso e retenção | Verificar política de expiração, consultas de log sem secret/PII e evidência de acesso restrito. Serviço/provedor depende de decisão e eventual billing específico. |
| Rollback do runtime e de restore | pipeline OCI/manifesto de imagem; runbook | Implantação isolada, health check, rollback para digest anterior; não implantar produção sem aprovação específica. |
| Budget alerts e limite de gasto | config de billing alert/limites e documentação de orçamento | Simulação/configuração apenas em projeto de teste se não gerar cobrança; produção paga depende de aprovação financeira. R$100/mês segue hipótese, não teto autorizado. |
| Separação teste/produção e segurança de secrets | `.github/workflows/ci.yml`, secrets de CI, configuração runtime e runbook | CI usa stack efêmera e dados sintéticos; nenhum segredo no repo/log; controle de IAM e rotação testados antes de produção. |

Os caminhos sob `scripts/task013/`, `docs/runbooks/`, `docs/observability/` e infraestrutura são **propostos**, não existem como implementação aprovada. Confirmar diretórios e arquivos contra `Allowed Changes` no início da Etapa 004. Nenhuma migration é prevista nesta fase; só propor alteração de schema se o desenho demonstrar necessidade concreta e a aprovação/escopo permitir.

## 5. Sequência futura da Etapa 004

1. Inventariar schema, extensões, buckets e chaves sem exportar dados reais; criar fixtures sintéticas isoladas.
2. Implementar manifesto/hash e dump cifrado; validar conteúdo e restauração do banco.
3. Implementar export binário completo dos buckets e reconciliação, sem propagação de exclusão; verificar todos os hashes.
4. Empacotar job OCI reproduzível, execução agendada e secrets em runtime; não configurar serviço pago ainda.
5. Instrumentar SLO/SLI, alertas de atraso/falha/integridade, retenção de logs e limites/budget gate em ambiente permitido.
6. Executar restore integrado local com marcador sintético; documentar RPO/RTO medidos, falhas, rollback e evidências.
7. Atualizar runbooks/arquitetura e revisar risco, permissões, retenção e Scope Guard.

## 6. Testes planejados (NOT RUN)

- Unidade: geração/canonização de manifesto, SHA-256, cifra, rejeição de arquivo truncado/ausente/hash incorreto, cálculo de SLI/erro budget, política de retenção e sanitização de logs.
- Integração local: `pg_dump --format=custom --single-transaction` e restore para banco efêmero; cópia de todos os bytes Storage; verificação de `storage.objects` e referências; restart/rollback sem mexer na origem.
- Cenários de falha: dump interrompido, Storage indisponível, objeto removido na origem, checksum divergente, chave de cifra indisponível, credencial expirada, job atrasado e restore parcial. Cada falha invalida o conjunto, gera alerta e preserva backup anterior.
- Container/runtime: build da imagem de job e smoke em ambiente local isolado; imagem web aprovada mantém configuração OCI existente.
- Segurança: least privilege, rotação de segredo, acesso de emergência, ausência de secret/PII em manifesto/logs, retenção e descarte.

Comandos futuros, somente na Etapa 004 e em stack isolada autorizada: `npm run supabase:start`; comandos de inspeção/status; carga exclusivamente sintética; comando de backup e restore dedicado; testes unitários/integrados e `git diff --check`. `supabase db reset`, produção, cobrança e envio de dados reais não fazem parte deste plano.

## 7. Riscos, mitigação e rollback

- **Dump sem schemas/metadata necessários:** inspecionar archive; declarar conjunto inválido se faltar `storage.objects`, extensões ou funções requeridas.
- **Manifesto sem bytes ou bytes incompletos:** inventário por bucket, hash por objeto e verificação após restore; não marcar job como sucesso.
- **Corrida DB/Storage:** uploads imutáveis, arquivo externo append-only e reconciliação baseada no snapshot DB; não espelhar exclusões. Se consistência não puder ser provada, invalidar conjunto e alertar.
- **Chave perdida/comprometida:** chaves fora dos artefatos, recuperação/rotação testada, acesso segregado; nunca usar backup cifrado como única cópia sem restore de chave testado.
- **Custo/egress:** testar apenas local; estimar volumes antes de projeto pago; bloquear promoção até aprovação financeira e alertas.
- **Rollback:** não sobrescrever fonte nem eliminar backup válido; interromper job em falha; restaurar em instância isolada; se restore falhar, descartar apenas o ambiente efêmero de teste após validação de isolamento e preservar a origem/cópias. Em runtime, reverter ao digest OCI anterior.

## 8. Aprovações, estado e Scope Guard

- Decisões de negócio: aprovadas conforme adendos de 13 e 14/11/2026.
- Gate anterior: GATE-002 APROVADO; evidência no relatório da Etapa 002.
- Scope Guard: PASS — apenas arquivos documentais TASK-013 alterados nesta etapa; dependências preexistentes preservadas; sem código/configuração/dados alterados.
- Testes/stack/migrations: NOT RUN; planejamento não os exige.
- GATE-003: APROVADO — planejamento cobre escopo, arquivos, critérios, validações, riscos, rollback e bloqueios externos sem decisão essencial pendente para iniciar implementação local.
- Próxima etapa: Etapa 004 — Implementação, elegível somente após autorização própria; não iniciada neste relatório.

==================================================
TASK: TASK-013
ETAPA: 003
STATUS DA ETAPA: APROVADA
==================================================
GATE DA ETAPA: APROVADO
GATES TOTAIS: 7
GATES CONCLUÍDOS: 3
GATES PENDENTES: 4
GATES BLOQUEADOS: 0
PROBLEMAS ENCONTRADOS:
- Nenhum bloqueio de planejamento. A CLI local foi instalada do lockfile durante a regularização do DoR; o audit automático de `npm ci` indicou duas vulnerabilidades moderadas, a investigar no gate de segurança aplicável.
CORREÇÕES REALIZADAS:
- Plano de implementação e matriz critério→artefato→validação documentados; sem alteração funcional.
PENDÊNCIAS:
- Implementar e validar artefatos na Etapa 004; destino pago exige aprovação financeira específica; validação jurídica por categoria antes de purge real.
TESTES RELACIONADOS:
- NOT RUN; sem stack, migration, backup, restore ou consulta de dados.
PRÓXIMA ETAPA: 004 — Implementação.
PRÓXIMA ETAPA HABILITADA: SIM, conforme planejamento aprovado; autorização própria da etapa requerida pelo AGENTS.md.
MOTIVO: GATE-002 aprovado, DoR atendido e plano aprovado. A execução de implementação não foi iniciada.
==================================================
