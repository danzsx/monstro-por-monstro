import type { InteractiveModule } from '../../shared/interactive-module';

/** Conteúdo editorial baseado estritamente no capítulo 6, pp. 143-150, de Feltre. */
export const COVALENT_BONDS_MODULE: InteractiveModule = {
  schemaVersion: 1,
  topicId: 'covalent-bonds',
  title: 'Ligações covalentes: o par que aproxima',
  intro: 'Acompanhe um único fio da ideia: quando átomos compartilham elétrons, como esse par vira uma ligação, uma fórmula e uma molécula?',
  sections: [
    {
      id: 'shared-pair',
      title: 'O par que aproxima',
      objective: 'Explicar a ligação covalente como uma união entre átomos estabelecida por pares de elétrons.',
      blocks: [
        {
          id: 'shared-pair-text',
          kind: 'text',
          title: 'Compartilhar para estabilizar',
          body: 'Na ligação covalente, a união entre os átomos é estabelecida por pares de elétrons. Em geral, ela aparece entre dois não metais, dois semimetais ou entre esses elementos e o hidrogênio: os átomos têm tendência a ganhar elétrons e podem compartilhá-los para se aproximar da configuração de um gás nobre.',
        },
        {
          id: 'shared-pair-list',
          kind: 'list',
          title: 'A regra que orienta o primeiro olhar',
          items: [
            'A regra do octeto indica 8 elétrons na camada mais externa.',
            'Se o átomo tem apenas a camada K, a referência é 2 elétrons.',
            'Na ligação covalente, o par compartilhado conta para os dois átomos.',
          ],
        },
        {
          id: 'shared-pair-check',
          kind: 'check',
          prompt: 'Na representação H-H, o traço entre os átomos indica:',
          options: [
            'Um par de elétrons compartilhado pelos dois hidrogênios.',
            'A transferência definitiva de um elétron de um H para o outro.',
            'Um par de prótons compartilhado pelos dois núcleos.',
            'A ausência de elétrons entre os núcleos.',
          ],
          answer: 0,
          explanation: 'O traço representa o par de elétrons que os dois átomos de hidrogênio passam a compartilhar. Como cada H fica com dois elétrons ao contar esse par, aproxima-se da configuração do hélio.',
        },
      ],
    },
    {
      id: 'bond-orders',
      title: 'Um par, dois ou três',
      objective: 'Distinguir ligações simples, duplas e triplas a partir do número de pares compartilhados.',
      blocks: [
        {
          id: 'bond-orders-text',
          kind: 'text',
          title: 'Os traços mostram quantos pares entram na ligação',
          body: 'Em H₂ e Cl₂, um par compartilhado forma uma ligação simples. Em O₂, os átomos compartilham dois pares e formam uma ligação dupla. Em N₂, compartilham três pares e formam uma ligação tripla. Os elétrons da camada de valência que não participam da ligação são pares isolados ou não ligantes.',
        },
        {
          id: 'bond-orders-list',
          kind: 'list',
          title: 'Leia o símbolo antes de ler o nome',
          items: [
            'H-H: uma ligação simples.',
            'O=O: uma ligação dupla.',
            'N≡N: uma ligação tripla.',
            'Pares que não participam da ligação continuam ao redor do átomo como pares isolados.',
          ],
        },
        {
          id: 'covalent-radius-text',
          kind: 'text',
          title: 'Uma medida da distância entre os núcleos',
          body: 'Entre átomos iguais, o raio covalente r é a metade do comprimento da ligação d: r = d/2. Quando os átomos são diferentes, o livro apresenta o comprimento como a soma dos raios covalentes: d = r₁ + r₂; esse raio pode variar conforme o átomo se liga a átomos diferentes.',
        },
        {
          id: 'bond-orders-check',
          kind: 'check',
          prompt: 'O que a fórmula N≡N informa sobre os dois átomos de nitrogênio?',
          options: [
            'Eles compartilham um par de elétrons.',
            'Eles compartilham três pares de elétrons.',
            'Um nitrogênio cede três elétrons ao outro.',
            'Eles não compartilham elétrons, apenas se aproximam.',
          ],
          answer: 1,
          explanation: 'Os três traços correspondem a três pares de elétrons compartilhados. Assim, cada nitrogênio completa seu octeto na representação da molécula N₂.',
        },
      ],
    },
    {
      id: 'formulas',
      title: 'Da distribuição à fórmula',
      objective: 'Interpretar as fórmulas de Lewis, estrutural plana e molecular e acompanhá-las em moléculas simples.',
      blocks: [
        {
          id: 'formulas-text',
          kind: 'text',
          title: 'Três maneiras de mostrar a mesma substância',
          body: 'Na fórmula eletrônica ou de Lewis, os elétrons da camada externa aparecem por sinais como pontos e cruzes. Na fórmula estrutural plana, os pares covalentes são representados por traços. A fórmula molecular informa quais elementos formam a molécula e quantos átomos de cada um aparecem, como H₂O, NH₃ e CO₂.',
        },
        {
          id: 'formulas-list',
          kind: 'list',
          title: 'Exemplos que o livro acompanha',
          items: [
            'HCl: hidrogênio e cloro unidos por uma ligação covalente.',
            'H₂O: H-O-H, com o oxigênio ligado a dois hidrogênios.',
            'NH₃: o nitrogênio ligado a três hidrogênios.',
            'CO₂: O=C=O, com duas ligações duplas entre o carbono e os oxigênios.',
          ],
        },
        {
          id: 'formulas-check',
          kind: 'check',
          prompt: 'Qual fórmula estrutural plana apresenta duas ligações duplas?',
          options: ['H-H', 'H-O-H', 'O=C=O', 'N≡N'],
          answer: 2,
          explanation: 'Em O=C=O, cada sinal de igualdade representa uma ligação dupla: o carbono compartilha dois pares com cada oxigênio.',
        },
      ],
    },
    {
      id: 'special-covalence',
      title: 'Quando o par já estava com um átomo',
      objective: 'Explicar a covalência especial e reconhecer o que acontece na formação do íon amônio.',
      blocks: [
        {
          id: 'special-covalence-text',
          kind: 'text',
          title: 'Covalência especial',
          body: 'Em alguns casos, o par eletrônico da ligação pertencia inicialmente a apenas um dos átomos. O livro chama isso de covalência especial e registra também o nome antigo ligação dativa; a seta indica o átomo doador e o átomo receptor do par. O par continua sendo contado ao redor dos dois átomos.',
        },
        {
          id: 'special-covalence-list',
          kind: 'list',
          title: 'Dois exemplos para acompanhar',
          items: [
            'Em SO₂ e SO₃, o enxofre pode fornecer um par para a ligação especial com o oxigênio.',
            'NH₃ + H⁺ → NH₄⁺: o H⁺ compartilha o par eletrônico livre que inicialmente pertencia ao nitrogênio.',
            'Depois da formação de NH₄⁺, as quatro ligações entre N e H são equivalentes; a seta é mantida apenas por finalidade didática.',
          ],
        },
        {
          id: 'special-covalence-check',
          kind: 'check',
          prompt: 'Na formação de NH₄⁺ a partir de NH₃ e H⁺, de onde vem o par usado na nova ligação?',
          options: [
            'Do par eletrônico livre que já pertencia ao nitrogênio.',
            'De dois prótons que se transformam em elétrons.',
            'De uma transferência definitiva de todos os elétrons do H⁺.',
            'De um par que não estava em nenhum dos participantes.',
          ],
          answer: 0,
          explanation: 'O NH₃ possui um par eletrônico livre. O H⁺ chega sem elétrons e compartilha esse par; por isso o exemplo ilustra uma covalência especial.',
        },
      ],
    },
    {
      id: 'molecular-or-ionic',
      title: 'Molécula ou aglomerado de íons?',
      objective: 'Distinguir compostos moleculares de compostos iônicos observando o tipo de ligação presente.',
      blocks: [
        {
          id: 'molecular-or-ionic-text',
          kind: 'text',
          title: 'A presença de uma ligação muda a classificação',
          body: 'Um composto é molecular quando apresenta exclusivamente ligações covalentes, como H₂O, CO₂ e SO₃. Um composto é iônico quando possui pelo menos uma ligação iônica, mesmo que também tenha ligações covalentes. Por isso, NaNO₃ e Na₂SO₄ são compostos iônicos: há ligações covalentes dentro dos íons poliatômicos, mas também há ligação iônica com Na⁺.',
        },
        {
          id: 'molecular-or-ionic-list',
          kind: 'list',
          title: 'A consequência estrutural',
          items: [
            'No composto molecular, falamos em moléculas.',
            'No composto iônico, o livro fala em aglomerados iônicos, não em moléculas.',
            'Íons formados por um átomo são simples; íons formados por vários átomos são compostos.',
            'Em geral, compostos iônicos são sólidos de pontos de fusão e ebulição elevados; compostos totalmente covalentes são, em geral, gases ou líquidos de ponto de ebulição baixo.',
          ],
        },
        {
          id: 'molecular-or-ionic-check',
          kind: 'check',
          prompt: 'Por que o NaNO₃ é classificado como composto iônico, embora o íon nitrato tenha ligações covalentes?',
          options: [
            'Porque todo composto que contém oxigênio é iônico.',
            'Porque basta haver pelo menos uma ligação iônica para o composto ser considerado iônico.',
            'Porque o nitrato não contém elétrons compartilhados.',
            'Porque compostos iônicos não podem conter mais de um elemento.',
          ],
          answer: 1,
          explanation: 'O NaNO₃ reúne Na⁺ e NO₃⁻ por ligação iônica. As ligações dentro do nitrato são covalentes, mas a presença da ligação iônica define a classificação do composto.',
        },
      ],
    },
    {
      id: 'octet-exceptions',
      title: 'O octeto tem exceções',
      objective: 'Reconhecer exemplos do próprio livro que apresentam menos, mais ou um número ímpar de elétrons ao redor do átomo central.',
      blocks: [
        {
          id: 'octet-exceptions-text',
          kind: 'text',
          title: 'Uma regra útil, mas não universal',
          body: 'O livro apresenta compostos que não obedecem à regra do octeto. BeH₂ tem 4 elétrons ao redor do berílio e BF₃ tem 6 ao redor do boro. Em PCl₅ e SF₆, o átomo central aparece com 10 e 12 elétrons, respectivamente. Esses casos de camada de valência expandida ocorrem em elementos do 3º período da Tabela Periódica para baixo.',
        },
        {
          id: 'octet-exceptions-list',
          kind: 'list',
          title: 'Outros desvios citados',
          items: [
            'NO, NO₂ e ClO₂ podem apresentar 7 elétrons ao redor do átomo central.',
            'Também foram produzidos compostos de gases nobres, como XeF₂ e XeF₄, com 10 e 12 elétrons ao redor do xenônio.',
            'O livro observa que esses compostos de gases nobres foram produzidos a partir de 1962 e envolvem átomos grandes.',
          ],
        },
        {
          id: 'octet-exceptions-check',
          kind: 'check',
          prompt: 'Qual exemplo apresenta menos de 8 elétrons ao redor do átomo central?',
          options: ['BeH₂, com 4 elétrons ao redor do berílio.', 'PCl₅, com 10 elétrons ao redor do fósforo.', 'SF₆, com 12 elétrons ao redor do enxofre.', 'XeF₄, com 12 elétrons ao redor do xenônio.'],
          answer: 0,
          explanation: 'BeH₂ é o exemplo de exceção com menos de 8 elétrons: o livro indica 4 elétrons ao redor do berílio. Os demais exemplos da questão têm camada de valência expandida.',
        },
      ],
    },
  ],
};
