# TASK-013 — Runbook local de backup e restauração

**Status:** procedimento de validação local sintética; não é rotina de produção.

## Guardrails

- Nunca aponte o comando para flor-da-meia-noite-local, projetos remotos ou dados reais.
- O backup aceita somente project_id task013-test-*, URL HTTP em 127.0.0.1/localhost e porta igual à configurada no checkout Supabase isolado.
- O restore aceita somente project_id task013-restore-*, URL local correspondente e confirmação literal TASK013_RESTORE_ACKNOWLEDGE_ISOLATED_TARGET=YES.
- O restore executa `pg_restore --clean` como `supabase_admin` no container local; use somente um projeto novo e descartável `task013-restore-*`. A validação confirma prefixo, porta, estado e label do container antes disso. O comando não remove volumes, mas substitui objetos do banco nesse alvo. O dump preserva ACLs (`pg_dump` não usa `--no-privileges`; restore não usa `--no-privileges`) e omite ownership para manter os grants necessários à API Storage sem depender do proprietário do host.
- Antes do `pg_restore`, o script lê o TOC do archive e desanexa, no banco descartável, as partições que o próprio TOC declara anexadas. Isso permite ao `--clean` remover constraints herdadas sem falhar com `cannot drop inherited constraint`; em seguida o archive recria constraints e anexos. Essa preparação pode permanecer aplicada caso o restore falhe depois, portanto um alvo que sofreu tentativa falha é tratado como descartável e não como estado preservável. Nunca aplique esse procedimento em projeto compartilhado ou remoto.
- O prefixo, URL loopback, porta e label provam que o script selecionou um container de teste com o ID configurado; não provam que seus dados podem ser descartados. Antes do ACK, confirme separadamente que o alvo é novo/descartável e que nenhum dado precisa ser preservado. Nunca use o alvo compartilhado `flor-da-meia-noite-local`.
- Backup e cópias de objetos são cifrados com AES-256-GCM. A chave de 32 bytes em Base64 deve ser fornecida pelo gerenciador de segredos da sessão; não a salve em arquivo, histórico ou relatório.
- TASK013_BACKUP_ROOT deve estar fora do repositório. O processo é append-only e não implementa expurgo automático.
- O executor requer Docker local, Supabase CLI no projeto, pg_dump/pg_restore dentro do container de banco e credencial local service_role apenas para a API local do Storage. Credenciais nunca são impressas.

## Preparar as duas stacks sintéticas

Copie somente supabase/config.toml, supabase/migrations/ e, se usado, supabase/seed.sql para diretórios novos fora do repositório. Em cada cópia, use IDs exclusivos:

- Origem: task013-test-<sufixo>, portas locais livres e diferentes de qualquer stack ativa.
- Restore: task013-restore-<sufixo>, portas locais livres e diferentes da origem.

Desabilite seeds no arquivo isolado salvo se a revisão confirmar que todos são exclusivamente sintéticos. Não reutilize diretório, configuração, porta, volume ou container de outro projeto. Confirme o project_id e as portas antes de iniciar. Depois, inicie apenas essas cópias com supabase start --workdir <diretório-isolado>. Preserve volumes; não use supabase db reset.

Crie no projeto de origem somente uma linha marcadora sintética em uma tabela temporária e um bucket privado sintético com um objeto de bytes conhecidos. Registre o SHA-256 do objeto e o valor do marcador fora do repositório, sem usar dados pessoais.

## Executar backup

Forneça na sessão, sem ecoar valores secretos:

- TASK013_SUPABASE_WORKDIR: diretório isolado da origem.
- TASK013_SUPABASE_URL: URL loopback/porta da origem.
- TASK013_SERVICE_ROLE_KEY: chave local da origem, obtida do status da mesma stack.
- TASK013_ENCRYPTION_KEY: chave Base64 de exatamente 32 bytes, guardada fora do repositório.
- TASK013_BACKUP_ROOT: destino local fora do repositório, com espaço suficiente.

Execute npm run backup:task013. O comando cria um conjunto novo em subdiretório, com dump custom PostgreSQL cifrado, cópia cifrada de todos os bytes dos buckets e manifesto cifrado com bucket, chave, MIME, tamanho e SHA-256 por objeto. O descriptor.json contém somente identificação técnica mínima. O processo falha se o container/label não corresponder ao projeto isolado, se o archive não puder ser lido ou se faltar storage.objects no inventário do dump; um conjunto incompleto não é publicado como final.

## Executar restore

Use uma stack nova task013-restore-*, com porta/ID próprios e sem dados que precisem ser preservados. Configure:

- TASK013_SUPABASE_WORKDIR, TASK013_SUPABASE_URL e TASK013_SERVICE_ROLE_KEY da stack de restore.
- TASK013_BACKUP_DIR para o conjunto final escolhido.
- TASK013_ENCRYPTION_KEY igual à chave original.
- TASK013_RESTORE_ACKNOWLEDGE_ISOLATED_TARGET=YES somente após verificar o ID e o alvo descartável.

Execute `npm run restore:task013`. Antes de alterar o banco, ele autentica o manifesto, valida o arquivo custom e todos os objetos cifrados, decifra os bytes em temporário e confere tamanho/SHA-256. Em seguida prepara as partições do alvo descartável, restaura o banco em transação única preservando ACLs e faz upload/verificação de cada objeto por SHA-256. O sucesso só é reportado depois da leitura dos bytes restaurados e comparação com o manifesto. Em falha após o começo, preserve a origem e o conjunto original; trate o destino como descartável/contaminado e não o use para dados de usuário.

## Limites e riscos aceitos — GATE-004/GATE-005

- O destino implementado é um diretório local cifrado fora do repositório. Não é, por si só, uma cópia independente de host/conta/provedor e não substitui uma réplica externa. Essa limitação foi aceita para o escopo local/sintético dos GATE-004 e GATE-005; cópia independente continua pré-requisito de produção.
- Não há agendador, configuração de retenção automática, dashboard hospedado ou integração com provedor de logs/alertas. Essas lacunas foram aceitas como riscos para os gates, não como funcionalidades concluídas. Não apague arquivos antigos automaticamente.
- O exercício local de restore está aprovado como evidência do escopo sintético. Ele não mede RPO/RTO nem a janela mensal de disponibilidade; essas medidas continuam pendentes no roteiro da Etapa 006. Não use este procedimento contra produção.

## Evidência local de referência — 2026-11-15

O conjunto sintético `2026-11-15T03-38-46-420Z-2c4f4bb0-641e-46d9-9239-6601d295d129` foi restaurado no alvo descartável `task013-restore-20261114` e o comando retornou `restored_and_verified`, um objeto. Dump restaurado: 640.521 bytes, SHA-256 `eab1604b718825c859728bcb0751b379c37e7132f5a8dcf177b9965538961f0a`. Objeto Storage: `task013-synthetic/task013-validation/marker.bin`, 8.192 bytes, `application/octet-stream`, SHA-256 `1f5a16c4456f34c5459e4e66d8650d4dbb6b298810d0c21cef6571db21d69c81`. As contagens pós-restore foram 0 `auth.users`, 1 `storage.objects`, 3 buckets, 1 marcador sintético e 29 tabelas públicas. Esta evidência valida um exercício local pontual; não comprova agendamento, destino independente, retenção, alertas nem RPO/RTO de operação real.
