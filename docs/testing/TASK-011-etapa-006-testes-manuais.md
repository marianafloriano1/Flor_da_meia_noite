# TASK-011 — Etapa 006 — Roteiro de testes manuais

**Branch:** `task/TASK-011-relatorios-exportacoes-metricas`
**Ambiente:** Supabase local/efêmero e aplicação local; usar somente dados sintéticos
**Executor e data:** operadora; aprovação geral confirmada em 2026-11-10; horários individuais não reproduzidos neste registro
**Status:** T001–T011 APROVADOS por confirmação explícita da responsável; não reexecutados pelo Codex
**Pré-condição:** GATE-004 e GATE-005 aprovados. Não usar produção.

## Regras de coleta

- Usar conta sintética com papel `admin`, além de contas sintéticas `customer` e `employee` para testes negativos.
- Registrar horário, filtros, request/response e resultado. Não copiar tokens, OTP, e-mail, telefone, CPF ou endereço para o relatório.
- Não usar pedidos, clientes ou dados reais.
- A semana é segunda–domingo e o mês é civil em `America/Sao_Paulo`; limites são início inclusivo e fim exclusivo.
- Exportações devem ser abertas localmente e removidas após a inspeção; não publicar os arquivos.

| ID | Cenário e procedimento | Resultado esperado | Resultado/evidência da operadora |
|---|---|---|---|
| T001 | Acessar `/admin/reports` sem sessão. | Redirecionamento para autenticação; nenhuma métrica retornada. | APROVADO por confirmação da responsável em 2026-11-10; saídas individuais não transcritas neste adendo |
| T002 | Acessar a tela e `GET /api/admin/reports` com sessão `customer` e `employee`. | Acesso negado; apenas admin pode consultar. | APROVADO por confirmação da responsável em 2026-11-10; saídas individuais não transcritas neste adendo |
| T003 | Consultar semana com uma data de referência em cada dia da semana. Comparar o início/fim exibidos com segunda–domingo local. | Mesmo intervalo local para qualquer dia daquela semana; conversão correta para UTC e fim exclusivo. | APROVADO por confirmação da responsável em 2026-11-10; saídas individuais não transcritas neste adendo |
| T004 | Consultar mês em virada de mês/ano usando as bases “criação” e “pagamento”. | Filtros temporais distintos; início do mês local até início do mês seguinte, fim exclusivo. | APROVADO por confirmação da responsável em 2026-11-10; saídas individuais não transcritas neste adendo |
| T005 | Preparar pedidos sintéticos pagos, não pagos e cancelados antes do pagamento; consultar receita. | Somente pagos entram; `orders.total_brl` já líquido do cupom não recebe desconto duplicado; não pagos e pré-pagamento cancelados ficam fora. | APROVADO por confirmação da responsável em 2026-11-10; saídas individuais não transcritas neste adendo |
| T006 | Preparar pedido sintético pago e depois cancelado. Consultar relatório. | Valor segue como pagamento confirmado conforme regra aprovada; cancelamento pós-pagamento aparece em indicador separado, sem presumir reembolso. | APROVADO por confirmação da responsável em 2026-11-10; saídas individuais não transcritas neste adendo |
| T007 | Comparar ranking de produtos com quantidades de linhas pagas e devoluções por linha registradas nos eventos. | Ranking de unidades líquidas, ordenação determinística; itens totalmente cancelados não contam como vendidos. | APROVADO por confirmação da responsável em 2026-11-10; saídas individuais não transcritas neste adendo |
| T008 | Adicionar item ao carrinho e favorito em sessão sintética; consultar período correspondente. | Eventos de adição ao carrinho/unidades e favoritos apresentados em contadores separados, sem dados pessoais. | APROVADO por confirmação da responsável em 2026-11-10; saídas individuais não transcritas neste adendo |
| T009 | Aplicar os mesmos filtros à tela, endpoint JSON, Excel e PDF. | Valores, rótulos de período e totais consistentes entre formatos. | APROVADO por confirmação da responsável em 2026-11-10; saídas individuais não transcritas neste adendo |
| T010 | Exportar XLSX e PDF; inspecionar conteúdo e cabeçalhos HTTP. | Arquivos válidos, download temporário, `private, no-store`, sem PII direta, sem payload armazenado em bucket público. | APROVADO por confirmação da responsável em 2026-11-10; saídas individuais não transcritas neste adendo |
| T011 | Exportar como admin e consultar `report_export_audit`; tentar exportar com role inadequada e cross-origin. | Registro mínimo com ator/período/base/formato/timestamp de servidor; acesso inadequado negado antes da exportação. | APROVADO por confirmação da responsável em 2026-11-10; saídas individuais não transcritas neste adendo |

## Registro individual

Para cada teste, incluir data/hora, ambiente, conta sintética por papel, filtros, resultado, evidência sanitizada e desvios. Se um cenário não puder ser executado, marcar PENDENTE e registrar a causa; não declarar PASS sem resultado observado.

## Estado do gate no registro original do roteiro

A redação desta seção descreve o estado antes da confirmação final da responsável, em 2026-11-10. A decisão vigente está registrada na retificação abaixo: GATE-006 e GATE-007 aprovados e TASK-011 DONE. Este roteiro não atribui ao Codex a execução manual.

## Retificação de aprovação — 2026-11-10

A responsável pelo projeto confirmou que T001–T011 foram executados manualmente e aprovados. Esta declaração é a fonte do status de aprovação desta retificação; não é log independente nem resultado executado pelo Codex. Os dados de Supabase Studio anteriormente informados continuam limitados aos resultados explicitamente descritos no relatório consolidado; este adendo não inventa requests, downloads, capturas ou saídas individuais.

**GATE-006 = APROVADO por decisão da responsável. GATE-007 = APROVADO por decisão da responsável. TASK-011 = DONE.** A referência de CI 42703076319 comprova somente os jobs nela executados; a aprovação dos testes manuais continua atribuída à responsável. Rastreabilidade: docs/reports/RETIFICACAO_APROVACOES_TASK-010_TASK-011.md.
