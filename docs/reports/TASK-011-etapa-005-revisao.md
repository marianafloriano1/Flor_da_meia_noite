# TASK-011 — Etapa 005 — Revisão

**Data:** 2026-11-08
**Branch:** `task/TASK-011-relatorios-exportacoes-metricas`
**GATE-005:** APROVADO em 2026-11-09 após revisão das evidências posteriores da CI 42703076319 (commit `d6124e18edc05593f63c394f1c9b54201d7d4bc4`)

## Revisão do escopo

- Acesso aos relatórios e exportações é verificado no servidor; apenas `admin` passa.
- A rota mutável de exportação valida same-origin e filtros; falhas não expõem dados internos.
- Consultas selecionam apenas campos de pedido, itens, eventos e catálogo necessários à agregação. Dados pessoais de clientes não entram no DTO/export.
- Os arquivos XLSX/PDF são produzidos na resposta e não são armazenados em bucket público.
- A tabela de auditoria guarda somente UID do ator, período, base, formato e timestamp do banco.
- As bases temporais de criação e pagamento são separadas; ambos exigem pagamento confirmado para faturamento. Cancelamentos após pagamento aparecem separadamente sem assumir reembolso.
- A ordenação do ranking é determinística. As quantidades devolvidas em eventos de cancelamento por item são deduzidas das unidades; esta métrica representa unidades líquidas, não um cálculo de reembolso.
- Não foram alterados os contratos, código, testes ou migrations históricas das dependências.

## Achados e veredito anteriores à CI (registro histórico de 2026-11-08)

| Severidade | Achado | Situação |
|---|---|---|
| P1/P2 funcionais | Nenhum achado confirmado na revisão estática e nos testes direcionados executados | Resolvido/sem achado |
| Validação obrigatória | Supabase efêmero, aplicação da migration e integração real ainda aguardam CI | Pendente; não é resultado funcional aprovado |
| Regressão herdada | `npm run test:task006` falha em asserção do parser de cupom presente na base integrada: espera propriedade `couponCode` ausente, implementação retorna `null`; arquivo não foi alterado | Falha observada e registrada; requer triagem na tarefa proprietária antes de declarar regressão geral PASS |

## Verificações

- `npm run test:task011`: 13/13 PASS, 0 SKIP.
- `npm run lint:task011`: PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `git diff --check`: PASS; sem erros de whitespace. Git emitiu apenas avisos de normalização CRLF→LF para os arquivos do worktree.
- Integração Supabase: NOT RUN localmente porque Docker está inacessível; workflow efêmero preparado, sem execução remota nesta retomada.

## Veredito anterior à CI (histórico)

A revisão estática e as verificações locais não apontaram defeito P1/P2 no escopo implementado. GATE-005 não pode ser aprovado enquanto a integração real da migration aguarda CI e a regressão `test:task006` permanece falhando na base integrada. A Etapa 006 está preparada por meio do roteiro, mas não foi iniciada nem executada; permanece dependente da aprovação dos gates anteriores e da execução manual pela operadora.

## Reavaliação posterior do GATE-005 — GitHub Actions (2026-11-09)

- Execução [CI 42703076319](https://github.com/marianafloriano1/Flor_da_meia_noite/actions/runs/42703076319), commit `d6124e18edc05593f63c394f1c9b54201d7d4bc4`, branch `task/TASK-011-relatorios-exportacoes-metricas`: a página pública confirma status geral **Success** e os jobs `TASK-011 Supabase integration` e `TASK-006 Supabase integration` como **succeeded**. Os logs detalhados exigem autenticação no GitHub.
- Conforme evidência fornecida pela solicitante, TASK-011 aplicou migrations na stack efêmera e executou 1 teste integrado aprovado, 0 falhas e 0 skips. O workflow torna obrigatórias as credenciais locais, a aplicação das migrations, essas contagens, a presença do cenário de integração esperado e a ausência de skips.
- O job TASK-006 da mesma execução também foi **succeeded**. Seu workflow inicia stack efêmera, aplica migrations, proíbe skips e exige os seis cenários integrados registrados no script: consentimento após mudança de preço; retry idempotente; abortar commit por divergência de preço; inspeção/MFA/pagamento; expiração e cancelamento do não pago; concorrência entre conversão e expiração. A evidência operacional fornecida pela solicitante informa que esses critérios foram satisfeitos.
- A execução local posterior informada pela solicitante (`npm run test:task006`: 5 aprovados, 0 falhas, 1 skip) é registrada separadamente: o skip decorreu da ausência de configuração de integração local e não é tratado como aprovação integrada. A CI efêmera, cujo workflow proíbe skips, é a evidência integrada aplicável ao gate.
- Assim, a pendência histórica de integração e a falha local anterior deixam de bloquear esta revisão: a CI posterior executou os testes TASK-006 na base integrada e concluiu o job com sucesso. Isso registra a resolução da pendência para esta branch, sem alterar código, testes ou contratos de TASK-006.
- A revisão estática anterior não registrou achados P1/P2 no escopo TASK-011; os gates locais direcionados descritos acima permanecem como evidências históricas, sem rerun nesta atualização.
- **Resultado atual: GATE-005 = APROVADO.** A Etapa 006 permanece não executada, aguardando os testes manuais T001–T011 pela operadora. GATE-006 não está aprovado e a Etapa 007 não foi iniciada nem habilitada por esta atualização.

## Retificação posterior de status — 2026-11-10

O estado anterior que mantinha GATE-006 pendente e Etapa 007 não iniciada descreve a avaliação registrada em 2026-11-09. A responsável confirmou posteriormente a aprovação de GATE-006 e GATE-007 e a conclusão da TASK-011. **TASK-011 = DONE; GATE-001–007 APROVADOS.** A aprovação de T001–T011 é atribuída à responsável; esta nota não altera os resultados observados nem inventa logs. Ver docs/reports/RETIFICACAO_APROVACOES_TASK-010_TASK-011.md.
