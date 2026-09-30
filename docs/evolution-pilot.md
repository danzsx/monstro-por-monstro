# Segunda forma: piloto de prática de prova

## Regra de aprendizagem

Nos quatro pilotos (`proportions`, `rule-of-three`, `cytology`, `genetics`), a primeira conclusão exige uma sessão `learn` com três questões de fixação distintas, todas corretas e sem ajuda, mais a declaração separada **Compreendi a teoria**. Respostas corrigidas durante a reparação não contam. A checklist orienta o estudo e não altera o resultado. Se faltar qualquer condição, o monstro segue pendente. Há seis itens de fixação por piloto para permitir outro conjunto de três depois de um erro.

`firstClearedAt` marca a primeira conclusão; `evolvedAt` ativa a arte evoluída. `stage` e `reviewLevel` continuam a registrar evidência de revisões posteriores; uma resposta errada não apaga a forma. O primeiro intervalo sugerido é de 24 horas, uma regra de produto a testar com estudantes. A fase oficial usa dois itens ENEM distintos por encontro, pode ser aberta antes pelo bestiário e só é recomendada automaticamente após o intervalo. Uma sessão em andamento tem prioridade na tela inicial.

## Publicação de itens oficiais

**Nenhum enunciado oficial está incluído neste piloto.** O editor e o banco aceitam itens da fase `exam` apenas com identificação de prova, gabarito e explicação revisados, proveniência licenciada e comprovante individual da autorização de reprodução. O comprovante deve cobrir o enunciado e qualquer texto ou imagem incorporado ao item. Estar disponível no portal do Inep não é tratado como autorização. O cliente também recusa itens sem esses campos. A fase oficial permanece indisponível até que ao menos dois itens distintos de um piloto passem pela revisão editorial e jurídica.

Antes de publicar cada item, arquivar a autorização original fora do catálogo público, conferir seu escopo e validade com o titular e verificar que a explicação é autoral. Registrar em `rights_evidence` apenas a referência, o titular, o uso permitido, a data da verificação e a confirmação da cobertura integral. Não colocar documentos contratuais nem dados pessoais do titular no app público.

## Dados do estudante

O caderno externo guarda somente fonte, identificação, link opcional, data, resultado e comentário pessoal. Não oferece campo de enunciado ou imagem. O resultado é autodeclarado, pode orientar uma sugestão de retomada e não entra em `assessmentEvidence`, `score` ou `stage`. O estudante pode editar, apagar e exportar os registros. A sincronização exige confirmação da faixa `16–17` ou `18+` antes de criar ou usar uma identidade na nuvem. O banco mantém RLS por titular; a RPC `delete_my_study_data` apaga snapshot, eventos e recibos apenas do usuário autenticado. A confirmação no perfil apaga também as cópias locais do progresso.

**Pendências para lançamento público:** publicar um aviso de privacidade com operador, finalidades, retenção, direitos do titular e canal para exclusão do cadastro de autenticação; revisar a experiência de adolescentes de 16–17 anos e a verificação proporcional da idade com assessoria jurídica; validar conflitos entre aparelhos com usuários reais. A exclusão implementada cobre os dados de estudo, não o cadastro no provedor de autenticação. Não anunciar a fase ENEM enquanto faltar autorização de reprodução.

## Arte e verificação

As quatro segundas formas em `assets/monsters/*-evolved.png` foram criadas com a ferramenta integrada **imagegen**, em fundo transparente. O conjunto de prompts pediu criaturas de fantasia originais que evoluíssem visualmente os quatro monstros existentes, preservando a identidade de cada tema, sem reproduzir personagens de franquias. A comparação com Charmander/Charmeleon orientou a ideia de evolução, não o desenho dos personagens.

Executar `npm test -- --runInBand`, `npm run typecheck`, `npm run lint`, `npm run security:db-check`, `npm run build` e `npm run build` em `admin/`. A checagem SQL cobre recusa de item oficial sem direitos, RLS entre duas contas e exclusão limitada ao titular. Antes da liberação, fazer também teste manual em aparelho móvel e navegador, com leitor de tela, uso offline e conflito de sincronização em dois dispositivos.
