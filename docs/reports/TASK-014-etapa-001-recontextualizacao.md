# TASK-014 — Etapa 001: Recontextualização

Data: 2026-11-15
Branch: task/TASK-014-migracao-operacional-catalogo
Base: c37f43660981df3e634a1e3f467cd75b335b9664 (fechamento documental TASK-012)
Status da TASK: IN_PROGRESS após DoR PASS; somente Etapa 001 realizada.

## Escopo e autorização

A solicitante autorizou iniciar a TASK-014 e a Etapa 001. A dependência TASK-012 foi fechada em sua própria branch no commit c37f436; alterações locais não relacionadas next-env.d.ts, .tmp/ e q foram preservadas e excluídas. Este worktree é isolado. Nesta etapa não foram alterados código, dados, migrations, produtos, estoque, Storage ou serviços; nenhum teste foi executado.

## Fontes consultadas

- AGENTS.md: governança, DoR/DoD, Scope Guard e autorização.
- README.md: RF-002, RN-002, UC-01/07, papéis de equipe e cadastro individual.
- TASKS.md: requisitos, dependências, escopo e critérios da TASK-014.
- Implementação administrativa: página /admin/catalog; painel; rota POST de produtos; rota de imagens; validação do produto, imagem e ajuste de estoque; serviço administrativo e categorias fixas.
- Histórico Git: branch criada em worktree dedicado no commit c37f43660981df3e634a1e3f467cd75b335b9664.

## Definition of Ready

| Critério | Resultado | Evidência |
|---|---|---|
| Dependências | PASS | TASK-004, TASK-007 e TASK-012 constam DONE em TASKS.md nesta base. |
| Rastreabilidade | PASS | RF-002, RN-002 e UC-01/07 existem no README e correspondem ao cadastro e conferência do catálogo. |
| Critérios testáveis | PASS | Cadastro item a item, categoria fixa, imagem otimizada, estoque conferido antes de abrir vendas e reconciliação manual são verificáveis. |
| Escopo/proibições | PASS | Guias, formulário, validações, checklist e treinamento são permitidos. Excel automático, saldo sem validação, informação inventada e publicação incompleta são proibidos. |
| Ambiente e validação | PASS para planejamento | O painel e APIs administrativas existem; a configuração local Supabase e os meios de ensaio com dados sintéticos estão no repositório. Serviços não foram iniciados nesta etapa. |
| Decisões externas | PASS para iniciar | Nenhum produto ou saldo real é necessário para planejar. A contagem física será fornecida/conferida manualmente antes da abertura de vendas. |

DoR: PASS para iniciar a TASK-014. A responsabilidade específica pela dupla conferência é um entregável desta tarefa; o planejamento definirá papéis e evidência de conferência sem inventar nomes.

## Fatos e limites técnicos observados

1. RF-002 define os campos de produto e as 16 categorias fixas; o painel usa a lista constante do catálogo.
2. A página administrativa restringe a interface aos papéis employee/admin. A rota de criação verifica autorização reforçada no servidor e valida o corpo da requisição.
3. O cadastro cria o produto com estoque inicial zero. Ajustes de estoque são uma operação separada e auditável, com justificativa obrigatória de até 400 caracteres.
4. A validação da imagem confere tipo permitido, assinatura real, dimensões, texto alternativo não vazio e limite de 10 MiB. O vínculo usa a rota administrativa existente.
5. O formulário admite rascunho e publicado. O processo da TASK-014 deve impedir publicação incompleta e não usar estoque presumido.
6. README proíbe Excel como sistema paralelo e determina cadastro individual. Não foi autorizada importação automática.
7. O DoD exige processo e responsabilidade de dupla conferência definidos. Nenhum funcionário específico foi designado nesta etapa.

## Scope Guard

- Alterações desta etapa: este relatório e o status/registro da TASK-014 em TASKS.md.
- Nenhuma alteração em aplicação, testes, migrations, dados, Storage ou infraestrutura.
- Nenhuma proibição foi acionada; nenhum produto real foi cadastrado ou publicado.
- TASK-004, TASK-007 e TASK-012 permanecem DONE.

## Gate e sequência

- Recontextualização, dependências, rastreabilidade, escopo e DoR: concluídos.
- Testes, lint, typecheck, build, Supabase e migrations: NOT RUN; não aplicáveis à etapa documental de recontextualização.
- GATE-001: APROVADO.
- GATE-002 a GATE-007: PENDENTES.
- Etapa 002 — Pré-condições e planejamento: habilitada, ainda não iniciada. A autorização atual não a inicia.

## Resultado

TASK-014: IN_PROGRESS.
Etapa 001 / GATE-001: APROVADO.
Nenhuma implementação ou validação funcional foi realizada. Nenhum commit, push ou merge foi feito na branch TASK-014.