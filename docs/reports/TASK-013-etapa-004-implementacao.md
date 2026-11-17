# TASK-013 — Etapa 004: Implementação

**Data:** 2026-11-14
**Branch:** `task/TASK-013-seguranca-recuperacao`
**Estado vigente:** GATE-004 **APROVADO POR ACEITE FORMAL DO ESCOPO REVISADO**. As limitações operacionais permanecem explícitas como riscos aceitos e pré-requisitos de produção.

## Escopo executado

Foram criados scripts isolados para backup cifrado do PostgreSQL e dos bytes dos objetos Storage, restore em projeto local explicitamente descartável, cálculo de SLI/RTO/RPO e coleta de probes HTTP sem corpo de resposta. A proteção exige projeto `task013-test-*` para backup e `task013-restore-*` para restore, endpoints loopback/portas configuradas, container identificado pelo label Supabase, artefatos fora do repositório e confirmação explícita do alvo de restore. O dump é transmitido cifrado sem arquivo plaintext persistente; o conjunto é publicado atomicamente após validação do archive e dos hashes. As chaves e credenciais sintéticas usadas na validação ficaram em variáveis temporárias e não foram registradas.

Arquivos da implementação: `scripts/task013/{backup-lib,backup,restore,sli,probe}.mjs`, `tests/task013/backup.test.mjs`, scripts TASK-013 em `package.json`, `docs/runbooks/TASK-013-backup-restore.md` e `docs/observability/TASK-013-slo.md`.

## Evidência obtida

- `node tests/task013/backup.test.mjs`: **12/12 PASS**, 0 falhas, 0 skips. Cobre cifra/autenticação, streaming, proteção contra traversal, guardas de endpoint/projeto/credencial, presença de metadados `storage.objects`, SLI e política dos probes.
- `node --check scripts/task013/*.mjs`: **PASS** para os cinco módulos.
- Biome nos diretórios `scripts/task013` e `tests/task013`: sem erros; 6 informações de estilo `useTemplate` permanecem.
- `package.json` parseado por Node: **PASS**. `lint:task013` limita-se aos diretórios da TASK-013 para não impor reformatação do arquivo compartilhado.
- Em stack sintética de origem `task013-test-20261114`, portas 56321–56327, foi executado o script de backup. Ele retornou marcador de conclusão e produziu diretórios de artefato cifrado fora do repositório. A implementação exige `storage.objects` no archive e cifra um artefato para cada objeto inventariado.
- A causa raiz do restore foi recuperada sem repetir a operação: o log do banco-alvo registrou `must be owner of event trigger pgrst_drop_watch`; a consulta de catálogo mostrou que o trigger pertence a `supabase_admin`, enquanto o role `postgres` não é superuser. A função de restore foi corrigida para executar `pg_restore` como `supabase_admin` no container já validado como `task013-restore-*`. A captura de stderr foi removida para impedir que erros de dados eventualmente apareçam nos logs. Sintaxe, 12 testes unitários e Biome foram repetidos após essa correção; **o restore integrado pós-correção não foi executado** porque a proteção de auto-review recusou a operação por limite de uso. Nenhum bypass foi tentado.
- A stack original compartilhada `flor-da-meia-noite-local` não foi iniciada, parada, reiniciada, resetada ou alterada. Somente stacks `task013-test-*` e `task013-restore-*` temporárias foram usadas.

## Limitações operacionais e riscos aceitos para produção

Não há prova de restore conjunto banco+Storage após a correção, integridade após restauração, tempo de restore, RTO ou RPO. O destino gerado está em disco local temporário, não é cópia independente da máquina/provedor; não há agendador diário, retenção automática de 30 dias, backend de logs por 30 dias, dashboard/alertas operacionais, budget alerts ou rollback de runtime OCI demonstrados. O código de probe produz JSONL local, não disponibiliza monitoramento contínuo. Portanto, a implementação parcial não satisfaz os critérios oficiais de backup automático e independente, restore, SLO e operação.

O roteiro operacional registrava `pg_dump --single-transaction`; `pg_dump --help` da versão disponível não oferece essa opção. O comando implementado usa `--format=custom --serializable-deferrable`, opção confirmada pelo help local. A decisão arquitetural foi atualizada sem alterar o requisito de snapshot consistente.

## Retomada segura do restore pós-correção

Pré-condições: revisar que o diretório contém `supabase/config.toml` com ID `task013-restore-*`; confirmar portas/API loopback e `docker inspect` com estado ativo e label `com.supabase.cli.project` igual ao ID; confirmar que o alvo é descartável e não contém dados que precisem ser preservados; usar backup sintético completo e a mesma chave de cifra original; fornecer apenas chave `service_role` obtida do status daquela stack. Não executar contra `flor-da-meia-noite-local` nem qualquer projeto remoto.

Com esses valores verificados na sessão local, o comando é `npm run restore:task013` com `TASK013_SUPABASE_WORKDIR`, `TASK013_SUPABASE_URL`, `TASK013_SERVICE_ROLE_KEY`, `TASK013_BACKUP_DIR`, `TASK013_ENCRYPTION_KEY` e `TASK013_RESTORE_ACKNOWLEDGE_ISOLATED_TARGET=YES`. Não registrar os valores secretos. A tentativa pós-correção permanece pendente porque o auto-review recusou a execução; este relatório não afirma sucesso de restore.

## Resultado

**Estado registrado em 2026-11-14 (histórico): GATE-004 BLOQUEADO.** Naquela revisão, a evidência unitária e a geração local eram parciais, e o restore ponta a ponta ainda não havia sido comprovado. A decisão vigente está registrada nos adendos de 2026-11-15.

## Adendo de prontidão — 2026-11-15

- Backup sintético `2026-11-15T01-47-44-180Z-f7700d1d-0bfd-4f29-a642-d6068f541e3e`, projeto `task013-test-20261114`: o hash do manifesto no descriptor coincide com o selo; AES-256-GCM e SHA-256 validaram o manifesto e o dump de 534.544 bytes. O único objeto sintético (8.192 bytes) foi autenticado e seu SHA-256 coincidiu com o arquivo de origem, o registro do manifesto e os bytes decifrados. Isso prova integridade do artefato, não restauração.
- Alvo identificado: projeto `task013-restore-20261114`, API `127.0.0.1:56421`, DB `127.0.0.1:56422`, container `supabase_db_task013-restore-20261114`, label igual ao projeto e volume Docker `supabase_db_task013-restore-20261114`. Consulta somente de leitura encontrou 0 usuários Auth, 0 objetos Storage, 2 buckets padrão vazios (`catalog` público e `employee-contracts` privado), ausência da tabela marcador e 28 tabelas públicas; apenas `catalog_categories` tinha linhas (16 categorias padrão de migração). O alvo foi criado para esta validação sintética e não contém dados de usuário identificados; `pg_restore --clean` continua sendo destrutivo, portanto a execução foi deliberadamente não realizada nesta rodada.
- Pré-validações de ID, porta, label, estado do container e integridade do backup estão satisfeitas para o alvo descrito. Restore pós-correção segue **NOT RUN** conforme solicitação. Destino externo, agendamento, retenção automática, monitoramento/alertas e medições RPO/RTO continuam pendentes.

**Estado antes da execução autorizada de 2026-11-15:** GATE-004 estava **BLOQUEADO** até haver restore verificado e evidências dos critérios operacionais. O estado atualizado consta no adendo abaixo.

## Adendo de execução autorizada — 2026-11-15

- As guardas foram revalidadas antes da escrita: `project_id=task013-restore-20261114`; API `127.0.0.1:56421`; DB `127.0.0.1:56422`; container `supabase_db_task013-restore-20261114` ativo, label igual ao projeto e volume próprio. `supabase status` apontou para essas portas. A chave local foi usada somente em memória e validada como role `service_role`; o ACK literal exigido pelo script foi fornecido. O alvo era descartável: antes da restauração, 0 usuários Auth, 0 objetos Storage, 2 buckets padrão vazios, 28 tabelas públicas e somente 16 categorias padrão. A stack de origem `task013-test-20261114` e a stack compartilhada não foram restauradas nem alteradas.
- A primeira execução após a correção de role falhou, com rollback da transação `pg_restore`: log do banco descartável registrou `cannot drop inherited constraint messages_2026_11_18_pkey`. O TOC do archive confirmou constraints e índices pertencentes a partições anexadas. O restore foi ajustado para detectar, a partir do TOC validado, somente as partições presentes no backup e desanexá-las do parent no alvo descartável antes do `pg_restore --clean`; nomes são limitados a identificadores ASCII seguros. A tentativa seguinte demonstrou que omitir a constraint do TOC não serve, pois o attach do índice depende dela; essa abordagem foi removida.
- A inspeção do Storage após o restore seguinte revelou `permission denied for schema storage`: o dump original foi produzido com `pg_dump --no-privileges`, portanto não continha as ACLs requeridas. O backup agora preserva ACLs, mantendo `--no-owner`; um novo backup sintético foi criado em diretório append-only fora do repositório. A restauração mantém as ACLs do arquivo, sem transferir ownership.
- Uma execução que chegou à leitura HTTP do objeto revelou ainda um erro de execução em `verifyObject`: `createHash` não estava importado. O import foi corrigido. A execução final de `npm run restore:task013` terminou com `status=restored_and_verified`, `objectCount=1`, `exit=0`.
- Evidência final do conjunto `2026-11-15T03-38-46-420Z-2c4f4bb0-641e-46d9-9239-6601d295d129` (origem sintética `task013-test-20261114`): dump descriptografado e autenticado com **640.521 bytes**, SHA-256 `eab1604b718825c859728bcb0751b379c37e7132f5a8dcf177b9965538961f0a`. O objeto `task013-synthetic/task013-validation/marker.bin` foi restaurado e lido pela API Storage: **8.192 bytes**, MIME `application/octet-stream`, SHA-256 `1f5a16c4456f34c5459e4e66d8650d4dbb6b298810d0c21cef6571db21d69c81`; o script comparou tamanho e SHA com o manifesto antes de declarar sucesso.
- Verificação somente de leitura após sucesso, comparada à origem: origem e destino têm `auth.users=0`, `storage.objects=1`, `storage.buckets=3`, `public.task013_validation_marker=1` e 29 tabelas públicas. `storage.objects` no destino aponta ao bucket/chave sintéticos acima e metadata size 8192. O role local `service_role` tem `USAGE` no schema `storage` e `SELECT` em `storage.buckets`. Os logs Storage confirmam inventário HTTP 200, upload HTTP 200 e download HTTP 200; a confirmação `restored_and_verified` cobre também o hash calculado dos bytes baixados.
- `npm run test:task013`: **13/13 PASS**, 0 falhas, 0 skips; `npm run lint:task013`: PASS (6 avisos informativos `useTemplate`, sem erros); `node --check` nos scripts TASK-013: PASS. As falhas intermediárias e respectivas correções estão registradas acima, não foram tratadas como sucesso.

**Estado técnico anterior ao aceite formal (histórico): GATE-004 BLOQUEADO.** O exercício local sintético não comprova backup automático nem destino independente/off-host, agendamento, expiração/retention automática de 30 dias, retenção central de logs, dashboards/alertas/budget alerts, isolamento efetivo teste/produção, imagem OCI aprovada/reproduzível e rollback, nem medições ponta a ponta de disponibilidade/SLO 99,5% mensal, integridade de jobs ≥99%/30 dias, RPO e RTO ≤24h. Por aceite formal da responsável, essas lacunas permanecem como riscos aceitos para o escopo local/sintético e pré-requisitos para produção, sem serem declaradas implementadas ou medidas.

## Adendo — aceite formal do escopo revisado (2026-11-15)

Por autorização expressa da responsável, o GATE-004 está **APROVADO POR ACEITE FORMAL DO ESCOPO REVISADO**.

**Status vigente:** APROVADO. O aceite não converte as limitações operacionais listadas acima em evidência de implementação nem mede SLO/RPO/RTO; mantém-nas como riscos aceitos e pré-requisitos de produção.

O aceite considera comprovados:
- backup sintético cifrado de PostgreSQL e Storage;
- verificação de integridade por AES-256-GCM e SHA-256;
- restauração isolada concluída com estado `restored_and_verified`;
- conferência dos marcadores, buckets, tabelas e objeto Storage;
- testes automatizados TASK-013 13/13 PASS;
- validações de lint direcionado, typecheck e build PASS.

As capacidades de destino independente, agendamento, retenção operacional, observabilidade, alertas, isolamento operacional e rollback OCI permanecem não implementadas ou não comprovadas. Não são declaradas concluídas por este aceite. Ficam registradas como riscos aceitos e pré-requisitos para implantação em produção, juntamente com a medição real de SLO, RPO e RTO.

A aprovação é limitada ao escopo de implementação local/sintética revisado. Não autoriza deploy ou gasto.
