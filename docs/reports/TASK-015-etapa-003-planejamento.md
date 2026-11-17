# TASK-015 — Etapa 003: Planejamento

Data: 2026-11-15<br>
Branch: `task/TASK-015-capacidade-prontida-lancamento`<br>
Base: `ff14822`<br>
Estado da TASK-015: `IN_PROGRESS`<br>
GATE-001: APROVADO · GATE-002: APROVADO · GATE-003: APROVADO<br>
Etapas 004–006: NÃO INICIADAS

## 1. Entradas e decisões vigentes

- Governança: `AGENTS.md`; requisitos e critérios: `README.md` e seção TASK-015 de `TASKS.md`; decisões técnicas: ADR-001..005.
- GATE-001 e integração das dependências TASK-012/013/014: `docs/reports/TASK-015-etapa-001-recontextualizacao.md`.
- Aprovação formal dos critérios do DoR e GATE-002: `docs/reports/TASK-015-etapa-002-pre-condicoes.md`.
- A execução futura será local, sintética e sem custo gerenciado. A decisão não autoriza credenciais/dados reais, pagamento, envio externo ou publicação.
- Critérios aprovados para carga: 1.000 sessões simultâneas; rampa 10 min, sustentação 30 min, encerramento 10 min; mix catálogo 35%, detalhes/imagens 25%, carrinho/cotação/checkout 20%, acompanhamento de pedidos 10%, administração/estoque 10%; erro total ≤1%, 5xx ≤0,1%, p95 crítico ≤2 s, registrar p50/p95/p99 e zero inconsistência de estoque/preço/pedido ou duplicidade indevida.
- Critério de imagens: Android intermediário, 4 GB RAM, Chrome estável na execução; rede simulada 10 Mbps down/2 Mbps up/100 ms; cache frio e aquecido separados; medir do início da requisição até disponibilidade para renderização; p95 frio ≤2 s.
- A aprovação desses parâmetros não representa execução ou resultado de teste.

## 2. Escopo e proteção

**Permitido pela TASK-015:** scripts/configuração de carga; correções diretamente necessárias aos critérios aprovados; runbooks e checklist de lançamento. Evidência e relatório por etapa. Dados de carga exclusivamente sintéticos.

**Proibido:** requisito novo ou mudança dos limites aprovados; PII real; pagamento/compra real; publicação sem autorização; cobrança/ambiente gerenciado; alterar contratos, migrations, políticas ou funcionalidades de tarefas anteriores sem defeito demonstrado e escopo confirmado.

Nenhum código, dependência, configuração, serviço ou dado foi alterado nesta etapa. Se uma correção exigir ampliar `Allowed Changes`, modificar workflow/contrato de tarefa anterior ou ativar serviço pago, parar e solicitar decisão antes da alteração.

## 3. Matriz de critérios, artefatos e evidências

| Critério de aceite | Plano de implementação/validação | Artefatos candidatos da Etapa 004 (a confirmar pelo Scope Guard antes de editar) | Evidência esperada |
|---|---|---|---|
| Fluxos críticos ponta a ponta | Exercitar navegação/catálogo, autenticação sintética, carrinho, cotação/checkout sem pagamento real e consulta de pedido; isolar a stack e registrar pré-condições. Reutilizar suítes já aprovadas e executar regressão integrada somente quando necessária à TASK-015. | `scripts/task015/`; eventualmente `package.json` apenas para comandos locais da TASK-015; relatórios em `docs/reports/`. | Saída reproduzível de cada fluxo, ambiente/commit, resultado e correlação sintética; sem PII ou efeitos externos. |
| 1.000 sessões e metas aprovadas | Implementar perfil ponderado pelos cinco fluxos aprovados, rampa/sustentação/encerramento exatos e métricas p50/p95/p99, erro total e 5xx. Garantir que checkout não invoque pagamento nem comunicação externa. Verificar saldo e idempotência antes/depois. | `scripts/task015/load/` e comando de execução local em `package.json`; versão/fonte da ferramenta fixadas no artefato quando escolhida. | Relatório da carga com configuração, logs resumidos, denominadores, percentis, erros e verificações de integridade. Não extrapolar resultado local para capacidade de produção. |
| Imagens p95 frio ≤2 s | Medir no Android de referência (4 GB, Chrome estável), sob o perfil 4G aprovado. Separar cache frio/aquecido. Usar início da requisição até a imagem estar decodificada/disponível para renderização; guardar amostras por imagem e p50/p95/p99, sem misturar cenários. Registrar método e quantidade de amostras antes da execução. | `scripts/task015/image-performance/` e instrução de execução em `docs/runbooks/TASK-015-validacao-local.md`; ferramenta de navegador só após confirmar disponibilidade/licença e sem instalar dependência nesta etapa. | Registro separado de cada cenário e dispositivo/navegador/rede; evidência não substitui a confirmação do hardware de referência. |
| Estoque, preço, pedido e ausência de duplicidade | Reutilizar testes concorrentes/idempotentes aprovados das TASKs predecessoras; no fluxo integrado sintético, comparar estado inicial/final e confirmar rollback/ausência de duplicidade nos limites. Não chamar gateways reais. | Suítes existentes sob `tests/task005`–`tests/task009`, integração pertinente e relatório de execução TASK-015. | Saídas dos testes pertinentes e consultas/leitura de integridade no ambiente isolado. Não reabrir gates anteriores nem repetir sua evidência sem justificativa. |
| Notificações e retries | Reutilizar especificações e evidências aprovadas da tarefa responsável; validar a integração/retry em ambiente sintético ou adapter controlado, sem envio real. | Relatórios e implementação integrados da tarefa de notificações; identificar cobertura disponível na preparação da Etapa 004. | Estado/idempotência observados no teste sintético; nenhuma entrega real presumida. |
| Restore demonstrado | Reutilizar a aprovação e limites aceitos da TASK-013. Só executar novo restore se o critério integrado da TASK-015 exigir evidência adicional e o destino descartável estiver comprovado e autorizado. | `scripts/task013/`, `docs/runbooks/TASK-013-backup-restore.md` e relatório final de TASK-013; referência no relatório TASK-015. | Referência à evidência aprovada já existente ou, se necessária execução nova, manifestos/checksums e resultado verificado em destino isolado. Não repetir automaticamente o gate predecessor. |
| Acessibilidade e privacidade/permissões | Reutilizar aprovações rastreáveis de TASK-003/TASK-012; validar somente jornadas integradas novas e permissões negativas diretamente pertinentes. | Relatórios/testes das tarefas responsáveis; runbook e roteiro manual TASK-015. | Fonte e escopo identificados, separando validação automatizada, confirmação manual e riscos aceitos. |
| Plano de suporte e prontidão | Documentar triagem, sinais observáveis, escalonamento, rollback, comunicação e critérios de não lançamento, sem atribuir equipe/contatos não fornecidos. | `docs/runbooks/TASK-015-suporte-e-lancamento.md` e checklist `docs/runbooks/TASK-015-release-checklist.md`. | Runbook revisável, responsáveis como função (sem inventar nomes), condições de lançamento e pendências explícitas. |

### Inventário técnico observado para o plano

- `package.json` tem suites direcionadas para TASK-005/006/007/008/009/011/013, lint/typecheck/build e scripts Supabase. Nesta cópia, não há diretório `tests/task010` nem script `test:task010`; a cobertura documental da tarefa de notificações deve ser localizada/referenciada na Etapa 004. Isso é uma lacuna de inventário, não uma conclusão de falha funcional nem motivo para alterar tarefas anteriores.
- Não foi localizado Playwright ou ferramenta de carga nos scripts/dependências do `package.json`. A seleção/instalação de ferramenta, se necessária, será proposta e autorizada antes da Etapa 004; esta etapa não instala nada.
- Há `scripts/task013/` e `docs/runbooks/TASK-013-backup-restore.md`; usar essas evidências existentes primeiro.

## 4. Sequência planejada

1. **Pré-voo local:** confirmar branch/worktree e ausência de segredos/dados reais; obter autorização necessária para `npm ci`; confirmar o binário local Supabase CLI vindo da dependência declarada; validar identidade/projeto/portas/container da stack local antes de iniciar qualquer serviço. Abortar se houver alvo remoto ou compartilhado.
2. **Definição dos cenários sintéticos:** preparar dados determinísticos sem PII, pagamentos ou envio externo; classificar as operações por fluxo e configurar quotas/limites para que o teste não publique produtos ou gere efeitos reais.
3. **Instrumentação de carga:** implementar somente scripts/configs TASK-015, fixar ferramenta e versão, associar VUs a um cenário conforme mix aprovado e gerar resultado reproduzível.
4. **Instrumentação de imagens:** confirmar a disponibilidade de um Android intermediário de 4 GB; separar cache frio/aquecido e medir request-start→render-ready sobre amostras por imagem; registrar configuração e percentis.
5. **Execução da implementação/validações da Etapa 004:** rodar apenas suites justificadas pelo escopo integrado, carga e medição local; verificar invariantes de estoque, preços, pedidos e retries; documentar PASS/FAIL/NOT RUN sem promover testes manuais a automatizados.
6. **Revisão da Etapa 005:** revisão integral do diff/Scope Guard, segurança, privacidade, qualidade das métricas, artefatos e reprodutibilidade; corrigir apenas problemas comprovados e dentro do escopo.
7. **Preparação da Etapa 006:** roteiro manual com ID, objetivo, pré-condições, passos, esperado, resultado/evidência para preenchimento pela responsável. Não executar em nome dela.
8. **Conclusão futura:** somente depois dos gates e evidências, preparar release checklist/relatório da Etapa 007. Esta etapa não inicia nem aprova a 007.

## 5. Matriz de escopo e riscos

| Área/arquivo candidato | Uso planejado | Limite/Safeguard |
|---|---|---|
| `scripts/task015/**` | Harnesses locais para carga e medição de imagens | Dados sintéticos; sem endpoints externos/pagos; interromper em dúvida de isolamento. |
| `package.json` / lockfile | Apenas comandos novos; lockfile só se dependência nova for aprovada e necessária | Não mudar dependências nesta etapa; solicitar autorização para instalação/alteração do lockfile. |
| `docs/runbooks/TASK-015-*` | Procedimentos de validação, suporte e release | Sem nomes, credenciais, contatos ou parâmetros não aprovados. |
| `docs/testing/TASK-015-etapa-006-testes-manuais.md` | Roteiro manual posterior | Resultados e evidências ficam vazios até execução pela responsável. |
| `docs/reports/TASK-015-etapa-004/005/007-*` | Evidências por gate futuro | Apenas quando cada etapa ocorrer; não criar resultados antecipadamente. |
| Código das tarefas predecessoras, migrations, RLS, CI/deploy | Fora do escopo primário | Não alterar; problema necessário exige prova, análise de impacto e escopo/autorização específica. |

**Riscos e controles:** (a) teste apontar para projeto remoto — confirmar project ref, URL, porta e container antes de qualquer escrita; (b) carga criar efeitos colaterais — usar adapters/sandbox sintéticos, sem pagamento/envio/publicação; (c) ambiente local não representar produção — rotular explicitamente e não extrapolar; (d) métricas de imagem contaminadas por cache/rede — separar cenários e registrar dispositivo/rede; (e) volume de dados sintéticos — usar faixa/namespace exclusivo e plano de descarte que não remova dados preexistentes; (f) falha de disponibilidade durante a carga — stack local descartável e parada controlada, sem tocar em volume compartilhado.

**Rollback:** antes da execução, registrar projeto/stack e inventário sintético inicial. Limitar remoção aos artefatos com identificador da rodada; não usar reset global, remover volumes ou limpar objetos sem confirmação de que são exclusivos/descartáveis. Ao final, preservar relatório e sumários sem dados pessoais e encerrar apenas processos/containers iniciados pela própria rodada, conforme autorização. Falha de isolamento implica abortar, não “limpar” o ambiente.

## 6. Pendências operacionais para etapas futuras

- Obter autorização aplicável para `npm ci` no checkout isolado antes da preparação local.
- Confirmar Supabase CLI instalada localmente pela dependência já declarada e stack local realmente isolada antes de iniciar testes com dados.
- Confirmar disponibilidade física do Android de referência e Chrome estável para o critério de imagens; emulador não será tratado como hardware aprovado sem decisão.
- Definir na Etapa 004 e registrar tamanho da amostra e mecanismo de coleta sem alterar o limiar aprovado.
- Verificar cobertura herdada de notificações via documentação/histórico, pois este checkout não contém `tests/task010` nem script npm correspondente.

## 7. Estado e verificações desta etapa

- Planejamento documental concluído, sem implementação funcional ou execução de serviços/testes.
- GATE-001 APROVADO; GATE-002 APROVADO; GATE-003 APROVADO; GATE-004, GATE-005, GATE-006 e GATE-007 PENDENTES.
- Etapa 003: CONCLUÍDA/APROVADA. TASK-015 permanece IN_PROGRESS; Etapa 004 é a próxima, ainda NÃO INICIADA e aguarda autorização própria.
- Testes, instalação de dependências, carga, navegador, migrations, stack Supabase, billing, restore novo e operações de dados: NOT RUN.
- Verificações documentais/Git finais: `git diff --check`, `git status --short`, `git diff --stat` (registradas no relatório final da execução).

==================================================
TASK: TASK-015
ETAPA: 003
STATUS DA ETAPA: CONCLUÍDA/APROVADA
==================================================
GATE DA ETAPA: APROVADO
GATES TOTAIS: 7
GATES CONCLUÍDOS: 3
GATES PENDENTES: 4
GATES BLOQUEADOS: 0
PROBLEMAS ENCONTRADOS:
- Nenhum bloqueio do plano; ferramentas e hardware para execuções futuras ainda precisam ser confirmados antes dos respectivos testes.
CORREÇÕES REALIZADAS:
- Decisões aprovadas consolidadas no GATE-002; plano, matriz critério→artefato→evidência, riscos e rollback registrados.
PENDÊNCIAS:
- Preparação isolada e autorização de instalação antes da execução; disponibilidade do dispositivo Android de referência; confirmação da cobertura de notificações.
TESTES RELACIONADOS:
- NOT RUN; nenhuma validação funcional foi repetida ou executada nesta etapa.
PRÓXIMA ETAPA: Etapa 004 — Implementação
PRÓXIMA ETAPA HABILITADA: NÃO (não iniciada neste pedido)
MOTIVO: O pedido autorizou somente o planejamento da Etapa 003; requer autorização própria para iniciar Etapa 004.
==================================================
