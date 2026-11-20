# TASK-016 — Estabilização visual e eficiência da aplicação

## Estado

- Status: IN_PROGRESS.
- Branch: `task/TASK-016-interface-runtime`.
- Base: TASK-014, commit `4a4f1b3fbf5b1e6df3229f33688afed6ae075ac5`.
- Dependências consideradas: TASK-012, TASK-014 e TASK-015, marcadas DONE no TASKS canônico. Gates anteriores não são reabertos.
- Escopo: restaurar inicialização visual reproduzível e otimizar consumo somente após medir, sem alterar regras de negócio.

## DoR e Scope Guard

- O problema observado foi um standalone antigo servindo HTML enquanto um asset CSS referenciado retornava 404.
- `src/app/layout.tsx` importa `globals.css`; `next.config.ts` configura `output: "standalone"`; o Dockerfile atual copia `.next/static` para a imagem runner.
- A documentação incluída na versão instalada do Next 16.4.2 explica que `server.js` standalone não inclui `public` nem `.next/static` por padrão; a cópia manual é necessária para execução fora da imagem configurada. Assim, a evidência aponta para artefato/execução inconsistente, não ausência do CSS-fonte.
- Host medido nesta sessão: 7,71 GiB RAM total, 0,76 GiB disponível (90% utilizado), 23 GiB livres em C:. O probe CIM/PerformanceCounter não estava acessível; medição feita via `GlobalMemoryStatusEx`.
- A nova worktree está isolada e parte do último commit funcional disponível da TASK-014. O checkout principal da TASK-003, com alterações preexistentes, permanece intocado.
- Node 22.15.0 está disponível. A worktree nova não tem `node_modules`; a worktree concluída TASK-014 tem dependências instaladas, mas contém alteração preexistente em `next-env.d.ts`. Nenhuma dependência foi instalada ou copiada até agora.
- O acesso remoto falhou (`git ls-remote`: `getaddrinfo() thread failed to start`; `Resolve-DnsName github.com`: acesso negado). Upgrade de Next e validação CI não foram executados.

## Validações desta retomada

- Inspeção somente de leitura do histórico, source, Dockerfile, configuração Next, scripts e dependências.
- Next local: 16.4.2. A release oficial estável localizada no GitHub é 16.4.6; Next 16.4.5 documenta correções de segurança moderadas. Nenhuma atualização foi aplicada.
- Não foram executados build, testes, migrations, queries ou serviços. Nenhum fluxo foi declarado PASS.

## Próximos passos

1. Reproduzir em artefato recém-construído, mantendo isolamento e sem tocar nas stacks existentes.
2. Para standalone local, incluir `public` e `.next/static` ao lado de `server.js` conforme documentação oficial do Next; comparar com a cópia já prevista no Dockerfile.
3. Medir memória/payloads e revisar componentes client e dependências antes de otimizar.
4. Atualizar Next para patch estável suportado quando o registry estiver acessível e validar lockfile, build e regressões.
5. Testar as telas e os fluxos aprovados em viewport desktop/mobile; usar Supabase local somente após confirmar que é a stack isolada correta.

## Limitações

A aprovação de TASK-016 não está declarada. Falta build novo, smoke HTTP de CSS/JS, inspeção de navegador, medição de memória da aplicação e regressão funcional. Nenhum gate anterior foi alterado.

## Retomada — 2026-11-18

- **Landing:** o conteúdo genérico foi substituído por uma apresentação editorial gótica/antiga, com a paleta já aprovada, moldura, tipografia serifada, ornamentação botânica vetorial, navegação e layout responsivo em CSS. A ilustração é decorativa, não é fotografia de produto nem logo oficial.
- **Mais vendidos:** a seção foi criada com estado vazio honesto. A consulta somente de leitura encontrou zero produtos públicos e nenhum dos cinco slugs da TASK-012 nesta base local; `catalog_product_images`/Storage da base também não contém as cinco imagens, somente `task015/t002-sample.png`. O contrato público `public_catalog_products` não contém métrica de vendas e não há endpoint público de ranking. Nenhum rascunho foi publicado e nenhuma regra de ranking foi inventada.
- **Build:** `npm --prefix <worktree> run build` — **PASS**, Next.js 16.4.6, TypeScript concluído, 25 páginas geradas, Build ID `TrH1aunLwoeYoxJMxY8TI`. `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` vieram do `supabase status` da stack local `flor-da-meia-noite-local`, somente no ambiente do processo; nenhum `.env.local` foi criado. A URL e a chave anon estão no bundle cliente, como esperado; `service_role` não está no bundle.
- **Inicialização e HTTP:** standalone iniciado em `http://127.0.0.1:3001`. GET `/`, `/auth`, `/catalog`, `/api/catalog` e `/api/health/db` retornaram HTTP 200; o health respondeu `{"status":"ok"}`. Nove assets CSS/JS referenciados pela landing retornaram HTTP 200; respostas foram lidas para medir bytes. A API pública do catálogo retornou zero produtos.
- **Validações:** Biome format aplicado somente a `src/app/page.tsx`; Biome check sem formatter em `page.tsx` e `globals.css` — **PASS**; `git diff --check` — **PASS**. Nenhum teste de gates anteriores foi repetido e nenhuma escrita ocorreu no Supabase.
- **Limitações:** não houve inspeção por screenshot em navegador, nem validação visual desktop/mobile por uma pessoa. Compra, autenticação ponta a ponta, persistência e demais fluxos não foram testados nesta retomada. A solicitação de mostrar “mais vendidos” segue dependente de produtos publicados com imagens disponíveis e de decisão/contrato para uma métrica pública de vendas.
- **Estado:** TASK-016 permanece `IN_PROGRESS`; gates anteriores e estados das demais TASKs não foram alterados. Não houve commit, push, deploy ou publicação de produtos.

### Composição inspirada na referência fornecida

- A landing foi reorganizada com faixa informativa, navegação, hero, faixa de serviços, coleções, explicação do fluxo de compra, seção de mais vendidos e rodapé, usando preto, verde profundo, vinho/rosa escuro e tons envelhecidos. A marca e as fotografias do exemplo não foram copiadas; os elementos florais são gravuras SVG decorativas, identificáveis como ilustração e não como foto de produto.
- `npm --prefix <worktree> run build` — **PASS**, Next.js 16.4.6, TypeScript e 25 páginas; `Biome format` em `src/app/page.tsx`, `Biome check --formatter-enabled=false` nos dois arquivos da landing e `git diff --check` — **PASS**.
- Standalone local ativo em `http://127.0.0.1:3001`: GET `/`, `/auth`, `/catalog`, `/api/catalog`, `/api/health/db` e `/admin/catalog` responderam HTTP 200; 9 assets da landing responderam HTTP 200; health retornou `ok`. O GET sem sessão ao painel exibiu `Acesso restrito à equipe autorizada.`. Não ocorreu inspeção visual via screenshot nem uso de sessão autenticada.
- A API do catálogo retornou zero produtos; a consulta estrutural anterior encontrou zero linhas dos cinco slugs TASK-012 e somente o objeto de teste `task015/t002-sample.png` no bucket local. Os cinco WebP aprovados existem fora deste worktree em `.tmp/TASK-012-pexels-preparation-2026-11-11/webp-ready`, sem alteração, cópia ou upload nesta retomada.
- **Cadastro não executado:** o browser conectado está em uma página externa não autenticada na loja; o painel local confirmou acesso restrito sem sessão. Nenhum registro ou arquivo foi enviado. A responsável precisa abrir `http://127.0.0.1:3001/admin/catalog` numa sessão `employee`/`admin` com step-up MFA recente e avisar quando estiver pronta. Os valores aprovados anteriormente (nomes, slugs, preços, categorias, status `draft`, estoque zero e alts) serão reaproveitados. Descrição, cores, ocasião, tamanho, materiais e detalhes botânicos não serão inventados; campos editoriais sem valor aprovado ficam vazios, conforme a validação existente.
- TASK-016 continua `IN_PROGRESS`; ranking de mais vendidos permanece sem implementação de dados porque a view pública não fornece métrica de vendas nem há decisão para expor um ranking público. Nenhum gate anterior foi alterado; sem commit, push ou publicação.

### Hotfix de autenticação após confirmação de e-mail — 2026-11-19

- **Causa observada:** os logs locais do Supabase Auth mostraram confirmação solicitada e callback PKCE concluído; depois, a tentativa manual de senha retornou `invalid_credentials`. O componente `/auth` não consultava uma sessão já restaurada ao montar, então não avançava automaticamente para a conclusão do perfil/celular após o link de confirmação. A interface ainda ocultava o código da falha de senha sob uma mensagem genérica.
- **Correção autorizada:** `src/app/auth/page.tsx` agora aguarda `auth.getSession()` ao abrir, continua `continueSignedInUser()` quando existe sessão e preserva o modo de recuperação de senha. Erros de callback expirado, `email_not_confirmed` e `invalid_credentials` recebem instruções distintas, sem mostrar dados pessoais nem mensagens internas do provedor.
- **Validações:** Biome no arquivo alterado — PASS; `npm run typecheck` — PASS; GET `/auth` — HTTP 200; GET `/api/health/db` — HTTP 200 e `status: ok`. O Auth local respondeu e o log registrou retorno PKCE. Não foi feita nova tentativa de login com a conta pessoal nem teste ponta a ponta de cadastro neste hotfix.
- **Limites:** a stack é local; e-mail de confirmação é capturado pelo Inbucket e não enviado à caixa postal real. SMS local continua sintético; envio real exige provedor configurado no Supabase hospedado. Nenhuma credencial ou dado de conta foi registrado aqui.
- **Governança:** hotfix pontual realizado por autorização expressa da responsável após explicar que a correção cruza o escopo visual original da TASK-016. TASK-003 não foi reaberta e nenhum gate anterior foi alterado. TASK-016 permanece `IN_PROGRESS`; sem commit ou push.

### Redirecionamento após login — 2026-11-19

- Após `establishSession()` concluir com sucesso, `/auth` navega à página inicial (`/`). Para administrador que exige MFA, o redirecionamento ocorre somente após a verificação SMS completar e a sessão protegida ser estabelecida.
- Falha no login exibe exatamente `login nao efetuado`. Cadastro que ainda exige completar perfil/celular permanece no fluxo de conclusão, sem ser tratado como login completo.
- Alteração funcional restrita a `src/app/auth/page.tsx`, autorizada pela responsável. Biome no arquivo auth, `npm run typecheck`, GET `/auth` HTTP 200 e `git diff --check` — PASS. Não foi feita tentativa de login com a conta pessoal.
