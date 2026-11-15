# TASK-012 — Etapa 003 — Planejamento

**Data:** 2026-11-10
**Branch:** `task/TASK-012-direcao-visual-acessibilidade-integrada`
**Base integrada:** `68ba912d79e51cad17db1696691f946c7d91faf5`
**GATE-002:** APROVADO (`docs/reports/TASK-012-etapa-002-pre-condicoes.md`)
**Status da etapa:** APROVADA — planejamento documental; sem implementação

## Objetivo e arquitetura de UI

Aplicar de forma incremental a identidade gótica/industrial já descrita no README, preservando a navegação e os fluxos atuais. Consolidar tokens compartilhados no CSS global e ajustar somente componentes dentro do escopo. Conteúdo de catálogo continua vindo dos serviços e traduções da TASK-004. Rótulos estáticos podem usar recursos locais de idioma (pt-BR, en, es, ru), com pt-BR como fallback; não criar outro provider ou alterar dados/traduções de produto.

Os assets oficiais serão fornecidos pela loja e devem ter origem/licença documentadas. Até lá, não adicionar logo, fotografia ou afirmação institucional fictícios. A ausência de asset deve ter apresentação neutra já compatível com o estado de imagem ausente do catálogo.

## Matriz critério → arquivo candidato → validação

| Critério | Arquivos/componentes candidatos | Validação planejada |
|---|---|---|
| Direção cromática existente sem perder legibilidade | `src/app/globals.css`; componentes públicos `src/app/page.tsx`, `src/app/catalog/page.tsx`, `src/app/catalog/[slug]/page.tsx`, `src/app/catalog/[slug]/product-actions.tsx` | Conferir tokens aprovados e contraste de texto, links, estados e controles; validar em telas claras/escuras e estados de erro/vazio. Não manter combinação que não alcance contraste legível. |
| Tipografia expressiva e conteúdo legível | Tokens em `globals.css`; `src/app/layout.tsx` | Usar fontes locais/sistema até loja fornecer arquivos/licenças. Na entrega de fonte oficial, registrar arquivo e licença/origem; validar fallback e caracteres pt/en/es/ru. |
| Fotografia floral autorizada, descrição alternativa e ausência de PII/conteúdo inventado | `src/app/catalog/page.tsx`, `src/app/catalog/[slug]/page.tsx`; configuração de assets apenas se necessária | Usar somente imagens aprovadas; verificar `altText` útil quando imagem informativa e alt vazio/oculto quando decorativa, layout com imagem ausente e carregamento responsivo. Nenhuma fotografia nova será gerada nesta etapa. |
| Navegação clara, teclado e foco | `src/app/layout.tsx`, `src/app/page.tsx`, catálogo/detalhe, `src/app/auth/page.tsx`, `src/app/cart/page.tsx`, `src/app/profile/page.tsx`, `src/app/orders/[reference]/page.tsx`; `globals.css` | Percorrer fluxos por teclado; ordem de foco, foco visível, links/controles com rótulo, headings/landmarks semânticos e mensagens de erro/estado acessíveis. Preservar backend e contratos. |
| Layout responsivo | CSS e páginas públicas acima; páginas autenticadas somente onde a auditoria identificar impacto do estilo compartilhado | Inspecionar larguras representativas de celular, tablet e desktop, incluindo 320 px, 768 px e 1280 px; sem overflow horizontal, conteúdo ou ação principal cortados. Esses valores são matriz técnica de teste, não regra de negócio. |
| Microinterações não essenciais | `src/app/globals.css` e componentes client existentes estritamente necessários | Transições discretas; nenhuma informação depende de animação; respeitar `prefers-reduced-motion`. Evitar dependência visual para preço, estoque, validação ou navegação. |
| Idiomas da UI | Arquivos de strings locais em `src/lib/i18n/` (novo, somente se a implementação confirmar essa fronteira) e seletor/links no cabeçalho do catálogo/layout | Verificar rótulos e navegação nos quatro idiomas, fallback pt-BR e manutenção do locale ao navegar; conteúdo de produto permanece segundo `src/lib/translation/catalog.ts`/ADR-004. Não ativar serviço pago. |
| Conteúdo institucional configurável | fonte de conteúdo tipada localizada em `src/lib/site-content/` (novo, se houver conteúdo aprovado); exibição no layout/rodapé | Campos opcionais não exibem endereço ou texto fictício; valores oficiais só entram mediante fornecimento da loja. Não incluir contato de produção inventado. |
| Integridade das features existentes | páginas e componentes listados; não alterar rotas de API, RPCs, migrations ou regras de catálogo | Executar testes de catálogo/regressão, lint, typecheck e build após implementação; verificar busca, filtros, estoque, preço, locale e fluxos de Auth/carrinho sem mudança de contrato. |

## Arquivos fora do escopo

Não alterar migrations, políticas/RLS, APIs de catálogo/pedido/Auth, regras de tradução automática, modelos de produto, estoque, cupons, pedidos, workers, CI ou dependências de tarefas anteriores. Inclusão de biblioteca externa de acessibilidade somente com justificativa técnica e escopo aprovado; a estratégia inicial é usar critérios e ferramentas locais disponíveis.

## Sequência proposta de implementação

1. Antes de codificar, confirmar que os assets oficiais necessários foram fornecidos ou limitar a alteração à estrutura sem conteúdo final; registrar origem/licença de cada asset aprovado.
2. Inventariar estilos e fluxos existentes na base integrada TASK-011 e registrar baseline dos testes das tarefas anteriores conforme `AGENTS.md`.
3. Consolidar tokens CSS e estados semânticos; provar contraste e foco antes de espalhar o estilo.
4. Ajustar layout comum e home; depois catálogo/detalhe/seletor de idioma; por fim Auth, carrinho, perfil e acompanhamento de pedido apenas para consistência/responsividade diretamente ligada aos critérios.
5. Adicionar/reutilizar recursos locais para rótulos da UI sem mudar o serviço de tradução do catálogo.
6. Executar testes direcionados e regressões requeridas, lint, typecheck, build, inspeção manual de teclado/responsividade/contraste e `git diff --check`.
7. Atualizar o relatório de implementação com resultados observados; manter NOT RUN onde ferramenta ou asset não estiver disponível.

## Testes previstos

- `npm run test:catalog` e testes de tradução existentes: preservar consulta, filtros, estado de estoque, locale e fallback.
- Suítes de regressão de tarefas anteriores definidas pelo projeto e disponíveis na branch; não alterar expectativas para mascarar regressões.
- `npm run lint`, `npm run typecheck`, `npm run build`.
- Verificação manual de navegação sem mouse, foco, rótulos/landmarks, mensagens de erro/estado, contraste e movimento reduzido.
- Inspeção de layout em 320, 768 e 1280 px e conferência do idioma pt-BR/en/es/ru.
- Revisão dos alt texts e origem/licença de imagens/fontes fornecidas.
- Não há teste automatizado de navegador/a11y dedicado no `package.json` observado; não afirmar cobertura até ser implementada/validada.

## Riscos e mitigação

| Risco | Efeito | Mitigação |
|---|---|---|
| Preto/verde/cinza com contraste insuficiente | Texto/controles ilegíveis | Medir contraste por uso; ajustar luminosidade de superfície/texto sem alterar a identidade aprovada. |
| Logo, fonte ou fotos sem autorização/licença | Risco de uso indevido e inconsistência visual | Não integrar até receber material e origem/licença; manter estado neutro. |
| Estilo global afetar Auth/carrinho/admin | Regressão de fluxo ou legibilidade | Alterar tokens/classes compartilhadas de forma pequena; rodar regressões e revisar cada página afetada. |
| Locale da UI divergir do locale de produto | Rótulos/links em idiomas diferentes | Preservar locale em navegação e fallback pt-BR; não alterar contrato de tradução de produto. |
| Animação distrair ou impedir leitura | Acessibilidade reduzida | Não condicionar conteúdo; respeitar redução de movimento do sistema. |
| Testes de acessibilidade sem automação local | Lacuna de cobertura | Planejar roteiro manual; decidir na Etapa 004 se ferramenta existente é suficiente ou se dependência separada deve ser proposta. |

## Rollback

Reverter somente os arquivos da TASK-012 identificados no diff daquela implementação. Preservar migrations, contratos, API, dependências e arquivos das TASK-001–TASK-011. Não executar reset/restore global nem descartar alterações de terceiros. Restaurar a apresentação anterior dos componentes sem alterar dados ou serviços.

## Gate e próxima etapa

- Escopo, arquivos candidatos, sequência, critérios, testes, riscos e rollback: documentados.
- Assets externos sem fornecimento: registrados como pré-condição para aplicação de conteúdo oficial; não impedem o planejamento aprovado.
- Implementação, build, testes e auditoria visual: NOT RUN nesta etapa, pois é exclusivamente de planejamento.
- **GATE-003: APROVADO.**
- Etapa 004 é a próxima; não foi executada nesta autorização.

==================================================
TASK: TASK-012
ETAPA: 003
STATUS DA ETAPA: APROVADA
==================================================
GATE DA ETAPA: APROVADO
GATES TOTAIS: 7
GATES CONCLUÍDOS: 3
GATES PENDENTES: 4
GATES BLOQUEADOS: 0
PROBLEMAS ENCONTRADOS:
- Assets oficiais da marca ainda não fornecidos; aplicar conteúdo real depende desses arquivos e de sua licença/origem.
- A base de testes não possui suíte automatizada de acessibilidade visual/browser identificada.
CORREÇÕES REALIZADAS:
- Nenhuma funcional; somente planejamento documental.
PENDÊNCIAS:
- Receber logo, fontes/licenças, fotografia autorizada, endereço e texto institucional antes de publicar conteúdo final.
TESTES RELACIONADOS:
- Não executados; plano é documental. Comandos e roteiros propostos estão listados acima.
PRÓXIMA ETAPA: 004 — Implementação
PRÓXIMA ETAPA HABILITADA: SIM
MOTIVO: GATE-003 aprovado. A Etapa 004 não foi iniciada e depende de autorização própria e dos insumos oficiais para conteúdo final.
==================================================
