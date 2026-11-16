# TASK-014 — Procedimento operacional para cadastro manual do catálogo

Use somente o painel administrativo da aplicação e cadastre um produto por vez. Não importar planilhas, inserir no banco diretamente ou ajustar saldo sem contagem física reconciliada.

## Papéis

- Pessoa registradora: reúne as fontes aprovadas, cadastra produto, imagem e conteúdo, e mantém o item como draft.
- Pessoa conferente: pessoa diferente, com conta própria autorizada, compara os dados com as fontes e a contagem física, preenche o checklist e autoriza a liberação.
- A operação designa as pessoas por rodada. Não há nomes predefinidos. A aplicação não impõe tecnicamente a aprovação em duas pessoas.

Sem conferente independente, manter draft e saldo inalterado. Nunca compartilhar credenciais, senha, MFA ou token.

## Preparação

1. Confirmar URL e ambiente autorizado antes de abrir /admin/catalog; interromper se projeto/ambiente não puder ser identificado como isolado.
2. Usar sessão própria autorizada.
3. Separar fontes aprovadas para nome, tipo, descrição, preço, categoria e atributos.
4. Não inventar composição, cuidados, significado, toxicidade, validade, dimensões ou alegações. Se informação relevante estiver ausente, manter draft e solicitar fonte.
5. Confirmar procedência e autorização da imagem antes do envio.
6. Preparar imagem otimizada. As validações existentes verificam tipo/MIME e assinatura, dimensões positivas, alt text não vazio e limite de 10 MiB. Isso não substitui inspeção visual ou comprovação de licença.

## Cadastro por produto

1. Pesquisar nome/slug para evitar duplicata.
2. Selecionar categoria da lista fixa.
3. Preencher dados com base em fonte aprovada, respeitando as validações do formulário.
4. Anexar imagem correspondente e alt factual, sem inferir detalhes invisíveis.
5. Manter status Rascunho. O cadastro começa com estoque zero.
6. Salvar e conferir nome, slug, preço, categoria, draft e estoque zero na listagem.
7. Registrar ID/slug no checklist operacional.

## Dupla conferência e liberação

A pessoa conferente usa sua própria sessão e verifica os campos contra as fontes, categoria, imagem, alt, procedência, conteúdo factual e estado draft. Registra decisão, data e identidades operacionais das duas contas no checklist. Divergência ou dado factual ausente mantém draft.

O painel permite selecionar published; a revisão independente não é imposta pelo backend. É obrigatório seguir este controle operacional. Publicar somente após conferência registrada, imagem autorizada e checklist aplicável completo, com liberação operacional apropriada.

## Contagem e estoque

1. Identificar fisicamente o produto vendável e contar unidades.
2. Outra pessoa reconta ou confere a contagem e o produto correspondente.
3. Resolver divergências antes de qualquer ajuste.
4. A pessoa autorizada lança a quantidade inteira pelo ajuste administrativo, com motivo objetivo de até 400 caracteres.
5. Conferir resultado e registro de auditoria de quantidade anterior/nova, ator e horário.
6. O saldo do sistema é o registro operacional. Não importar saldo via planilha.
7. Não disponibilizar para venda até a contagem estar reconciliada e os dados necessários revisados.

## Checklist por produto

- ID/slug: ____________________
- Fonte aprovada de nome, tipo, descrição e preço: ____________________
- Categoria da lista fixa: [ ] conferida
- Imagem correspondente, visual e alt: [ ] conferidos
- Formato/tamanho aceitos e procedência/licença registrada: [ ] conferidos
- Dados sem suposições: [ ] conferidos
- Status draft durante revisão: [ ] confirmado
- Conferente diferente da pessoa registradora: [ ] confirmado
- Divergências resolvidas: [ ] sim [ ] não; se não, manter draft
- Contagem física conferida antes do saldo: [ ] sim [ ] ainda não
- Ajuste e justificativa auditável conferidos: [ ] sim [ ] ainda não
- Liberação autorizada após checklist: [ ] sim [ ] não
- Conta registradora / conta conferente: ____________________
- Data e decisão operacional: ____________________

Se qualquer item aplicável não estiver confirmado, mantenha draft e não libere o saldo para venda.

## Treinamento

Demonstrar em ambiente isolado, com dados sintéticos: localizar painel, pesquisar duplicidade, selecionar categoria fixa, preencher apenas dados fornecidos, anexar imagem sintética válida, salvar draft, localizar registro e conferir saldo zero. Em seguida, treinar revisão independente e ajuste auditável. A pessoa treinada repete o procedimento sintético e demonstra como parar diante de informação ausente, imagem sem procedência ou divergência de contagem.

Esse treinamento não substitui o ensaio e a reconciliação registrados no roteiro manual da Etapa 006.