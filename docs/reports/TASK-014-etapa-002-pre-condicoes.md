# TASK-014 — Etapa 002: Pré-condições e decisões

Data: 2026-11-15
Branch: task/TASK-014-migracao-operacional-catalogo
Base: c37f43660981df3e634a1e3f467cd75b335b9664

## DoR

| Critério | Resultado | Evidência |
|---|---|---|
| Dependências | PASS | TASK-004, TASK-007 e TASK-012 constam DONE nesta base. Fechamento da TASK-012 incorporado em c37f436. |
| Rastreabilidade | PASS | README: RF-002, RN-002, UC-01 e UC-07. |
| Critérios testáveis | PASS | Cadastro individual, categoria fixa, imagem otimizada, estoque conferido fisicamente e reconciliação manual constam em TASKS.md. |
| Escopo | PASS | Guia, formulário, validações, checklist e treinamento permitidos; importação Excel, saldo sem validação, dados inventados e publicação incompleta sem autorização proibidos. |
| Ambiente | PASS com preparação futura | Docker Engine respondeu como 29.9.2; portas locais 54321–54325 estavam em escuta; config.toml e seed.sql do Supabase existem. node_modules, .env.local e CLI não estão disponíveis; nenhum app/serviço foi iniciado. Esses itens deverão ser preparados e o destino isolado confirmado antes do ensaio da Etapa 006. |
| Decisões externas | PASS | Não é necessário usar produtos, preços ou saldos reais para preparar o processo. A contagem física será fornecida e conferida pela operação antes da venda. |

## Decisões operacionais do processo

- Cadastro individual no painel existente. Manter draft durante o preenchimento e revisão.
- Pessoa registradora e pessoa conferente independente, ambas usando contas próprias autorizadas. Papéis definidos pelo processo; nomes designados pela operação em cada rodada.
- Categorias somente da lista fixa. Informação comercial, botânica, cuidados, toxicidade e validade somente com fonte verificável; não preencher por suposição.
- Cadastro inicia com estoque zero. Lançar saldo apenas depois da contagem física e conferência independente, com justificativa no ajuste auditável.
- A interface aceita seleção de published e não foi identificada trava server-side para aprovação em duas pessoas. A dupla conferência será controle operacional, não se afirma imposição técnica.
- Nenhuma publicação antes de checklist conferido e autorização operacional.

## Limites

Portas em escuta não identificam, por si sós, o projeto ou o banco; não foram consultados. A URL da aplicação, projeto local isolado, sessão autorizada e dados sintéticos deverão ser confirmados antes de qualquer ensaio. Nenhuma alteração de dados foi feita.

## Gates

GATE-001 APROVADO conforme relatório da Etapa 001. GATE-002 APROVADO para o DoR e decisões desta tarefa. Etapas posteriores permanecem pendentes no momento deste registro.

## Resultado

TASK-014 IN_PROGRESS. Etapa 002 / GATE-002 APROVADA. Etapa 003 habilitada.