# TASK-012 — Etapa 004 — Implementação

**Data:** 2026-11-10
**Branch:** `task/TASK-012-direcao-visual-acessibilidade-integrada`
**Base:** `68ba912d79e51cad17db1696691f946c7d91faf5`
**GATE-001–003:** aprovados conforme relatórios anteriores
**Status da etapa:** BLOQUEADA — implementação de CSS validada; critério de asset autorizado pendente

## Escopo implementado

Alterado somente `src/app/globals.css`, dentro do escopo de tokens, estilos, responsividade e acessibilidade da TASK-012:

- Reaproveita preto, cinza chumbo e verde musgo já aprovados; organiza o fundo com contraste de superfícies e acento vinho já existente no projeto.
- Unifica o foco visível para links, botões, campos, seletores e elementos de resumo.
- Melhora o tamanho mínimo dos links de ação da página inicial e a adaptação de navegação/filtros em telas estreitas.
- Aplica realce discreto a imagens de produto já cadastradas, sem fornecer nem inventar fotos.
- Inclui `prefers-reduced-motion` para neutralizar animações e transições não essenciais.
- Mantém um estado neutro quando não há foto cadastrada.

Não foram alterados componentes de negócio, catálogo, API, traduções persistidas, contratos, dependências, migrations ou dados. Não foi adicionado logo, fonte, endereço ou conteúdo institucional fictício.

## Validação executada

As dependências foram instaladas neste worktree isolado por `npm ci`, autorizado pela solicitante. O comando terminou com `info ok`; `package-lock.json` permaneceu inalterado.

| Comando | Resultado observado |
|---|---|
| `npm run test:catalog` | PASS: 19 aprovados, 0 falhas, 0 skips. |
| `npm run lint` | PASS: Biome verificou 90 arquivos. A primeira execução apontou regras de estilo no CSS; os pontos foram corrigidos e a repetição passou. |
| `npm run typecheck` | PASS: `next typegen && tsc --noEmit`. |
| `npm run build` | PASS: Next.js 16.4.2 compilou e gerou as páginas sem erro. |
| Auditoria visual/WCAG no navegador | NOT RUN; requer app executável e inspeção manual. |
| `git diff --check` | Verificação registrada no encerramento da sessão. |

Os comandos automatizados acima foram executados após a instalação autorizada. Não foi iniciado Supabase nem alterado banco/dados.

## Atualização documental de assets — 2026-11-11

A solicitante informou que enviou manualmente ao Supabase Storage, bucket `catalog`, cinco objetos: `arranjo_flores.png`, `buque_flores.png`, `buque_girassol.png`, `buque_lirio.png` e `buque_rosas.png`. Segundo a operadora, o bucket está público, com limite de 10 MB e MIME types AVIF, WebP, JPEG e PNG. Este registro é evidência reportada pela operadora; não houve consulta independente ao Storage.

A solicitante informou que as cinco fotografias foram obtidas no Pexels e apontou a [licença oficial do Pexels](https://www.pexels.com/license/). A página oficial consultada em 2026-11-11 permite uso gratuito em sites e lojas virtuais, inclusive comercial, e não exige atribuição. Também proíbe vender cópias inalteradas como produto independente/stock, redistribuir em plataformas de stock, usar a imagem como marca e sugerir endosso de pessoas ou marcas retratadas; há condição específica para representação de pessoas identificáveis. Isso torna compatível, em termos gerais, o uso como imagem ilustrativa em uma loja virtual, observadas essas restrições e a apresentação comercial verdadeira do produto.

**Limite de rastreabilidade:** a fonte Pexels e o regime de licença são declaração da solicitante, corroborada pela licença geral consultada; não foi localizada a página de cada fotografia nem confirmação independente de que cada arquivo baixado corresponde à página/licença indicada. Inspecionei os cinco PNGs locais em `C:\Users\Mariana\Downloads`: todos têm 1200×1200 px e incluem metadados XMP com ferramenta Canva, mas não encontrei URL Pexels, nome de fotógrafo ou campo de fonte nos arquivos. A busca nos documentos atuais do projeto encontrou apenas os nomes dos arquivos, sem URLs ou créditos individuais. Os metadados ajudam a identificar as cópias examinadas, mas não comprovam sua origem Pexels.

| Arquivo | Origem declarada | URL original / fotógrafo | Observação de terceiros na cópia local |
|---|---|---|---|
| `arranjo_flores.png` | Pexels, informado pela solicitante | Não recuperados dos arquivos/documentos consultados | Nenhuma pessoa identificável ou marca confirmada nesta inspeção estática. |
| `buque_flores.png` | Pexels, informado pela solicitante | Não recuperados dos arquivos/documentos consultados | Nenhuma pessoa identificável ou marca confirmada nesta inspeção estática. |
| `buque_girassol.png` | Pexels, informado pela solicitante | Não recuperados dos arquivos/documentos consultados | Nenhuma pessoa identificável ou marca confirmada nesta inspeção estática. |
| `buque_lirio.png` | Pexels, informado pela solicitante | Não recuperados dos arquivos/documentos consultados | Há texto impresso em uma fita; não foi possível determinar se é marca/logotipo nem sua autorização. A espécie floral também não é confirmada apenas pela imagem. |
| `buque_rosas.png` | Pexels, informado pela solicitante | Não recuperados dos arquivos/documentos consultados | Aparece parte de uma pessoa segurando o buquê, sem rosto visível; identidade, identificabilidade e eventual autorização de imagem não foram confirmadas. |

A associação dos objetos em `public.catalog_product_images` continua sem confirmação. O schema exige `product_id`, `object_key`, `alt_text`, `width`, `height`, `mime_type` e `sort_order` válido/único por produto. O fluxo existente é `/admin/catalog`, com associação a um produto e texto alternativo obrigatório.

## Verificações documentais ainda necessárias

1. Recuperar e registrar a URL Pexels e o nome do fotógrafo de cada arquivo, se disponíveis, para fechar a rastreabilidade individual. A atribuição não é exigida pela licença, mas a fonte específica não foi localizada.
2. Confirmar que o texto na fita de `buque_lirio.png` não usa marca/logotipo sem autorização e que a pessoa parcialmente visível em `buque_rosas.png` não exige autorização adicional; guardar a evidência/licença correspondente sem publicar dados pessoais.
3. Definir para cada filename o produto-alvo (slug/ID) e o texto alternativo factual. Não inferir espécie ou conteúdo apenas pelo nome do arquivo.
4. Após associação, guardar evidência observável do produto e metadados (`object_key`, `product_id`, `alt_text`, dimensões e MIME type). O Codex não consultou nem alterou o banco.
5. Inspecionar no catálogo público e na página de produto se as imagens carregam, têm enquadramento adequado e comportamento responsivo, incluindo o estado sem imagem. A inspeção de arquivos locais feita para esta análise não é o aceite visual da interface.
6. Completar os testes manuais de foco/teclado, contraste, viewports, mensagens e locales conforme o roteiro. A inspeção visual da aplicação ainda não foi realizada.

## Bloqueios obrigatórios

1. Upload e origem Pexels foram reportados pela solicitante; a licença geral foi consultada, mas URLs/autores e liberações de terceiros específicas não foram recuperadas; associação aos produtos permanece sem confirmação.
2. Não houve inspeção manual da interface em navegador; contraste renderizado, navegação por teclado, layout responsivo, estados e apresentação não receberam evidência visual nesta etapa.

## Gate

- Implementação de estilos permitida: parcial, diff restrito a `src/app/globals.css`.
- Verificações automatizadas direcionadas: PASS (test:catalog 19/19, lint, typecheck, build).
- Associação, rastreabilidade individual/checagem de terceiros e inspeção visual: pendentes.
- **GATE-004: BLOQUEADO.** A compatibilidade geral da licença Pexels para uso em loja virtual está documentada com base na declaração da solicitante e na página oficial; faltam rastreabilidade por foto, resolução dos possíveis direitos de terceiros, associação aos produtos e resultados reais de inspeção visual/acessível.
- A etapa de revisão formal e o gate de testes manuais não avançam enquanto o GATE-004 não for aprovado. O roteiro manual preparado está em `docs/testing/TASK-012-etapa-006-testes-manuais.md`, sem resultados preenchidos.

==================================================
TASK: TASK-012
ETAPA: 004
STATUS DA ETAPA: BLOQUEADA
==================================================
GATE DA ETAPA: BLOQUEADO
GATES TOTAIS: 7
GATES CONCLUÍDOS: 3
GATES PENDENTES: 3
GATES BLOQUEADOS: 1
PROBLEMAS ENCONTRADOS:
- As cinco fotos foram reportadas como enviadas ao bucket; origem/licença e associação a produtos não foram confirmadas.
- A inspeção manual de contraste, teclado, responsividade, idiomas e estados ainda não ocorreu.
CORREÇÕES REALIZADAS:
- Ajustes de CSS focados em direção visual, foco, responsividade e movimento reduzido.
PENDÊNCIAS:
- Mapear cada arquivo para o produto e documentar sua origem/licença.
- Inspeção visual e acessível da aplicação executável.
- Inspeção visual e acessível da aplicação executável.
TESTES RELACIONADOS:
- `npm ci`: PASS; lockfile inalterado.
- `npm run test:catalog`: PASS, 19/19, 0 skips.
- `npm run lint`: PASS, 90 arquivos.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- Testes manuais: não executados.
PRÓXIMA ETAPA: 005 — Revisão (não iniciada formalmente)
PRÓXIMA ETAPA HABILITADA: NÃO
MOTIVO: o prompt oficial exige GATE-004 aprovado antes da revisão; persistem bloqueios obrigatórios.
==================================================

## Adendo — bloqueio de autorização local e estado de dados (2026-11-11)

Verificação somente de leitura realizada na stack local `flor-da-meia-noite-local`, container `supabase_db_flor-da-meia-noite-local`:

- A branch ativa foi confirmada como `task/TASK-012-direcao-visual-acessibilidade-integrada`.
- O `git status --short` mostrou alterações preexistentes em `TASKS.md`, `src/app/globals.css`, `.tmp/` e relatórios/roteiro das Etapas 001–006. Elas foram preservadas.
- O Chrome estava em `http://127.0.0.1:3000/auth`. Um GET somente de leitura para `/api/admin/catalog/products` respondeu `403` com `catalog_operator_required`. O endpoint reconhece uma sessão, mas a identidade atual não possui papel `employee` nem `admin`.
- Consulta agregada local a `auth.users` e `employee_profiles`: 1 conta com `app_metadata.role=admin`, 6 com `customer`, 2 sem papel reconhecido; nenhum perfil `employee` ativo. Consulta agregada a `auth.mfa_factors`: a única conta admin não tem fator verificado. Nenhum UID, e-mail ou token foi incluído neste relatório.
- Os cinco slugs aprovados ainda não existem e a consulta de associações de imagem para esses slugs retornou zero linhas.
- A configuração versionada identifica o projeto local e a API/Studio nas portas 54321/54323. `supabase status` não concluiu porque a CLI tentou gravar telemetria no perfil do usuário e recebeu erro de permissão. O container local foi consultado via Docker após autorização de leitura; a consulta SQL foi somente leitura.
- Nenhum usuário, papel, produto, objeto de Storage ou dado foi alterado. Nenhum teste foi repetido.

**Decisão do gate:** GATE-004 permanece BLOQUEADO. A sessão atual não tem autorização para as rotas administrativas; não há funcionário ativo e a conta admin local não tem MFA verificado, requisito para mutações. Ainda falta uma página de preview autorizada que apresente rascunhos sem estoque: o catálogo público os filtra e o painel administrativo não renderiza as imagens. Nenhuma publicação, elevação de papel, bypass de MFA/RLS ou mudança de estoque foi feita.


## Adendo — revalidação de vínculos do GATE-004 (2026-11-12)

Auditoria somente de leitura. A branch foi confirmada como `task/TASK-012-direcao-visual-acessibilidade-integrada`; as alterações locais existentes em `TASKS.md`, `src/app/globals.css`, `.tmp/` e relatórios/roteiro foram preservadas.

- A lista administrativa observada anteriormente mostrou os cinco produtos TASK-012 como `draft`, cada um com saldo administrativo `0`. Os seis fixtures da TASK-010 permaneceram na lista como `published`, saldo `4`.
- O painel confirmou `Imagem adicionada ao produto.` para Buquê Primavera, Buquê Elegância de Lírios, Buquê Rosas Coloridas e Buquê Sol Radiante. Para Arranjo Encanto Floral, houve seleção/submissão de `arranjo_flores.webp`, sem confirmação explícita de sucesso registrada.
- Nesta revalidação não foi possível consultar `catalog_product_images` nem confirmar objetos no bucket `catalog`: `supabase status` falhou porque o executável `supabase` não está instalado/disponível; `docker info`/`docker ps` falharam por ausência do endpoint Docker `npipe:////./pipe/dockerDesktopLinuxEngine`; as portas locais 54321, 54322 e 54323 não estão escutando.
- Nenhuma consulta ao banco ou Storage, upload, alteração de dados, reset ou operação destrutiva foi executada nesta revalidação.

**GATE-004: BLOQUEADO.** Faltam leitura verificável dos cinco vínculos e dos cinco objetos, especialmente do Arranjo Encanto Floral. Menor ação necessária: restabelecer o Docker Engine existente e disponibilizar a Supabase CLI (ou o Studio local conectado à stack existente); então executar somente consultas de leitura. Não recriar nem resetar o projeto.

## Adendo — disponibilidade da CLI e tentativa de recuperação do Engine (2026-11-12)

Correção de precisão do adendo anterior: o comando `supabase` não está no PATH, mas a CLI do projeto está disponível em `node_modules/.bin/supabase.cmd`. A execução somente de leitura `supabase status` retornou `StatusDbInspectError`, pois não conseguiu conectar ao Docker API em `npipe:////./pipe/dockerDesktopLinuxEngine`.

O Docker Desktop foi iniciado e permaneceu como processo, mas após aguardar o Engine, o endpoint continuou ausente. Não foi executado `supabase start`, reset, migration ou consulta de dados. Os vínculos e objetos continuam sem confirmação verificável; GATE-004 permanece BLOQUEADO.

Ação manual mínima: abrir/recuperar o Docker Desktop até o Engine Linux ficar disponível; depois avisar para repetir apenas `supabase status` e as consultas de leitura dos cinco objetos/vínculos. Não é necessário instalar a CLI nem recriar/resetar a stack.

## Revalidação de infraestrutura e catálogo — 2026-11-12

### Infraestrutura local

- `docker info --format '{{.ServerVersion}}'` sem elevação retornou `permission denied` no pipe `npipe:////./pipe/dockerDesktopLinuxEngine`; a mesma leitura com permissão aprovada respondeu Docker Engine `29.9.2`, contexto `desktop-linux`. A evidência aponta para a fronteira de permissão do processo do Codex no pipe; não aponta para falha do WSL2.
- Configuração local: `project_id = flor-da-meia-noite-local`; `supabase status` pela CLI versionada no worktree indicou `linked_project: null` e endpoints locais API `127.0.0.1:54321`, DB `127.0.0.1:54322`, Studio `127.0.0.1:54323`.
- Containers DB e Studio estavam healthy; Storage healthy; REST e Kong ativos. GETs locais de Studio, Auth health, REST e Storage retornaram HTTP 200. `supabase db query --local` conectou ao banco.
- Os volumes `supabase_db_flor-da-meia-noite-local` e `supabase_storage_flor-da-meia-noite-local` continuam existentes e montados nos containers correspondentes. Nenhum volume foi removido/recriado; não houve reset nem migration.
- A CLI informou serviços opcionais parados (imgproxy, edge runtime e pooler). Não executei start/stop para esses serviços; o edge runtime consta como encerrado há cinco dias. Vector aparece em reinicialização. Isso não impediu as verificações de DB, API e Storage desta auditoria.

### Produtos, vínculos e objetos

Consulta somente de leitura: `supabase db query --local --output-format json` com `catalog_products`, `catalog_product_images` e `storage.objects`, filtrada pelos cinco slugs. Foram retornadas cinco linhas, uma por slug, cada uma com um vínculo e `object_exists = true`. As cinco respostas HTTP HEAD aos caminhos públicos do bucket `catalog` retornaram 200 e `image/webp`.

| Slug / produto | Product ID | Preço / categoria | Estado / estoque | Object key | Dimensões | Bytes |
|---|---|---|---|---|---:|---:|
| `arranjo-encanto-floral` / Arranjo Encanto Floral | `99215a04-9050-4d3d-92a3-cb3dd3a3fd78` | R$ 229,90 / Arranjos | draft / 0 | `products/99215a04-9050-4d3d-92a3-cb3dd3a3fd78/2e364d8f-e1e4-4730-97e5-fc9b61f21a2f.webp` | 4016×6016 | 1.310.274 |
| `buque-primavera` / Buquê Primavera | `49c667f1-d60a-4a94-9ef7-b0fe5b60b24e` | R$ 189,90 / Buquês | draft / 0 | `products/49c667f1-d60a-4a94-9ef7-b0fe5b60b24e/1fa2f0d4-45b5-46f2-86a7-77c5798ade6b.webp` | 3648×5472 | 1.221.388 |
| `buque-sol-radiante` / Buquê Sol Radiante | `1d0450d0-5bf0-4bff-80ed-d33c7f71cccd` | R$ 159,90 / Buquês | draft / 0 | `products/1d0450d0-5bf0-4bff-80ed-d33c7f71cccd/c49412ee-a88c-4531-a246-88b758ca5e65.webp` | 3888×5184 | 4.292.642 |
| `buque-elegancia-de-lirios` / Buquê Elegância de Lírios | `d653ff73-8735-4bce-b736-e3f75fb88e1d` | R$ 219,90 / Buquês | draft / 0 | `products/d653ff73-8735-4bce-b736-e3f75fb88e1d/9ee8c128-e453-4c51-9ca3-296735028e3a.webp` | 5568×3712 | 1.640.566 |
| `buque-rosas-coloridas` / Buquê Rosas Coloridas | `a3972902-413a-4db4-a71b-88c88496cd29` | R$ 189,90 / Buquês | draft / 0 | `products/a3972902-413a-4db4-a71b-88c88496cd29/7245e28a-29c9-4ad7-8053-9e304e1864a4.webp` | 6960×4640 | 1.211.162 |

Em todos os cinco registros, a tabela informa `mime_type = image/webp`, `sort_order = 0` e alt text preenchido; os objetos no bucket têm `mimetype = image/webp`. **Arranjo Encanto Floral** foi confirmado individualmente: vínculo presente, objeto respondendo HTTP 200, 1.310.274 bytes.

### Resultado e limites remanescentes

Os critérios de infraestrutura local, cinco produtos, cinco objetos e cinco vínculos estão comprovados; os dados comerciais, status draft e estoque zero correspondem aos valores aprovados. Não houve correção de dados porque nenhuma divergência foi encontrada. Nenhum teste foi repetido e nenhum dado foi alterado.

**Registro histórico de 2026-11-12:** GATE-004 permanecia BLOQUEADO enquanto aguardava inspeção visual/acessível e declarações da responsável sobre procedência/direitos. A decisão posterior da responsável está registrada no adendo abaixo.

`git diff --check`: PASS após a atualização documental. Nenhum commit, push ou merge realizado.

## Adendo — aceite formal da responsável e liberação para revisão (2026-11-12)

A responsável pela auditoria declarou ter realizado a inspeção visual e de acessibilidade na aplicação local. **Como declaração manual da responsável, e não como inspeção executada ou observada pelo Codex**, ela atestou que as cinco imagens carregam em diferentes larguras; proporção e recorte são responsivos; contraste, teclado e atributos `alt` foram considerados adequados; e nenhuma anomalia de UI/UX foi detectada. Não houve nova inspeção nesta sessão.

A responsável declarou as cinco imagens como obtidas sob a licença gratuita do Pexels e forneceu as referências abaixo. Elas são páginas de busca do Pexels, não páginas individuais dos assets; “Pexels Contributor” é a atribuição declarada, não o nome identificável de um fotógrafo. Portanto, o registro distingue a declaração de origem da rastreabilidade individual não disponível:

| Produto | Referência fornecida pela responsável | Atribuição declarada | Limite de rastreabilidade |
|---|---|---|---|
| Arranjo Encanto Floral | https://www.pexels.com/search/flower%20arrangement/ | Pexels Contributor | URL individual e nome do fotógrafo não identificados |
| Buquê Elegância de Lírios | https://www.pexels.com/search/lilies/ | Pexels Contributor | URL individual e nome do fotógrafo não identificados |
| Buquê Rosas Coloridas | https://www.pexels.com/search/roses/ | Pexels Contributor | URL individual e nome do fotógrafo não identificados |
| Buquê Primavera | https://www.pexels.com/search/flowers/ | Pexels Contributor | URL individual e nome do fotógrafo não identificados |
| Buquê Sol Radiante | https://www.pexels.com/search/bouquet/ | Pexels Contributor | URL individual e nome do fotógrafo não identificados |

Sobre terceiros, a responsável atestou que o texto de fundo na imagem dos lírios é genérico/ilegível e não viola direitos; e que a pessoa parcialmente visível na imagem das rosas está desfocada/irreconhecível e não viola direitos de imagem ou privacidade. Isso é registrado como avaliação/aceite da responsável, não como parecer jurídico independente. Canva consta somente como ferramenta identificada nos metadados anteriormente examinados; a procedência/licença de elemento específico do Canva Pro não foi identificada separadamente.

**Decisão de governança:** a responsável aceitou expressamente essas declarações e os limites de rastreabilidade para esta entrega. Com essa aceitação registrada, GATE-004 fica **APROVADO por aceite da responsável**, sem afirmar que o Codex reproduziu a inspeção ou recuperou páginas individuais/autores. As cinco associações/objetos e os dados draft/estoque zero permanecem comprovados pela consulta local somente de leitura registrada acima.

**Etapa 005 / GATE-005: LIBERADA para início; ainda não executada nem aprovada.** Esta liberação não concede aprovação à revisão. GATE-001 a GATE-003 permanecem inalterados. Nenhum dado, imagem, código ou configuração foi modificado; não houve commit, push, merge ou início da Etapa 007.

## Reconciliação histórica do GATE-004 — 2026-11-12

Os registros anteriores desta seção que diziam **GATE-004 BLOQUEADO**, condicionavam a revisão à recuperação de URLs/fotógrafos individuais ou tratavam a associação como não confirmada descrevem o estado antes das evidências e da decisão da responsável registradas acima. Foram superados em 2026-11-12: consulta somente de leitura confirmou os cinco produtos, objetos e vínculos; a responsável aceitou formalmente as ressalvas de procedência/direitos e declarou a inspeção visual/acessível. O status vigente permanece **GATE-004 APROVADO por aceite formal da responsável**, sem converter suas declarações em evidência independente do Codex.

As URLs fornecidas são páginas gerais de busca, não identificadores individuais dos arquivos; nomes de fotógrafos e procedência específica do elemento Canva Pro seguem não identificados. Essas limitações permanecem registradas, mas não reabrem GATE-004 nem bloqueiam a revisão conforme a decisão explícita da responsável.
