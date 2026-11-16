# TASK-012 — Etapa 006 — Roteiro de testes manuais

**Branch:** `task/TASK-012-direcao-visual-acessibilidade-integrada`
**Base:** `68ba912d79e51cad17db1696691f946c7d91faf5`
**Executor:** preencher pela pessoa que executar
**Ambiente/commit testado:** preencher manualmente
**Status vigente em 2026-11-13:** Etapa 006 concluída/aprovada para o escopo adaptado do Supabase Studio; GATE-006 APROVADO por decisão expressa da responsável. Os procedimentos originais de interface T001–T011 não foram executados nem aprovados e ficam preservados como roteiro de referência, fora da base de aceite adaptada. GATE-004 e GATE-005 permanecem aprovados.

**Atualização documental em 2026-11-13:** a responsável autorizou formalmente que as 11 verificações adaptadas, executadas por consultas de leitura no Supabase Studio, sejam os critérios oficiais do GATE-006 nesta etapa. Resultados, decisão e limites estão em `docs/reports/TASK-012-etapa-006-evidencias-banco.md`. Os campos abaixo continuam sem preenchimento porque os procedimentos originais de interface não foram executados; isso não rebaixa a aprovação do escopo adaptado nem significa aprovação dos comportamentos de UI.

## Preparação segura

1. Use um checkout atualizado da branch TASK-012 e registre o commit testado.
2. Instale as dependências de forma reproduzível com `npm ci` no ambiente autorizado. Nesta sessão, `node_modules` estava ausente e não foi instalado.
3. Configure somente credenciais sintéticas de um projeto Supabase local/efêmero. Não use produção nem dados reais. Confirme a origem da URL/credenciais antes de iniciar a aplicação.
4. Inicie a aplicação com `npm run dev` e abra `http://localhost:3000`. O catálogo requer a configuração Supabase de teste; não altere dados durante estes testes visuais.
5. Registre navegador/versão, sistema, viewport, locale e ferramenta usada para medir contraste. Guarde capturas sem PII ou credenciais.
6. Para contraste, compare cores efetivamente renderizadas. Critério de referência WCAG AA: 4,5:1 para texto normal e 3:1 para texto grande e componentes gráficos relevantes; registre ferramenta e os pares medidos.

## Casos

### T001 — Direção cromática e hierarquia visual

- **Objetivo:** verificar a identidade visual aprovada sem prejudicar leitura ou compra.
- **Pré-condições:** aplicação disponível; páginas inicial e catálogo carregam.
- **Procedimento:** abra `/` e `/catalog`; confira fundo, superfícies, títulos, links, preço, alertas e controles.
- **Esperado:** preto `#000000`, cinza chumbo `#4A4A4A` e verde musgo `#1E2B22` aparecem como base; acentos não substituem informação; textos e preços permanecem legíveis.
- **Obtido:** [PREENCHER MANUALMENTE]
- **Evidência:** [PREENCHER MANUALMENTE]
- **Status:** [ ] NÃO EXECUTADO [ ] APROVADO [ ] REPROVADO [ ] BLOQUEADO

### T002 — Fotografia floral autorizada e carregamento

- **Objetivo:** confirmar presença de fotografia floral de impacto, carregamento e origem/licença.
- **Pré-condições:** usar o mapeamento e os vínculos já registrados no relatório da Etapa 004; não criar ou alterar produtos/associações neste teste. A responsável aceitou para GATE-004 a origem Pexels declarada, referências gerais e ressalvas sobre terceiros; isso não identifica URL/fotógrafo individuais.
- **Procedimento:** abra catálogo e detalhe de produto com imagem; confira enquadramento em tela larga e estreita e carregamento da imagem principal.
- **Esperado:** imagem floral associada aparece sem distorção e mantém enquadramento responsivo; o aceite de procedência/ressalvas já registrado em GATE-004 é preservado, sem afirmar autoria individual não identificada. Estado sem imagem continua neutro.
- **Obtido:** [PREENCHER MANUALMENTE]
- **Evidência:** [PREENCHER MANUALMENTE]
- **Status:** [ ] NÃO EXECUTADO [ ] APROVADO [ ] REPROVADO [ ] BLOQUEADO
- **Nota atual:** as cinco associações e os objetos WebP foram confirmados no relatório da Etapa 004. A responsável aceitou para GATE-004 a declaração de origem Pexels, páginas gerais de busca e avaliação dos elementos de terceiros; não há URL/fotógrafo individuais nem rastreamento separado do elemento Canva Pro. Esta nota não registra execução nem aprovação de T002. Na última consulta somente de leitura, `/catalog` respondeu HTTP 200 com a mensagem de catálogo temporariamente indisponível e sem cartões; confirme a disponibilidade do ambiente antes de executar este caso. Os cinco produtos TASK-012 estão `draft` e com estoque zero, portanto não aparecem na view pública.

### T003 — Navegação principal e ação de compra

- **Objetivo:** verificar que os caminhos de descoberta e acesso são claros.
- **Pré-condições:** aplicação disponível.
- **Procedimento:** siga da página inicial ao catálogo, abra um produto e use os links de voltar, carrinho e autenticação. Repita usando os links do cabeçalho.
- **Esperado:** cada destino é compreensível e funcional; a localização atual e a ação principal não ficam ambíguas.
- **Obtido:** [PREENCHER MANUALMENTE]
- **Evidência:** [PREENCHER MANUALMENTE]
- **Status:** [ ] NÃO EXECUTADO [ ] APROVADO [ ] REPROVADO [ ] BLOQUEADO

### T004 — Navegação por teclado e foco visível

- **Objetivo:** percorrer as ações sem mouse.
- **Pré-condições:** teclado e navegador disponíveis.
- **Procedimento:** use Tab/Shift+Tab e Enter nas páginas inicial, catálogo, detalhe e autenticação; percorra filtros, seletor de idioma, links e botões. Verifique também o foco do link da imagem no cartão. R-03 foi corrigido e confirmado pela responsável no preview isolado durante a Etapa 005; este caso ainda cobre a navegação completa na aplicação e permanece sem execução.
- **Esperado:** ordem de foco acompanha a ordem visual/lógica; nenhum controle fica inacessível; o foco é visível e não encoberto.
- **Obtido:** [PREENCHER MANUALMENTE]
- **Evidência:** [PREENCHER MANUALMENTE]
- **Status:** [ ] NÃO EXECUTADO [ ] APROVADO [ ] REPROVADO [ ] BLOQUEADO

### T005 — Contraste de texto, links, alertas e foco

- **Objetivo:** verificar legibilidade e contraste dos estados relevantes.
- **Pré-condições:** página renderizada e ferramenta de contraste identificada.
- **Procedimento:** medir texto normal, títulos grandes, links, texto sobre cartões, mensagem de estoque baixo, erro/vazio e indicador de foco. Registrar cada par foreground/background e a razão.
- **Esperado:** atender aos limites WCAG AA informados na preparação; não usar apenas cor para comunicar erro, disponibilidade ou foco.
- **Obtido:** [PREENCHER MANUALMENTE]
- **Evidência:** [PREENCHER MANUALMENTE]
- **Status:** [ ] NÃO EXECUTADO [ ] APROVADO [ ] REPROVADO [ ] BLOQUEADO

### T006 — Texto alternativo e ausência de imagem

- **Objetivo:** verificar descrições de imagens e o fallback sem imagem.
- **Pré-condições:** produto com imagem associada confirmado no relatório da Etapa 004 e produto sem imagem disponível no ambiente de teste. Não altere nem remova as imagens aprovadas para criar o estado sem imagem; se não houver fixture sem imagem, registre essa pré-condição como bloqueada e solicite orientação antes de criar dados.
- **Procedimento:** inspecione catálogo e detalhe visualmente e com leitor de tela/árvore de acessibilidade; confira imagem informativa e o estado sem imagem.
- **Esperado:** imagem informativa expõe texto alternativo útil; imagens decorativas não repetem conteúdo; ausência de imagem não anuncia placeholder decorativo como informação essencial.
- **Obtido:** [PREENCHER MANUALMENTE]
- **Evidência:** [PREENCHER MANUALMENTE]
- **Status:** [ ] NÃO EXECUTADO [ ] APROVADO [ ] REPROVADO [ ] BLOQUEADO

### T007 — Layout responsivo

- **Objetivo:** verificar leitura e ações em celular, tablet e desktop.
- **Pré-condições:** catálogo com dados sintéticos renderizado.
- **Procedimento:** inspecione larguras de 320 px, 768 px e 1280 px; navegue por catálogo, filtros, cartão e detalhe.
- **Esperado:** sem rolagem horizontal involuntária, controles cortados, texto sobreposto ou ação principal inacessível; grade e imagens se adaptam.
- **Obtido:** [PREENCHER MANUALMENTE]
- **Evidência:** [PREENCHER MANUALMENTE]
- **Status:** [ ] NÃO EXECUTADO [ ] APROVADO [ ] REPROVADO [ ] BLOQUEADO

### T008 — Estados de erro, indisponibilidade e vazio

- **Objetivo:** verificar estados não felizes sem modificar dados.
- **Pré-condições:** acesso a consulta inválida e a cenário de indisponibilidade de ambiente de teste.
- **Procedimento:** abra catálogo sem resultados; use um filtro de preço inválido; quando o serviço de teste estiver indisponível por condição controlada, observe o estado de falha. Não interrompa serviços compartilhados.
- **Esperado:** mensagem clara, acessível e não técnica; usuário consegue limpar filtros/tentar novamente; nenhum stack compartilhado é alterado.
- **Obtido:** [PREENCHER MANUALMENTE]
- **Evidência:** [PREENCHER MANUALMENTE]
- **Status:** [ ] NÃO EXECUTADO [ ] APROVADO [ ] REPROVADO [ ] BLOQUEADO

### T009 — Idiomas, fallback e valores invariáveis

- **Objetivo:** verificar a escolha opcional de conteúdo persistido nos quatro locales.
- **Pré-condições:** fixture de catálogo com tradução persistida em pt-BR, en, es e ru; locale sem tradução para observar fallback.
- **Procedimento:** use o seletor do catálogo e navegue a um detalhe em cada idioma; repita com locale sem tradução, se houver fixture; compare preço e códigos.
- **Esperado:** conteúdo persistido aparece no locale selecionado; ausência/falha volta a pt-BR sem bloquear navegação; preço continua em BRL e códigos não são traduzidos.
- **Obtido:** [PREENCHER MANUALMENTE]
- **Evidência:** [PREENCHER MANUALMENTE]
- **Status:** [ ] NÃO EXECUTADO [ ] APROVADO [ ] REPROVADO [ ] BLOQUEADO

### T010 — Movimento reduzido

- **Objetivo:** confirmar respeito à preferência de redução de movimento.
- **Pré-condições:** sistema operacional/navegador com `prefers-reduced-motion: reduce` disponível.
- **Procedimento:** compare hover/foco de cartões e ações com a preferência desligada e ligada.
- **Esperado:** nenhuma informação ou funcionalidade depende de movimento; transições não essenciais são reduzidas quando a preferência está ativa.
- **Obtido:** [PREENCHER MANUALMENTE]
- **Evidência:** [PREENCHER MANUALMENTE]
- **Status:** [ ] NÃO EXECUTADO [ ] APROVADO [ ] REPROVADO [ ] BLOQUEADO

### T011 — Experiência sem imagem e carregamento de imagem principal

- **Objetivo:** verificar que o conteúdo continua compreensível quando uma imagem falta ou está carregando.
- **Pré-condições:** fixture sintética de produto com imagem associada e sem imagem. O relatório da Etapa 004 já confirma vínculos para os cinco produtos TASK-012; para o caso sem imagem, use a fixture prevista sem alterar os produtos aprovados.
- **Procedimento:** observe o cartão e detalhe durante carregamento e no estado sem imagem; confirme que nome, preço, disponibilidade e ação continuam disponíveis.
- **Esperado:** imagem não é o único meio de identificar o produto nem de acessar a ação; o fallback não aparenta ser fotografia ou logo oficial.
- **Obtido:** [PREENCHER MANUALMENTE]
- **Evidência:** [PREENCHER MANUALMENTE]
- **Status:** [ ] NÃO EXECUTADO [ ] APROVADO [ ] REPROVADO [ ] BLOQUEADO

## Evidência adaptada de banco e decisão do gate

As consultas de leitura declaradas pela responsável e a avaliação formal estão em `docs/reports/TASK-012-etapa-006-evidencias-banco.md`. T001, T002, T003, T005, T007, T008 e T011 foram aprovados no escopo de banco; T004 somente quanto à configuração RLS/policies; T006 somente quanto à estrutura dos textos; T009 registrou ausência de traduções; T010 passou estruturalmente com ressalvas editoriais. **GATE-006 foi aprovado no escopo adaptado**, sem declarar que qualquer procedimento original de interface abaixo tenha sido executado ou aprovado.

## Contadores

- Casos previstos: 11
- Procedimentos originais de interface executados: 0
- Procedimentos originais de interface aprovados: 0
- Reprovados: 0
- Bloqueados por pré-condição conhecida: 0
- Procedimentos originais de interface não executados: 11 (preservados como referência; não compõem o aceite adaptado do GATE-006)
- Verificações adaptadas de banco declaradas: 11
- GATE-006: APROVADO — ESCOPO ADAPTADO PARA VALIDAÇÃO EXCLUSIVA NO SUPABASE STUDIO

Os campos `Obtido`, `Evidência` e `Status` acima permanecem em branco porque não houve execução de interface. A aprovação adaptada não deve ser usada como evidência de inspeção visual, acessibilidade, responsividade ou comportamento de navegador.

**Atualização posterior:** a Etapa 007 foi concluída em 2026-11-13 e TASK-012 está DONE; consultar `docs/reports/TASK-012-etapa-007-conclusao.md`. Este fechamento não altera os estados não executados dos procedimentos originais de interface acima.
