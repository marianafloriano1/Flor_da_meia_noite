# TASK-014 — Etapa 003: Planejamento

Data: 2026-11-15
Branch: task/TASK-014-migracao-operacional-catalogo
GATE-002: APROVADO

## Estratégia

Reutilizar /admin/catalog e suas APIs/validações. A inspeção anterior encontrou cadastro individual, categoria da lista fixa, upload de imagens, status draft/published, criação com estoque zero e ajuste de estoque separado com justificativa e trilha administrativa. A validação de imagem verifica MIME/assinatura, dimensões, alt text não vazio e limite de 10 MiB.

A menor entrega é documental: guia operacional, checklist de dupla conferência e treinamento. Nenhum defeito de formulário foi comprovado que justifique alterar código. O cadastro permanece draft até conferência.

## Matriz de aceite

| Critério | Entrega | Verificação |
|---|---|---|
| Cadastro item por item | Procedimento do painel e conferência de duplicidade | Revisão estática; ensaio sintético reservado a GATE-006 |
| Imagens otimizadas | Instrução de preparo e verificação de formato/tamanho/dimensões/alt | Validações existentes e cenário manual futuro |
| Categoria fixa | Seleção da lista existente, sem categoria ad hoc | Constante e validação server-side; cenário manual futuro |
| Contagem contra estoque físico | Contagem e conferência independentes antes do ajuste | Fluxo auditável inspecionado; reconciliação manual futura |
| Dupla conferência | Papéis registradora e conferente, com checklist por item | Revisão do procedimento e ensaio manual futuro |
| Não publicar incompleto | Manter draft até checklist completo e autorização | Controle operacional; limitação: UI/API não impõe segunda aprovação |

## Escopo

Permitidos: guia, formulário, validações, checklist e treinamento. Implementar apenas documentação pois o painel atende o fluxo básico. Proibidos: importação automática de Excel, migrar saldo sem validação, criar fatos comerciais ou publicar produto incompleto sem autorização. Não definir regra técnica de completude que o requisito não especifica.

## Arquivos e rollback

Criar docs/operations/TASK-014-cadastro-manual-catalogo.md e relatórios das Etapas 002–005; atualizar apenas a seção TASK-014 em TASKS.md. Rollback documental: remover somente os novos artefatos/linhas desta tarefa antes de commit; nenhum dado ou serviço é alterado.

## Riscos

- Dupla revisão é processo humano, não garantia técnica de backend.
- Informação ou imagem sem fonte confirmada mantém o produto em draft.
- Ambiente para ensaio ainda requer instalação/configuração local e confirmação de isolamento.
- Não alterar estoque antes de reconciliação física.

## Resultado

Etapa 003 / GATE-003 APROVADA: plano revisável, escopo e validações mapeados. Etapa 004 habilitada. Ensaios não executados.