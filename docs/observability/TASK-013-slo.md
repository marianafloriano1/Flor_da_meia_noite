# TASK-013 — SLI, SLO e observabilidade

## Metas aprovadas e medidas distintas

- Disponibilidade: alvo ≥99,5% em janela móvel de 30 dias; orçamento de erro matemático de 216 minutos nessa janela (3 h 36 min).
- Integridade de backup: alvo ≥99% dos jobs agendados concluídos com checksums verificados em 30 dias. Um job ausente, incompleto ou com hash inválido conta como falha.
- Recuperação: RPO ≤24 h e RTO ≤24 h são metas; RPO é medido pelo marcador sintético mais recente confirmado versus o marcador recuperado, e RTO pelo tempo ponta a ponta de restauração e health-check.

## Fórmulas implementadas

- Disponibilidade: (amostras totais - timeouts - respostas 5xx) / amostras totais. Respostas HTTP válidas 4xx não são indisponibilidade por si só. Cada amostra contém somente alias, instante, código, timeout e duração; nunca corpo, cookie, token, consulta ou dado do cliente.
- Backup: jobs completos com checksum confirmado / jobs esperados. A lista de entrada precisa incluir cada job esperado, inclusive ausências.
- Orçamento: duração da janela × (1 - SLO).
- RPO/RTO: funções em scripts/task013/sli.mjs; são cálculos de resultados fornecidos, não observação contínua.

## Coleta de probes

npm run probe:task013 executa probes GET sem ler corpo e emite JSONL sanitizado. TASK013_PROBE_TARGETS recebe uma lista de aliases e URLs sem credenciais, query ou path. HTTP é permitido somente para loopback; destinos HTTPS externos exigem TASK013_EXTERNAL_PROBES_ENABLED=YES. Não foi executada chamada a endpoint externo nesta etapa. Falha do processo ocorre em timeout ou HTTP 5xx.

## Estado da instrumentação

O código de cálculo/probe e testes unitários direcionados pertencem à Etapa 004. Ainda não há backend de métricas, agendador, dashboard, canal de alerta, retenção de logs de 30 dias nem janela observada de 30 dias provisionados. Isso depende da escolha/validação do ambiente gerenciado e de credenciais/provisionamento aprovados. Não alegar SLO alcançado a partir dos testes unitários.

## Dados mínimos para operação posterior

Reter timestamps, aliases, status/duração dos probes e estado/hash de cada job; nunca registrar URLs completas quando possam conter identificadores ou parâmetros, chaves, PII, contratos ou conteúdo de backup. Aplicar expiração de 30 dias no serviço de logs escolhido. Dados transacionais/fiscais seguem revisão jurídico-contábil por categoria; nenhum purge automático está habilitado.
