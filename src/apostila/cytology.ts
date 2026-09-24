import type { InteractiveModule } from '../../shared/interactive-module';

/** Original editorial content. The reference PDF only informed the topic inventory. */
export const CYTOLOGY_MODULE: InteractiveModule = {
  schemaVersion: 1,
  topicId: 'cytology',
  title: 'Citologia: uma célula de cada vez',
  intro: 'Você não precisa decorar uma cidade inteira de nomes. Vamos descobrir o problema que cada parte da célula resolve.',
  sections: [
    {
      id: 'essentials', title: 'O começo de tudo', objective: 'Reconhecer o que as células têm em comum e por que isso importa.',
      blocks: [
        { id: 'essentials-core', kind: 'text', title: 'Pequena, mas completa', body: 'A célula é a menor unidade capaz de realizar atividades da vida. Bactérias, plantas e animais têm células com membrana, citoplasma, material genético e ribossomos. Vírus não são células.' },
        { id: 'essentials-analogy', kind: 'analogy', title: 'Pense em um espaço de trabalho', body: 'A membrana delimita o espaço, o material genético guarda instruções, e os ribossomos montam proteínas. Essas peças cooperam para manter a célula funcionando.', limit: 'Uma célula não segue ordens como uma equipe humana. Moléculas interagem por processos físicos e químicos.' },
        { id: 'essentials-list', kind: 'list', title: 'Quatro pistas para reconhecer vida celular', items: ['Membrana: separa o interior do ambiente e regula trocas.', 'Citoplasma: meio onde acontecem muitas reações.', 'DNA: armazena informação hereditária.', 'Ribossomos: participam da produção de proteínas.'] },
        { id: 'essentials-check', kind: 'check', prompt: 'Uma bactéria e uma célula humana compartilham qual conjunto?', options: ['Núcleo, cloroplastos e parede', 'Membrana, DNA, citoplasma e ribossomos', 'Mitocôndrias, núcleo e vacúolo central', 'Parede de celulose e cloroplastos'], answer: 1, explanation: 'Essas quatro estruturas aparecem em células bacterianas e humanas. Bactérias não têm núcleo delimitado nem organelas membranosas.' },
      ],
    },
    {
      id: 'types', title: 'Quem faz o quê?', objective: 'Comparar tipos celulares e associar estruturas a funções.',
      blocks: [
        { id: 'types-figure', kind: 'figure', title: 'Compare sem decorar tabela', figureId: 'cell-types', caption: 'Toque em cada tipo celular para destacar suas estruturas características.' },
        { id: 'types-concept', kind: 'text', title: 'O critério que muda o jogo', body: 'Procariontes, como bactérias, mantêm o DNA em uma região sem envoltório nuclear. Células eucarióticas têm núcleo delimitado e compartimentos internos. Animais e plantas são eucariontes, mas suas células não são idênticas.' },
        { id: 'types-analogy', kind: 'analogy', title: 'Compartimentos ajudam a coordenar tarefas', body: 'Em uma célula eucariótica, organelas lembram estações de trabalho: ribossomos montam proteínas, o Golgi modifica e distribui parte delas, e mitocôndrias participam da produção de ATP.', limit: 'Nem toda proteína passa pelo Golgi, e bactérias também produzem ATP sem possuir mitocôndrias.' },
        { id: 'types-list', kind: 'list', title: 'Observe a função, não só o nome', items: ['Cloroplastos usam luz na fotossíntese de plantas e algas.', 'A parede celular vegetal sustenta; a membrana continua controlando trocas.', 'O vacúolo central ajuda a manter a pressão interna da célula vegetal.', 'Microvilosidades ampliam a área de absorção em certas células, como as do intestino.'] },
        { id: 'types-check', kind: 'check', prompt: 'Uma substância impede a formação de proteínas. Qual estrutura foi atingida diretamente?', options: ['Ribossomos', 'Parede celular', 'Vacúolo central', 'Membrana nuclear'], answer: 0, explanation: 'Ribossomos leem a informação do RNA mensageiro e unem aminoácidos para formar proteínas.' },
      ],
    },
    {
      id: 'membrane', title: 'A fronteira inteligente', objective: 'Explicar por que a membrana deixa algumas substâncias passar e outras precisam de ajuda.',
      blocks: [
        { id: 'membrane-concept', kind: 'text', title: 'Uma barreira que se move', body: 'A membrana plasmática tem uma bicamada de fosfolipídios com proteínas. Ela é fluida e seletiva: gases pequenos atravessam com relativa facilidade; íons e muitas moléculas polares dependem de proteínas de transporte.' },
        { id: 'membrane-figure', kind: 'figure', title: 'Veja os caminhos possíveis', figureId: 'membrane-transport', caption: 'Compare passagem direta, canal e bomba. As setas mostram o sentido do fluxo; ATP indica gasto de energia.' },
        { id: 'membrane-analogy', kind: 'analogy', title: 'Uma portaria com portas diferentes', body: 'Algumas moléculas atravessam a bicamada. Outras usam uma porta específica. A célula também pode acionar uma “bomba” para manter diferenças entre o lado de dentro e o de fora.', limit: 'A membrana não toma decisões conscientes: sua seletividade depende das propriedades das moléculas, das proteínas e das condições do meio.' },
        { id: 'membrane-check', kind: 'check', prompt: 'Por que o oxigênio consegue atravessar a membrana com mais facilidade que um íon sódio?', options: ['Porque todo gás consome ATP', 'Porque oxigênio é pequeno e atravessa a bicamada; o íon precisa de proteína', 'Porque só o sódio existe dentro da célula', 'Porque a parede celular empurra o oxigênio'], answer: 1, explanation: 'A região interna da bicamada dificulta a passagem de partículas carregadas. O oxigênio pode difundir-se pela bicamada.' },
      ],
    },
    {
      id: 'transport', title: 'Entradas e saídas', objective: 'Distinguir transporte passivo, ativo e por vesículas em situações reais.',
      blocks: [
        { id: 'transport-list', kind: 'list', title: 'Três perguntas resolvem a maior parte dos casos', items: ['Vai a favor do gradiente? Pode ser difusão simples ou facilitada, sem gasto direto de ATP.', 'Vai contra o gradiente? Exige energia e uma proteína transportadora, como na bomba de sódio e potássio.', 'É uma carga grande? A membrana pode formar vesículas para entrada ou saída.'] },
        { id: 'transport-concept', kind: 'text', title: 'O que é um gradiente?', body: 'É uma diferença de concentração entre duas regiões. Na difusão, o fluxo líquido segue da maior para a menor concentração. No equilíbrio, partículas ainda se movem, mas sem fluxo líquido predominante.' },
        { id: 'transport-analogy', kind: 'analogy', title: 'Ladeira e elevador', body: 'Difundir-se a favor do gradiente lembra descer uma ladeira. Levar uma substância contra essa tendência lembra usar um elevador: é preciso fornecer energia.', limit: 'Moléculas não “querem” descer. O movimento resulta do comportamento de muitas partículas e pode depender também de cargas elétricas.' },
        { id: 'transport-text', kind: 'text', title: 'Quando a carga não cabe na porta', body: 'Na fagocitose, certas células envolvem partículas, como microrganismos. Na endocitose, materiais entram em vesículas; na exocitose, vesículas se fundem à membrana e liberam conteúdo.' },
        { id: 'transport-check', kind: 'check', prompt: 'Uma toxina bloqueia a produção de ATP. Qual processo tende a ser afetado diretamente?', options: ['Difusão de oxigênio pela bicamada', 'Bomba de sódio e potássio', 'Difusão facilitada a favor do gradiente', 'Movimento térmico das moléculas'], answer: 1, explanation: 'A bomba usa ATP para manter concentrações diferentes de Na+ e K+ dentro e fora da célula.' },
      ],
    },
    {
      id: 'osmosis', title: 'Água em movimento', objective: 'Prever o que acontece com células animais e vegetais em meios de diferentes concentrações.',
      blocks: [
        { id: 'osmosis-concept', kind: 'text', title: 'A pergunta certa: para onde vai a água?', body: 'Osmose é o movimento líquido de água através de uma membrana seletiva. Quando os solutos relevantes não atravessam facilmente a membrana, a água tende ao lado com maior concentração desses solutos.' },
        { id: 'osmosis-figure', kind: 'figure', title: 'Mude o meio, observe a célula', figureId: 'osmosis', caption: 'Escolha o meio externo e o tipo de célula para comparar a direção da água e o resultado.' },
        { id: 'osmosis-analogy', kind: 'analogy', title: 'Conservar alimentos com sal', body: 'Muito sal fora das células cria um meio hipertônico. A perda de água dificulta a atividade de vários microrganismos e ajuda na conservação.', limit: 'O resultado depende de quais solutos atravessam a membrana e de outras condições; salgar não esteriliza o alimento.' },
        { id: 'osmosis-list', kind: 'list', title: 'Animal e vegetal respondem de formas diferentes', items: ['Célula animal em meio muito hipotônico pode inchar e romper.', 'Célula vegetal em meio hipotônico fica túrgida; a parede limita a expansão.', 'Em meio hipertônico, a célula vegetal pode sofrer plasmólise.'] },
        { id: 'osmosis-check', kind: 'check', prompt: 'Uma célula vegetal é colocada em solução muito concentrada e sua membrana se afasta da parede. O que ocorreu?', options: ['Entrada de água e turgescência', 'Saída de água e plasmólise', 'Fotossíntese acelerada', 'Transporte ativo de toda a água'], answer: 1, explanation: 'Em meio hipertônico, a célula perde água por osmose. O conteúdo celular retrai e a membrana pode se afastar da parede.' },
      ],
    },
    {
      id: 'connections', title: 'Da célula ao ENEM', objective: 'Conectar energia, informação genética e estrutura celular a problemas do cotidiano.',
      blocks: [
        { id: 'connections-figure', kind: 'figure', title: 'Dois fluxos, uma célula viva', figureId: 'cell-workflow', caption: 'Acompanhe a transformação de energia e o caminho da informação para produzir proteínas.' },
        { id: 'connections-text', kind: 'text', title: 'Energia não nasce na mitocôndria', body: 'Na respiração celular, energia de moléculas orgânicas é transferida para ATP. Em eucariontes, a glicólise começa no citoplasma e etapas seguintes envolvem mitocôndrias. Células vegetais também respiram.' },
        { id: 'connections-analogy', kind: 'analogy', title: 'Da receita ao produto', body: 'Um trecho de DNA pode ser transcrito em RNA. No ribossomo, a sequência do RNA orienta a montagem de uma proteína. Algumas proteínas seguem para processamento e distribuição.', limit: 'DNA não é uma receita fixa para toda característica: ambiente, regulação gênica e interações entre moléculas também importam.' },
        { id: 'connections-check-1', kind: 'check', prompt: 'Uma célula secretora apresenta muitos ribossomos associados ao retículo e um Golgi desenvolvido. Qual atividade combina com essa organização?', options: ['Exportar proteínas', 'Construir parede de celulose', 'Deixar de produzir ATP', 'Eliminar o próprio DNA'], answer: 0, explanation: 'Ribossomos associados ao retículo produzem muitas proteínas destinadas à secreção ou às membranas; o Golgi participa de seu processamento e envio.' },
        { id: 'connections-check-2', kind: 'check', prompt: 'Uma planta fica sem luz por algumas horas, mas ainda dispõe de reservas orgânicas e oxigênio. Qual afirmação é correta?', options: ['Suas células deixam de respirar', 'Cloroplastos passam a fabricar DNA bacteriano', 'Suas células podem continuar a respiração celular', 'A parede celular substitui a mitocôndria'], answer: 2, explanation: 'Fotossíntese depende de luz, mas células vegetais também respiram e podem usar reservas orgânicas para produzir ATP.' },
        { id: 'connections-check-3', kind: 'check', prompt: 'Uma substância impede a tradução do RNA mensageiro. Qual consequência imediata é mais provável?', options: ['Parada direta da osmose', 'Redução da síntese de proteínas', 'Desaparecimento instantâneo da parede', 'Produção de mais glicose no núcleo'], answer: 1, explanation: 'A tradução ocorre nos ribossomos e monta cadeias de aminoácidos. Seu bloqueio reduz a produção de proteínas.' },
      ],
    },
  ],
};
