# TASK-012 — Etapa 005 — Revisão

> **Estado vigente após retificação de 2026-11-12:** GATE-004 e GATE-005 APROVADOS pela responsável. R-03 foi corrigido e a responsável confirmou o preview isolado em desktop e mobile; a evidência é declaração manual sem capturas anexas, detalhada na retificação final deste relatório. Bloqueios anteriores permanecem como histórico.

**Data:** 2026-11-10
**Branch:** `task/TASK-012-direcao-visual-acessibilidade-integrada`
**Base revisada:** `68ba912d79e51cad17db1696691f946c7d91faf5`
**Status da triagem de 2026-11-10:** NÃO INICIADA formalmente — pré-condição GATE-004 então não satisfeita; registro histórico, superado pela aprovação formal posterior.

## Revisão preliminar de escopo — histórica (2026-11-10)

O único arquivo de implementação intencional é `src/app/globals.css`, dentro das áreas permitidas de estilo, responsividade e acessibilidade. A revisão estática do diff não identificou mudanças em APIs, dados, autenticação, tradução persistida, migrations, dependências, CI ou contratos das TASKs anteriores. Não há inclusão de PII, segredos ou assets sem origem.

## Achados que impedem o aceite

| ID | Severidade | Achado | Evidência/efeito | Resolução necessária |
|---|---|---|---|---|
| R-01 | Bloqueador | Associação e rastreabilidade individual incompletas | A solicitante informou Pexels como origem. A licença oficial foi consultada e permite uso em e-commerce, mas não foram recuperados URL/fotógrafo por imagem; os arquivos XMP indicam ferramenta Canva, sem dados de fonte. Há texto em fita em `buque_lirio.png` e pessoa parcialmente visível em `buque_rosas.png`, sem confirmação de direitos/autorização de terceiros; associação em `public.catalog_product_images` continua não confirmada. | Recuperar as páginas/nomes de fotógrafo, esclarecer direitos do texto e da pessoa, definir produto e alt text factual, associar pela interface administrativa e guardar evidência dos metadados. A atribuição opcional pode ser registrada quando fonte individual for recuperada. |
| R-02 | Pendente | Evidência visual/acessível não coletada | `test:catalog` 19/19, lint, typecheck e build passaram; nenhum navegador foi usado para medir contraste renderizado, teclado, viewport, fallback ou locale. | Executar inspeção manual conforme o roteiro após desbloquear a revisão formal. |

## Estado do gate

Conforme o prompt oficial, a Etapa 005 só pode iniciar depois de relatório e GATE-004 aprovados. A inspeção acima é uma triagem estática, não uma aprovação formal da revisão.

- **GATE-005: BLOQUEADO / NÃO INICIADO.**
- GATE-004 permanece bloqueado conforme `docs/reports/TASK-012-etapa-004-implementacao.md`.
- A declaração da fonte Pexels e a licença geral atualizam a análise documental, mas não comprovam URL/autoria específica, direitos de terceiros, associação nem apresentação visual. A inspeção dos PNGs locais foi somente de metadados/conteúdo estático, não uma inspeção de aceite da aplicação.
- A triagem estática do diff continua sem achados de escopo/segurança; lint e demais validações automatizadas passaram após correção de formatação/ordem de CSS.
- Nenhuma correção adicional foi aplicada durante esta revisão preliminar.
- **Etapa 006:** roteiro preparado como material de apoio a pedido da solicitante; a etapa formal e seu gate permanecem bloqueados até aprovação de GATE-004 e GATE-005.

## Revisão formal e Scope Guard — 2026-11-12

### Estado e escopo inspecionado

- Branch `task/TASK-012-direcao-visual-acessibilidade-integrada`; HEAD `68ba912d79e51cad17db1696691f946c7d91faf5`.
- `git status --short`: `TASKS.md` e `src/app/globals.css` modificados; relatórios TASK-012 das Etapas 001–006, roteiro manual, `.tmp/` e `q` não rastreados. Não havia alterações staged.
- Diff rastreado integral: somente `TASKS.md` (documentação/status TASK-012) e `src/app/globals.css` (tokens, hierarquia visual, layout responsivo, foco e movimento reduzido). O CSS está em `Allowed Changes`; não altera APIs, dados, autenticação, Storage, migrations, contratos ou tarefas anteriores.
- Foram lidos os relatórios TASK-012 das Etapas 001–006, o roteiro T001–T011 e o diff completo. GATE-001 a GATE-004 foram preservados nos estados documentados; a aprovação do GATE-004 permanece atribuída à decisão da responsável.

### Inventário de `.tmp/` e `q`

Inventário somente de leitura: 20 arquivos em `.tmp/TASK-012-pexels-preparation-2026-11-11/`: cinco JPG em `.visual-review/`, cinco PNG em `jpeg-originals-copies/`, cinco PNG de alta resolução em `png-ready/` (aprox. 25–48 MB cada) e cinco WebP em `webp-ready/` (aprox. 1,2–4,3 MB cada). Busca em `src/` não encontrou referência a esses caminhos/arquivos; nomes de PNG aparecem em relatórios como identificação de origem. A finalidade aparente é preparação e comparação local. Os WebP correspondem aos assets enviados e podem ajudar a reproduzir a preparação, mas não são dependência de runtime nem necessários para compilar. A finalidade individual dos JPG de comparação não está descrita em manifesto. Todos foram preservados.

`q` é um arquivo não rastreado de 14.781 bytes cujo conteúdo começa com um diff textual de `TASKS.md` e `src/app/globals.css`; sua origem/finalidade não foi confirmada e não há referência no código/documentação. Foi preservado e excluído da revisão de produto. `.tmp/` e `q` aparecem como não rastreados; inclusão indiscriminada (`git add -A`) poderia adicioná-los. Não foram staged nem modificados.

### Achado que bloqueia GATE-005

| ID | Severidade | Arquivo/localização | Evidência e impacto | Correção mínima |
|---|---|---|---|---|
| R-03 | Bloqueador | `src/app/globals.css`: `.catalog-card { overflow: hidden }` (regra existente no diff de trabalho) e regra global `:focus-visible` com `outline-offset: 4px`; `src/app/catalog/page.tsx`, link `.catalog-card-image` (40–56) | Revisão estática: o link da imagem ocupa a borda superior/interna do cartão e recebe contorno externo deslocado; o ancestral com `overflow: hidden` recorta a parte do indicador que ultrapassa sua caixa de recorte. Assim, ao menos parte do foco desse link pode ficar invisível. Não foi feita reprodução em browser nesta revisão. O aceite visual/acessível anterior da responsável para GATE-004 continua preservado, mas não elimina o achado estático de código. | Ajustar o recorte/foco no escopo de estilos e validar o foco do link da imagem por teclado. Nenhum CSS foi alterado nesta revisão documental. |

### Validações e decisão

- `git status`, diff rastreado integral, Scope Guard, documentos e inventário `.tmp/`: PASS; nenhuma inclusão de arquivo foi preparada.
- Os resultados anteriores registrados no relatório da Etapa 004 (`npm run test:catalog` 19/19, lint em 90 arquivos, typecheck e build) foram reutilizados, não repetidos.
- Testes manuais T001–T011: **NOT RUN**, conforme solicitado. A declaração visual/acessível da responsável continua identificada como aceite manual para GATE-004, não como execução dos casos pelo Codex.
- Nenhum código, dado, Storage, migration, dependência ou configuração foi alterado nesta revisão.
- GATE-001 a GATE-003: APROVADOS e preservados. GATE-004: APROVADO por aceite formal da responsável em 2026-11-12, com ressalvas de rastreabilidade preservadas. **GATE-005: BLOQUEADO por R-03.** GATE-006 permanece PENDENTE, com 0/11 testes executados; GATE-007 PENDENTE.
- `git diff --check`: resultado final registrado após as atualizações documentais.

==================================================
TASK: TASK-012
ETAPA: 005
STATUS DA ETAPA: BLOQUEADA
==================================================
GATE DA ETAPA: BLOQUEADO
GATES TOTAIS: 7
GATES CONCLUÍDOS: 4
GATES PENDENTES: 2
GATES BLOQUEADOS: 1
PROBLEMAS ENCONTRADOS:
- R-03: indicador de foco do link da imagem potencialmente recortado pelo overflow do cartão.
CORREÇÕES REALIZADAS:
- Reconciliação documental de estados históricos; nenhuma alteração de implementação.
PENDÊNCIAS:
- Corrigir R-03 em CSS e validar o indicador com teclado antes de aprovar GATE-005.
TESTES RELACIONADOS:
- Validações automatizadas anteriores reutilizadas; não repetidas. T001–T011 manuais NOT RUN.
PRÓXIMA ETAPA: 006 — testes manuais, após GATE-005 aprovado e autorização específica
PRÓXIMA ETAPA HABILITADA: NÃO
MOTIVO: GATE-005 bloqueado por R-03; Etapa 006 não iniciada.
==================================================

## Adendo — correção pontual de R-03 (2026-11-12)

- **Causa confirmada:** `.catalog-card` mantém `overflow: hidden` para preservar o recorte e os cantos arredondados; o link `.catalog-card-image` recebia a regra global de foco com `outline-offset: 4px`, que pode ser cortada pelo ancestral.
- **Correção:** em `src/app/globals.css`, `.catalog-card-image:focus-visible` define `outline-offset: -5px` e um filete interno de 2px em `var(--color-black)`. O contorno dourado global passa a ficar dentro da caixa do link e o filete escuro cria uma borda contrastante com partes claras da fotografia. A regra só atua com `:focus-visible`; não altera dimensões, fluxo, recorte, responsividade nem o seletor de hover.
- **Validação estática:** inspeção do CSS e da estrutura confirmam que o indicador fica dentro da caixa de recorte do cartão; o foco só é exibido no estado `:focus-visible`, e a regra não modifica `:hover`. O contorno e a sombra não participam do layout, portanto não introduzem deslocamento geométrico.
- **Validação visual no navegador:** **NOT RUN**. A tentativa de abrir `http://127.0.0.1:3000/catalog` retornou `ERR_CONNECTION_REFUSED`; não foi possível confirmar visualmente o foco, blur/hover ou viewports desktop e mobile na aplicação real.
- **Verificação manual pendente:** com o catálogo local disponível, usar Tab até o link da imagem, confirmar que o contorno dourado e o filete escuro aparecem integralmente dentro dos cantos arredondados; pressionar Tab para o próximo elemento e confirmar o desaparecimento do indicador; verificar que hover mantém o estilo atual. Repetir em viewport desktop e mobile (por exemplo, 1440×900 e 390×844), sem executar os casos T001–T011.
- **Arquivos alterados neste adendo:** `src/app/globals.css` e este relatório. O estado preexistente de `TASKS.md`, `.tmp/` e `q` foi preservado.
- **Decisão:** R-03 tem correção de CSS aplicada, mas sua validação visual exigida não foi possível. **GATE-005 permanece BLOQUEADO** até a verificação manual acima; Etapas 006 e 007 não foram iniciadas.

==================================================
TASK: TASK-012
ETAPA: 005
STATUS DA ETAPA: BLOQUEADA
==================================================
GATE DA ETAPA: BLOQUEADO
GATES TOTAIS: 7
GATES CONCLUÍDOS: 4
GATES PENDENTES: 2
GATES BLOQUEADOS: 1
PROBLEMAS ENCONTRADOS:
- R-03: correção CSS aplicada; verificação visual real em desktop/mobile continua pendente porque o servidor local recusou conexão.
CORREÇÕES REALIZADAS:
- `.catalog-card-image:focus-visible` usa contorno interno e filete escuro, sem alterar layout, recorte ou hover.
PENDÊNCIAS:
- Confirmar com Tab o foco integral, o desaparecimento ao perder foco e a ausência de interferência no hover, em desktop e mobile.
TESTES RELACIONADOS:
- Verificação visual NOT RUN; casos manuais T001–T011 não executados.
PRÓXIMA ETAPA: 006 — Testes manuais (roteiro preparado, etapa formal bloqueada)
PRÓXIMA ETAPA HABILITADA: NÃO
MOTIVO À época deste resumo: GATE-005 aguardava a verificação visual. Este estado foi superado pela retificação final de validação manual registrada abaixo.
==================================================

## Retificação de status — validação manual de R-03 (2026-11-12)

A responsável confirmou a inspeção manual do preview HTML isolado e declarou que:

- o link da imagem recebe foco por teclado com o contorno visível por inteiro;
- ao avançar o foco, o contorno desaparece do link anterior;
- o hover permanece funcionando;
- o comportamento está correto em desktop e mobile.

O preview foi aberto em `C:\Users\Mariana\AppData\Local\Temp\TASK-012-R03-preview-2026-11-12\index.html`, com cópias locais do CSS e de `buque_flores.webp`. As cópias foram verificadas por SHA-256 e coincidiram com os originais: CSS `7A9D02E72E2380548E0803ED5C597A147D3B81ED4CFAD6EE9D86825CBDE7604E`; imagem `E650DB99573C2B21CE84BA53A645DD772230237BF44DAA8904CCE624B6F2A920`.

**Origem e limite da evidência:** confirmação manual declarada pela responsável; não foram anexadas capturas de tela. Nenhum teste automatizado foi repetido nesta atualização.

**Decisão vigente:** R-03 resolvido conforme a validação manual declarada. **GATE-005: APROVADO. Etapa 005: APROVADA.** GATE-001 a GATE-004 permanecem aprovados. A Etapa 006 permanece PENDENTE/NÃO INICIADA (T001–T011 não executados nesta atividade); Etapa 007 NÃO INICIADA.
