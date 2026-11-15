# TASK-012 — Etapa 002 — Pré-condições e decisões

**Data:** 2026-11-10
**Branch:** `task/TASK-012-direcao-visual-acessibilidade-integrada`
**GATE-001:** APROVADO (`docs/reports/TASK-012-etapa-001-recontextualizacao.md`)
**Status da etapa:** APROVADA para avançar ao planejamento
**GATE-002:** CONCLUÍDO

## Decisões e limites vigentes

- Reutilizar a paleta e a direção existentes no README: preto `#000000`, cinza chumbo `#4A4A4A`, verde musgo `#1E2B22`, fotografia floral saturada e tipografia expressiva. Toda aplicação deve manter legibilidade e acessibilidade.
- Não escolher nem gerar logo, fonte proprietária, fotografia, endereço ou texto oficial. Esses insumos permanecem valores fornecidos pela loja; a interface poderá ter slots/configuração, sem apresentar texto ou imagem fictícios como conteúdo oficial.
- Reutilizar idiomas e tradução de catálogo já implementados pela TASK-004 e as regras do ADR-004. A TASK-012 pode localizar rótulos estáticos da interface nos quatro idiomas; não duplica provider, cache ou tradução de produto.
- Não introduzir dependência externa, cobrança, serviço ou integração de conteúdo nesta etapa.

## Checklist do Definition of Ready

| Critério | Resultado | Evidência/decisão |
|---|---|---|
| Dependências TASK-001 e TASK-004 DONE | APROVADO | `TASKS.md`; TASK-004 final em `docs/reports/TASK-004-etapa-007-conclusao.md`. |
| Rastreabilidade e escopo | APROVADO | RF-001/019, RNF-002/007, UC-01, ADR-004; Allowed/Forbidden Changes reproduzidos no relatório da Etapa 001. |
| Critérios de direção visual e acessibilidade testáveis | APROVADO para planejamento | Paleta/direção no README; aceites de responsividade, foco/teclado, contraste, textos alternativos, estados vazio/erro e quatro idiomas em TASKS.md. |
| Decisões de negócio necessárias | APROVADO para planejamento | Direção cromática e idioma base já são explícitos. Nenhuma escolha de marca ou conteúdo foi presumida. |
| Ativos finais e textos oficiais | PENDENTE para Etapa 004/entrega final; não bloqueia Etapa 003 | README mantém pendentes logo/arquivos, endereço e contatos; TASKS.md lista fontes licenciadas, fotos autorizadas e texto institucional. Para o plano, podem ser tratados como dependências explícitas de implementação/publicação. |
| Ambiente e meios de validação | APROVADO para planejamento | Aplicação Next.js e testes de catálogo presentes na base integrada; execução funcional será necessária somente na implementação/revisão. A ferramenta WCAG automatizada não está configurada; plano usará verificação manual e ferramentas já disponíveis, sem afirmar conformidade antecipada. |
| Segurança e escopo | APROVADO | Sem alteração de catálogo, Auth, tradução backend, dados, migrations ou serviços externos; teste visual usará dados existentes/sintéticos. |

## Bloqueios e riscos diferidos

Não há decisão de comportamento indispensável pendente para elaborar o plano. Logo final, fontes licenciadas, imagens autorizadas, endereço e conteúdo institucional são insumos a obter antes de aplicá-los como conteúdo real e antes da aprovação final de publicação. Eles não serão substituídos por dados fictícios. O planejamento deve indicar pontos de integração e critérios de aceite para esses insumos.

O contraste dos tons carvão/verde sobre preto precisa ser medido; se a combinação falhar nos elementos de texto ou estado, a hierarquia visual deve usar tons legíveis sem remover as cores aprovadas. Microinterações serão não essenciais e respeitarão `prefers-reduced-motion`.

## Resultado

O DoR da **Etapa 003 — Planejamento** está satisfeito. A decisão é restrita a habilitar planejamento documental; não libera implementação, compra de assets nem publicação. Nenhuma funcionalidade ou teste foi executado nesta etapa.

==================================================
TASK: TASK-012
ETAPA: 002
STATUS DA ETAPA: APROVADA
==================================================
GATE DA ETAPA: APROVADO
GATES TOTAIS: 7
GATES CONCLUÍDOS: 2
GATES PENDENTES: 5
GATES BLOQUEADOS: 0
PROBLEMAS ENCONTRADOS:
- Insumos oficiais da marca ainda não fornecidos; ficam pré-condições para implementação do conteúdo final, não para planejamento.
- Não há ferramenta automatizada WCAG/E2E visual configurada no projeto.
CORREÇÕES REALIZADAS:
- Nenhuma funcional; decisões e limites documentados.
PENDÊNCIAS:
- Obter logo, fontes/licenças, fotos autorizadas, endereço e texto institucional antes de aplicar esses ativos como conteúdo oficial.
TESTES RELACIONADOS:
- Não executados; etapa de DoR documental.
PRÓXIMA ETAPA: 003 — Planejamento
PRÓXIMA ETAPA HABILITADA: SIM
MOTIVO: critérios e decisões necessários para planejar estão definidos; insumos externos são rastreados como dependência da implementação/entrega.
==================================================
