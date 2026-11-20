# TASK-016 — Execução local do build standalone

O build standalone não leva `public` nem `.next/static` para sua pasta de saída automaticamente. A imagem Docker do projeto já copia `.next/static`; para teste direto no host, use o launcher abaixo, que copia somente esses arquivos gerados e inicia o `server.js` do mesmo build.

Na raiz do projeto, com ambiente local configurado:

```powershell
npm run build
node scripts/task016/start-standalone.mjs
```

O servidor usa `http://127.0.0.1:3001` por padrão. Para escolher outra porta, defina `$env:PORT` antes de iniciar. Pare com Ctrl+C.

Em outro terminal, faça o smoke check de páginas públicas e assets:

```powershell
node scripts/task016/smoke-ui.mjs
```

O smoke check verifica apenas HTTP das páginas `/`, `/auth`, `/catalog` e dos CSS/JS estáticos referenciados. Não comprova operações autenticadas, gravações, checkout, acessibilidade visual nem integrações externas. Essas validações continuam separadas e devem usar apenas ambiente local/sintético.
## Supabase local reduzido (sem envio de SMS real)

Para diminuir o número de serviços locais, use `npm run supabase:start:lite`. Esse comando exclui Studio, imgproxy, Realtime, Edge Runtime, Logflare, Vector, Supavisor e postgres-meta. Mantém PostgreSQL, Auth, Kong/API, PostgREST, Storage e Mailpit, usados pelo produto ou pela confirmação de e-mail. O projeto não usa Realtime nem Edge Functions no código atual.

A stack reduzida ainda usa Docker, memória e espaço em disco; o Supabase não publica um mínimo de recursos garantido para essa seleção. Confira recursos livres antes de iniciar. Não execute `db:reset` para reaproveitar um banco com dados: esse comando substitui o conteúdo local.

O SMS não é enviado a uma operadora em desenvolvimento. Auth mantém a confirmação de telefone e o `config.toml` fornece OTPs sintéticos para números de teste. Use somente esses números/ códigos em contas sintéticas; não use telefone de cliente. Isso testa a etapa de OTP local, não entrega SMS real.

Na primeira configuração, inicie a stack e consulte a saída de `npm run supabase:status -- -o env` para preencher `.env.local` com URL e chaves locais. Não versione `.env.local` nem compartilhe a chave `service_role`. Em seguida, aplique/valide as migrations conforme o procedimento do README, construa o artefato uma vez (`npm run build`) e inicie o standalone (`node scripts/task016/start-standalone.mjs`). A aplicação fica em `http://127.0.0.1:3001`; e-mails de teste ficam no Mailpit.