# TASK-013 — Decisões operacionais e reavaliação do DoR

**Data:** 2026-11-13
**Branch:** `task/TASK-013-seguranca-recuperacao`
**Base:** `68ba912d79e51cad17db1696691f946c7d91faf5`
**Escopo:** atualização documental e análise estática; sem início de implementação, serviços, billing, migrations ou testes.

## Decisões aprovadas pela responsável

| Item | Decisão registrada | Limite da decisão |
|---|---|---|
| SLO | Disponibilidade desejada de 99,5% ao mês | Meta aprovada; não é SLA, garantia ou medição. Métrica, janela de medição e alertas ainda precisam ser projetados. |
| Provedor | Supabase | Registrado para os serviços gerenciados de dados, identidade e arquivos, coerente com ADR-007. Não altera a direção OCI/Cloud Run do runtime da aplicação. |
| Região Supabase | South America (São Paulo), `sa-east-1` | Região aprovada para o projeto Supabase. Não escolhe a região do runtime Cloud Run. |
| Backup de banco | Frequência diária; retenção de referência de 30 dias | Decisão de política; implementação, tier/plano, independência e restore ainda não comprovados. |
| Logs operacionais | Retenção de referência de 30 dias | Decisão de política; capacidade nativa, destino de arquivo e custo ainda não verificados no projeto. |
| Pedidos e registros financeiros | Reter conforme prazos legais aplicáveis, sem exclusão automática indiscriminada | Os prazos legais específicos não foram identificados; não implementar purge automatizado até essa definição. |
| Orçamento | R$ 100/mês, exclusivamente hipotético | Parâmetro de planejamento/simulação. Não autoriza contratação, cobrança ou consumo pago. |
| RPO | Meta de até 24 horas | Meta aprovada, ainda não medida nem garantida. |

As decisões foram fornecidas pela responsável no prompt de regularização da TASK-013. Não foram criadas credenciais, projetos, serviços ou despesas.

## Evidência técnica documental consultada

Consulta estática ao README, ADR-001, ADR-007, `package.json`, configuração local e workflow CI. `package.json` declara Supabase CLI e comando `supabase:start`; o CI configura stack Supabase efêmera para integrações de outras tarefas. Isso demonstra ferramentas e infraestrutura de teste de banco disponíveis no repositório, mas não valida funcionalidades gerenciadas de backup, retenção, restore ou disponibilidade.

Consulta às páginas oficiais Supabase em 2026-11-13:

- [Regiões disponíveis](https://supabase.com/docs/guides/platform/regions): lista South America (São Paulo), `sa-east-1`.
- [Database Backups](https://supabase.com/docs/guides/platform/backups): informa backups automáticos diários nos planos Pro, Team e Enterprise; retenção diária de 7, 14 e até 30 dias, respectivamente. Backups de banco não incluem os bytes dos objetos Storage. Se PITR é ativado, os daily backups deixam de ocorrer.
- [Supabase pricing](https://supabase.com/pricing): exibe retenção de logs diferente por plano (Free 1 dia, Pro 7 dias e Team 28 dias) e recursos/limites sujeitos ao plano.
- [Log Drains](https://supabase.com/features/log-drains): exporta logs a destinos externos para retenção ampliada; é recurso cobrado separadamente.
- [Logs in Studio](https://supabase.com/docs/guides/observability/logs): retenção depende do plano; o conteúdo consultado pode ser exportado, mas isso não prova retenção de 30 dias do projeto.

Essas páginas são evidência de capacidades publicadas pelo fornecedor, não evidência de plano contratado, configuração do projeto da loja, execução de backup, restore ou preço final. Os recursos e limites podem mudar; a confirmação deve ocorrer antes da implantação.

## Reavaliação do DoR

| Critério obrigatório | Situação | Evidência e motivo |
|---|---|---|
| Dependências TASK-001, TASK-002, TASK-003 e TASK-005 concluídas | **ATENDIDO** | `TASKS.md` no commit-base registra as quatro como `DONE`. |
| Rastreabilidade RNF/ADR | **ATENDIDO** | A entrada da TASK referencia RNF-003..006/008..011 e ADR-001/002/005; esses documentos/IDs existem. ADR-007 confirma Supabase para dados, identidade e arquivos. |
| Metas operacionais e provedor/região registrados | **ATENDIDO** | Decisões da responsável foram registradas neste relatório, README, TASKS.md e adendo ADR-001, distinguindo metas de evidência técnica. |
| Critérios testáveis e regras pendentes sem interpretação implícita | **PARCIALMENTE ATENDIDO** | Backup diário/RPO 24 h é uma meta coerente como alvo, mas depende da disponibilidade efetiva de restore point em intervalo máximo de 24 h; não foi medido. Retenção legal de pedidos/financeiro ainda não possui prazos específicos e bloqueia purge automatizado. |
| Viabilidade do backup diário por 30 dias | **PENDENTE** | Documentação do fornecedor associa 30 dias de backups diários ao Enterprise; nenhum plano foi selecionado ou contratado. R$ 100 é apenas hipotético e não aprova billing. |
| Cópia independente e cobertura dos objetos Storage | **PENDENTE** | Backup do banco não inclui o conteúdo dos objetos Storage. O plano para cópia independente dos arquivos e comprovação de restore não está definido nem autorizado. |
| Retenção de logs operacionais por 30 dias | **PENDENTE** | Retenção depende do plano; a página de preços indica Free 1 dia, Pro 7 e Team 28. Log Drain é cobrado separadamente. Não há plano/destino externo escolhido nem autorização de despesa. |
| Monitoramento capaz de avaliar SLO de 99,5% | **PARCIALMENTE ATENDIDO** | A meta está aprovada, porém instrumento, janela, alertas, limites e evidência de disponibilidade ainda não foram definidos/medidos. |
| Região do runtime OCI e destino de implantação | **PENDENTE para implantação** | `sa-east-1` resolve a região Supabase. ADR-001 mantém Cloud Run como direção para runtime OCI, mas a região concreta do runtime e configuração final continuam pendentes. Isso não impede documentação conceitual, mas impede validar/deployar essa configuração. |
| Ambiente e meios de validação | **PARCIALMENTE ATENDIDO** | Repositório fornece Supabase CLI e CI efêmera para integração de banco; esses meios não reproduzem backups gerenciados, retenção por plano, log drain ou restore do serviço hospedado. Nenhum ambiente gerenciado isolado está autorizado/provisionado. |
| Sequência de gates | **RESOLVIDO PARA GATE-001; GATE-002 CONTINUA NÃO APROVADO** | Na versão inicial deste relatório não existia relatório aprovado da Etapa 001. O GATE-001 foi aprovado pelo relatório `docs/reports/TASK-013-etapa-001-recontextualizacao.md`; isso resolve somente a ordem entre as etapas. As demais pendências do DoR abaixo mantêm TASK-013 BLOCKED e não liberam GATE-002. |

## Resultado e pendências

**Status oficial da TASK-013: BLOCKED.** Esta atualização documenta decisões e pré-condições, mas não marca a TASK como `READY`/`IN_PROGRESS`, não aprova GATE-001 ou GATE-002 e não inicia T001–T005.

Impedimentos objetivos:

1. Cumprir a sequência oficial: registrar e aprovar Etapa 001/GATE-001 antes de aprovar GATE-002.
2. Selecionar, sem ativar ainda, a estratégia tecnicamente viável para 30 dias de backups diários e cópia independente dos dados e objetos Storage; qualquer plano/serviço pago depende de orçamento real e autorização específica.
3. Definir destino/capacidade/custo para 30 dias de logs ou aceitar que a retenção de referência não seja nativa no plano escolhido; não ativar Log Drain sem autorização de billing.
4. Identificar os prazos legais específicos de pedidos e registros financeiros antes de projetar exclusão automatizada.
5. Definir métricas e janela de observação para aferir o SLO; comprovar tecnicamente o RPO ≤24 h por restore/medição.
6. Definir a região do runtime OCI antes de qualquer implantação; a região Supabase já aprovada não responde essa questão.

Nenhum teste funcional, migration, consulta de escrita, serviço remoto, provisionamento ou cobrança foi executado. Nenhum gate anterior foi reaberto. Sem commit/push.

## Adendo — resultado da Etapa 001 (2026-11-13)

GATE-001 foi aprovado após a recontextualização documentada em `docs/reports/TASK-013-etapa-001-recontextualizacao.md`. O item da tabela acima que dizia não existir relatório aprovado da Etapa 001 descrevia o estado anterior deste relatório; essa condição de sequência foi resolvida. As pendências técnicas e legais das demais linhas continuam inalteradas: GATE-002 não aprovado e TASK-013 permanece `BLOCKED`. A Etapa 002 não foi iniciada nem habilitada. Nenhum teste funcional, serviço, migration ou dado foi executado/alterado.