# TASK-015 — Suporte e lançamento controlado

**Estado:** proposta documental para revisão da responsável. Não autoriza deploy, publicação, cobrança ou uso de dados reais.

## 1. Papéis e acionamento

| Papel | Responsabilidade | Designação atual |
|---|---|---|
| Responsável pelo incidente | Classificar impacto, decidir no-go/rollback e aprovar comunicação externa | A designar antes de qualquer lançamento |
| Operação da aplicação | Consultar saúde, erros, logs e métricas; executar procedimentos autorizados | A designar antes de qualquer lançamento |
| Responsável pelo banco/backup | Confirmar integridade e executar recuperação isolada conforme runbook TASK-013 | A designar antes de qualquer lançamento |
| Atendimento | Receber relatos, registrar horário e referência não sensível, encaminhar para operação | A designar antes de qualquer lançamento |

Nomes, contatos, canal de plantão e tempos de resposta não foram fornecidos e não são inventados neste runbook. Defini-los é pré-condição operacional de lançamento.

## 2. Triagem

1. Registrar início em UTC, sintoma, escopo afetado e referência técnica sanitizada. Não copiar tokens, OTP, dados de pagamento ou PII para logs/tickets.
2. Classificar como incidente de disponibilidade, integridade de pedido/estoque/preço, autenticação/autorização, notificações, exportação/privacidade ou recuperação.
3. Verificar os health checks e métricas configurados para o ambiente efetivo. O estado e os endereços de produção não foram fornecidos neste registro.
4. Para pedido, estoque, preço, autorização ou privacidade potencialmente incorretos, suspender a jornada afetada e escalar ao responsável pelo incidente; não corrigir registros manualmente sem procedimento aprovado.
5. Preservar logs e evidências conforme política aplicável, minimizando dados pessoais. Não apagar/recriar banco, Storage, containers ou volumes como ação de triagem.

## 3. Escalonamento e comunicação

- Operação comunica ao responsável pelo incidente os sinais observados, período e escopo, sem dados secretos.
- O responsável decide severidade, suspensão da funcionalidade, rollback e comunicação a clientes/autoridades conforme procedimento da organização.
- O canal, contatos, severidades formais, SLAs e modelos de comunicação continuam pendentes de designação/aprovação; nenhum prazo é presumido.
- Incidente com possível exposição de dados deve ser encaminhado ao responsável de privacidade/jurídico designado pela organização antes de comunicação externa.

## 4. Critérios de no-go e rollback

Não iniciar ou interromper o lançamento controlado se ocorrer qualquer uma destas condições:

- gate obrigatório sem status aprovado/aceito conforme registro oficial;
- falha de autenticação, autorização, isolamento entre clientes ou proteção de dados;
- discrepância de preço, estoque, pedido ou duplicidade;
- perda de integridade do banco/Storage ou ausência de recuperação operacional utilizável;
- erro/latência acima dos limites aplicáveis sem exceção formal vigente;
- envio externo, cobrança, publicação ou recurso pago sem autorização específica;
- responsáveis, acesso operacional ou canal de incidentes não designados.

Rollback deve seguir procedimento versionado e aprovado para o ambiente alvo. Não há evidência neste repositório de rollback de produção; não executar rollback por improviso. Isolar a versão/funcionalidade afetada, preservar evidências e obter decisão do responsável.

## 5. Limitações conhecidas da TASK-015

- GATE-004 foi encerrado por exceção administrativa. A carga integral não foi reexecutada; o run histórico 43978132230 registrou p95 crítico acima de 2 s (8.931–13.009 ms), e o Android físico de referência não foi medido.
- GATE-005 está marcado DONE por determinação explícita da responsável; YAML/actionlint e CI não foram validados nessa revisão.
- GATE-006 foi aceito com base nos resultados manuais declarados pela responsável; logs brutos, capturas e identificadores completos de execução não foram anexados.
- A aprovação desses gates não comprova prontidão de produção nem autoriza publicação.
- Pré-requisitos operacionais externos de backup, monitoramento, alertas, retenção e rollback devem ser conferidos no runbook TASK-013 antes de operação real.

## 6. Revisão antes de lançamento

A responsável aprovou a conclusão documental da TASK-015 em 2026-11-16. Os papéis e canais ainda precisam ser designados e os procedimentos do ambiente alvo verificados antes de lançamento; o estado de produção permanece **NO-GO**.
