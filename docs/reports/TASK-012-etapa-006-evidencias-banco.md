# TASK-012 — Etapa 006 — Evidências adaptadas de banco (T001–T011)

**Registro documental:** 2026-11-13
**Fonte:** relatório fornecido pela responsável no anexo desta solicitação
**Ambiente/método declarado:** Supabase Studio, SQL Editor, consultas somente de leitura
**Alterações de dados declaradas:** nenhuma
**Execução independente pelo Codex:** não realizada

## Escopo e interpretação

Em decisão expressa nesta solicitação, a responsável autorizou adaptar formalmente o escopo da Etapa 006 para validação exclusivamente no Supabase Studio e tratar as verificações adaptadas T001–T011 como critérios oficiais do GATE-006. A autorização aceita os resultados declarados pela responsável e não converte verificações de banco em comprovação de navegação, renderização, acessibilidade visual, responsividade ou comportamento de interface. O roteiro original permanece preservado como referência, com seus procedimentos de interface identificados como não executados.

Os resultados abaixo são evidência declarada pela responsável; o material não inclui texto integral das consultas, export bruto do SQL Editor, captura, timestamp por caso, ID de execução nem commit do ambiente consultado. Esses elementos não são inferidos ou inventados neste relatório.

## Resultados por caso adaptado

| ID | Verificação adaptada declarada | Resultado registrado | Limite / ressalva |
|---|---|---|---|
| T001 | Identidade de cinco produtos, nomes, slugs e preços | **APROVADO** — os cinco valores cadastrados corresponderam aos esperados. | Verificação de registros; não valida apresentação do cartão ou conteúdo editorial. |
| T002 | Registros de imagens, alt text não vazio e objetos Storage | **APROVADO** — cinco produtos, cinco imagens e cinco arquivos encontrados no bucket `catalog`. | Não valida carregamento no navegador, enquadramento, qualidade visual nem semântica do alt para leitores de tela. |
| T003 | Estado e elegibilidade pública | **APROVADO** — cinco produtos `draft`, estoque zero e ausentes de `public_catalog_products`. | Coerente com a elegibilidade descrita; não equivale a testar a vitrine. Nenhum produto foi publicado nem teve estoque alterado. |
| T004 | Configuração RLS e políticas em `catalog_products`, `catalog_product_images` e `catalog_product_translations` | **APROVADO — somente configuração**: RLS habilitado nas três tabelas e políticas `SELECT` para `anon` e `authenticated`. | `FORCE ROW LEVEL SECURITY` desabilitado nas três. Não houve teste de acesso em execução com identidades/papéis; não comprova autorização efetiva. |
| T005 | Metadados das imagens | **APROVADO** — cinco caminhos preenchidos, MIME `image/webp` na tabela e correspondente no Storage, dimensões positivas. | A evidência é estrutural; não substitui inspeção visual. |
| T006 | Integridade estrutural de `alt_text` | **APROVADO — somente estrutura**: cinco valores não vazios, sem espaços excedentes. Tamanhos declarados: Arranjo Encanto Floral 38; Buquê Elegância de Lírios 50; Buquê Primavera 60; Buquê Rosas Coloridas 63; Buquê Sol Radiante 56. | Não comprova descrição semanticamente adequada nem experiência com leitor de tela. O conteúdo integral dos textos não foi incluído no material fornecido. |
| T007 | Categorias e referências | **APROVADO** — Arranjo Encanto Floral em `Arranjos`; os outros quatro em `Buquês`, categorias existentes. | Verificação relacional declarada, sem resultado bruto anexado. |
| T008 | Valores de status e estoque | **APROVADO** — todos `draft`, estado permitido, estoque zero/não negativo. | Não comprova fluxos de publicação ou ajuste de estoque em execução. |
| T009 | Traduções dos cinco produtos | **SEM TRADUÇÕES CADASTRADAS**: 0 traduções, 0 locales e 0 traduções na versão atual. | **Não aprovado como tradução.** Fallback da interface não foi testado; conteúdo traduzido não deve ser inventado. |
| T010 | Integridade estrutural/editorial | **INTEGRIDADE ESTRUTURAL APROVADA, COM RESSALVAS**: cinco `content_version = 1`; nome, slug, tipo, preço e estoque passaram na validação estrutural. | Em todos: descrição vazia; cores e materiais com zero elementos. Instruções de cuidado, significado das flores, toxicidade para animais e durabilidade foram declarados preenchidos. Isso não representa completude editorial. |
| T011 | Consistência entre produtos, imagens e objetos | **APROVADO no escopo consultado**: 5 produtos, 5 imagens; 0 produtos sem imagem; 0 imagens sem arquivo; 0 caminhos duplicados; 0 objetos órfãos encontrados na consulta. | A busca de órfãos limitou-se ao padrão de caminho dos cinco produtos; não é auditoria global do bucket. |

### Contagem itemizada

Conforme os resultados individuais do material fornecido: 7 casos com aprovação sem ressalva estrutural/de configuração explicitada (T001, T002, T003, T005, T007, T008 e T011); T004 e T006 aprovados apenas no escopo limitado acima; T010 aprovado estruturalmente com ressalvas editoriais; T009 sem traduções cadastradas e sem aprovação de tradução. A frase agregada do anexo que informa “9 testes com resultado aprovado sem ressalva” não é consistente com a própria lista detalhada; esta contagem usa os resultados itemizados e não reproduz o total agregado contraditório.

### Avaliação das ressalvas no escopo adaptado

| Caso | Classificação para o GATE-006 adaptado | Limite que permanece registrado |
|---|---|---|
| T004 | Atende ao critério adaptado de configuração: RLS habilitado e policies `SELECT` presentes. A ausência de teste de autorização em execução não bloqueia este critério configuracional. | `FORCE ROW LEVEL SECURITY` está desabilitado; autorização efetiva por identidade/papel não foi validada. |
| T006 | Atende ao critério adaptado de integridade estrutural dos cinco `alt_text`. | Adequação semântica e experiência com leitor de tela não foram avaliadas. |
| T009 | Não há traduções para estes cinco produtos. Isso é uma condição conhecida, não uma falha de banco: RF-019/RN-018 definem a exibição de tradução como dependente de conteúdo persistido disponível. A responsável autorizou este escopo adaptado e não exige inventar conteúdo para passar o gate. | Não se aprova a qualidade de traduções nem o comportamento visual/de fallback; ambos não foram testados neste escopo. |
| T010 | Atende à validação estrutural declarada (`content_version = 1` e campos estruturais válidos). Descrição, cores e materiais vazios são ressalvas editoriais, não falhas da validação estrutural adaptada nem requisito de bloqueio explícito para estes produtos sintéticos em rascunho. | A completude editorial desses campos não foi aprovada; os valores continuam vazios. |
| T011 | Atende no universo delimitado da consulta aos cinco produtos e caminhos associados. | Não é auditoria global do bucket Storage. |

Essas classificações delimitam somente a decisão do GATE-006 adaptado; não alteram os requisitos gerais de catálogo, não declaram comportamento de interface aprovado e não substituem trabalho editorial futuro.

## Relação com o roteiro original

O roteiro original preserva T001–T011 para inspeções de interface e experiência: direção visual, fotos, navegação, teclado/foco, contraste, alt text com leitor de tela, responsividade, estados de erro/vazio, locales, movimento reduzido e apresentação sem imagem. As consultas no SQL Editor não exercitam esses comportamentos. Por decisão da responsável, esses procedimentos originais deixam de ser a base de aceite do GATE-006 nesta execução adaptada; permanecem como verificações de interface não executadas e não aprovadas:

- Os onze resultados acima são **verificações adaptadas de banco declaradas pela responsável**, não execução pelo Codex nem aprovação dos onze procedimentos originais de interface.
- Os campos de resultado/evidência/status dos procedimentos originais permanecem não executados; não são necessários para a decisão deste gate por força da adaptação autorizada, mas também não são considerados aprovados.
- T004 e T006 mantêm explicitamente seu escopo limitado; T009 segue sem tradução e sem teste de fallback; T010 mantém as ressalvas editoriais.
- Nenhum critério visual, de navegador, acessibilidade operacional ou responsividade é aprovado por este relatório.

## Decisão formal do GATE-006 — 2026-11-13

A responsável autorizou expressamente a adaptação dos casos T001–T011 para verificações que podem ser realizadas exclusivamente no Supabase Studio, determinou que os resultados apresentados sejam aceitos como evidência declarada e instruiu aprovar o gate se todos os critérios obrigatórios desse escopo estiverem satisfeitos. A avaliação individual acima considera os onze resultados, incluindo as limitações de T004/T006, a ausência de traduções em T009 e as ressalvas editoriais de T010. Nenhuma dessas ressalvas reprova um critério obrigatório do escopo adaptado: T009 não exige inventar traduções quando não há conteúdo persistido disponível; T010 confirma integridade estrutural e mantém vazios editoriais explicitamente; T004/T006 aprovam somente os aspectos estruturais/configuracionais definidos para a adaptação.

**GATE-006: APROVADO — ESCOPO ADAPTADO PARA VALIDAÇÃO EXCLUSIVA NO SUPABASE STUDIO.** **Etapa 006: CONCLUÍDA/APROVADA no escopo adaptado.** A decisão não afirma que os testes originais de interface, acessibilidade visual, leitor de tela, responsividade, idiomas/fallback ou estados de UI foram executados ou aprovados. No momento deste registro, GATE-007 ainda não havia sido concluído; seu fechamento posterior em 2026-11-13 e o status DONE da TASK-012 estão registrados em `docs/reports/TASK-012-etapa-007-conclusao.md`.

Nenhum teste foi repetido nesta atualização. Nenhuma consulta SQL foi executada, nenhum dado foi alterado e nenhum código, migration, configuração ou produto foi modificado.
