# TASK-015 — Procedimento de medição de imagens em Android

Status: procedimento preparado; **medição física NÃO EXECUTADA**. A máquina auditada não apresentou `adb`, e não foi confirmado Android de referência disponível. Não usar resultado de desktop como substituto.

## Pré-condições

- Android intermediário com 4 GB RAM e Google Chrome estável; anotar modelo, RAM, versão do Android e versão do Chrome.
- Aplicação e Supabase locais, com dados sintéticos e imagens efetivamente disponíveis no catálogo público. Confirmar que todos os URLs usam `localhost`/`127.0.0.1`; não usar domínio remoto.
- Conectar o telefone por USB e ter `adb` disponível. O encaminhamento deve limitar a exposição ao próprio dispositivo:

```powershell
adb devices
adb reverse tcp:3000 tcp:3000
adb reverse tcp:57321 tcp:57321
adb reverse tcp:4173 tcp:4173
```

Confirme as portas da stack local antes de usar os comandos; `57321` é apenas a porta da stack isolada criada nesta rodada e pode não estar ativa posteriormente. Confira `adb reverse --list` antes de criar encaminhamentos e não substitua encaminhamentos preexistentes. Não iniciar nem alterar outra stack para executar este roteiro.

## Preparar URLs e probe

1. No catálogo local aberto no Chrome do Android, obtenha `currentSrc` das imagens visíveis via DevTools remoto. Use somente URLs locais, sem tokens ou query strings com credenciais.
2. No terminal do worktree, inicie o probe passando cada URL local:

```powershell
node scripts/task015/image-probe.mjs `
  --image "http://127.0.0.1:57321/storage/v1/object/public/catalog/EXEMPLO.webp" `
  --port 4173
```

Substitua o exemplo pelo `currentSrc` real observado; não execute com endereço placeholder. O script aborta para hosts que não sejam loopback e não grava resultados em arquivo.
3. No telefone, abra `http://127.0.0.1:4173/`. O probe executa 30 medições por imagem e mede da entrada de recurso (`startTime`) até `HTMLImageElement.decode()` concluir. Registra p50/p95/p99, falhas, dimensões e formato quando informado pelo browser.

## Cenários separados

No Chrome DevTools remoto, configure rede customizada: 10 Mbps download, 2 Mbps upload, 100 ms latency. Registre a configuração efetivamente aplicada.

- **Frio:** limpar cache do Chrome e manter “Disable cache” ativo no DevTools durante a rodada; executar “Medir cache frio”. Confirmar que cada amostra solicitou o recurso pela rede. Não misturar com resultados aquecidos.
- **Aquecido:** desativar “Disable cache”, repetir o carregamento para aquecer o cache e então executar “Medir cache aquecido”.

Copie o JSON exibido e anexe-o ao relatório junto com modelo/dispositivo, navegador, rede, horário e URLs sem credenciais. Se houver falhas ou faltarem entradas de timing, a rodada é incompleta. O critério só passa se o p95 de cache frio for ≤2.000 ms em todas as imagens incluídas no escopo aprovado; cache aquecido é relatado separadamente e não substitui frio.

## Limites e segurança

- O probe escuta apenas em `127.0.0.1`, aceita somente imagens HTTP loopback, não envia analytics e não cria artefatos permanentes.
- O processo mede bytes/URL disponibilizados pela aplicação, mas não substitui inspeção visual de recorte/layout nem prova acessibilidade.
- Pare o probe com Ctrl+C. Remova individualmente apenas os encaminhamentos que esta sessão criou (`adb reverse --remove tcp:3000`, `--remove tcp:57321`, `--remove tcp:4173`); preserve quaisquer encaminhamentos preexistentes.
- Não executar contra produção, não publicar produtos, não usar dados pessoais e não inferir aprovação sem resultados observados.
