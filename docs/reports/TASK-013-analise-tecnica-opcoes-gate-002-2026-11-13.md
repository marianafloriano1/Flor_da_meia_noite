Continue exclusivamente no worktree da TASK-013.

Prepare uma proposta técnica detalhada para a estratégia de backup e recuperação da Flor da Meia Noite, usando a pesquisa comparativa já criada.

Considere como candidata, sem torná-la decisão definitiva:
- Backups gerenciados Supabase como primeira camada.
- Dump lógico criptografado do banco para destino independente.
- Cópia dos objetos Supabase Storage para armazenamento externo.
- Retenção de referência de 30 dias.
- Manifestos, checksums e proteção contra exclusão acidental.
- Restauração conjunta de banco e arquivos em ambiente isolado.

Antes de recomendar uma arquitetura:
1. Identifique o escopo completo dos dados e configurações que precisam ser recuperados.
2. Explique como manter a consistência entre banco e Storage.
3. Compare níveis de independência: outro projeto, outra conta e outro provedor.
4. Apresente custos estimados por volume, separando armazenamento, operações, transferência e manutenção.
5. Identifique os riscos de segurança e acesso às cópias.
6. Proponha como testar restore, RPO e RTO.
7. Verifique no backlog se RTO de 24 horas é um critério oficial aprovado ou uma meta ainda não decidida.

Não invente volumes, custos totais ou aprovações.

Restrições:
- Não implemente nada.
- Não crie buckets, projetos ou contas.
- Não habilite billing nem contrate serviços.
- Não execute migrations, testes ou operações de dados.
- Não altere as decisões já aprovadas.
- Não altere outros worktrees.
- Não faça commit, push ou merge.
- GATE-001 permanece aprovado; GATE-002 permanece bloqueado.
- Não inicie a Etapa 002.

Entregue uma recomendação comparativa, deixando explícitas as decisões que dependem da responsável.