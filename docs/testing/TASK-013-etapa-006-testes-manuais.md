# TASK-013 — Etapa 006: Roteiro de testes manuais e operacionais

**Estado:** **CONCLUÍDA — GATE-006 APROVADO** para o escopo local/sintético revisado.
**Gates anteriores:** GATE-004 e GATE-005 permanecem **APROVADOS por aceite formal do escopo revisado**. Após a consolidação da declaração manual, GATE-006 está **APROVADO** para o escopo local/sintético revisado; T011 continua como limitação aceita e não executada.

**Nota de proveniência:** a tabela preliminar abaixo registra verificações anteriores do Codex e não representa a execução manual da operadora. O registro manual declarado em 2026-11-15, acrescentado ao final deste arquivo, é a fonte dos resultados T001–T011.

## Regras de segurança

- Usar somente projetos Supabase locais e sintéticos `task013-test-*` e `task013-restore-*`, cada um com configuração/portas e containers identificados.
- Não usar projeto remoto, produção, dados reais, secrets versionados ou a stack compartilhada `flor-da-meia-noite-local`.
- A restauração é destrutiva no banco alvo: usar apenas projeto restore descartável, verificar endpoint e label, fornecer `TASK013_RESTORE_ACKNOWLEDGE_ISOLATED_TARGET=YES` somente após a confirmação do isolamento.
- Preservar artefatos/cópias válidos; não executar `db reset`, apagar volumes nem repetir upload sem consulta prévia.
- Guardar evidência sem tokens, service-role keys, chaves de cifra, OTP, PII ou URLs assinadas.

## Registro preliminar anterior à declaração manual da operadora

| ID | Critério | Procedimento | Resultado esperado | Evidência necessária | Estado preliminar antes da execução manual |
|---|---|---|---|---|---|
| T001 | Rejeitar projeto-fonte não isolado | Executar validação de backup com ID de projeto que não use prefixo `task013-test-`, sem iniciar conexão. | Processo recusa o projeto antes de acessar banco/API. | Código/saída sanitizada e prova do endpoint/ID sintético utilizado. | Validação preliminar Codex: exit 1, `task013_isolated_project_id_required`; sem conexão. Caso manual da operadora NÃO INICIADO |
| T002 | Rejeitar endpoint remoto | Usar configuração sintética com host não-loopback; não enviar requisição. | Guarda recusa antes da conexão externa. | Saída sanitizada e configuração sem segredo. | Validação preliminar Codex com `https://example.invalid`: exit 1, `task013_source_must_be_localhost`; nenhuma requisição externa. Caso manual da operadora NÃO INICIADO |
| T003 | Rejeitar diretório de artefatos dentro do repositório | Definir raiz de backup igual ao checkout ou subdiretório e executar pré-validação. | Operação aborta e nenhum artefato é criado no checkout. | Saída, `git status` antes/depois e caminhos redigidos. | Validação preliminar Codex: exit 1, `task013_backup_root_must_be_outside_repository`; abortou antes de criar artefatos. Caso manual da operadora NÃO INICIADO |
| T004 | Criar backup cifrado | Em stack sintética, executar backup e inventariar descriptor e arquivos do conjunto. | Conjunto completo publicado atomicamente, sem dump plaintext; manifest e artefatos cifrados. | Descriptor, contagem/tamanho, hash do ciphertext e verificação de ausência de plaintext. | Backup sintético executado pelo Codex; caso manual não executado |
| T005 | Incluir metadados Storage no dump | Inspecionar lista do archive do dump e procurar dados de `storage.objects`. | Archive contém linhas/metadados necessários à restauração de buckets/objetos. | Saída `pg_restore --list` sanitizada, versão e hash do dump. | Verificação interna do backup ocorreu; evidência manual NOT RUN |
| T006 | Copiar bytes e verificar manifesto | Comparar inventário de buckets/objetos, tamanhos e SHA-256 na origem e nos artefatos cifrados. | Todo objeto do snapshot tem manifesto e hash; qualquer ausência invalida o conjunto. | Manifesto descriptografado apenas localmente, lista redigida, contagens e hashes. | Um fixture sintético foi incluído; restore/hash final não comprovado |
| T007 | Detectar adulteração | Em cópia descartável do conjunto, modificar ciphertext e iniciar apenas validação offline do artefato. | AES-GCM rejeita o arquivo adulterado antes de conexão/escrita no alvo. | Saída sanitizada e confirmação de que alvo permaneceu sem alterações. | Validação Codex em memória rejeitou ciphertext alterado com `task013_ciphertext_integrity_failed`; cópia física/manual NÃO INICIADA |
| T008 | Proteger o destino de restore | Tentar validação sem ACK explícito, com ID fora do prefixo e com container/label divergente; não fornecer dados reais. | Cada caso é rejeitado antes de executar `pg_restore`. | Saídas sanitizadas e inspeções de ID/label/porta. | Validações Codex: ACK ausente (`task013_required_env_missing:TASK013_RESTORE_ACKNOWLEDGE_ISOLATED_TARGET`) e ID inválido (`task013_isolated_project_id_required`) foram rejeitados antes da conexão; divergência de label não exercitada. Caso manual da operadora NÃO INICIADO |
| T009 | Restaurar banco e Storage juntos | Gerar backup sintético, restaurar em stack `task013-restore-*` isolada, consultar marcador sintético e baixar objeto para comparar SHA-256. | Marcador DB, bucket, objeto, tamanho e hash restauram iguais; estado final é `restored_and_verified`. | Saídas de backup/restore, consulta do marcador sintético, hash de bytes e endpoints/labels isolados. | Exercício automatizado da Etapa 004 concluído em 2026-11-15 (`restored_and_verified`, um objeto; detalhes no relatório da Etapa 004). Execução manual T009 pela operadora NÃO INICIADA. |
| T010 | Medir RTO/RPO | Cronometrar início do restore até health-check e comparar horário do marcador de origem com o restaurado. | RTO ≤24h e RPO ≤24h, medidos ponta a ponta; sem estimativa substituindo medição. | Timestamps UTC, duração, fonte do marcador, health-check e cálculo reproduzível. | NOT RUN; sem medições |
| T011 | Conferir operação, retenção e alertas | Em ambiente gerenciado autorizado, observar job diário, expiração de 30 dias, logs, alertas de falha/atraso/checksum/budget e rollback OCI. | Ciclo e alertas observáveis, retenção configurada sem purge jurídico indiscriminado e rollback demonstrado. | Execuções do scheduler, política/configuração, eventos de alerta, evidência de retenção e rollback. | NOT RUN; limitações operacionais aceitas para GATE-004/GATE-005, ainda não implementadas e pré-requisitos de produção. |

Os T001–T011 acima são um roteiro operacional desta etapa, não resultados já aprovados nem substituição de critérios originais. As verificações preliminares listadas foram executadas pelo Codex e não são atribuídas à operadora nem certificam a conclusão manual dos casos. O teste unitário automatizado 13/13 e o restore sintético da Etapa 004 são evidências separadas.

## Registro de andamento preliminar (anterior à declaração manual) — 2026-11-15

Checkpoint preliminar anterior à declaração manual: a Etapa 006 havia sido iniciada com verificações parciais do Codex para T001–T003 e T007–T008. Naquele momento, T004–T006 e T009 tinham somente evidência automatizada anterior; T010 não tinha medição registrada; T011 não havia sido executado. Naquele checkpoint, GATE-006 constava PENDENTE e Etapa 007 não iniciada. Esse status histórico foi supersedido pelo registro manual declarado e pela avaliação vigente abaixo.

## Coleta

Para cada caso registrar executor, data/hora UTC e local, identificação não secreta do projeto isolado, comando/ação, resultado observado, código de saída e caminhos de logs/capturas redigidos. Para RTO/RPO guardar timestamps necessários à reprodução. A responsável deve anexar evidências visuais/logs sem segredos; o Codex não atribui a si a execução manual pendente.

## Registro manual declarado pela operadora — 2026-11-15

Janela declarada: 2026-11-15T14:49:52Z a 2026-11-15T15:02:04Z. Operadora: Mariana Floriano de Sant Anna.

Ambientes declarados: origem task013-test-20261114, API 127.0.0.1:56321, banco 56322; destino descartável task013-restore-20261114, API 127.0.0.1:56421, banco 56422. Diretório de artefatos informado: $TEMP\task013-validation-20261114\artifacts-manual-20261115.

Os artefatos externos não estão visíveis no diretório TEMP desta sessão e não foram inspecionados independentemente pelo Codex. Os itens abaixo são transcrição da evidência sanitizada e declaração da operadora, sem atribuição de execução manual ao Codex.

| Caso | Status informado | Evidência fornecida |
|---|---|---|
| T001 | PASS | Projeto flor-da-meia-noite-local rejeitado com task013_isolated_project_id_required, exit 1. |
| T002 | PASS | Endpoint remoto https://example.invalid rejeitado com task013_source_must_be_localhost, exit 1. |
| T003 | PASS | Diretório de backup dentro do repositório rejeitado com task013_backup_root_must_be_outside_repository; git status --short inalterado e diretório não criado. |
| T004 | PASS | Backup 2026-11-15T14-55-49-077Z-289a2e81-87cb-4b3b-8429-c5e24b6e67d7 criado com cinco artefatos cifrados/selados e nenhum arquivo plaintext. |
| T005 | PASS | Dump inspecionado em memória com pg_restore --list, PostgreSQL 15.19: 109 entradas do schema storage, incluindo TABLE DATA storage buckets e TABLE DATA storage objects. |
| T006 | PASS | Manifesto descriptografado em memória: três buckets e um objeto Storage de 8.192 bytes. Hash plaintext 1f5a16c4456f34c5459e4e66d8650d4dbb6b298810d0c21cef6571db21d69c81; hash ciphertext b7d9753515afd90bf1019db835d3153087331c0ecb12e3b13a783853505567ca. |
| T007 | PASS | Cópia descartável adulterada rejeitada com task013_storage_archive_hash_mismatch; AES-GCM também rejeitou ciphertext alterado com task013_ciphertext_integrity_failed, sem escrita no alvo. |
| T008 | PASS | ACK ausente, ID fora do prefixo permitido e container/label divergente rejeitados antes de pg_restore: task013_required_env_missing:TASK013_RESTORE_ACKNOWLEDGE_ISOLATED_TARGET, task013_isolated_project_id_required e task013_isolated_restore_container_missing, respectivamente. |
| T009 | PASS | Backup 2026-11-15T15-01-15-234Z-bfddd947-d89a-4793-a6a5-3406c17b04d4 restaurado no destino; restored_and_verified, exit 0. Marcador DB MANUAL-OP-E2E-20261115150110 e objeto task013-validation/manual-marker-20261115.bin, 4.096 bytes, SHA-256 fe339885618a2316813511ae91689219c6b0ca90c6625cb157fc240701af28ef, declarados verificados. |
| T010 | PASS | RTO informado: 5,26 segundos, de 15:01:18.990Z a 15:01:24.250Z. RPO informado: 14,222 segundos, do marcador 15:01:10.028Z à conclusão 15:01:24.250Z. Ambos abaixo do objetivo de 24 horas. |
| T011 | ACCEPTED_LIMITATION (NOT_RUN) | Runbooks e documentação operacional conferidos pela operadora. Scheduler, lifecycle de 30 dias, alertas gerenciados e rollback OCI continuam como limitações aceitas para produção conforme as decisões formais dos GATE-004 e GATE-005. |

Nenhum segredo aparece na transcrição fornecida. Essa observação se limita ao registro textual recebido; não certifica arquivos externos que não puderam ser inspecionados.

## Avaliação vigente do GATE-006

GATE-006 **APROVADO** para o escopo local/sintético revisado. T001–T010 são registrados como PASS conforme a execução declarada e evidências sanitizadas fornecidas pela operadora. T011 permanece ACCEPTED_LIMITATION (NOT_RUN), não é convertido em PASS e não demonstra implementação operacional.

A aceitação de T011 decorre da decisão formal registrada nos GATE-004 e GATE-005: scheduler, retenção gerenciada, monitoramento/alertas e rollback OCI são pré-requisitos para produção, não bloqueadores do escopo local/sintético revisado. Essa decisão é compatível com o DoD do AGENTS.md, que permite gates explicitamente aceitos como NOT APPLICABLE/BLOCKED pela responsável. Permanecem como riscos e pré-requisitos de go-live: destino independente, scheduler, retenção, monitoramento/alertas, rollback OCI e medições operacionais contínuas. Esta aprovação não autoriza produção, gastos ou uso de dados reais.

Etapa 006 concluída; Etapa 007 foi iniciada para consolidação final. Este era o estado no momento da transição; o GATE-007 e o status final da TASK-013 estão registrados no relatório de conclusão. Nenhum teste foi repetido nesta consolidação.