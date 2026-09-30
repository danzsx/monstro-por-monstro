# Fase 5 — avaliação avançada condicionada a dados

Estado em 29/09/2026: **aguardando piloto**. Não há coorte consentida, corpus de provas codificado nem experimento pré-registrado no repositório. A política em uso continua `evidence-v1`. `npm run phase5:evaluate` mostra esse estado sem produzir taxas artificiais.

## Estudo de incidência por prova

O módulo `src/research/phase5.ts` aceita um caderno canônico por ano, aplicação e área. Cada item do caderno deve estar presente no denominador, inclusive os que não pertencem ao catálogo. Dois revisores diferentes atribuem o tema principal; divergências exigem adjudicação com justificativa. IDs de itens não podem se repetir. A fonte precisa apontar para o domínio oficial do Inep. O resultado é contagem e proporção **por prova**. O relatório só libera essas tabelas para revisão editorial quando há três edições distintas por área. Revisão editorial ainda deve avaliar seleção de edições, ambiguidade e incerteza antes de qualquer frase no produto.

Fontes de corpus: [provas e gabaritos oficiais do Inep](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos) e [matriz de referência](https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem). A matriz delimita escopo curricular; não fornece incidência. O relatório armazena identificadores e classificações, sem reproduzir enunciados ou imagens oficiais.

## Erros por item e psicometria

O agregado usa a primeira tentativa independente de cada participante por questão e versão. Exclui entrada, diagnóstico, respostas assistidas e itens sem versão. Separa prática de revisão. Uma taxa só aparece com pelo menos 30 participantes distintos e pelo menos cinco acertos e cinco erros; grupos menores são suprimidos. A taxa descreve a amostra exposta ao item e **não** é prioridade global de recomendação.

A triagem de calibração pede, como filtro operacional conservador, 200 participantes que responderam cinco itens distintos e dez itens versionados com 200 respostas e alguma variação de acerto. Passar nessa triagem apenas autoriza revisão por especialista: ainda faltam análise de dimensionalidade, dependência local, itens âncora, estabilidade entre grupos, cobertura de habilidade e diagnóstico do modelo. Nenhum parâmetro psicométrico é calculado ou aplicado ao produto nesta fase sem esses estudos.

## Experimento de política

O avaliador exige protocolo pré-registrado antes da inclusão, atribuição estável por ID pseudônimo e dois braços: `baseline` (`evidence-v1`) e `candidate`. A métrica primária é primeira sessão concluída por participante que abriu a entrada. Retorno em sete dias e compreensão são guardrails; compreensão é a fração de participantes com pelo menos cinco itens distintos sem ajuda e pelo menos 80% de acertos. O plano fixa amostra mínima de pelo menos 30 por braço e margens máximas de queda, antes de ver os resultados. A decisão usa limites conservadores de 95% para a diferença entre proporções. Resultado favorável significa apenas `candidate-eligible-for-review`: ainda requer revisão metodológica e de produto. Nos demais casos o resultado é `keep-baseline`.

`npm run phase5:evaluate -- caminho/estudo.json` aceita um manifesto local com `protocolId`, `dataOrigin: "observed"`, `consentConfirmed: true`, `examBooklets`, `itemAttempts` e, quando existir, `experiment` com `plan`, `people`, `preregisteredAt` e `enrollmentStartedAt`. O relatório imprime o SHA-256 do manifesto para reprodutibilidade; não imprime IDs individuais. O arquivo de dados não deve ser versionado no repositório. Consentimento, proveniência dos dados, amostragem e registro do protocolo devem ser verificados pela equipe antes da análise.

## Critério para avançar

1. Concluir a curadoria e executar o piloto com consentimento, preservando versões de itens e eventos.
2. Codificar três ou mais edições oficiais por área com dois revisores, guardar divergências e método.
3. Analisar exposição e vieses dos agregados por item. Suprimir grupos abaixo dos limites.
4. Pré-registrar e executar o experimento de política. Comparar início, retorno e compreensão com a heurística simples.
5. Manter `evidence-v1` se a amostra for insuficiente, houver piora nos guardrails ou o ganho não for demonstrado.
