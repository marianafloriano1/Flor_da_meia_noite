# TASK-013 — Etapa 005: Revisão

**Data:** 2026-11-14
**Branch:** `task/TASK-013-seguranca-recuperacao`
**Estado vigente:** GATE-005 **APROVADO POR ACEITE FORMAL DO ESCOPO REVISADO**. As ressalvas operacionais permanecem registradas como riscos aceitos e pré-requisitos de produção.

## Escopo revisado

Revisados os scripts `scripts/task013/`, testes, scripts de pacote, runbook e especificação de SLI. A revisão focou isolamento local, cifragem, checksums, paths de objetos, credenciais, comportamento de falha, restore e aderência ao escopo aprovado da TASK-013.

## Achados

1. **Bloqueador — restore não comprovado após correção:** a causa foi confirmada em log do banco descartável: `must be owner of event trigger pgrst_drop_watch`; catálogo confirmou owner `supabase_admin` e `postgres.rolsuper=false`. O restore foi corrigido para executar `pg_restore` como `supabase_admin` apenas depois das guardas de projeto/container local isolado. A captura de stderr foi removida para não expor conteúdo de dados. A execução pós-correção foi recusada pelo auto-review por limite de uso; a correção ainda não tem prova integrada.
2. **Bloqueador — critérios operacionais ausentes:** os scripts executam manualmente em host local; não existe job agendado, destino off-host independente, política efetiva de retenção/expiração, exportador persistente de logs de 30 dias, monitor/dashboards/alertas nem budget alerts validados. O probe é uma amostra local JSONL, não um SLI mensal medido.
3. **Bloqueador — resultados ainda não medidos:** RTO ≤24h e RPO ≤24h continuam metas oficiais sem evidência ponta a ponta; não foi medido rollback de runtime OCI nem demonstrada separação operacional teste/produção para um deploy aprovado.
4. **Bloqueador pendente de identificação:** o registro anterior de `npm ci` informou duas vulnerabilidades moderadas, mas não preservou pacote, advisory, versão afetada ou versão corrigida. A tentativa local de consultar o audit offline não retornou relatório utilizável. Não alterei dependências sem identificar os avisos; obter o relatório npm audit correspondente ao lockfile é necessário antes de afirmar correção.
5. **Melhoria aplicada na Etapa 004:** remoção de `package.json` do escopo do script Biome TASK-013 para evitar conflito de formatação preexistente do arquivo compartilhado; sintaxe JSON validada separadamente com Node. Seis diagnósticos `useTemplate` são apenas informações do Biome, sem falhas.

## Validações desta revisão

- Inspeção estática dos scripts e runbook: executada.
- `node --check` nos cinco módulos: PASS.
- `node tests/task013/backup.test.mjs`: 12/12 PASS, 0 falhas, 0 skips.
- Biome em `scripts/task013` e `tests/task013`: sem erros; 6 informações de estilo.
- Parse de `package.json`: PASS.
- Busca estática de padrões de chaves privadas/JWT/`sb_secret_` nos scripts e testes e de arquivos `.env`/chave no status: limpa; nenhum candidato encontrado.
- Restore integrado antes da correção: FAIL; log comprova falha por ownership do event trigger. Restore pós-correção: NOT RUN/BLOCKED pela proteção de auto-review; não tratar como aprovado.
- `git diff --check`: PASS após as atualizações documentais.

## Controles de segurança observados

Os scripts verificam prefixos de projeto distintos para backup e restore, URL loopback/porta declarada, existência/estado/label do container Docker, local externo ao checkout para artefatos, role `service_role` apenas para chamadas à API local e ACK explícito antes de restore. Artefatos usam AES-256-GCM e SHA-256; objetos são descriptografados e verificados antes de `pg_restore`. O restore local exige `supabase_admin` para operar sobre objetos gerenciados, somente após a validação do alvo isolado. Segredos ficam em variáveis de ambiente e a saída de erro do `pg_restore` permanece suprimida para não vazar dados do backup. Essas proteções foram inspecionadas estaticamente e cobertas parcialmente por testes unitários; o restore integrado pós-correção segue sem validação.

## Decisão do gate

**Estado registrado em 2026-11-14 (histórico): GATE-005 BLOQUEADO.** Naquela revisão, o restore pós-correção não estava verificado e os advisories ainda não tinham sido recuperados. A decisão vigente consta nos adendos de 2026-11-15.

## Adendo de dependências — 2026-11-15

- `npm audit --json` executado no worktree sem opção de correção: **não produziu relatório de advisories**; exit 1 por `ENOTFOUND registry.npmjs.org` ao acessar `/-/npm/v1/security/advisories/bulk`. Não houve atualização de dependências nem alteração de `package-lock.json`.
- `npm ls --all --json`: exit 0; árvore instalada foi listada. O comando não identifica advisories por si só e não recupera os dois avisos moderados do `npm ci` anterior.
- `package-lock.json` registra versões/resoluções, mas não contém os IDs/faixas de advisories. A busca local por logs npm anteriores não encontrou o relatório original. Assim, pacote, versão afetada, caminho transitivo, advisory e versão corrigida permanecem **não recuperados**; não é possível comparar avisos específicos com fontes oficiais nem aplicar correção segura nesta rodada.
- Próximo passo para fechar a análise: executar `npm audit --json` quando o registry estiver acessível, salvar a saída fora do repositório e correlacionar cada advisory e faixa afetada com a versão instalada de `npm ls --all --json`. Não executar `npm audit fix`/`npm update` sem revisão de impacto e autorização.

**Estado antes das validações complementares de 2026-11-15:** GATE-005 estava **BLOQUEADO** enquanto os advisories não fossem identificados e os achados de revisão/infraestrutura permanecessem sem resolução. O estado atualizado consta no adendo abaixo.

## Adendo de revisão e dependências — 2026-11-15

- Recuperado audit do lockfile original de `HEAD` em cópia temporária, sem alterar o repositório: duas entradas moderadas — `exceljs@4.4.0` (entrada direta agregada, `via uuid`) e `uuid@8.3.2` transitivo (`<11.1.1`). Ambas apontavam para o advisory oficial [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq), CVE-2026-41907, faixa afetada `<11.1.1`, corrigida em `11.1.1`. Trata-se de dois nós vulneráveis no audit, não de dois advisories distintos. A recomendação npm de downgrade do ExcelJS para `3.4.0` era breaking e não foi aplicada.
- Aplicada correção mínima compatível: override restrito `exceljs -> uuid@11.1.1` em `package.json` e lockfile. A árvore atual confirma `exceljs@4.4.0` e `uuid@11.1.1 (overridden)`. O código instalado do ExcelJS usa `uuid.v4`; a API CommonJS permanece disponível em uuid 11 (a remoção ocorre a partir da versão 12). `npm audit --json`: **0 vulnerabilidades** em todos os níveis. Não foi executado `npm audit fix` nem `npm update`.
- Restore isolado pós-correção passou em `restored_and_verified` após correção de partições/ACLs e da verificação SHA; os detalhes e as contagens estão no relatório da Etapa 004. A falha antiga por `pgrst_drop_watch` permanece como histórico, mas foi resolvida pelo uso de `supabase_admin` no container validado.
- Validações atuais: `npm run test:task013` **13/13 PASS**, 0 falhas/0 skips; `npm run test:task011` **13/13 PASS**, 0 falhas/0 skips; `npm run lint:task013` PASS, com 6 avisos informativos; `npm run typecheck` PASS; `npm run build` PASS; `git diff --check` a executar após esta atualização documental. As execuções anteriores não foram repetidas sem necessidade além das suítes afetadas pela correção de restore/dependência.
- Revisão dos controles: o restore ainda restringe projeto `task013-restore-*`, URL/porta loopback, estado e label do container, diretório de artefato fora do checkout, chave local service_role e ACK literal; dump e objetos são autenticados e verificados por SHA-256; DB restaura em transação única. A desanexação preparatória de partições acontece apenas no banco descartável, antes da transação do restore; se houver falha posterior, o alvo deve ser considerado descartável/contaminado, nunca uma fonte a preservar. ACLs são preservadas para que a API Storage mantenha seus grants originais, sem restaurar ownership.

**Avaliação técnica anterior ao aceite formal (histórico): GATE-005 BLOQUEADO para aceite integral.** A vulnerabilidade dependencial foi corrigida e as validações de código/dependências passaram; as lacunas operacionais listadas continuam sem comprovação e não são convertidas em capacidade implementada. Por decisão formal da responsável, tais limitações foram aceitas para o escopo revisado, conforme o adendo seguinte. GATE-001, GATE-002 e GATE-003 permanecem APROVADOS; GATE-006 permanece PENDENTE e T001–T011 não foram executados.

## Adendo — decisão formal do GATE-005 (2026-11-15)

Por autorização expressa da responsável e em decorrência do escopo revisado da TASK-013, o GATE-005 está **APROVADO POR ACEITE FORMAL DO ESCOPO REVISADO**.

**Status vigente:** APROVADO. O aceite é limitado à revisão do escopo local/sintético e não representa certificação de segurança operacional nem evidência de infraestrutura ou operação em produção.

A revisão considera:
- restore isolado pós-correção comprovado como `restored_and_verified`;
- advisory GHSA-w5hq-g745-h8pq corrigido por override compatível para `uuid@11.1.1`;
- `npm audit` atual com zero vulnerabilidades;
- `npm run test:task013`: 13/13 PASS;
- `npm run test:task011`: 13/13 PASS;
- lint direcionado, typecheck, build e validações documentais aprovados.

As lacunas operacionais identificadas na revisão permanecem registradas como riscos aceitos e pré-requisitos para produção. Esta aprovação não declara scheduler, destino independente, retenção operacional, dashboards, alertas, budget alerts, rollback OCI ou medições reais de SLO/RPO/RTO como implementados.

O GATE-005 fica aprovado para o escopo revisado, sem autorização automática para deploy, gastos ou início da Etapa 007. GATE-006 permanece pendente.
