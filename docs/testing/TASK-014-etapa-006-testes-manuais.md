# TASK-014 — Etapa 006: Roteiro de testes manuais T001–T011

Data da preparação do roteiro: 2026-11-15
Branch: task/TASK-014-migracao-operacional-catalogo
Executor declarado: Mariana Floriano de Sant Anna. Execução manual relatada em 15–16/11/2026.
Ambiente relatado pela operadora: projeto local flor-da-meia-noite-local; produção/remoto proibidos. Janela declarada: 2026-11-15T19:42:49Z a 2026-11-16T01:31:45Z (2026-11-15 16:42:49–22:31:45 America/Sao_Paulo). Evidências deste adendo são relato consolidado sanitizado fornecido pela operadora, não saída independente recuperada pelo Codex.

## Estado e limitações antes da execução

A configuração versionada identifica project_id flor-da-meia-noite-local, API 127.0.0.1:54321, banco 54322 e Studio 54323. Docker respondeu como 29.9.2 e portas 54321–54325 estavam em escuta, mas não foi executado supabase status nem comprovada a identidade do serviço por CLI. Portanto, antes de qualquer mutação, confirme pelo Studio/CLI que aplicação, API e banco são locais e pertencem a este projeto; se não confirmar, pare.

Neste worktree não existem node_modules, .env.local ou Supabase CLI detectável; a aplicação não está iniciada. O diretório public/tests não contém imagem fixture com PNG/JPEG/WebP/AVIF. Não inicie nem resete stack por este roteiro. Preparação posterior necessária: restaurar dependências com npm ci; configurar apenas URL/chave anon locais conforme .env.example e o estado da stack, sem copiar segredos para relatório; disponibilizar imagem sintética de teste válida com tamanho menor que 10 MiB. Não usar service_role no navegador, dados reais, produtos da TASK-012 ou imagens sem autorização.

## Regras para todos os casos

- Usar registros com prefixo inequívoco task014-test, slug único minúsculo, nome marcado “TESTE NÃO COMERCIAL” e status draft. Produto sintético não representa informação botânica/comercial.
- Usar apenas uma série de produtos sintéticos e reutilizá-la nos casos; não criar duplicatas desnecessárias. Não inserir SQL. Toda criação e ajuste passa pela interface/API administrativa normal.
- Para campos factuais desconhecidos, não inventar: deixar sem conteúdo conforme validação ou interromper mantendo draft.
- Estoque começa em zero. Só lançar quantidade depois de contagem física de unidades de ensaio não comercializadas e conferência por segunda pessoa.
- As consultas Supabase Studio abaixo são somente leitura. Não colar tokens, cookies, chaves, e-mails pessoais ou dados de clientes nas evidências.
- Se o ambiente, acesso, asset, MFA ou autorização não corresponder às pré-condições, marcar BLOQUEADO e parar sem repetir ou contornar controles.

## Preparação manual do ambiente

1. No PowerShell, abrir o worktree da branch indicada e instalar dependências somente quando autorizado: npm ci.
2. Disponibilizar a Supabase CLI por meio aprovado, sem npx/download implícito. Confirmar a stack existente com supabase status; não executar db reset. Verificar project_id flor-da-meia-noite-local e endpoints locais antes de prosseguir.
3. Preparar .env.local a partir de .env.example apenas com URL e chave anon locais; não compartilhar os valores. Se não conseguir confirmar a URL/API local e o projeto, interromper.
4. Iniciar a aplicação pela instrução aprovada do projeto (npm run dev) somente depois de confirmar configuração local. A rota de teste é /admin/catalog.
5. Separar imagem sintética autorizada, MIME/assinatura coincidentes, dimensões positivas e menos de 10 MiB. Separar unidades físicas de ensaio não comercial, todas marcadas para não venda.
6. Usar duas contas administrativas autorizadas distintas para o conferente e a pessoa registradora. Não contornar MFA.

## Casos

### T001 — Pré-condições, isolamento e autorização
**Objetivo:** evitar escrita em projeto remoto e confirmar acesso legítimo.
**Pré-condições:** aplicação e stack local prontas; conta própria autorizada.
**Comandos:** PowerShell: supabase status (redigir qualquer chave exibida); abrir /admin/catalog no navegador.
**Executado em (UTC):** 2026-11-15T19:42:49Z
**Origem da evidência:** declaração manual consolidada da operadora; sanitizada, sem IDs internos de contas ou segredos.
**Procedimento:** verificar URL do app, status da stack/projeto, portas locais e abrir /admin/catalog. Confirmar que a sessão reconhecida tem papel autorizado. Não registrar valores de chaves.
**Esperado:** project_id flor-da-meia-noite-local, API local, painel acessível pela conta autorizada.
**Resultado obtido:** supabase status confirmou project_id local flor-da-meia-noite-local e endpoints locais; GET /admin/catalog HTTP 200; sessões rotuladas registradora e conferente verificadas como role admin e aal2.
**Evidência:** relato consolidado e sanitizado fornecido pela operadora; supabase status confirmou project_id local flor-da-meia-noite-local e endpoints locais; GET /admin/catalog HTTP 200; sessões rotuladas registradora e conferente verificadas como role admin e aal2.
**Status:** [ ] NÃO EXECUTADO [x] APROVADO [ ] REPROVADO [ ] BLOQUEADO

### T002 — Cadastro individual e rascunho
**Objetivo:** comprovar cadastro item por item sem publicação e sem saldo presumido.
**Pré-condições:** T001 aprovado; dados de ensaio claramente sintéticos.
**Comandos:** Interface: /admin/catalog; consultas SELECT de conferência ao final do roteiro.
**Executado em (UTC):** 2026-11-15T20:23:39Z e 2026-11-15T20:28:37Z
**Origem da evidência:** declaração manual consolidada da operadora; sanitizada, sem IDs internos de contas ou segredos.
**Procedimento:** pesquisar duplicidade; cadastrar dois registros sintéticos em submissões separadas via painel, usando categoria existente, valor de ensaio, status draft e conteúdo não factual rotulado como teste; não afirmar atributos botânicos.
**Esperado:** cada submissão cria somente o respectivo registro; ambos draft, estoque inicial zero, sem produto real alterado.
**Resultado obtido:** Dois produtos sintéticos criados em requisições POST separadas a /api/admin/catalog/products, ambas HTTP 201: task014-test-buque-ensaio-01 (Buquês) e task014-test-vaso-ensaio-02 (Vasos). Ambos draft e stock_quantity 0.
**Evidência:** relato consolidado e sanitizado fornecido pela operadora; Dois produtos sintéticos criados em requisições POST separadas a /api/admin/catalog/products, ambas HTTP 201: task014-test-buque-ensaio-01 (Buquês) e task014-test-vaso-ensaio-02 (Vasos). Ambos draft e stock_quantity 0.
**Status:** [ ] NÃO EXECUTADO [x] APROVADO [ ] REPROVADO [ ] BLOQUEADO

### T003 — Prevenção de duplicidade
**Objetivo:** verificar conflito de slug sem duplicar produto.
**Pré-condições:** T002 aprovado e um slug sintético já existente.
**Comandos:** Interface: /admin/catalog; nenhuma consulta de escrita fora do formulário.
**Executado em (UTC):** 2026-11-15T20:28:37Z
**Origem da evidência:** declaração manual consolidada da operadora; sanitizada, sem IDs internos de contas ou segredos.
**Procedimento:** tentar cadastrar novamente o mesmo slug no painel, sem repetir upload de imagem.
**Esperado:** operação recusada como conflito; permanece apenas um registro para o slug e seus valores não são sobrescritos.
**Resultado obtido:** Reenvio do slug task014-test-buque-ensaio-01 sem upload foi rejeitado com HTTP 409 e catalog_product_slug_conflict. Um registro preservado; price_brl 120.00.
**Evidência:** relato consolidado e sanitizado fornecido pela operadora; Reenvio do slug task014-test-buque-ensaio-01 sem upload foi rejeitado com HTTP 409 e catalog_product_slug_conflict. Um registro preservado; price_brl 120.00.
**Status:** [ ] NÃO EXECUTADO [x] APROVADO [ ] REPROVADO [ ] BLOQUEADO

### T004 — Categorias fixas
**Objetivo:** confirmar seleção de categoria permitida, sem criar categorias livres.
**Pré-condições:** produto sintético em draft.
**Comandos:** Interface: /admin/catalog; consulta SELECT de categoria em catalog_products se necessário.
**Executado em (UTC):** 2026-11-15T20:23:39Z
**Origem da evidência:** declaração manual consolidada da operadora; sanitizada, sem IDs internos de contas ou segredos.
**Procedimento:** inspecionar as opções do formulário; selecionar uma categoria já existente e salvar. Não enviar categoria arbitrária nem executar SQL.
**Esperado:** só opções fixas são apresentadas e o produto salvo conserva a escolhida.
**Resultado obtido:** Operadora conferiu as 16 categorias fixas em public.catalog_categories. Categoria Livre Invalida foi recusada com HTTP 400 e invalid_catalog_product; Buquês e Vasos preservadas.
**Evidência:** relato consolidado e sanitizado fornecido pela operadora; Operadora conferiu as 16 categorias fixas em public.catalog_categories. Categoria Livre Invalida foi recusada com HTTP 400 e invalid_catalog_product; Buquês e Vasos preservadas.
**Status:** [ ] NÃO EXECUTADO [x] APROVADO [ ] REPROVADO [ ] BLOQUEADO

### T005 — Imagem otimizada e válida
**Objetivo:** confirmar imagem de ensaio carregada e metadados coerentes.
**Pré-condições:** asset sintético autorizado, menos de 10 MiB, arquivo íntegro; T001 aprovado.
**Comandos:** Interface: upload em /admin/catalog; consulta SELECT de metadados/vínculo e conferência de Storage.
**Executado em (UTC):** 2026-11-15T20:28:37Z
**Origem da evidência:** declaração manual consolidada da operadora; sanitizada, sem IDs internos de contas ou segredos.
**Procedimento:** enviar pela interface normal ao produto draft; preencher alt factual; conferir resposta e preview. Consultar apenas leitura o vínculo em catalog_product_images e objeto no bucket associado.
**Esperado:** upload aceito; MIME/assinatura coincidentes, dimensões positivas, alt não vazio, objeto e vínculo apontam ao produto correto; nenhuma imagem real ou não autorizada.
**Resultado obtido:** Upload de PNG sintético 400 × 400 px, 3.360 bytes, aceito pelo endpoint de imagem com HTTP 201. Registro informado: mime_type image/png, alt_text factual não vazio e sort_order 0.
**Evidência:** relato consolidado e sanitizado fornecido pela operadora; Upload de PNG sintético 400 × 400 px, 3.360 bytes, aceito pelo endpoint de imagem com HTTP 201. Registro informado: mime_type image/png, alt_text factual não vazio e sort_order 0.
**Status:** [ ] NÃO EXECUTADO [x] APROVADO [ ] REPROVADO [ ] BLOQUEADO

### T006 — Conteúdo factual e campos desconhecidos
**Objetivo:** confirmar que a equipe não inventa descrição, composição, cuidados, toxicidade ou durabilidade.
**Pré-condições:** fonte sintética identificada como tal; nenhum dado de cliente.
**Comandos:** Interface: /admin/catalog; comparação visual/manual com a fonte sintética.
**Executado em (UTC):** 2026-11-15T20:28:37Z
**Origem da evidência:** declaração manual consolidada da operadora; sanitizada, sem IDs internos de contas ou segredos.
**Procedimento:** preencher somente informação expressamente fornecida para o fixture; deixar campo desconhecido em branco quando permitido. Se validação impedir isso, parar e registrar o campo/erro, sem inserir afirmação inventada.
**Esperado:** conteúdo do registro corresponde à fonte; produto permanece draft enquanto faltar informação necessária à liberação.
**Resultado obtido:** Fixtures salvos com descrição sintética declarada; occasion, size, materials, care_instructions, flower_meaning, pet_toxicity e shelf_life ficaram vazios ou null. Ambos permaneceram draft; nenhuma informação foi inventada.
**Evidência:** relato consolidado e sanitizado fornecido pela operadora; Fixtures salvos com descrição sintética declarada; occasion, size, materials, care_instructions, flower_meaning, pet_toxicity e shelf_life ficaram vazios ou null. Ambos permaneceram draft; nenhuma informação foi inventada.
**Status:** [ ] NÃO EXECUTADO [x] APROVADO [ ] REPROVADO [ ] BLOQUEADO

### T007 — Dupla conferência independente
**Objetivo:** validar o procedimento de revisão por segunda pessoa.
**Pré-condições:** T002–T006; duas contas autorizadas próprias.
**Comandos:** Interface: /admin/catalog em sessões próprias da pessoa registradora e conferente.
**Executado em (UTC):** 2026-11-16T01:22:41Z
**Origem da evidência:** declaração manual consolidada da operadora; sanitizada, sem IDs internos de contas ou segredos.
**Procedimento:** pessoa diferente da registradora compara registro, categoria, imagem, alt e fonte; registrar decisão no checklist. Fazer uma rodada com divergência sintética não factual e não liberar o produto.
**Esperado:** conferente independente identifica divergência; item fica draft e sem saldo liberado. Este é controle operacional, não prova de bloqueio técnico: a UI/API permite status published. Não selecionar published durante o ensaio.
**Resultado obtido:** Conferente, conta distinta com role admin e aal2, inspecionou os dois fixtures via GET /api/admin/catalog/products, identificou pendências factuais e manteve ambos draft, com saldo zero.
**Evidência:** relato consolidado e sanitizado fornecido pela operadora; Conferente, conta distinta com role admin e aal2, inspecionou os dois fixtures via GET /api/admin/catalog/products, identificou pendências factuais e manteve ambos draft, com saldo zero.
**Status:** [ ] NÃO EXECUTADO [x] APROVADO [ ] REPROVADO [ ] BLOQUEADO

### T008 — Contagem física de unidades de ensaio
**Objetivo:** documentar contagem e verificação por duas pessoas antes do saldo.
**Pré-condições:** unidades de ensaio físicas, não comerciais, identificadas; produto segue draft.
**Comandos:** Contagem física manual e checklist; sem comando SQL.
**Executado em (UTC):** 2026-11-16T01:30:00Z
**Origem da evidência:** declaração manual consolidada da operadora; sanitizada, sem IDs internos de contas ou segredos.
**Procedimento:** registradora conta as unidades de ensaio; conferente, sem copiar a contagem inicial, reconta e compara. Se não houver objetos físicos de ensaio, marcar BLOQUEADO; não substituir contagem por número digitado.
**Esperado:** duas contagens coincidem e são ligadas ao mesmo produto/fixture; divergência interrompe o processo.
**Resultado obtido:** Contagem física independente de três objetos de ensaio não comerciais (duas canetas e um lápis) vinculados ao fixture task014-test-buque-ensaio-01: registradora contou três e conferente recontou três; contagens reconciliadas.
**Evidência:** relato consolidado e sanitizado fornecido pela operadora; Contagem física independente de três objetos de ensaio não comerciais (duas canetas e um lápis) vinculados ao fixture task014-test-buque-ensaio-01: registradora contou três e conferente recontou três; contagens reconciliadas.
**Status:** [ ] NÃO EXECUTADO [x] APROVADO [ ] REPROVADO [ ] BLOQUEADO

### T009 — Ajuste de estoque auditável após reconciliação
**Objetivo:** confirmar que somente a contagem acordada é lançada com justificativa.
**Pré-condições:** T008 aprovado; destino local isolado confirmado; pessoa autorizada.
**Comandos:** Interface: ajuste administrativo; SQL Editor somente com a consulta SELECT inventory_ledger deste roteiro.
**Executado em (UTC):** 2026-11-16T01:31:45Z
**Origem da evidência:** declaração manual consolidada da operadora; sanitizada, sem IDs internos de contas ou segredos.
**Procedimento:** usar o ajuste de estoque do painel, informar a quantidade inteira reconciliada e motivo sintético. Depois, consultar somente leitura public.inventory_ledger filtrando product_id e event_type = stock_adjustment; conferir quantity_before, quantity_after, actor_uid, reason e created_at.
**Esperado:** antes/depois correspondem à contagem validada; ator e motivo registrados; saldo permanece no produto sintético draft.
**Resultado obtido:** Ajuste via POST /api/admin/catalog/products/{id}/stock respondeu HTTP 200. A operadora relata linha imutável em public.inventory_ledger: stock_adjustment, quantity_before 0, quantity_after 3, quantity_delta 3; ator rotulado registradora. Produto permaneceu draft.
**Evidência:** relato consolidado e sanitizado fornecido pela operadora; Ajuste via POST /api/admin/catalog/products/{id}/stock respondeu HTTP 200. A operadora relata linha imutável em public.inventory_ledger: stock_adjustment, quantity_before 0, quantity_after 3, quantity_delta 3; ator rotulado registradora. Produto permaneceu draft.
**Status:** [ ] NÃO EXECUTADO [x] APROVADO [ ] REPROVADO [ ] BLOQUEADO

### T010 — Divergência impede ajuste/liberação operacional
**Objetivo:** verificar a parada do processo quando contagens diferem.
**Pré-condições:** fixture sintético e produto draft; não fazer alteração para simular divergência.
**Comandos:** Checklist operacional e consulta SELECT de produto/saldo.
**Executado em (UTC):** 2026-11-16T01:31:45Z
**Origem da evidência:** declaração manual consolidada da operadora; sanitizada, sem IDs internos de contas ou segredos.
**Procedimento:** em registro separado no checklist, apresentar uma contagem sintética divergente; a pessoa conferente rejeita a reconciliação. Não enviar ajuste de estoque e não alterar estado do produto.
**Esperado:** checklist mostra divergência; saldo do sistema não muda por esta tentativa; item permanece draft e não é liberado para venda. O resultado verifica adesão ao processo humano, não uma trava automatizada.
**Resultado obtido:** Checklist do task014-test-vaso-ensaio-02 registrou divergência 2 versus 1, rejeitada pela conferente; não houve submissão de ajuste. Consulta final confirmou stock_quantity 0 e status draft.
**Evidência:** relato consolidado e sanitizado fornecido pela operadora; Checklist do task014-test-vaso-ensaio-02 registrou divergência 2 versus 1, rejeitada pela conferente; não houve submissão de ajuste. Consulta final confirmou stock_quantity 0 e status draft.
**Status:** [ ] NÃO EXECUTADO [x] APROVADO [ ] REPROVADO [ ] BLOQUEADO

### T011 — Conferência final antes de abertura de vendas
**Objetivo:** comprovar que nenhum produto incompleto ou não reconciliado é liberado.
**Pré-condições:** T001–T010 avaliados; produtos sintéticos ainda isolados.
**Comandos:** Interface pública local e consulta SELECT de produto; nenhuma publicação.
**Executado em (UTC):** 2026-11-16T01:31:45Z
**Origem da evidência:** declaração manual consolidada da operadora; sanitizada, sem IDs internos de contas ou segredos.
**Procedimento:** a segunda pessoa revisa checklist final. Manter todos os fixtures em draft; verificar em consulta de leitura que não estão na view/listagem pública. Não publicar nem realizar compra. Confirmar que nenhum saldo comercial foi presumido.
**Esperado:** fixtures de ensaio não aparecem como itens vendáveis; nenhuma publicação ocorreu; pendências continuam claramente marcadas. A ausência no catálogo é evidência auxiliar, não prova isolada da conferência física.
**Resultado obtido:** GET /api/catalog respondeu HTTP 200, TOTAL_PUBLICO 6 e FIXTURES_VAZADOS 0. Consultas públicas diretas aos dois slugs sintéticos responderam HTTP 404 product_not_found.
**Evidência:** relato consolidado e sanitizado fornecido pela operadora; GET /api/catalog respondeu HTTP 200, TOTAL_PUBLICO 6 e FIXTURES_VAZADOS 0. Consultas públicas diretas aos dois slugs sintéticos responderam HTTP 404 product_not_found.
**Status:** [ ] NÃO EXECUTADO [x] APROVADO [ ] REPROVADO [ ] BLOQUEADO

## Consultas somente leitura para evidência

Executar no SQL Editor somente depois de T001 confirmar projeto local. Substituir o prefixo pelo slug único de ensaio. Não usar consultas de escrita.

Produtos:
select id, slug, name, category_name, status, stock_quantity
from public.catalog_products
where slug like 'task014-test-%'
order by created_at;

Imagens:
select p.slug, i.object_key, i.mime_type, i.width, i.height, i.alt_text, i.sort_order
from public.catalog_products p
join public.catalog_product_images i on i.product_id = p.id
where p.slug like 'task014-test-%'
order by p.slug, i.sort_order;

Ajustes de estoque:
select id, product_id, event_type, quantity_delta, actor_uid,
       quantity_before, quantity_after, reason, created_at
from public.inventory_ledger
where event_type = 'stock_adjustment'
  and product_id in (
    select id from public.catalog_products where slug like 'task014-test-%'
  )
order by created_at;

## Contadores e decisão

- Previstos: 11.
- Executados: 11.
- Aprovados: 11.
- Reprovados: 0.
- Bloqueados: 0.
- Pendentes: 0.

**GATE-006: APROVADO**, conforme relato consolidado da execução manual e evidências sanitizadas fornecidas pela operadora. Os resultados não são apresentados como logs independentes recuperados nesta atualização.

Conforme declaração da operadora, os testes usaram dados sintéticos, não expuseram chaves/tokens/senhas/PII, arquivos temporários foram limpos, e os dois produtos permaneceram draft sem publicação comercial. A limpeza e a ausência de exposição não foram reexecutadas ou verificadas independentemente nesta atualização.

**GATE-007 / Etapa 007: HABILITADA, ainda não iniciada.** A aprovação do GATE-006 libera a próxima etapa conforme a sequência formal; não significa que sua conclusão foi executada.
