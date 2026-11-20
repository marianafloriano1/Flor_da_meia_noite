# TASK-015 — Etapa 004: implementação e validação

Data: 2026-11-16
Branch: `task/TASK-015-capacidade-prontida-lancamento`
Escopo: validação local integrada, sintética e sem custo
Resultado: **PARCIAL — GATE-004 BLOQUEADO**

## 1. Ambiente e isolamento

- Dependências instaladas com `npm ci` usando o lockfile existente: 336 pacotes adicionados; auditoria do install informou 0 vulnerabilidades. `package.json` e lockfile não foram alterados.
- Docker Engine disponível. Foi iniciada uma stack Supabase exclusiva desta rodada, com project ID `task015-local-20261116` e portas não padrão (API 57321, DB 57322, Studio 57323; SMTP 57325). A configuração temporária ficou em `node_modules/.cache/task015-stack`; nenhum arquivo versionado de configuração foi alterado.
- A stack foi parada ao fim da validação com filtro pelo project ID acima e opção de backup habilitada. Nenhuma outra stack foi parada; nenhum reset foi executado.
- As chaves locais foram obtidas em memória do status da stack e não foram exibidas nem gravadas em arquivo.
- Na leitura de capacidade do host via `node:os`, foram observadas 12 CPUs lógicas, 7,7 GiB de RAM total e 0,8 GiB livres. Como o perfil precisa executar app, Supabase e gerador de carga, não iniciei a execução de 1.000 sessões nesse host sob baixa memória livre. Não há base empírica suficiente para declarar um mínimo universal de hardware; a próxima rodada requer host sintético dedicado com capacidade livre monitorada, ou gerador separado, sem parar serviços de outras tarefas.

## 2. Verificações executadas

| Comando/validação | Resultado observado |
|---|---|
| `npm run test:task005` com URL e chaves da stack isolada | PASS — 10 testes, 0 falhas, 0 skips. A tentativa inicial sem variáveis de integração teve um skip e não foi contada como aprovação. |
| `npm run test:task006` | PASS — 12/12, 0 falhas, 0 skips. |
| `npm run test:task007` com `TASK007_REQUIRE_SUPABASE=1` | PASS — 21/21, 0 falhas, 0 skips. |
| `npm run test:task008` | PASS — 17/17, 0 falhas, 0 skips. |
| `npm run test:task009` | PASS — 10/10, 0 falhas, 0 skips. |
| `npm run test:task009:integration` | PASS — 5/5, 0 falhas, 0 skips. |
| `npm run test:task011` | PASS — 13/13, 0 falhas, 0 skips. |
| `npm run test:task011:integration` | PASS — 1/1, 0 falhas, 0 skips. |
| `npm run test:task013` | PASS — 13/13, 0 falhas, 0 skips. |
| `npm run test:auth` | PASS — 3/3, 0 falhas, 0 skips. |
| `npm run test:catalog` | PASS — 19/19, 0 falhas, 0 skips. |
| `npm run lint` | PASS — Biome verificou 90 arquivos, sem correções. |
| `npm run typecheck` | PASS. |
| `npm run build` | PASS — build Next.js, TypeScript e geração das páginas concluídos. |

Os logs persistidos de testes, lint, typecheck e build desta rodada ficaram sob o diretório ignorado `node_modules/.cache/task015-test-logs`; o resultado de `test:task005` foi observado na sessão e não possui arquivo de log separado nessa pasta. Nenhum desses logs foi adicionado ao Git.

## Adendo de retomada — 2026-11-16

Este adendo atualiza os itens que estavam descritos como ausentes na revisão inicial; não apaga o histórico acima.

- Foram adicionados o contrato local de notificações reconstruído a partir dos documentos aprovados da TASK-010, uma migration aditiva ainda **não aplicada**, testes unitários e a suíte `test:task015`. A suíte unitária direcionada `npm run test:task010` passou com 6/6, 0 falhas e 0 skips. `npm run lint:task010` passou (exit 0; Biome reportou avisos/informações, sem erros). `node --check` passou nos seis módulos/scripts adicionados; `git diff --check` passou.
- `npm run test:task015` permanece **NOT RUN**: exige stack Supabase efêmera acessível. Nesta retomada, Docker negou acesso ao engine Linux; não foi iniciado nem alterado serviço. A migration e a integração não foram validadas contra PostgreSQL/Supabase.
- O harness local de carga e o launcher com `next build` + `next start` foram adicionados. O harness valida manifesto de 1.000 sessões, mix aprovado, limites de erro/5xx e p95 crítico ≤2.000 ms; não houve execução. A última leitura disponível de capacidade indicou cerca de 0,70 GiB livres de 7,71 GiB, insuficientes para presumir execução segura por 50 minutos junto de app e Supabase. Nenhum container de outra tarefa foi parado.
- A medição de imagem aprovada como alternativa Chromium ainda não foi realizada: não há stack/URL local de catálogo acessível nem runner de navegador com throttling disponível nesta cópia. Não há resultado de desempenho a registrar.
- Os arquivos e scripts novos são preparação, não evidência de execução. A afirmação inicial de que não havia suíte/harness é histórica e foi supersedida por este adendo; os resultados NOT RUN continuam explícitos.

### Estado vigente

GATE-004 permanece **BLOQUEADO**. Faltam: validação da migration e execução da suíte integrada em Supabase isolado sem skips; ensaio de carga completo com os limites aprovados; e medição de imagens no perfil Chromium autorizado. Não há aprovação de GATE-004 nem liberação da Etapa 005.

### Adendo de infraestrutura — verificação posterior

- O Docker CLI está instalado. A primeira chamada dentro do sandbox recebeu `permission denied` para `dockerDesktopLinuxEngine`; a verificação somente de leitura autorizada fora do sandbox confirmou Docker Engine **29.9.2** e WSL2 operacional (Ubuntu, WSL 2). Portanto, não é uma falha de instalação nem razão para reinstalar Docker.
- A stack compartilhada `flor-da-meia-noite-local` e containers residuais de TASK-013 estão ativos; não foram tocados. Não há containers TASK-015 ativos. Permanecem volumes com labels Compose/Supabase `task015-local-20261116` para DB, Storage e Edge Runtime, mas a configuração isolada anterior `node_modules/.cache/task015-stack/config.toml` não existe nesta cópia; não foi possível confirmar/reconstituir com segurança portas e serviços sem preparar novamente a configuração.
- RAM livre observada: **942.690.304 bytes (~0,88 GiB) de 7,72 GiB**. Com stacks de outras tarefas em execução, não iniciei outra stack Supabase nem a carga de 50 minutos, para não degradar serviços existentes. Não houve migration, teste de integração, load test ou alteração de volume nesta verificação.
- A limitação atual para iniciar a validação é operacional: liberar capacidade de memória suficiente sem parar os serviços protegidos e disponibilizar/confirmar a configuração local isolada com `project_id = task015-local-20261116` e portas exclusivas. O Engine em si está disponível quando acessado pelo contexto autorizado.

## 3. Critérios ainda sem evidência — registro histórico da rodada inicial

As afirmações de ausência de harness, suíte E2E e módulos TASK-010 nesta seção descrevem somente a primeira revisão. O adendo de retomada abaixo registra sua criação posterior; sua execução integrada continua pendente.

- **Carga aprovada de 1.000 sessões:** NOT RUN na rodada inicial. O harness foi adicionado depois, mas não foi executado. Não há resultados de rampa/sustentação, p50/p95/p99, taxa de erro ou invariantes sob carga. As suítes de regressão acima não substituem esse critério.
- **Imagens no dispositivo de referência:** NOT RUN. Não foi confirmada disponibilidade de Android intermediário com 4 GB e Chrome estável, e `adb`/Playwright não foram encontrados no PATH/dependências desta execução. Um probe Node local, sem dependências e restrito a URLs loopback, e seu runbook foram preparados (`scripts/task015/image-probe.mjs`, `docs/runbooks/TASK-015-validacao-imagens.md`); nenhuma medição cache frio/aquecido ou p95 foi produzida.
- **E2E integrado de TASK-015:** NOT RUN na rodada inicial. A suíte `test:task015` foi adicionada posteriormente; continua sem execução por falta de stack isolada acessível.
- **Notificações/retries:** módulos e testes unitários TASK-010 foram adicionados posteriormente a partir dos contratos aprovados. `test:task010` passou 6/6; não houve validação integrada Supabase. A aprovação da TASK-010 permanece preservada.

Nenhum resultado de carga, imagem, disponibilidade ou release foi inferido a partir de build ou testes de regressão.

### Matriz resumida de aceite integrado

| Critério | Situação nesta rodada |
|---|---|
| Fluxos críticos ponta a ponta da TASK-015 | NOT RUN; suíte foi criada depois, mas requer stack Supabase isolada. |
| Carga aprovada de 1.000 sessões e limites | Harness criado; NOT RUN por limitação operacional de recursos/ambiente. |
| Imagens ≤2 s no cenário aprovado | Probe preparado; medição Chromium com perfil/throttling aprovado NOT RUN. |
| Estoque, preço e pedidos sem regressão | Suites direcionadas/regressivas listadas acima PASS; invariantes sob carga não comprovados. |
| Notificações/retries no fluxo integrado | Testes unitários TASK-010: 6/6 PASS; integração Supabase NOT RUN. Aprovação anterior da TASK-010 preservada. |
| Restore | Evidência aprovada da TASK-013 é reutilizada; nenhum restore foi repetido nesta etapa. |
| Acessibilidade e permissões | Aprovações predecessoras preservadas; nenhuma nova jornada integrada foi testada nesta rodada. |
| Plano de suporte/prontidão de lançamento | Não avaliado/aprovado nesta etapa; permanece para o fluxo de conclusão da TASK-015. |

## 4. Decisão do gate e sequência

- GATE-001, GATE-002 e GATE-003 permanecem **APROVADOS**.
- **GATE-004: BLOQUEADO**, porque faltam evidências obrigatórias da carga aprovada e do desempenho de imagens no dispositivo/cenário aprovados; o fluxo E2E integrado da própria TASK-015 também não foi executado.
- **Etapa 005/GATE-005: NÃO INICIADA**, aguardando conclusão e aprovação do GATE-004.
- **Etapa 006/GATE-006: NÃO INICIADA**; nenhum teste manual T001–T011 foi executado nesta rodada.
- Etapa 007/GATE-007 permanece pendente e não iniciada.

As aprovações de parâmetros do GATE-002 não são resultados de ensaio. A evidência local desta etapa tampouco demonstra capacidade de produção, disponibilidade mensal, SLO, capacidade de lançamento ou aprovação financeira.

## 5. Alterações e verificações finais

Arquivos atualizados/criados: `TASKS.md`, este relatório, `scripts/task015/image-probe.mjs` e `docs/runbooks/TASK-015-validacao-imagens.md`. O probe é uma ferramenta de medição isolada, não altera a aplicação nem envia dados. Não houve alteração de funcionalidades, migrations, dados de produto, preço ou estoque. Não houve publicação, commit, push ou merge.

Verificações desta rodada: `node --check scripts/task015/image-probe.mjs` PASS; `biome check scripts/task015/image-probe.mjs` PASS; parser sintático do script embutido no probe PASS; guarda rejeitou URL remota com código 2 PASS; `git diff --check` PASS. `npm run test:task015` NOT RUN porque o script/suíte não existe nesta base. Lint global, typecheck e build foram executados antes da criação do probe e passaram; não foram repetidos após a adição da ferramenta isolada, sem mudança na aplicação ou nas dependências. `git status --short --branch` e `git diff --stat` foram conferidos.

O parágrafo acima é o registro histórico da validação inicial; o adendo de retomada contém as verificações posteriores e substitui as afirmações de que os scripts não existiam.

### Decisão operacional da responsável

A responsável informou que não dispõe de condições para novas tentativas de recuperação/execução da infraestrutura e decidiu não reinstalar ferramentas nem reconstruir/reconfigurar o ambiente. Essa limitação é registrada como **bloqueio operacional**, não como falha de implementação nem como obrigação futura da responsável. Não foram removidos containers/volumes ou interrompidas stacks existentes. Os critérios técnicos não executados permanecem NOT RUN; GATE-004 não é aprovado por essa decisão.

### Adendo de tentativa de medição — 2026-11-16

- A stack local compartilhada identificada é `flor-da-meia-noite-local` (API `127.0.0.1:54321`, DB `:54322`; Studio `:54323` indisponível). Ela não é a stack isolada TASK-015 e não foi usada para executar fluxo de carga ou migration.
- Consulta somente de leitura à `storage.objects` retornou `catalog_objects=0`; os cinco nomes simples `.png` e `.webp` consultados retornaram `NoSuchKey`. As cinco cópias `.webp` foram encontradas no worktree TASK-012: `arranjo_flores.webp` 1.310.274 bytes, `buque_flores.webp` 1.221.388, `buque_girassol.webp` 4.292.642, `buque_lirio.webp` 1.640.566 e `buque_rosas.webp` 1.211.162. Servi-las por HTTP local chegou a ser preparado apenas em memória, mas não houve amostra de imagem: o controle do Chrome parou por não conseguir confirmar com segurança a URL da janela. Os servidores locais nas portas 4173/4174 foram encerrados e as portas confirmadas fechadas.
- `load-harness.mjs` não foi executado: o critério aprovado é 1.000 sessões durante 50 minutos; uma carga reduzida não o satisfaz. A RAM livre observada nesta tentativa foi 0,78 GiB e não se comprovou manifesto de tráfego integrado apropriado. Não houve carga nem métricas de p50/p95/p99/erros.
- Resultado: nenhuma nova medição física foi produzida. GATE-004 permanece **BLOQUEADO**; medições de carga e imagem continuam **NÃO EXECUTADAS**, sem serem tratadas como falhas funcionais. Nenhum dado, objeto, container, volume ou stack foi alterado; nenhuma etapa posterior foi iniciada.

### Alternativa GitHub Actions — auditoria remota e preparação

- `.github/workflows/ci.yml` já usa `ubuntu-latest` e, nos jobs TASK-005/006/008/009/011, instala Supabase CLI e inicia projeto efêmero sob `$RUNNER_TEMP`, aplica migrations e obtém chaves geradas pelo próprio Supabase. A API do GitHub confirmou repositório público, Actions habilitado/allowed_actions=`all`, runs anteriores bem-sucedidos de TASK-011 e nenhuma secret/variable de repositório listada. O job proposto não depende de secrets de projeto Supabase: usa credenciais geradas pela stack efêmera. A disponibilidade efetiva para executar TASK-015 depende de publicar a branch.
- Não havia job `task015-integration`; acrescentei um job condicionado à branch TASK-015 que inicia Supabase efêmero, aplica migrations e exige TAP de 1 teste aprovado, 0 falhas e nenhum skip. Ele está somente no worktree local. Não houve push nem execução remota. O workflow atual dispara em `push` para `task/**` e `pull_request` para `master`, sem `workflow_dispatch`.
- A primeira resolução DNS no sandbox foi negada; com acesso de rede aprovado, o login web oficial do GitHub CLI foi concluído e `gh auth status` confirmou a conta. A lista remota contém apenas `task/TASK-011-relatorios-exportacoes-metricas`; não existe branch remota TASK-015. Não foram exibidos valores de credenciais.
- Playwright/Puppeteer não estão instalados no projeto. O Chrome existe, mas não há benchmark headless implementado. A API/DB local estava nas portas 54321/54322; a aplicação nas portas 3000/3215 e o Studio 54323 estavam indisponíveis. O bucket `catalog` local tinha zero objetos. Os cinco WebP existem no worktree TASK-012, mas `git status` indica diretório `.tmp/.../webp-ready/` não rastreado; `git ls-files` e histórico não retornam esses arquivos. Eles não estão disponíveis ao runner, e não foram copiados ou publicados.
- Não há manifesto de tráfego sintético em `scripts/task015/load/`; o harness exige 1.000 sessões e fluxos autorizados, mas o repositório não define passos/rotas e fixtures autenticadas reproduzíveis para cada fluxo. Não existe job remoto de carga. A carga de 1.000/50 min não foi reduzida nem executada; inventar rotas/credenciais de sessão não produziria evidência equivalente.
- **Estado:** migration e `test:task015` aguardam a resolução da dependência de implementação TASK-010 e execução do job em branch publicada; carga e imagem ainda não estão preparadas para execução remota reproduzível. GATE-004 continua **BLOQUEADO**, sem waiver técnico ou aprovação fictícia.
- **Limitações precisadas nesta retomada:** `scripts/task015/load/load-harness.mjs` exige um manifesto sintético validado com exatamente 1.000 sessões e a mistura aprovada; nenhum manifesto ou gerador existe em `scripts/task015/load/`, então não há entrada segura pronta para a carga. `scripts/task015/image-probe.mjs` é um probe manual servido em loopback que recebe somente URLs locais e requer que a pessoa escolha as medições de cache; não é um benchmark headless/runner pronto. O endpoint compartilhado consultado não contém os objetos e os cinco WebP encontrados estão em outro worktree, não nesta cópia. Assim, a preparação do job de integração não habilita nem comprova carga ou imagem.
- **Validações desta retomada:** `git diff --check` passou; `gh auth status` e `gh api user` confirmaram a conta após Device Activation. `actionlint` e parser YAML offline não estão disponíveis, então o workflow não recebeu validação sintática por ferramenta. Não houve commit/push; nenhum workflow, migration, integração, carga ou medição de imagem foi executado.

### Adendo de retomada remota — 2026-11-16 (preparação, antes da execução)

Este adendo supersede somente as afirmações anteriores sobre indisponibilidade da origem TASK-010, dos arquivos WebP e da autenticação GitHub. Não altera gates aprovados nem transforma preparação em resultado de teste.

- **TASK-010 recuperada e integrada:** origem aprovada `task/TASK-010-verificacao-notificacoes`, HEAD `5271a62a3b80c55dfa9f351a75a78ed589537d79`; commit de integração na branch TASK-015 `b101380327e88df77abc05f943982e35a095111f`. `git merge-base --is-ancestor` confirmou a origem aprovada na ancestralidade, e `supabase/migrations/202611050001_task010_notifications.sql` está rastreada. Branch/worktree original da TASK-010 não foi alterado. Arquivos protótipo TASK-010 não rastreados encontrados nesta cópia foram preservados e não serão incluídos no commit TASK-015.
- **WebP TASK-012 recuperados sem alterar os originais.** Local de origem: worktree `task/TASK-012-direcao-visual-acessibilidade-integrada`, `.tmp/TASK-012-pexels-preparation-2026-11-11/webp-ready/`; HEAD de referência informado `68ba912d79e51cad17db1696691f946c7d91faf5`. SHA-256 atuais:

| Arquivo | Bytes | SHA-256 |
|---|---:|---|
| `arranjo_flores.webp` | 1.310.274 | `86bb20db284e977f2e6e5064c74afaeb49f688a5fc2aff0c1fd4a1f5266f2843` |
| `buque_flores.webp` | 1.221.388 | `e650db99573c2b21ce84ba53a645dd772230237bf44daa8904cce624b6f2a920` |
| `buque_girassol.webp` | 4.292.642 | `9a1ac8fd752c1e3470dcf72047752dfd52e22376c7798ffc923301284566872f` |
| `buque_lirio.webp` | 1.640.566 | `6181fb1d34ba540777aa13a188d9cd1102dbb3cc3d4b9cd4b1e5308fbe43fff8` |
| `buque_rosas.webp` | 1.211.162 | `2c50c9f4e2fbbd97b57fe9562951abff440a97d193bc3af2449125c430e377fb` |

O hash histórico recuperado para `buque_flores.webp` coincide. Não foi localizada referência histórica independente para os outros quatro arquivos; seus valores acima são medições atuais, registradas também em `scripts/task015/assets/manifest.json`.

- **Distribuição privada:** os cinco WebP estão dentro de `scripts/task015/assets/task015-images.aesgcm` (9.678.039 bytes), pacote AES-256-GCM versionado. O secret de repositório `TASK015_IMAGE_KEY` existe; nenhum valor foi lido ou exibido. O workflow fornece o secret apenas ao passo de descriptografia, valida a lista dos cinco nomes, usa os arquivos em `$RUNNER_TEMP`, e remove pacote/arquivos temporários no encerramento. Os WebP não são enviados como artefatos.
- **Suíte e carga:** `test:task015` usa `runNotificationCycle` e a migration TASK-010 aprovada. A preparação de carga cria dados/accounts sintéticos exclusivamente na stack Supabase efêmera; manifestos com cookies ficam em arquivo temporário com modo restrito e não são publicados. Os 1.000 workers seguem mix 35/25/20/10/10, ramp-up de 10 min, sustentação de 30 min e encerramento de 10 min. Fluxos públicos usam catálogo/detalhes; checkout e histórico usam sessões customer autenticadas; inventário usa sessão employee válida. O fluxo `details_images` consulta o detalhe real e baixa o objeto Storage, consumindo cada bloco sem reter payloads. Pós-carga, um verificador checa 200 pedidos sintéticos únicos, 200 eventos `order_created` com idempotência e estoque esperado, sem pagamento ou envio real.
- **Benchmark:** implementado com Chromium headless/CDP, 30 amostras frias e 30 aquecidas por imagem, viewport móvel 390×844, CPU 4×, download 10 Mbps, upload 2 Mbps e latência 100 ms; mede transferência e `Image.decode()` com p50/p95/p99. O relatório identifica o runner como emulação, não Android físico. O critério do GATE-002 ainda requer Android intermediário real com 4 GB; esse requisito não é satisfeito pela medição headless.
- **Verificações antes da publicação:** `node --check` em scripts da TASK-015 e no arquivo da suíte integrada passou; `npm run lint:task015` terminou com exit 0 (Biome reportou avisos/informações sem erros); `git diff --check` passou. Nenhuma migration, `test:task015`, carga de 50 min ou benchmark foi executado localmente.
- **Workflows:** CI possui job de integração TASK-015 com stack Supabase efêmera, aplicação das migrations e TAP de 1 teste/0 falhas/0 skips. Um dispatch manual, protegido por input booleano, executa o job de performance para evitar repetir 50 minutos em commits somente documentais. A autenticação GitHub foi confirmada como `marianafloriano1`; secret name confirmado sem leitura do valor. Neste ponto ainda não há resultado remoto para registrar.

### Situação vigente após preparação

- Migration/integrada, carga integral, métricas p50/p95/p99, invariantes pós-carga e benchmark headless: **NOT RUN**; aguardando publicação e workflows.
- Critério de imagem em Android físico de 4 GB: **NOT RUN** e não pode ser substituído pelo benchmark headless. Mesmo que CI passe para migration, E2E, carga e emulação, esse critério ainda bloqueia a aprovação técnica integral do GATE-004.
- GATE-001 a GATE-003 permanecem **APROVADOS**; **GATE-004 permanece BLOQUEADO**; Etapas 005–006 continuam não iniciadas.
