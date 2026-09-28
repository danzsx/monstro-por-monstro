import type { InteractiveModule } from '../../shared/interactive-module';

/** Aula autoral de genética básica, com exemplos hipotéticos e ressalvas do modelo mendeliano. */
export const GENETICS_MODULE: InteractiveModule = {
  schemaVersion: 1,
  topicId: 'genetics',
  title: 'Genética: uma herança de cada vez',
  intro: 'Como uma característica passa entre gerações sem virar uma simples mistura? Siga uma versão de gene por vez, faça previsões e confira o raciocínio.',
  sections: [
    {
      id: 'inheritance',
      title: 'A pergunta de Mendel',
      objective: 'Explicar por que o reaparecimento de uma característica aponta para unidades hereditárias que se separam.',
      blocks: [
        { id: 'inheritance-story', kind: 'text', title: 'O traço que reaparece', body: 'Ao estudar características de ervilhas por gerações, Mendel observou que uma característica ausente nos descendentes imediatos podia reaparecer na geração seguinte. Se a herança fosse sempre uma mistura irreversível, isso seria difícil de explicar. O modelo mendeliano propõe fatores hereditários transmitidos entre gerações; hoje os relacionamos aos genes e seus alelos.' },
        { id: 'inheritance-model', kind: 'analogy', title: 'Duas cartas, uma para passar adiante', body: 'Imagine que, para uma característica simples, cada indivíduo tem duas cartas com versões de um mesmo gene. Na formação de cada gameta, só uma das duas cartas vai para ele. Na fecundação, duas cartas voltam a formar um par.', limit: 'Genes não são cartas soltas. Eles ocupam regiões dos cromossomos, e muitas características dependem de vários genes e do ambiente.' },
        { id: 'inheritance-check', kind: 'check', prompt: 'Uma característica não aparece em uma geração, mas reaparece na seguinte. Qual ideia ajuda a explicar isso?', options: ['As versões herdadas podem permanecer presentes mesmo sem se manifestar.', 'Toda característica dos pais se mistura de modo irreversível.', 'O ambiente cria sempre uma nova versão do gene no descendente.', 'Cada descendente recebe apenas genes de um dos pais.'], answer: 0, explanation: 'Uma versão pode ser transmitida mesmo quando não se manifesta. Em outra combinação, ela pode voltar a aparecer. Nas próximas etapas, você verá esse caso com os alelos A e a.' },
      ],
    },
    {
      id: 'dna-alleles',
      title: 'Gene, alelo e cromossomo',
      objective: 'Localizar um gene e reconhecer alelos como versões desse gene.',
      blocks: [
        { id: 'dna-alleles-text', kind: 'text', title: 'Onde fica a informação?', body: 'O DNA forma os cromossomos. Um gene é uma região de DNA com informação funcional; alelos são versões de um gene. Em um organismo diploide, os cromossomos de um par homólogo podem trazer alelos do mesmo gene na mesma posição, chamada lócus. Em geral, um dos homólogos veio de cada genitor.' },
        { id: 'dna-alleles-list', kind: 'list', title: 'Leia o par de alelos', items: ['AA: dois alelos A; homozigoto.', 'Aa: alelos A e a; heterozigoto.', 'aa: dois alelos a; homozigoto.', 'A e a representam versões de um gene no exemplo, não dois genes diferentes.'] },
        { id: 'dna-alleles-check', kind: 'check', prompt: 'Em uma planta diploide fictícia, o genótipo Aa para um gene indica:', options: ['Duas versões diferentes desse gene, uma em cada cromossomo homólogo.', 'Dois genes sem relação, ambos no mesmo cromossomo.', 'Que a planta apresenta obrigatoriamente uma mistura visível dos fenótipos.', 'Que cada gameta dessa planta carregará A e a juntos.'], answer: 0, explanation: 'Aa representa dois alelos do mesmo gene em cromossomos homólogos. Na formação dos gametas, esses alelos normalmente se separam; cada gameta recebe apenas um deles.' },
      ],
    },
    {
      id: 'genotype-phenotype',
      title: 'Do alelo à característica',
      objective: 'Distinguir genótipo de fenótipo e interpretar dominância completa sem confundir dominância com frequência ou valor.',
      blocks: [
        { id: 'genotype-phenotype-text', kind: 'text', title: 'Ter e manifestar não são sinônimos', body: 'Genótipo é a constituição genética considerada; fenótipo é o conjunto de características observáveis, produzido pela interação entre genes e ambiente. Vamos usar uma planta fictícia: para a cor da flor, A determina roxo e domina completamente sobre a. Nesse modelo, AA e Aa têm flores roxas; aa tem flores brancas.' },
        { id: 'genotype-phenotype-caution', kind: 'list', title: 'Três cuidados que evitam tropeços', items: ['Dominante quer dizer que aparece no heterozigoto neste modelo; não quer dizer “mais comum”.', 'Recessivo não quer dizer fraco, pior ou destinado a desaparecer.', 'Saber o fenótipo roxo não basta para distinguir AA de Aa sem outras informações.'] },
        { id: 'genotype-phenotype-check', kind: 'check', prompt: 'Na planta fictícia, uma flor roxa tem qual genótipo possível?', options: ['Apenas o homozigoto AA.', 'Apenas o heterozigoto Aa.', 'AA ou Aa.', 'O homozigoto recessivo aa.'], answer: 2, explanation: 'Com dominância completa de A, AA e Aa produzem o fenótipo roxo. A aparência sozinha não revela qual dos dois genótipos a planta tem.' },
      ],
    },
    {
      id: 'gametes',
      title: 'Cada gameta leva um',
      objective: 'Aplicar a segregação dos alelos para prever os gametas de um indivíduo.',
      blocks: [
        { id: 'gametes-text', kind: 'text', title: 'A separação que explica a herança', body: 'Na meiose, os cromossomos homólogos se separam. Para um gene autossômico como o do nosso exemplo, isso separa seus dois alelos: cada gameta recebe apenas um. A fecundação reúne um gameta de cada genitor e restaura o par no descendente. Essa é a base cromossômica da primeira lei de Mendel.' },
        { id: 'gametes-list', kind: 'list', title: 'Preveja antes de olhar um cruzamento', items: ['AA forma gametas com A.', 'aa forma gametas com a.', 'Aa pode formar gametas com A ou com a; nesse modelo, cada tipo tem probabilidade de 1/2.'] },
        { id: 'gametes-check', kind: 'check', prompt: 'Uma planta Aa é cruzada com uma planta aa. Que gametas cada uma pode fornecer?', options: ['Aa fornece A ou a; aa fornece apenas a.', 'Aa fornece sempre A e a juntos; aa fornece apenas a.', 'Aa fornece apenas A; aa fornece apenas a.', 'Aa fornece apenas a; aa fornece A ou a.'], answer: 0, explanation: 'Os dois alelos de Aa se separam na formação dos gametas: A ou a. Como aa tem duas cópias de a, seus gametas carregam a.' },
      ],
    },
    {
      id: 'crosses',
      title: 'Cruzar é combinar possibilidades',
      objective: 'Construir as combinações de um cruzamento monohíbrido e interpretar suas probabilidades.',
      blocks: [
        { id: 'crosses-method', kind: 'text', title: 'Monte o quadro em três passos', body: 'Em Aa × Aa, escreva A e a como gametas possíveis de um genitor no topo e A e a do outro na lateral. Combine uma letra de cada lado em cada casa: AA, Aa, Aa e aa. As quatro casas são igualmente prováveis neste modelo. Assim, a proporção genotípica esperada é 1 AA : 2 Aa : 1 aa.' },
        { id: 'crosses-phenotypes', kind: 'list', title: 'Agora traduza para o que se observa', items: ['AA e Aa são roxas: 3 das 4 combinações, ou 75%.', 'aa é branca: 1 das 4 combinações, ou 25%.', 'A proporção 3:1 vale para esse cruzamento com dominância completa e gametas igualmente prováveis.'] },
        { id: 'crosses-check', kind: 'check', prompt: 'No cruzamento Aa × Aa, qual é a probabilidade de uma planta descendente ter flores brancas?', options: ['0%, porque A domina.', '25%, porque apenas aa é branco.', '50%, porque metade dos genitores tem a.', '75%, porque três casas do quadro contêm A.'], answer: 1, explanation: 'A planta branca precisa receber a dos dois gametas. Entre as quatro combinações igualmente prováveis, uma é aa: 1/4 ou 25%.' },
        { id: 'crosses-chance', kind: 'check', prompt: 'Após nascerem três plantas roxas de Aa × Aa, qual é a chance de a próxima ser branca, mantendo as mesmas condições?', options: ['0%, porque já nasceram três roxas.', '25%, pois cada fecundação é um evento independente.', '50%, para compensar as três roxas.', '100%, porque a quarta precisa ser branca.'], answer: 1, explanation: 'A proporção descreve chances, não uma sequência obrigatória. Se os eventos são independentes e as condições não mudam, cada novo descendente tem probabilidade de 1/4 de ser aa.' },
      ],
    },
    {
      id: 'infer',
      title: 'Descubra o genótipo',
      objective: 'Usar um cruzamento com homozigoto recessivo para testar uma hipótese sobre o genótipo.',
      blocks: [
        { id: 'infer-text', kind: 'text', title: 'A flor roxa esconde uma dúvida', body: 'Uma planta roxa pode ser AA ou Aa. Cruze-a com uma planta branca aa. Se a roxa for AA, todos os descendentes esperados serão Aa e roxos. Se ela for Aa, cada descendente terá 1/2 de chance de ser Aa (roxo) e 1/2 de ser aa (branco). Esse raciocínio é chamado de cruzamento-teste.' },
        { id: 'infer-caution', kind: 'text', title: 'O que uma amostra permite concluir?', body: 'O nascimento de ao menos um descendente branco mostra que a planta roxa forneceu a; portanto, era Aa neste modelo. Já observar só descendentes roxos em uma amostra pequena não prova AA: por acaso, uma planta Aa também pode produzir vários roxos seguidos.' },
        { id: 'infer-check', kind: 'check', prompt: 'Uma planta roxa cruzada com aa produz uma descendente branca. Qual era o genótipo da planta roxa?', options: ['AA, pois roxo é dominante.', 'Aa, pois precisou fornecer o alelo a.', 'aa, pois produziu uma descendente branca.', 'Não há como inferir nada nesse modelo.'], answer: 1, explanation: 'A descendente branca é aa e recebeu um a de cada genitor. A planta roxa carregava a, mas expressava roxo; logo, era Aa.' },
      ],
    },
    {
      id: 'scope',
      title: 'Onde o modelo muda',
      objective: 'Reconhecer quando a regra de dominância completa e a proporção 3:1 não bastam.',
      blocks: [
        { id: 'scope-text', kind: 'text', title: 'O quadro é uma ferramenta, não uma regra para tudo', body: 'O quadro de Aa × Aa descreve um gene com dois alelos e dominância completa. Em dominância incompleta, o heterozigoto tem fenótipo intermediário; em codominância, os efeitos dos dois alelos aparecem. Muitas características envolvem vários genes e ambiente. Nesses casos, não devemos aplicar automaticamente a proporção fenotípica 3:1.' },
        { id: 'scope-independent', kind: 'text', title: 'E se houver dois genes?', body: 'Para genes em pares diferentes de cromossomos, um indivíduo AaBb pode formar gametas AB, Ab, aB e ab, cada um com probabilidade de 1/4 no modelo simples. Isso expressa a distribuição independente da segunda lei de Mendel. Genes próximos no mesmo cromossomo podem ser herdados juntos com maior frequência; portanto, a regra exige atenção à localização dos genes.' },
        { id: 'scope-check', kind: 'check', prompt: 'Uma questão informa que Aa tem fenótipo intermediário entre AA e aa. Qual cuidado você deve tomar ao calcular fenótipos de Aa × Aa?', options: ['Aplicar 3:1, pois toda letra maiúscula é dominante.', 'Considerar três fenótipos na proporção esperada 1:2:1.', 'Concluir que os alelos se misturaram e desapareceram.', 'Ignorar os gametas, pois não há segregação.'], answer: 1, explanation: 'Os alelos ainda se separam e os genótipos seguem 1 AA : 2 Aa : 1 aa. Como o heterozigoto tem fenótipo próprio na dominância incompleta, os três fenótipos também seguem 1:2:1 nesse modelo.' },
        { id: 'scope-final', kind: 'check', prompt: 'Para resolver uma nova questão de herança, qual sequência de raciocínio é mais segura?', options: ['Escolher 3:1 antes de ler o enunciado.', 'Identificar o modelo de herança, listar gametas, combinar alelos e interpretar as chances.', 'Decidir o genótipo de todos apenas pela aparência.', 'Contar quatro filhos e exigir que um tenha o fenótipo recessivo.'], answer: 1, explanation: 'Primeiro veja quais relações entre alelos e genes a questão descreve. Depois determine gametas e combinações. Por fim, traduza genótipos em fenótipos e lembre que proporções são probabilidades, não garantias em poucos descendentes.' },
      ],
    },
  ],
};
