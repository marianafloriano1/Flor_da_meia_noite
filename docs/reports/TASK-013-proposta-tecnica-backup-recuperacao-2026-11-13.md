# TASK-013 — Proposta técnica candidata de backup e recuperação

**Data:** 2026-11-13
**Branch de referência:** task/TASK-013-seguranca-recuperacao
**HEAD de referência:** 68ba912
**Base documental:** TASKS.md; README.md/RNF-003; ADR-001; ADR-007; docs/reports/TASK-013-reavaliacao-dor-2026-11-13.md; docs/reports/TASK-013-analise-tecnica-opcoes-gate-002-2026-11-13.md.
**Natureza:** proposta técnica comparativa, não decisão de arquitetura aprovada. Não implementa nem provisiona recursos.

## 1. Conclusão sobre o RTO oficial

**RTO máximo de 24 horas é critério oficial da TASK-013, não um valor ainda sem decisão.** O backlog define no objetivo recuperação em RTO ≤24h e repete no aceite “RTO avaliado ≤24h”; o README registra RNF-003 como máximo de 24h. A aprovação desse limite não prova que uma arquitetura o atende: falta um exercício de restauração com tempo medido. O método de cronometragem e a confirmação do resultado permanecem parte do plano de validação.

O mesmo backlog exige backup automático e independente, exercício documentado, RPO medido e aprovado, dashboards/alertas, rollback, budget alerts e isolamento entre teste e produção. As metas previamente aprovadas (SLO mensal 99,5%, RPO até 24h, backup diário/retenção de referência 30d) são preservadas. R$ 100/mês continua apenas hipótese e não autoriza gasto.

## 2. Escopo a recuperar

A recuperação deve reconstituir um **conjunto operacional compatível**, não apenas um arquivo de banco.

| Domínio | Conteúdo a incluir no plano de recuperação | Fonte de recuperação proposta | Observação/limite |
|---|---|---|---|
| PostgreSQL da aplicação | Catálogo/categorias/traduções/metadados de imagem; perfis; carrinhos, favoritos e reservas; ledger de estoque; cotações/pedidos/itens/eventos/inspeções; cupons/resgates/eventos de carrinho; auditoria de exportações; demais tabelas e funções das migrations vigentes. | Backup Supabase + dump lógico cifrado independente, com migration/schema version registrado. | Inventário deve reconciliar todas as migrations aplicadas; não assumir que dump inclui objetos externos. Ledger e eventos imutáveis devem preservar histórico. |
| Supabase Auth | Contas/identidades e estado necessário para login/recuperação, configurações de Auth e métodos/fatores MFA relevantes. | Backup/recuperação suportado pelo Supabase e inventário versionado de configuração. | Confirmar formalmente quais dados de Auth, fatores, chaves e segredos são incluídos/restauráveis pelo mecanismo escolhido; não copiar senhas/OTP/secrets em relatórios. Planejar reset seguro de credenciais quando exigido pelo fornecedor. |
| Supabase Storage | Bytes dos objetos de catálogo/anexos; bucket, chave, MIME, metadados, políticas, referências DB. | Cópia independente de objetos + manifesto e checksums; reconstituir configurações de bucket/policies por IaC/registro controlado. | Backup do banco preserva metadados, não bytes. Não versionar o bucket de origem via API S3 do Supabase; impedir exclusão/overwrite antes da cópia externa validada. |
| Definição do banco | Schema, migrations, extensões, índices, constraints, funções, triggers, policies/RLS, grants e configuração necessária para ativar a versão restaurada. | Repositório e migration history mais dump/backup. | Credenciais e valores secretos não devem estar no repositório nem no dump documental. Validar dependências de extensões e versões do Postgres. |
| Aplicação e runtime OCI | Código no commit, lockfile, Dockerfile, imagem publicada/digest, configuração de serviço, jobs/workers, health checks, limites, ingress/rotas e rollback. | Git + registry de imagens + IaC/export de configuração do runtime. | Registro de imagem deve sobreviver ao ambiente primário ou ser reconstruível do commit; não guardar valores de secrets em arquivo exportado. |
| Configuração operacional | Região, políticas de backup, retenção, regras de bucket, IAM, alertas/dashboards/SLO, drains/sinks de logs, schedules, domínios/DNS e runbooks. | IaC e export seguro de configuração; inventário versionado sem segredos. | A configuração real ainda não foi provisionada; manter declarativo e versionado. A restauração depende de credenciais administrativas independentes. |
| Secrets e chaves | Referências/identificadores e procedimento de recuperação de credenciais, chaves de cifragem e acesso de emergência. | Secret Manager/KMS ou equivalente, com recuperação administrativa segregada. | Não colocar plaintext na cópia de backup. Se a chave for perdida, backup cifrado pode tornar-se irrecuperável. Precisa de procedimento de break-glass testado. |
| Logs e provas | Logs operacionais necessários para 30 dias, trilha de acesso/auditoria e evidências de backup/restore/incidentes. | Retenção nativa para o que couber ou exportação a destino separado. | Diferenciar diagnóstico, acesso/auditoria e registros legalmente retidos; minimização de PII e regras de descarte separadas. |
| Itens deliberadamente fora do backup operacional | Cache, temporários regeneráveis, arquivos de build reproduzíveis e dados de teste descartáveis. | Reconstruir. | Confirmar que não há conteúdo único nesses caminhos antes de excluí-los do escopo. |

O inventário final precisa partir do conjunto completo de migrations na release aprovada, schema e configuração efetivamente usados; a tabela é o escopo mínimo visível na base consultada, não declaração de que todas as classes de Auth/configuração já foram examinadas ou que um backup exista.

## 3. Arquitetura candidata

### Camada 1 — Supabase gerenciado

Manter o backup diário gerenciado como primeira camada operacional e mecanismo de restore mais rápido. Isso depende do plano e da retenção disponível. A documentação consultada informa 7 dias Pro, 14 dias Team e até 30 dias Enterprise; o backup do banco não inclui bytes de Storage. PITR é alternativa de recuperação granular, mas a documentação diz que ativá-lo interrompe backups diários, e retenção/preço devem ser confirmados. Não ativar ambos presumindo coexistência.

### Camada 2 — Dump lógico independente

Gerar um dump lógico consistente do banco em janela definida; cifrar antes ou durante a transferência; armazenar em conta/destino separado do projeto Supabase. Registrar commit/schema version, versão da ferramenta, horário UTC, tamanho, checksum, status e identificador não secreto da chave KMS. Aplicar retenção de referência de 30 dias por conjunto e alerta de execução atrasada/falha. O dump não deve conter senhas recuperáveis nem ser publicado em logs.

### Camada 3 — Cópia independente dos objetos

Enumerar objetos e metadados de Storage, copiar bytes para destino externo em prefixo de backup imutável por execução, gerar manifesto com bucket/chave, tamanho, MIME, metadados necessários e SHA-256. Validar leitura/checksum no destino antes de marcar o conjunto completo. Uma regra de lifecycle deve conservar 30 dias de referência; não propagar deletes da origem ao destino. A credencial de cópia deve ser apenas de servidor e de escopo mínimo possível: documentação Supabase informa que S3 access keys têm acesso completo e podem contornar RLS, portanto chave ampla exige isolamento, cofre e rotação.

### Manifesto de conjunto

Um único backup set recebe um backup_set_id e inclui:
- horário de corte UTC e estado de sucesso;
- referência ao backup Supabase e ao dump lógico;
- commit/schema version e versões de ferramenta;
- inventário de objetos e hashes;
- versões/IDs de configurações necessárias, sem valores secretos;
- resultado de validação, contagens e alertas;
- chave KMS por identificador, nunca material da chave.

Estados sugeridos no desenho: started, database_ready, objects_copying, verified, failed, expired. Um conjunto só pode ser restaurado como completo após todas as partes e verificações estarem presentes. Os nomes são proposta, não contrato implementado.

## 4. Consistência entre banco e Storage

Banco e Storage não participam de uma transação distribuída única; logo, cópias concorrentes sem coordenação podem produzir backup inconsistente. Metadados do objeto na tabela não provam que os bytes foram copiados.

**Opção de consistência mais simples para primeiro restore:** janela curta de congelamento de escritas de produto/Storage (não de leitura), registrar corte T, obter snapshot/dump DB e listar/copiar os objetos referenciados nesse estado, confirmar hashes/manifesto e só então encerrar a janela. O impacto em disponibilidade e o modo seguro de impedir writes precisam de decisão operacional e implementação futura.

**Alternativa sem congelamento, mais complexa:** usar nomes de objetos imutáveis/versionados na aplicação, atrasar exclusões/limpeza por mais que a janela de backup, copiar objetos primeiro para prefixo imutável e, depois, produzir snapshot consistente da base que referencia esse conjunto; repetir inventário/diff para capturar mudanças e só declarar verificado quando a reconciliação fechar. A origem Supabase não oferece versionamento pela interface S3, então sobrescrita/exclusão concorrente exige janela, tombstone/retention na aplicação ou cópia prévia confiável. Esta opção não é automaticamente consistente e requer prova em ensaio.

**Regras em qualquer opção:**
1. Não espelhar exclusões da origem ao destino de backup.
2. Chaves de destino por backup_set_id, evitando overwrite.
3. Conferir cada objeto do manifesto por tamanho e SHA-256.
4. Depois do restore DB, conferir que cada referência necessária existe no conjunto; objetos sem referência podem ser conservados até expirar a retenção, sem descarte automático durante reconciliação.
5. Se DB e Storage tiverem cortes incompatíveis, marcar o conjunto inconsistente e não usá-lo para declarar RPO.
6. Manter histórico de marcadores sintéticos: uma alteração DB e objeto confirmada antes do corte; medir ambos no restore.

A responsável ainda deve escolher se a operação aceita breve pausa de escrita ou prefere projetar a alternativa de objetos imutáveis/diff. Não pressupor essa escolha.

## 5. Independência e custo parametrizado

### Níveis de falha

| Nível | Isolamento | Proteção principal | Risco residual |
|---|---|---|---|
| Outro projeto Supabase na mesma organização | Separação lógica parcial. | Erro localizado no projeto e restore para projeto distinto. | Mesmo fornecedor, organização, billing e controles administrativos; exclusão da organização/outage ampla pode afetar ambos. |
| Outra conta/organização | Separação administrativa e de credenciais maior. | Reduz erro, comprometimento de uma conta e exclusão administrativa comum. | Mesmo fornecedor/região pode manter risco de indisponibilidade, conta corporativa, suporte e jurisdição comuns. |
| Outro provedor e conta | Maior independência de fornecedor/plano de controle. | Falha ou suspensão de um fornecedor não elimina automaticamente cópia do outro. | Mais egress, integrações, IAM, operação, transferência/localização de dados e complexidade de restore. |

### Fórmulas, sem inventar volume

Defina:
- D = GiB do dump lógico já comprimido por conjunto;
- O = GiB de bytes de objetos por conjunto;
- N_A/N_B = operações Standard de classes A/B por mês;
- E = GiB transferidos para fora do Supabase no mês;
- V = GiB médio efetivamente armazenado no destino durante o ciclo;
- H = horas de operação/manutenção;
- R = tarifa interna por hora, ainda não fornecida.

| Componente | Estimativa parametrizada | Referência pública/limitação |
|---|---|---|
| Plano/backups Supabase | Plano + recurso backup/PITR elegível + compute/armazenamento/uso. | Pro US$25/mês e Team US$599/mês como preço inicial; Enterprise sob consulta. PITR: valores da seção 2. Não calcular total sem plano e quote. |
| Armazenamento externo 30d | Cópias full diárias conservadas por 30 dias: no regime estável, aproximadamente V ≈ 30 × (D + O), sem contar versões adicionais. Custo mensal ≈ V × tarifa regional por GiB-mês. Se houver dedupe/incremental, V depende de churn real e desenho, não assumido. | Cloud Storage Standard inicia em US$0,02/GiB-mês; logo, apenas como unidade normalizada, 1 GiB de conjunto full retido em 30 gerações representa cerca de 30 GiB armazenados e US$0,60/mês na tarifa inicial. Não é estimativa do projeto e exclui itens abaixo. Preço de São Paulo precisa ser recalculado. |
| Operações destino | Custo ≈ (N_A/1000 × preço A) + (N_B/1000 × preço B), mais listagens/restore e eventuais classes. | Página oficial mostra Standard flat namespace regional como referência: US$0,005/1000 Class A e US$0,0004/1000 Class B. N depende de quantidade/tamanho de objetos e paginação; região/SKU deve ser confirmada. |
| Transferência de saída Supabase | E acima da franquia × tarifa aplicável. A cópia inicial e cada full transfer contam conforme metering real. | Pro/Team publicam 250 GB de egress incluídos e US$0,09/GB acima, com quota compartilhada; Enterprise custom. Confirmar se o caminho escolhido e volume estão na quota. |
| Transferência de restore do GCP | Volume restaurado × tarifa de rota/SKU. | General transfer out da tabela Cloud Storage inicia em US$0,08/GiB; transfer para serviços GCP na mesma região pode não cobrar data transfer, mas restaurar para Supabase não é essa condição. Cotar a rota exata. |
| Compute/execução | Segundos vCPU e GiB × preços Cloud Run regionais, mais scheduler, logs, KMS e artefatos necessários. | Cloud Run pay-per-use, depende de região, arquitetura e duração; sem carga não calcular. [Calculadora/preços Cloud Run](https://cloud.google.com/run/pricing). |
| Manutenção | H × R, separando implementação inicial, operação mensal e exercício de restore. | R e H não fornecidos; não há custo interno estimável nesta pesquisa. |
| Retenção de versões/soft delete | Bytes não correntes/retidos × armazenamento e operações; versioning duplica espaço quando conteúdo muda, mas não necessariamente todos os dias. | Destino GCS suporta versionamento/soft delete; custo depende de bytes e regra lifecycle. |

As tarifas Google são preços “a partir de” e podem variar por região, classe e localização. Não há volume, taxa de mudança, quantidade de objetos, retenção efetiva, franquias organizacionais ou cotação da conta; portanto não apresento total mensal.

## 6. Segurança e controles de acesso

- Backups contêm dados pessoais, pedidos, transações, perfis e possivelmente material operacional sensível. Aplicar classificação/minimização e acesso just-in-time.
- Criptografia em trânsito e repouso; gestão de chave separada do destino dos dados. Documentar recuperação e rotação da chave. Perda da chave torna cópias cifradas inutilizáveis; chave acessível ao mesmo administrador/conta reduz independência.
- Contas de serviço distintas: export DB, cópia Storage, leitura/restore. Preferir grants read-only; credenciais S3 do Supabase documentadas como full access/RLS bypass não devem ser usadas no cliente/browser. Guardar no Secret Manager, restringir IAM, rotacionar e auditar.
- Destino em conta/organização separada; impedir exclusão por identidade usada pelo job (retenção/soft delete/lock conforme decisão); MFA e controle administrativo independente. Manter trilha de operações.
- Dumps e manifestos não devem conter tokens, senhas, OTP, chaves, URLs assinadas nem CPF integral. Proteger também logs do job.
- Definir retenção/expiração e exceções legais antes de habilitar lifecycle. Restaurar cópia não deve expor bucket/arquivo nem reabrir acesso público.
- Avaliar residência/transferência internacional do dump, objetos, logs, chaves, suporte e acesso administrativo, não apenas região do banco.

## 7. Plano proposto para validar restore, RPO e RTO

1. Aprovar arquitetura, objetivos de proteção, custo e ambiente de teste; preparar somente dados sintéticos.
2. Produzir conjunto DB+Storage identificado e aguardar status verified; manter uma alteração sintética conhecida antes do corte.
3. Isolar destino de restore para que não tenha conexão/credencial de produção; registrar incidente simulado e T0.
4. Restaurar DB e arquivos juntos; reconstruir configuração da app a partir do commit/imagem aprovada e referências de secrets, sem valores de produção.
5. Validar migrations/schema version, consistência e contagens de entidades essenciais; validar todos os objetos referenciados por existência/hash/MIME; validar RLS e papéis em chamadas de teste; executar fluxo sintético mínimo sem e-mail/SMS real nem cobrança.
6. Medir RPO DB e Storage separadamente contra o último marcador confirmado na origem; resultado combinado = pior atraso/qualquer ausência.
7. Medir RTO de T0 até aplicação acessível e validada, com dependências e permissões restauradas. Critério oficial: ≤24h. Registrar duração e excluir apenas pausas aprovadas/documentadas, sem parar cronômetro por conveniência.
8. Arquivar evidência: backup_set_id, horários UTC, IDs de artefatos, hashes, versão da imagem/commit, checklist de validação, erros, RPO/RTO calculados e aceite responsável.
9. Frequência de exercícios recorrentes deve ser definida em planejamento operacional; não fixada aqui.

O exercício é obrigatório para comprovar o critério de aceite. Nenhum restore foi realizado nesta pesquisa.

## 8. Recomendação comparativa e decisões da responsável

**Candidata mais equilibrada para aprofundar no planejamento, não aprovada:** usar backup gerenciado Supabase como camada rápida, mais dump lógico cifrado em conta independente, mais cópia de bytes Storage com manifesto/checksums, retenção de referência 30 dias e restore integrado em projeto isolado. Isso combina recuperação gerenciada com cópia fora do projeto e cobre os bytes que o backup do banco não cobre. A viabilidade depende de custo/retention confirmados, consistência operacional, acesso seguro e exercício de restore; não declarar “independente” até escolher o nível (mesma organização, outra conta ou outro provedor).

**Decisões/validações abertas:**
1. Significado de independência aceitável e eventual fornecedor/destino.
2. Conta/região do bucket, classe, versão/soft delete, cópias full versus incremental e política para exclusão.
3. Método de consistência: janela curta de freeze versus desenho imutável/diff.
4. Plano Supabase e backup/PITR, após cotação e análise do requisito 30 dias.
5. Volume D/O, número de objetos, mudança diária, taxa de execução e estimativa concreta.
6. Orçamento real, billing, teto/alertas; R$100 segue hipótese sem autorização.
7. Dados de entidade/regime fiscal/jurisdição para parecer jurídico-contábil sobre retenção e destino internacional.
8. Ambiente gerenciado isolado e permissão para billing/teste sintético.
9. Confirmar com responsável os limites dos secrets/Auth a restaurar.
10. SLI/janela SLO e pontos de T0/T1 do RTO; o teto de 24h já é requisito oficial, a prova está pendente.

## 9. Estado do gate e escopo

- GATE-001 continua APROVADO, preservado.
- GATE-002 continua BLOQUEADO/não aprovado. Este documento é proposta comparativa, não aprovação nem mudança do DoR.
- Etapa 002 não iniciada.
- Nenhum recurso contratado, habilitado ou provisionado; sem testes, migrations, dados ou alterações de outros worktrees.
- Este texto deve ser registrado como relatório novo da TASK-013; não altera relatório anterior, TASKS.md, decisões ou status.

## Fontes oficiais consultadas

- [Backups Supabase](https://supabase.com/docs/guides/platform/backups) — camadas, retenção e exclusão de objetos Storage.
- [Preços Supabase](https://supabase.com/pricing) e [egress](https://supabase.com/docs/guides/platform/manage-your-usage/egress).
- [Supabase Storage S3 compatibility](https://supabase.com/docs/guides/storage/s3/compatibility) e [autenticação S3](https://supabase.com/docs/guides/storage/s3/authentication).
- [Preços Cloud Storage](https://cloud.google.com/storage/pricing), [Object Versioning](https://docs.cloud.google.com/storage/docs/object-versioning), [lifecycle](https://docs.cloud.google.com/storage/docs/lifecycle).
- [Preços Cloud Run](https://cloud.google.com/run/pricing), [regiões](https://docs.cloud.google.com/run/docs/locations).
- Backlog oficial TASKS.md, linha TASK-013, e [RNF-003 no README](../../README.md).
