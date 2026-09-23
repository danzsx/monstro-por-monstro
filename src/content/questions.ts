import { EnemMetadata, Question, TopicId } from '@/learning/types';

type Entry = [string, string[], number, string, EnemMetadata?];

function question(topicId: TopicId, i: number, e: Entry): Question {
  // Rotate alternatives so option position never signals correctness.
  const [prompt, original, answer, explanation, enemMetadata] = e;
  const shift = i % original.length;
  const options = [...original.slice(shift), ...original.slice(0, shift)];
  return {
    id: `${topicId}-${i}`,
    topicId,
    prompt,
    options,
    answer: (answer - shift + original.length) % original.length,
    explanation,
    difficulty: (i % 3 + 1) as 1 | 2 | 3,
    purpose: i < 6 ? 'diagnostic' : i < 12 ? 'practice' : 'review',
    ...(enemMetadata ? { enemMetadata } : {}),
  };
}

const enem = (year: number, color: string, qNum: number, ability: string, competency?: string): EnemMetadata => ({
  exam: 'ENEM',
  year,
  color,
  questionNumber: qNum,
  ability,
  competency,
  label: `ENEM ${year} · Caderno ${color} · Q. ${qNum} · ${ability}`,
});

export function mathQuestions(id: TopicId): Question[] {
  return Array.from({ length: 18 }, (_, i) => {
    const n = i + 2;
    if (id === 'proportions') {
      if (i % 3 === 0) return question(id, i, [`Uma mistura usa ${n} copos de concentrado e ${n * 3} de água. Qual é a razão concentrado : água?`, ['1 : 3', '3 : 1', '1 : 4', '4 : 1'], 0, `Divida os dois termos por ${n}: 1 : 3. Concentrado : mistura seria 1 : 4. A ordem e as quantidades comparadas importam.`, enem(2023, 'Azul', 136 + (i % 5), 'H11')]);
      if (i % 3 === 1) return question(id, i, [`Uma receita usa ${n} xícaras de farinha para ${n * 2} porções. Para ${n * 6} porções, quantas xícaras são necessárias?`, [`${n * 2}`, `${n * 3}`, `${n * 6}`, `${n}`], 1, `As porções foram multiplicadas por 3. A farinha também: ${n} × 3 = ${n * 3}.`, enem(2022, 'Amarelo', 142 + (i % 5), 'H12')]);
      return question(id, i, [`Em um mapa de escala 1 : 1.000, uma distância mede ${n} cm. Quanto isso representa em metros?`, [`${n}`, `${n * 1000}`, `${n * 10}`, `${n * 100}`], 2, `${n} × 1.000 = ${n * 1000} cm. Divida por 100 para converter: ${n * 10} metros.`, enem(2024, 'Cinza', 151 + (i % 5), 'H11')]);
    }
    if (i % 3 === 0) return question(id, i, [`${n} cadernos custam R$ ${n * 8}. Mantido o preço unitário, quanto custam ${n + 3} cadernos?`, [`R$ ${(n + 3) * 8}`, `R$ ${n * 8 + 3}`, `R$ ${(n + 3) * 4}`, `R$ ${n * 8}`], 0, `Cada caderno custa R$ 8. Quantidade e custo são diretos: ${n + 3} × 8 = ${(n + 3) * 8}.`, enem(2023, 'Azul', 145 + (i % 5), 'H12')]);
    if (i % 3 === 1) return question(id, i, [`${n} máquinas iguais fazem um lote em 12 horas. Com ${n * 2} máquinas, nas mesmas condições, quanto tempo leva?`, ['24 horas', '6 horas', '12 horas', '3 horas'], 1, 'O número de máquinas dobra e o tempo cai pela metade. São grandezas inversas: 12 ÷ 2 = 6 horas.', enem(2021, 'Rosa', 139 + (i % 5), 'H12')]);
    return question(id, i, [`Um carro percorre ${n * 60} km em ${n} horas a velocidade constante. Quantos quilômetros percorre em ${n + 2} horas?`, [`${n * 60 + 2}`, `${n * 60}`, `${(n + 2) * 60}`, `${(n + 2) * 30}`], 2, `A velocidade é 60 km/h. Distância e tempo são diretos: 60 × ${n + 2} = ${(n + 2) * 60} km.`, enem(2024, 'Azul', 160 + (i % 5), 'H13')]);
  });
}

const cells: Entry[] = [
  ['Qual estrutura controla as trocas da célula com o meio?', ['Ribossomo', 'Membrana plasmática', 'Cromossomo', 'Nucléolo'], 1, 'A membrana plasmática possui permeabilidade seletiva.', enem(2023, 'Azul', 94, 'H14')],
  ['O que caracteriza uma célula procariótica?', ['Não ter DNA', 'Não ter membrana', 'Não ter núcleo delimitado', 'Não produzir proteínas'], 2, 'Procariontes possuem DNA, ribossomos e membrana, mas não núcleo delimitado por envoltório.'],
  ['Qual organela participa da respiração aeróbia em eucariontes?', ['Mitocôndria', 'Lisossomo', 'Golgi', 'Vacúolo'], 0, 'Mitocôndrias participam da produção de ATP pela respiração celular.', enem(2022, 'Amarelo', 105, 'H15')],
  ['Onde ocorre a síntese de proteínas?', ['Lisossomos', 'Ribossomos', 'Centríolos', 'Membrana nuclear'], 1, 'Ribossomos traduzem o RNA mensageiro em cadeias de aminoácidos.'],
  ['Uma célula animal em meio muito concentrado em solutos tende a:', ['Ganhar água', 'Não trocar água', 'Perder água', 'Produzir cloroplastos'], 2, 'Na osmose, a água tende ao meio com maior concentração efetiva de solutos.', enem(2024, 'Cinza', 99, 'H14')],
  ['Qual estrutura existe em bactérias e células animais?', ['Núcleo delimitado', 'Cloroplasto', 'Mitocôndria', 'Ribossomo'], 3, 'Ambas possuem ribossomos. Bactérias não possuem organelas membranosas.'],
  ['Uma célula secreta muitas proteínas. Qual estrutura deve ser abundante?', ['Retículo endoplasmático rugoso', 'Centríolo', 'Parede celular', 'Cloroplasto'], 0, 'O retículo rugoso possui ribossomos associados à produção de proteínas para secreção e membranas.', enem(2021, 'Azul', 111, 'H15')],
  ['Qual estrutura modifica e empacota proteínas para secreção?', ['Mitocôndria', 'Complexo golgiense', 'Nucléolo', 'Centríolo'], 1, 'O complexo golgiense processa e distribui substâncias em vesículas.'],
  ['Mover solutos contra o gradiente exige:', ['Difusão simples', 'Osmose', 'Transporte ativo', 'Difusão facilitada'], 2, 'Transporte ativo utiliza energia para mover substâncias contra o gradiente.'],
  ['Cloroplastos estão associados a qual processo?', ['Digestão', 'Respiração exclusiva', 'Produção bacteriana', 'Fotossíntese'], 3, 'Cloroplastos realizam fotossíntese em plantas e algas. Células vegetais também respiram.'],
  ['Qual é a função principal dos lisossomos?', ['Digestão intracelular', 'Fotossíntese', 'Guardar cromossomos', 'Produzir ribossomos'], 0, 'Lisossomos contêm enzimas que degradam materiais e componentes celulares.'],
  ['Uma célula vegetal em água fica túrgida porque:', ['Perde solutos', 'A água entra e a parede limita a expansão', 'O núcleo desaparece', 'A membrana impede qualquer troca'], 1, 'A água entra por osmose e a parede oferece resistência mecânica.'],
  ['Uma toxina bloqueia ribossomos. Qual processo é diretamente afetado?', ['Osmose', 'Síntese de proteínas', 'Difusão de oxigênio', 'Entrada de água'], 1, 'Sem ribossomos funcionais, a tradução de RNA em proteínas é prejudicada.'],
  ['Por que um antibiótico dirigido à parede bacteriana pode agir seletivamente?', ['Células humanas não têm parede celular', 'Humanos não têm DNA', 'Bactérias não têm membrana', 'Humanos não têm ribossomos'], 0, 'Células humanas possuem membrana, mas não parede bacteriana.'],
  ['Um glóbulo vermelho em solução hipotônica pode romper porque:', ['Perde água', 'Forma parede', 'Recebe água por osmose', 'Perde ribossomos'], 2, 'A água tende a entrar. Sem parede celular, o excesso pode provocar lise.'],
  ['Qual par reúne organelas membranosas?', ['Ribossomo e centríolo', 'Ribossomo e núcleo', 'Centríolo e nucléolo', 'Mitocôndria e Golgi'], 3, 'Mitocôndrias e complexo golgiense são delimitados por membranas.'],
  ['O DNA de uma bactéria fica principalmente:', ['No nucleoide', 'Nas mitocôndrias', 'No cloroplasto', 'Fora da célula'], 0, 'O nucleoide contém o cromossomo bacteriano e não tem envoltório nuclear.'],
  ['Uma célula muscular demanda muito ATP. Qual organela contribui para isso?', ['Lisossomo', 'Mitocôndria', 'Golgi', 'Vacúolo'], 1, 'Mitocôndrias contribuem para a produção de ATP pela respiração celular.'],
];

const genes: Entry[] = [
  ['Um gene é, simplificadamente:', ['Uma célula', 'Uma região do DNA com informação funcional', 'Uma organela', 'Um tecido'], 1, 'Um gene é uma região do DNA com informação para um produto funcional, como RNA ou proteína.', enem(2023, 'Azul', 119, 'H16')],
  ['Alelos são:', ['Células idênticas', 'Organelas', 'Versões de um mesmo gene', 'Proteínas sempre iguais'], 2, 'Alelos são variantes de um gene em um mesmo locus.'],
  ['Qual genótipo é heterozigoto?', ['Aa', 'AA', 'aa', 'Todos'], 0, 'Aa tem dois alelos diferentes; AA e aa são homozigotos.'],
  ['Em Aa × aa, qual proporção esperada é aa?', ['0%', '50%', '75%', '100%'], 1, 'Aa fornece A ou a. aa fornece apenas a. Metade das combinações é aa.'],
  ['Fenótipo se refere:', ['Só à sequência do DNA', 'Apenas aos gametas', 'Às características observáveis', 'Só ao número de cromossomos'], 2, 'Características observáveis resultam da interação entre genótipo e ambiente.', enem(2024, 'Amarelo', 101, 'H16')],
  ['Para esse gene, um indivíduo Aa forma gametas:', ['Todos Aa', 'Só AA', 'Só aa', 'A ou a'], 3, 'Os alelos segregam: cada gameta recebe um dos alelos.'],
  ['Em Aa × Aa, qual a chance esperada de AA?', ['25%', '50%', '75%', '100%'], 0, 'As combinações são AA, Aa, aA e aa; uma em quatro é AA.'],
  ['Um alelo dominante:', ['É sempre mais comum', 'Manifesta seu efeito no heterozigoto em dominância completa', 'É sempre benéfico', 'Só existe em homens'], 1, 'Dominância descreve expressão, não frequência nem vantagem.'],
  ['Em dominância completa, AA e Aa têm:', ['Sempre fenótipos distintos', 'Mesmo genótipo', 'Mesmo fenótipo para a característica', 'Só alelos recessivos'], 2, 'O fenótipo dominante se manifesta em ambos, embora os genótipos sejam diferentes.'],
  ['Em AA × aa, espera-se:', ['Todos AA', 'Todos aa', 'Metade AA', 'Todos Aa'], 3, 'Um genitor fornece A e o outro fornece a.'],
  ['A primeira lei de Mendel descreve:', ['A segregação dos alelos nos gametas', 'O desaparecimento de recessivos', 'Genes criados por esforço', 'A união de núcleos em toda célula'], 0, 'Os dois alelos se separam na formação dos gametas.'],
  ['Aa × Aa gera quatro descendentes. É garantido que um seja aa?', ['Sim, sempre', 'Não: 25% é uma probabilidade por descendente', 'Sim, na mesma espécie', 'Não, pois aa é impossível'], 1, 'Proporções são expectativas probabilísticas, não garantias em amostras pequenas.'],
  ['Um cruzamento-teste com aa pode revelar:', ['A idade do organismo', 'Se o genitor dominante é AA ou Aa', 'O número de organelas', 'O ambiente'], 1, 'Um descendente recessivo revela que o genitor dominante fornece o alelo a.'],
  ['A proporção genotípica esperada de Aa × Aa é:', ['1 AA : 2 Aa : 1 aa', '3 AA : 1 aa', 'Todos Aa', '1 AA : 1 aa'], 0, 'AA, Aa, aA e aa: Aa e aA representam o mesmo genótipo.'],
  ['Uma característica muda com a alimentação. Isso mostra que:', ['Genes nunca influenciam', 'O DNA sempre muda', 'O ambiente pode influenciar o fenótipo', 'Alelos desaparecem'], 2, 'O ambiente afeta características sem necessariamente alterar a sequência do DNA.'],
  ['Em aa × aa, espera-se qual genótipo?', ['AA', 'Aa', 'AA ou aa', 'aa'], 3, 'Ambos os genitores fornecem apenas o alelo a.'],
  ['Dois alelos iguais caracterizam um indivíduo:', ['Homozigoto', 'Heterozigoto', 'Sempre dominante', 'Sempre haploide'], 0, 'Homozigose significa alelos iguais, como AA ou aa.'],
  ['Em Aa × aa, sob dominância completa, a chance de fenótipo dominante é:', ['25%', '50%', '75%', '100%'], 1, 'Metade dos descendentes esperados é Aa e metade aa.'],
];

export const biologyQuestions = (id: 'cytology' | 'genetics') => (id === 'cytology' ? cells : genes).map((e, i) => question(id, i, e));

// Physics: kinematics, newton-laws, calorimetry
const kinematicsEntries: Entry[] = [
  ['Um ônibus percorre 120 km em 2 horas. Qual é a velocidade escalar média?', ['40 km/h', '60 km/h', '80 km/h', '120 km/h'], 1, 'Velocidade média é a razão entre o deslocamento total e o tempo decorrido: 120 / 2 = 60 km/h.', enem(2023, 'Azul', 112, 'H20')],
  ['Para converter uma velocidade de km/h para m/s, deve-se:', ['Multiplicar por 3,6', 'Dividir por 3,6', 'Multiplicar por 10', 'Dividir por 60'], 1, 'Como 1 km = 1000 m e 1 h = 3600 s, divide-se por 3,6. Exemplo: 72 km/h = 20 m/s.'],
  ['Em um gráfico espaço x tempo (s x t) retilíneo uniforme, a inclinação da reta representa:', ['A aceleração', 'A velocidade', 'A força resultante', 'A energia cinética'], 1, 'No gráfico s x t, a razão delta s / delta t equivale numericamente à velocidade do corpo.'],
  ['Um corredor percorre 100 metros em 10 segundos. Sua velocidade média em km/h é:', ['10 km/h', '25 km/h', '36 km/h', '45 km/h'], 2, '100 m / 10 s = 10 m/s. Convertendo para km/h: 10 × 3,6 = 36 km/h.', enem(2021, 'Amarelo', 98, 'H17')],
  ['Se um móvel mantém velocidade constante diferente de zero, sua aceleração é:', ['Crescente', 'Nula', 'Igual à velocidade', 'Constante e positiva'], 1, 'Aceleração mede a variação da velocidade no tempo. Se a velocidade não varia, a aceleração é zero.'],
  ['Dois carros partem juntos. Carro A tem v = 80 km/h e Carro B tem v = 100 km/h. Após 2h, a distância entre eles é:', ['20 km', '40 km', '80 km', '180 km'], 1, 'A diferença de velocidade é 20 km/h. Em 2 horas: 20 × 2 = 40 km.'],
  ['Um trem de 200 m de comprimento atravessa uma ponte de 400 m a 20 m/s. O tempo de travessia total é:', ['10 s', '20 s', '30 s', '40 s'], 2, 'O deslocamento total para a travessia completa é 200 + 400 = 600 m. Tempo = 600 / 20 = 30 segundos.'],
  ['A aceleração escalar média é definida matematicamente por:', ['delta s / delta t', 'delta v / delta t', 'm × a', 'v × delta t'], 1, 'Aceleração média é a taxa de variação da velocidade dividida pelo intervalo de tempo decorrido.'],
  ['Um carro desacelera de 30 m/s até o repouso em 6 segundos. A magnitude da aceleração média é:', ['2 m/s²', '5 m/s²', '6 m/s²', '15 m/s²'], 1, 'delta v = 30 m/s em delta t = 6 s. Aceleração = 30 / 6 = 5 m/s².'],
  ['No movimento retilíneo uniformemente variado (MRUV), a aceleração é:', ['Zero', 'Constante e não nula', 'Variável', 'Inversamente proporcional ao tempo'], 1, 'A característica definidora do MRUV é uma aceleração constante ao longo de todo o intervalo.'],
  ['A área sob a curva em um gráfico de velocidade x tempo (v x t) representa:', ['A aceleração', 'O deslocamento escalar', 'A força peso', 'A velocidade inicial'], 1, 'A integral ou área sob o gráfico v x t fornece a variação de posição (deslocamento delta s).'],
  ['Se um veículo dobra sua velocidade média no mesmo trajeto, o tempo de viagem:', ['Dobra', 'Permanece constante', 'Cai pela metade', 'Quadruplica'], 2, 'Velocidade e tempo são grandezas inversamente proporcionais para uma mesma distância percorrida.'],
  ['Uma viagem de 300 km foi feita com 60 km/h na primeira metade e 100 km/h na segunda metade. A distância total é dividida em:', ['Dois tempos iguais', 'Dois trechos de 150 km', 'Dois consumos iguais', 'Três etapas'], 1, 'Metade do trajeto significa 150 km para cada trecho, com tempos diferentes em cada um.'],
  ['Em 2 horas e meia (2,5 h), um avião a 600 km/h percorre:', ['1200 km', '1500 km', '1800 km', '2400 km'], 1, 'Delta s = v × delta t = 600 × 2,5 = 1500 km.'],
  ['Um ciclista com velocidade de 5 m/s pedala durante 2 minutos. A distância percorrida é:', ['10 m', '100 m', '600 m', '1000 m'], 2, '2 minutos equivalem a 120 segundos. Delta s = 5 × 120 = 600 metros.'],
  ['Se um móvel inverte o sentido do movimento, necessariamente sua velocidade escalar:', ['Permanece positiva', 'Passa por zero', 'Fica infinita', 'Não se altera'], 1, 'Para mudar o sentido em uma trajetória contínua unidimensional, a velocidade instantânea anula-se momentaneamente.'],
  ['O velocímetro de um carro indica:', ['A velocidade escalar média', 'A velocidade instantânea', 'A aceleração média', 'O deslocamento vetorial'], 1, 'O velocímetro afere a rapidez naquele exato instante, ou seja, a velocidade escalar instantânea.'],
  ['Um corpo em queda livre no vácuo próximo à Terra tem aceleração aproximadamente de:', ['0 m/s²', '9,8 m/s²', '100 m/s²', 'Variável com o peso'], 1, 'No vácuo, todos os corpos caem com a mesma aceleração da gravidade, cerca de 9,8 m/s².'],
];

const newtonEntries: Entry[] = [
  ['A primeira lei de Newton (Lei da Inércia) afirma que um corpo tende a manter seu estado de repouso ou MRU se:', ['A força resultante for nula', 'A gravidade for zero', 'A velocidade for crescente', 'A massa for nula'], 0, 'Sem força resultante, não há variação de velocidade; o corpo mantém sua inércia.', enem(2024, 'Azul', 119, 'H20')],
  ['O uso do cinto de segurança em automóveis justifica-se principalmente pelo princípio da:', ['Ação e reação', 'Inércia', 'Conservação de energia térmica', 'Dilatação térmica'], 1, 'Em uma frenagem, os passageiros tendem a continuar em movimento pela inércia de seus corpos.'],
  ['A segunda lei de Newton relaciona força resultante, massa e aceleração pela equação:', ['F = m / a', 'F = m × a', 'F = v / t', 'F = m × g × h'], 1, 'A força resultante aplicada a um corpo é diretamente proporcional à sua aceleração: F = m · a.'],
  ['Se uma força resultante de 20 N é aplicada a um bloco de 4 kg, a aceleração produzida é:', ['5 m/s²', '16 m/s²', '24 m/s²', '80 m/s²'], 0, 'a = F / m = 20 / 4 = 5 m/s².', enem(2022, 'Azul', 103, 'H20')],
  ['A terceira lei de Newton afirma que o par ação-reação atua:', ['No mesmo corpo e se anula', 'Em corpos diferentes e tem mesma intensidade', 'Em tempos diferentes', 'Com intensidades opostas e desiguais'], 1, 'Ação e reação são forças mútuas aplicadas em corpos distintos; por isso, nunca se anulam mutuamente.'],
  ['A força peso de um corpo na superfície terrestre é calculada por:', ['P = m / g', 'P = m × g', 'P = m × v', 'P = g / m'], 1, 'O peso é a força de atração gravitacional: P = massa × aceleração da gravidade (g).'],
  ['A força normal exercida por uma superfície horizontal sobre um bloco em repouso:', ['É a reação do peso do bloco', 'Equilibra o peso do bloco na vertical', 'Tem intensidade sempre maior que o peso', 'Puxa o bloco para baixo'], 1, 'A normal é força de contato com o piso. Ela equilibra o peso na horizontal, mas a reação do peso atua no centro da Terra.'],
  ['A força de atrito estático máximo entre duas superfícies depende:', ['Apenas da área de contato', 'Do coeficiente de atrito e da força normal', 'Da velocidade do corpo', 'Do volume do bloco'], 1, 'Fat_max = mi_estatico × Normal. Não depende em primeira aproximação da área de contato macroscópica.'],
  ['Quando um bloco desliza sobre uma mesa com atrito, o atrito que atua é:', ['Estático', 'Cinético (ou dinâmico)', 'Nulo', 'Gravitacional'], 1, 'Com movimento relativo entre as superfícies, o atrito atuante é o atrito cinético.'],
  ['A massa de um astronauta na Lua em comparação com a Terra:', ['É 6 vezes menor', 'É idêntica', 'É 6 vezes maior', 'É nula'], 1, 'A massa é quantidade intrínseca de matéria e não muda; o que diminui na Lua é a força peso.'],
  ['Se a velocidade de um carro é constante em linha reta, a força resultante sobre ele:', ['É máxima', 'É igual a zero', 'Aponta para a frente', 'Aponta para trás'], 1, 'Velocidade constante em linha reta significa aceleração nula; pela 2ª lei, Força Resultante = 0.'],
  ['Um elevador sobe com aceleração para cima. A força que o chão exerce sobre os pés do passageiro:', ['É menor que o peso', 'É maior que o peso', 'É igual a zero', 'Inverte de sentido'], 1, 'Para acelerar para cima, Normal - Peso = m·a, logo Normal = Peso + m·a (aparente aumento de peso).'],
  ['O atrito entre os pneus de um carro e o asfalto em uma frenagem sem travar as rodas é:', ['Estático', 'Cinético', 'Nulo', 'Centrípeto exclusivo'], 0, 'Se a roda não escorrega/arrasta, o ponto de contato está instantaneamente em repouso: atrito estático.'],
  ['A unidade de força no Sistema Internacional (SI) é:', ['Joule', 'Watt', 'Newton', 'Pascal'], 2, 'O Newton (N) equivale a kg·m/s² no Sistema Internacional.'],
  ['Uma força de 10 N para a direita e outra de 4 N para a esquerda geram uma resultante de:', ['14 N para a direita', '6 N para a direita', '6 N para a esquerda', '40 N para o centro'], 1, 'Forças colineares em sentidos opostos se subtraem: 10 - 4 = 6 N na direção da maior força.'],
  ['O empuxo exercido por um fluido sobre um corpo submerso decorre:', ['Da inércia do corpo', 'Da diferença de pressão entre a parte inferior e superior', 'Da terceira lei isolada', 'Da ausência de gravidade'], 1, 'A pressão aumenta com a profundidade; a resultante das forças de pressão para cima é o empuxo.'],
  ['Ao chutar uma bola, o jogador exerce uma força nela e a bola:', ['Não exerce força no pé', 'Exerce força de mesma intensidade e sentido oposto no pé', 'Exerce força menor', 'Anula a força do chute'], 1, 'Pela 3ª lei de Newton, o pé empurra a bola e a bola empurra o pé com força de mesmo módulo e sentido oposto.'],
  ['Qual grandeza física representa a medida quantitativa da inércia de um corpo?', ['A velocidade', 'A aceleração', 'A massa', 'O volume'], 2, 'Quanto maior a massa de um corpo, maior sua inércia, ou seja, maior a resistência a variações de velocidade.'],
];

const calorimetryEntries: Entry[] = [
  ['O calor é definido em Física como:', ['A temperatura interna de um corpo', 'Energia térmica em trânsito devido a uma diferença de temperatura', 'A quantidade de frio armazenada', 'A capacidade de queima de um combustível'], 1, 'Calor é energia em trânsito espontâneo do corpo de maior para o de menor temperatura.', enem(2023, 'Azul', 131, 'H21')],
  ['A quantidade de calor sensível necessária para variar a temperatura de uma massa sem mudar de fase é dada por:', ['Q = m × L', 'Q = m × c × delta T', 'Q = P × t', 'Q = C / delta T'], 1, 'Equação fundamental da calorimetria: Q = m · c · delta T.'],
  ['O calor latente está associado a processos em que ocorre:', ['Aumento contínuo da temperatura', 'Mudança de estado físico a temperatura constante', 'Variação da massa do corpo', 'Transformação de calor em trabalho puro'], 1, 'O calor latente (Q = m · L) promove a quebra/formação de ligações na mudança de fase sem mudar a temperatura.', enem(2022, 'Azul', 92, 'H21')],
  ['A água possui alto calor específico. Isso significa que ela:', ['Aquece e esfria muito rápido', 'Demora mais para aquecer e para esfriar', 'Não consegue absorver calor', 'Evapora instantaneamente'], 1, 'Alto calor específico exige grande quantidade de energia para cada grau de variação térmica.'],
  ['O fenômeno das brisas marítimas durante o dia decorre de:', ['A terra aquecer mais rápido que o mar devido ao menor calor específico', 'O mar aquecer mais rápido que a terra', 'A ausência de vento no oceano', 'O vapor d água ser mais denso que o solo'], 0, 'A areia/terra tem menor calor específico, aquecendo mais rápido e gerando convecção do mar para a terra.', enem(2019, 'Azul', 116, 'H21')],
  ['Dois corpos a temperaturas diferentes isolados termicamente atingem o equilíbrio térmico quando:', ['Suas massas se tornam iguais', 'Suas temperaturas se igualam', 'A soma das energias é nula', 'O calor latente se esgota'], 1, 'O equilíbrio térmico ocorre quando cessa a troca de calor, ou seja, quando as temperaturas se igualam.'],
  ['A capacidade térmica (C) de um corpo relaciona-se com o calor específico (c) por:', ['C = m / c', 'C = m × c', 'C = c / m', 'C = delta T / m'], 1, 'Capacidade térmica é a propriedade do corpo inteiro: C = massa × calor específico.'],
  ['A transferência de calor que ocorre sem a necessidade de matéria (através do vácuo) é:', ['Condução', 'Convecção', 'Radiação (ou irradiação)', 'Sublimação'], 2, 'A radiação térmica propaga-se por ondas eletromagnéticas (infravermelho), ocorrendo no vácuo.'],
  ['A garrafa térmica utiliza paredes espelhadas duplas com vácuo intermediário para reduzir:', ['Condução, convecção e radiação', 'Apenas a pressão atmosférica', 'O peso da garrafa', 'A umidade do ar'], 0, 'O vácuo impede condução e convecção; as paredes espelhadas refletem a radiação térmica.'],
  ['Para fundir 100 g de gelo a 0 °C (L_fusao = 80 cal/g), a quantidade de calor necessária é:', ['80 cal', '800 cal', '8000 cal', '100 cal'], 2, 'Q = m · L = 100 × 80 = 8000 calorias.'],
  ['Se 200 g de água recebem 1000 cal (c = 1 cal/g°C), a variação de temperatura é:', ['2 °C', '5 °C', '10 °C', '50 °C'], 1, 'delta T = Q / (m · c) = 1000 / (200 × 1) = 5 °C.'],
  ['A convecção térmica ocorre caracteristicamente em:', ['Sólidos cristalinos rígidos', 'Fluidos (líquidos e gases)', 'No vácuo absoluto', 'Apenas em metais nobres'], 1, 'Convecção envolve transporte de matéria com densidades diferentes e ocorre apenas em fluidos.'],
  ['O congelador costuma ficar na parte superior das geladeiras convencionais porque:', ['O ar quente desce e o ar frio sobe', 'O ar frio é mais denso e desce por convecção natural', 'Facilita a circulação de calor por condução sólida', 'A gravidade empurra o calor'], 1, 'O ar resfriado no topo torna-se mais denso e desce, criando correntes de convecção que refrigeram o interior.'],
  ['Na ebulição da água pura ao nível do mar sob 1 atm, a temperatura durante a vaporização:', ['Sobe até 200 °C', 'Permanece constante em 100 °C', 'Cai para 0 °C', 'Oscila aleatoriamente'], 1, 'Durante a mudança de fase de substâncias puras em pressão constante, a temperatura permanece estável.'],
  ['Em uma garrafa com água e gelo em equilíbrio a 1 atm, a temperatura da mistura é:', ['-5 °C', '0 °C', '4 °C', '10 °C'], 1, 'O equilíbrio termodinâmico gelo-água pura à pressão de 1 atm se dá a 0 °C.'],
  ['Uma caloria (cal) equivale no Sistema Internacional aproximadamente a:', ['1 Joule', '4,18 Joules', '100 Joules', '1000 Joules'], 1, 'O equivalente mecânico do calor estabelece que 1 caloria equivale a aproximadamente 4,18 J.'],
  ['Durante o dia ensolarado, a areia da praia queima o pé enquanto a água do mar está fresca porque:', ['A areia absorve mais luz e tem menor calor específico', 'A água reflete todo o calor', 'A areia é um fluido', 'A água não recebe radiação solar'], 0, 'A menor capacidade térmica mássica da areia faz sua temperatura subir muito mais com a mesma radiação recebida.'],
  ['Em um calorímetro ideal sem perdas externas, a soma das trocas de calor entre corpos é:', ['Maior que zero', 'Igual a zero', 'Menor que zero', 'Infinita'], 1, 'Conservação de energia: Q_recebido + Q_cedido = 0.'],
];

export const physicsQuestions = (id: 'kinematics' | 'newton-laws' | 'calorimetry') => {
  const map = { kinematics: kinematicsEntries, 'newton-laws': newtonEntries, calorimetry: calorimetryEntries };
  return map[id].map((e, i) => question(id, i, e));
};

// Chemistry: stoichiometry, solutions
const stoichiometryEntries: Entry[] = [
  ['A Lei da Conservação das Massas (Lavoisier) em recipientes fechados estabelece que:', ['A massa dos produtos é maior que a dos reagentes', 'A massa total dos reagentes é igual à massa total dos produtos', 'Gases não possuem massa', 'O volume sempre se conserva'], 1, 'Na natureza nada se cria, nada se perde, tudo se transforma: a massa total permanece invariável.', enem(2024, 'Azul', 124, 'H24')],
  ['A constante de Avogadro indica que 1 mol de qualquer entidade contém aproximadamente:', ['1000 partículas', '6,02 × 10²³ partículas', '12 partículas', '10⁶ partículas'], 1, '1 mol reúne 6,02 × 10²³ átomos, moléculas ou íons.'],
  ['Na reação 2 H2 + O2 -> 2 H2O, a proporção em mols entre H2, O2 e H2O é:', ['1 : 1 : 1', '2 : 1 : 2', '2 : 2 : 1', '4 : 2 : 2'], 1, 'Os coeficientes estequiométricos da equação balanceada definem a proporção molar: 2 : 1 : 2.'],
  ['A massa molar da água (H2O, com H=1 e O=16 g/mol) é:', ['17 g/mol', '18 g/mol', '32 g/mol', '34 g/mol'], 1, 'M = 2 × 1 + 16 = 18 g/mol.'],
  ['Quantos mols de CO2 são produzidos pela queima completa de 1 mol de metano (CH4 + 2 O2 -> CO2 + 2 H2O)?', ['0,5 mol', '1 mol', '2 mols', '4 mols'], 1, 'A proporção molar entre CH4 e CO2 na equação balanceada é de 1 : 1.', enem(2023, 'Azul', 115, 'H24')],
  ['O reagente limitante em uma reação química é aquele que:', ['Sobra no final', 'É consumido primeiro e limita a quantidade máxima de produto', 'Possui menor massa molar sempre', 'Não participa da reação'], 1, 'O reagente em proporção estequiométrica insuficiente se esgota antes, determinando o rendimento da reação.'],
  ['Na síntese da amônia N2 + 3 H2 -> 2 NH3, para reagir com 3 mols de N2 são necessários:', ['1 mol de H2', '3 mols de H2', '6 mols de H2', '9 mols de H2'], 3, 'A proporção molar é de 1 N2 para 3 H2. Para 3 mols de N2: 3 × 3 = 9 mols de H2.'],
  ['Se o rendimento real de uma reação é de 80% do teórico esperado de 50 g, a massa obtida é:', ['30 g', '40 g', '45 g', '50 g'], 1, 'Rendimento = 50 g × 0,80 = 40 gramas produzidas.'],
  ['Nas CNTP (0 °C e 1 atm), 1 mol de qualquer gás ideal ocupa o volume de:', ['10 L', '22,4 L', '25 L', '44,8 L'], 1, 'O volume molar de um gás ideal nas condições normais de temperatura e pressão é 22,4 L/mol.'],
  ['Qual massa de oxigênio (O2, 32 g/mol) há em 0,5 mol?', ['16 g', '32 g', '64 g', '8 g'], 0, 'Massa = n × M = 0,5 × 32 = 16 gramas.'],
  ['A Lei das Proporções Definidas foi formulada por:', ['Lavoisier', 'Proust', 'Dalton', 'Boyle'], 1, 'Proust estabeleceu que uma substância composta se forma pela união de seus elementos em proporções fixas de massa.'],
  ['Em 2 mols de glicose (C6H12O6), o número de átomos de carbono é:', ['6 átomos', '12 átomos', '12 × 6,02 × 10²³ átomos', '24 átomos'], 2, 'Cada mol tem 6 mols de C. Em 2 mols: 12 mols de C = 12 × 6,02 × 10²³ átomos de carbono.'],
  ['A combustão completa de hidrocarbonetos na presença de oxigênio suficiente produz tipicamente:', ['Apenas monóxido de carbono', 'Dióxido de carbono (CO2) e água (H2O)', 'Apenas fuligem', 'Ácido sulfúrico'], 1, 'A queima completa gera CO2 e H2O, liberando energia térmica.'],
  ['Se 40 g de reagentes são misturados em sistema aberto e os produtos pesam 32 g, isso indica:', ['A lei de Lavoisier falhou', 'Liberação de 8 g de produtos gasosos para o ambiente', 'Criação de novos átomos', 'Destruição de matéria'], 1, 'Gases liberados em sistemas abertos escapam para a atmosfera, reduzindo a massa aparente na balança.'],
  ['A massa de 1 mol de gás carbônico (CO2, C=12, O=16) é:', ['28 g', '44 g', '56 g', '60 g'], 1, '12 + 2 × 16 = 44 g/mol.'],
  ['O número de mols presentes em 88 g de CO2 (44 g/mol) é:', ['1 mol', '2 mols', '3 mols', '4 mols'], 1, 'n = m / M = 88 / 44 = 2 mols.'],
  ['Ao queimar 24 g de carbono (C=12 g/mol) com oxigênio em excesso, quantos mols de CO2 se formam?', ['1 mol', '2 mols', '3 mols', '4 mols'], 1, '24 g de C correspondem a 24 / 12 = 2 mols de C. Pela proporção 1 : 1, geram-se 2 mols de CO2.'],
  ['Um processo com pureza de reagente de 90% em 100 g de minério significa que:', ['Há 100 g de substância pura', 'Há 90 g de substância útil e 10 g de impurezas', 'A reação não ocorre', 'A perda foi de 90%'], 1, 'Pureza representa a fração mássica ativa do composto de interesse na amostra bruta.'],
];

const solutionsEntries: Entry[] = [
  ['Em uma solução aquosa de cloreto de sódio (sal de cozinha em água), a água atua como:', ['Soluto', 'Solvente', 'Precipitado', 'Catalisador'], 1, 'Solvente é a substância que dissolve o soluto e costuma estar em maior proporção na fase homogênea.', enem(2023, 'Azul', 102, 'H25')],
  ['A concentração comum (C) de uma solução é a relação entre:', ['Massa do soluto em gramas e volume da solução em litros (g/L)', 'Volume do solvente e massa da solução', 'Número de mols de soluto e peso da Terra', 'Temperatura e pressão'], 0, 'Concentração comum: C = m_soluto / V_solucao (em g/L).'],
  ['Se 20 g de açúcar são dissolvidos em água suficiente para 500 mL (0,5 L) de solução, a concentração é:', ['10 g/L', '20 g/L', '40 g/L', '100 g/L'], 2, 'C = 20 g / 0,5 L = 40 g/L.'],
  ['Na diluição de uma solução pela adição de solvente puro, a quantidade de soluto:', ['Aumenta', 'Permanece constante', 'Diminui', 'Anula-se'], 1, 'Adicionar solvente aumenta o volume e reduz a concentração, mas a massa de soluto dissolvido não varia.'],
  ['A fórmula fundamental da diluição relacionando concentração inicial e final é:', ['C1 × C2 = V1 × V2', 'C1 × V1 = C2 × V2', 'C1 / V1 = C2 / V2', 'C1 + V1 = C2 + V2'], 1, 'Como m_soluto = C · V se conserva: C1 · V1 = C2 · V2.', enem(2022, 'Amarelo', 118, 'H25')],
  ['A concentração molar ou molaridade (M) expressa a quantidade de matéria em:', ['Gramas por litro', 'Mols de soluto por litro de solução (mol/L)', 'Porcentagem de volume', 'Graus Celsius'], 1, 'Molaridade M = n_soluto / V_solucao (em mol/L).'],
  ['Uma solução saturada é aquela que:', ['Ainda pode dissolver mais soluto facilmente', 'Atingiu a quantidade máxima de soluto que o solvente consegue dissolver naquela temperatura', 'Não possui solvente', 'Ferve a 0 °C'], 1, 'Saturação indica que o limite de solubilidade do soluto no solvente naquela temperatura foi alcançado.'],
  ['Se 100 mL de uma solução 2 mol/L são diluídos para 400 mL, a nova concentração molar é:', ['0,5 mol/L', '1 mol/L', '4 mol/L', '8 mol/L'], 0, 'C1 · V1 = C2 · V2 -> 2 × 100 = C2 × 400 -> C2 = 200 / 400 = 0,5 mol/L.'],
  ['O soro fisiológico comercial é uma solução aquosa de NaCl a aproximadamente:', ['0,9% em massa', '9% em massa', '20% em massa', '0,01% em massa'], 0, 'O soro fisiológico é uma solução isotônica a cerca de 0,9% m/v de NaCl.', enem(2020, 'Azul', 133, 'H25')],
  ['Uma mistura homogênea é aquela que apresenta:', ['Duas ou mais fases visíveis', 'Apenas uma única fase uniforme', 'Precipitado no fundo obrigatoriamente', 'Partículas sedimentadas'], 1, 'Soluções verdadeiras são misturas homogêneas monofásicas em escala molecular.'],
  ['O que acontece com a solubilidade da maioria dos sais sólidos em água quando a temperatura aumenta?', ['Diminui', 'Aumenta na maioria dos casos (dissolução endotérmica)', 'Permanece constante', 'Cai a zero'], 1, 'Para a grande maioria dos sais com dissolução endotérmica, o aumento de temperatura eleva o coeficiente de solubilidade.'],
  ['Ao evaporar parte da água de uma solução aquosa de sal sem atingir a saturação:', ['A massa de sal diminui', 'A concentração de sal aumenta', 'O volume aumenta', 'A concentração diminui'], 1, 'A perda de solvente reduz o volume, tornando a solução restante mais concentrada em soluto.'],
  ['A fração molar de um componente em uma mistura é dada pela razão entre:', ['Seu número de mols e o número total de mols da solução', 'Sua massa e o volume do frasco', 'Sua temperatura e a pressão externa', 'O número de elétrons'], 0, 'X_i = n_i / n_total. A soma das frações molares é sempre igual a 1.'],
  ['Uma solução com precipitado no fundo (corpo de chão) em equilíbrio é classificada como:', ['Insaturada', 'Saturada com corpo de fundo', 'Hipersensível', 'Gasosa pura'], 1, 'A fase líquida está no limite de saturação e o excesso não dissolvido repousa como precipitado.'],
  ['Se dissolvemos 58,5 g de NaCl (M = 58,5 g/mol) em água para obter 1 L de solução, a molaridade é:', ['0,5 mol/L', '1 mol/L', '2 mol/L', '58,5 mol/L'], 1, '58,5 g equivalem a exatamente 1 mol. Em 1 litro de solução: 1 mol/L.'],
  ['Título em massa (tau) é definido como:', ['Massa do soluto dividida pela massa total da solução', 'Volume do solvente dividido por 100', 'Massa de solvente por litro', 'Número de prótons'], 0, 'tau = m_soluto / m_solucao. Pode ser expresso em porcentagem multiplicando por 100.'],
  ['Ao misturar duas soluções de mesmo soluto com concentrações diferentes:', ['A concentração final é a média ponderada pelos volumes', 'A concentração final é sempre menor que ambas', 'O soluto se anula', 'A temperatura vai a zero'], 0, 'C_final = (C1·V1 + C2·V2) / (V1 + V2).'],
  ['Qual método físico é utilizado para separar o sal dissolvido da água do mar?', ['Filtração simples', 'Destilação ou evaporação do solvente', 'Decantação estática', 'Peneiração mecânica'], 1, 'Como o sal está dissolvido em escala iônica, a separação exige evaporação ou destilação do solvente.'],
];

export const chemistryQuestions = (id: 'stoichiometry' | 'solutions') => {
  const map = { stoichiometry: stoichiometryEntries, solutions: solutionsEntries };
  return map[id].map((e, i) => question(id, i, e));
};

// Ecology: ecology
const ecologyEntries: Entry[] = [
  ['Em uma cadeia alimentar típica, os organismos autotróficos fotossintetizantes atuam como:', ['Consumidores primários', 'Produtores', 'Decompositores exclusivos', 'Parasitas'], 1, 'Produtores convertem energia luminosa em energia química, constituindo a base trófica do ecossistema.', enem(2024, 'Azul', 98, 'H28')],
  ['Ao longo dos níveis tróficos de uma cadeia alimentar, o fluxo de energia é:', ['Cíclico e crescente', 'Unidirecional e decrescente', 'Bidirecional e constante', 'Infinito'], 1, 'A energia dissipa-se como calor em cada nível metabólico (respiração/calor), diminuindo ao longo da cadeia.', enem(2023, 'Azul', 120, 'H29')],
  ['A bioacumulação ou magnificação trófica de metais pesados (como o mercúrio) atinge maior concentração:', ['Nos produtores', 'Nos consumidores primários', 'Nos consumidores do topo da cadeia', 'Na água pura'], 2, 'Substâncias não biodegradáveis lipossolúveis acumulam-se em tecidos e concentram-se no topo da cadeia trófica.', enem(2022, 'Amarelo', 109, 'H28')],
  ['No ciclo do carbono, o processo biológico responsável por retirar CO2 da atmosfera é:', ['A respiração celular', 'A fotossíntese', 'A combustão de madeira', 'A decomposição bacteriana'], 1, 'A fotossíntese vegetal e algal fixa o carbono inorgânico do CO2 na forma de matéria orgânica.'],
  ['A queima de combustíveis fósseis intensifica o efeito estufa principalmente pela liberação de:', ['Oxigênio puro', 'Dióxido de carbono (CO2) e metano (CH4)', 'Nitrogênio inerte', 'Ozônio na estratosfera'], 1, 'Gases do efeito estufa retêm radiação infravermelha na troposfera, elevando a temperatura média global.', enem(2021, 'Azul', 114, 'H29')],
  ['No ciclo do nitrogênio, bactérias do gênero Rhizobium associadas a leguminosas realizam:', ['Desnitrificação', 'Fixação biológica do nitrogênio atmosférico (N2)', 'Fotossíntese profunda', 'Eutrofização direta'], 1, 'Bactérias fixadoras transformam o N2 gasoso em formas nitrogenadas assimiláveis pelas plantas.'],
  ['A eutrofização de corpos d água causada por esgoto ou fertilizantes provoca inicialmente:', ['Morte instantânea de peixes por frio', 'Proliferação explosiva de algas na superfície', 'Seca imediata do lago', 'Diminuição dos nutrientes orgânicos'], 1, 'O excesso de fósforo e nitrogênio causa floração de algas, bloqueando a luz solar para as camadas inferiores.'],
  ['Após a proliferação das algas na eutrofização, a decomposição bacteriana aeróbia leva a:', ['Aumento do oxigênio dissolvido', 'Queda drástica do oxigênio dissolvido e morte de peixes', 'Purificação natural da água', 'Aumento da fotossíntese profunda'], 1, 'Bactérias decompositoras consomem o oxigênio da água, gerando hipóxia/anóxia e mortandade aquática.'],
  ['Os decompositores (fungos e bactérias) desempenham papel ecológico indispensável na:', ['Criação de novos elementos químicos', 'Reciclagem da matéria orgânica em inorgânica', 'Destruição de toda a energia do planeta', 'Fixação exclusiva de oxigênio'], 1, 'Decompositores convertem matéria orgânica morta em nutrientes inorgânicos reutilizáveis pelos produtores.'],
  ['A relação ecológica em que abelhas polinizam flores e obtêm néctar com benefício mútuo obrigatório ou benéfico é:', ['Predação', 'Mutualismo', 'Parasitismo', 'Competição interespecífica'], 1, 'Ambas as espécies obtêm vantagens adaptativas na interação mutualística.'],
  ['A introdução de espécies exóticas invasoras em um bioma frequentemente gera:', ['Preservação do bioma nativo', 'Perda de biodiversidade nativa por competição ou predação sem inimigos naturais', 'Extinção imediata da espécie invasora', 'Aumento da estabilidade trófica'], 1, 'Sem predadores e parasitas locais, a espécie exótica prolifera e desequilibra as populações nativas.'],
  ['Em uma pirâmide ecológica de biomassa invertida típica de ecossistemas marinhos abertos:', ['O fitoplâncton tem menor biomassa instantânea que o zooplâncton devido à rápida reprodução', 'O topo tem mais energia que a base', 'Os carnívoros não comem peixes', 'A luz não atinge a água'], 0, 'O fitoplâncton possui alta taxa de renovação e reprodução rápida, sustentando biomassa maior de zooplâncton momentâneo.'],
  ['O nicho ecológico de uma espécie descreve:', ['Apenas o endereço físico onde ela vive', 'Seu papel funcional, hábitos alimentares e interações no ecossistema', 'Sua classificação taxonômica', 'Apenas seu tamanho corporal'], 1, 'Habitat é o local onde a espécie vive; nicho é o seu papel e modo de vida funcional no ecossistema.'],
  ['A sucessão ecológica primária ocorre em:', ['Áreas desmatadas com solo preservado', 'Ambientes previamente estéreis sem solo formado (rocha nua, lava vulcânica resfriada)', 'Campos cultivados abandonados', 'Áreas de queimada recente'], 1, 'Sucessão primária inicia-se em substratos recém-formados sem comunidade biológica pré-existente.'],
  ['Os organismos pioneiros em uma sucessão primária sobre rochas nuas costumam ser:', ['Árvores de grande porte', 'Líquens e musgos', 'Aves migratórias', 'Mamíferos herbívoros'], 1, 'Líquens resistem a condições extremas e iniciam a meteorização da rocha para formação de solo inicial.'],
  ['A camada de ozônio (O3) na estratosfera protege a vida na Terra contra:', ['Radiação ultravioleta solar nociva (UV)', 'Meteoros de grande porte', 'Radiação infravermelha', 'Chuva ácida'], 0, 'O ozônio estratosférico absorve grande parte dos raios UV prejudiciais ao DNA dos seres vivos.'],
  ['A chuva ácida resulta da reação de óxidos de enxofre (SOx) e nitrogênio (NOx) com a água da chuva, formando:', ['Glicose e amido', 'Ácido sulfúrico (H2SO4) e ácido nítrico (HNO3)', 'Ozônio superficial', 'Bases alcalinas'], 1, 'Emissões industriais e de queima veicular reagem com a umidade atmosférica formando ácidos fortes.'],
  ['A capacidade de suporte de um ambiente representa:', ['O número infinito de espécies que cabem no planeta', 'O tamanho populacional máximo que os recursos do ambiente conseguem sustentar', 'A massa da biosfera', 'A velocidade do vento'], 1, 'A resistência ambiental impõe um teto ao crescimento exponencial, estabilizando a população na capacidade de suporte.'],
];

export const ecologyQuestions = () => ecologyEntries.map((e, i) => question('ecology', i, e));

const natureExpansionEntries: Record<'human-health' | 'evolution' | 'electricity' | 'acid-base' | 'electrochemistry' | 'atomic-models' | 'ecosystems', Entry[]> = {
  ecosystems: [
    ['Um lago contém peixes, algas, bactérias, água, sais minerais e luz. O conjunto dos organismos e das condições físicas que interagem forma:', ['Uma população', 'Uma comunidade', 'Um ecossistema', 'Um nicho'], 2, 'Ecossistema inclui a comunidade de seres vivos e os fatores abióticos em interação.'],
    ['Qual alternativa apresenta apenas fatores abióticos de uma floresta?', ['Fungos, temperatura e aves', 'Luz, água e temperatura', 'Plantas, solo e insetos', 'Bactérias, umidade e algas'], 1, 'Fatores abióticos são componentes físicos e químicos do ambiente, como luz, água e temperatura.'],
    ['A competição entre duas espécies por alimento é uma interação:', ['Abiótica', 'Biótica', 'Geológica', 'Climática'], 1, 'Interações entre organismos, como competição, são fatores bióticos.'],
    ['O local onde uma espécie vive corresponde ao seu:', ['Nicho ecológico', 'Habitat', 'Nível trófico', 'Bioma'], 1, 'Habitat é o espaço onde a espécie vive; nicho descreve seu modo de vida e suas relações.'],
    ['O papel de uma espécie, seus recursos alimentares e seus horários de atividade ajudam a descrever seu:', ['Habitat', 'Nicho ecológico', 'Ecótono', 'Clima'], 1, 'O nicho ecológico abrange as condições, recursos e interações associados ao modo de vida da espécie.'],
    ['Um grupo de capivaras da mesma espécie que vive em uma várzea constitui:', ['Uma população', 'Uma comunidade', 'Um ecossistema', 'Uma biosfera'], 0, 'População reúne indivíduos da mesma espécie que ocupam uma área no mesmo período.'],
    ['Peixes, plantas aquáticas e insetos de um mesmo lago, considerados em conjunto, formam:', ['Uma população', 'Uma comunidade', 'Um fator abiótico', 'Um nicho'], 1, 'Comunidade é o conjunto de populações de espécies diferentes que vivem e interagem numa área.'],
    ['Após a retirada da mata ciliar, a água de um rio fica mais quente e turva. Essa situação mostra que:', ['Uma mudança abiótica pode afetar os organismos do ecossistema', 'Fatores bióticos nunca dependem do ambiente físico', 'Habitat e ecossistema são sinônimos', 'A temperatura é um fator biótico'], 0, 'Remover vegetação altera sombra, erosão e condições da água, afetando os organismos que vivem no rio.'],
    ['Uma área degradada perdeu espécies nativas e abrigo para animais. Qual ação ajuda a recuperar as relações do ecossistema?', ['Plantar espécies nativas adequadas ao local', 'Introduzir espécies exóticas sem avaliar impactos', 'Eliminar todos os decompositores', 'Manter fragmentos isolados entre si'], 0, 'A restauração com espécies nativas pode recuperar habitat e recursos para organismos locais; a escolha depende das condições do ambiente.'],
  ],
  'atomic-models': [
    ['No modelo de Dalton, o átomo era representado como:', ['Uma esfera maciça e indivisível', 'Um núcleo com elétrons em órbitas', 'Uma nuvem eletrônica', 'Uma esfera positiva com elétrons incrustados'], 0, 'Dalton propôs átomos como partículas maciças e indivisíveis, modelo conhecido como bola de bilhar.'],
    ['Os experimentos com raios catódicos levaram Thomson a propor:', ['A existência do elétron', 'A existência do nêutron', 'A órbita quantizada', 'A radioatividade natural'], 0, 'Os raios catódicos eram feixes de partículas negativas: os elétrons.'],
    ['O experimento da lâmina de ouro de Rutherford indicou que o átomo:', ['Tem um núcleo pequeno e positivo e é majoritariamente vazio', 'É uma esfera maciça sem espaços vazios', 'Não possui partículas negativas', 'Tem carga positiva distribuída em toda a massa'], 0, 'O desvio de poucas partículas alfa indicou um núcleo pequeno, denso e positivo; a maioria atravessou a lâmina.'],
    ['No modelo de Bohr para o hidrogênio, os elétrons:', ['Ocupam níveis de energia definidos', 'Podem ter qualquer energia sem restrição', 'Ficam presos no núcleo', 'São partículas positivas'], 0, 'Bohr propôs níveis de energia quantizados e transições associadas à emissão ou absorção de energia.'],
    ['Quando um elétron passa de um nível mais energético para outro menos energético, o átomo:', ['Emite energia', 'Absorve energia', 'Perde prótons', 'Transforma-se necessariamente em íon negativo'], 0, 'A diferença de energia pode ser emitida como fóton durante a transição para um nível inferior.'],
    ['A existência do núcleo atômico foi inferida principalmente a partir:', ['Do espalhamento de partículas alfa', 'Da eletrólise da água', 'Da balança de Cavendish', 'Da decomposição térmica de sais'], 0, 'A dispersão em grandes ângulos de poucas partículas alfa revelou uma região central concentrada.'],
    ['O modelo de Thomson ficou conhecido como “pudim de passas” porque descrevia:', ['Elétrons negativos inseridos em uma massa positiva', 'Prótons inseridos em elétrons positivos', 'Um núcleo cercado por órbitas quantizadas', 'Uma nuvem de nêutrons sem carga'], 0, 'Thomson imaginou a carga positiva distribuída, com elétrons negativos no interior do átomo.'],
    ['Espectros de emissão em linhas são compatíveis com:', ['Transições entre níveis de energia discretos', 'Qualquer energia possível para elétrons ligados', 'A ausência de interação entre luz e matéria', 'A emissão de prótons pelo núcleo em toda transição'], 0, 'Cada linha corresponde a uma diferença específica entre níveis de energia.'],
    ['O modelo atual descreve os elétrons principalmente por:', ['Regiões de probabilidade chamadas orbitais', 'Órbitas planetárias perfeitamente definidas', 'Pontos imóveis entre prótons', 'Uma esfera positiva sem estrutura'], 0, 'O modelo quântico descreve probabilidades de localização, não trajetórias planetárias determinadas.'],
    ['Ao derramar água salgada na chama, ela fica amarela. Qual explicação relaciona melhor o fenômeno à estrutura atômica?', ['O sódio excitado emite fótons ao retornar a níveis de menor energia', 'O sal transforma o gás de cozinha em cloro', 'O núcleo do sódio se funde com o oxigênio', 'As proteínas da água passam a emitir elétrons'], 0, 'O calor excita elétrons dos átomos de sódio. Ao retornarem a níveis de menor energia, emitem fótons cuja energia corresponde à luz amarela observada.'],
    ['Ao formar compostos em reações químicas, qual ideia de Dalton continua útil para explicar as proporções entre elementos?', ['Os átomos se combinam em proporções de números inteiros simples', 'Átomos são indivisíveis em qualquer transformação', 'Todos os átomos de um elemento têm sempre a mesma massa', 'Elétrons ocupam órbitas fixas em todos os elementos'], 0, 'A composição dos compostos pode ser descrita por proporções definidas entre átomos. Outros postulados de Dalton foram revistos após a descoberta de partículas subatômicas e isótopos.'],
    ['Uma equipe compara um feixe de partículas antes e depois de atravessar uma lâmina metálica. A maioria passa, mas poucas sofrem grande desvio. Qual conclusão é apoiada por esse resultado?', ['O átomo é majoritariamente vazio e concentra carga positiva num núcleo pequeno', 'A carga positiva está distribuída igualmente por todo o átomo', 'O átomo é uma esfera maciça indivisível', 'Os elétrons ocupam necessariamente níveis de energia quantizados'], 0, 'A passagem da maioria das partículas e o grande desvio de poucas são evidências compatíveis com um núcleo pequeno e positivo, como no modelo de Rutherford.'],
  ],
  'human-health': [
    ['Qual sistema transporta oxigênio e nutrientes pelo corpo?', ['Digestório', 'Circulatório', 'Excretor', 'Endócrino'], 1, 'O sistema circulatório distribui gases, nutrientes, hormônios e resíduos pelo organismo.'],
    ['A troca de gases entre o ar e o sangue ocorre principalmente:', ['Nos alvéolos pulmonares', 'No estômago', 'Nos rins', 'No intestino grosso'], 0, 'A grande superfície dos alvéolos permite difusão de O2 para o sangue e de CO2 para o ar.'],
    ['A insulina contribui para:', ['Aumentar a glicose no sangue', 'Reduzir a glicose no sangue ao favorecer sua entrada nas células', 'Produzir hemácias', 'Filtrar a urina'], 1, 'A insulina é um hormônio pancreático que favorece a captação de glicose e ajuda a regular a glicemia.'],
    ['A principal função das vilosidades do intestino delgado é:', ['Produzir bile', 'Ampliar a absorção de nutrientes', 'Filtrar o sangue', 'Realizar trocas gasosas'], 1, 'Vilosidades e microvilosidades ampliam a superfície de absorção intestinal.'],
    ['Os rins ajudam a manter a homeostase porque:', ['Produzem oxigênio', 'Regulam água e sais e eliminam resíduos na urina', 'Realizam digestão', 'Bombeiam sangue'], 1, 'A filtração renal remove resíduos e participa do equilíbrio de água, íons e pH.'],
    ['Vacinas estimulam principalmente:', ['Memória imunológica', 'Digestão de proteínas', 'Produção de bile', 'Coagulação'], 0, 'A vacinação prepara o sistema imune para responder com maior rapidez a um agente específico.'],
    ['Uma pessoa com baixa produção de hemoglobina pode apresentar menor transporte de:', ['Glicose', 'Oxigênio', 'Ureia', 'Bile'], 1, 'A hemoglobina nas hemácias liga-se ao oxigênio e permite seu transporte pelo sangue.'],
    ['O sistema nervoso coordena respostas rápidas por meio de:', ['Impulsos elétricos e neurotransmissores', 'Enzimas digestivas', 'Anticorpos circulantes', 'Filtração glomerular'], 0, 'Neurônios conduzem sinais elétricos e comunicam-se por neurotransmissores nas sinapses.'],
    ['Em uma situação de exercício, a frequência respiratória aumenta para:', ['Diminuir a entrada de oxigênio', 'Atender à maior demanda de oxigênio e eliminar mais CO2', 'Interromper a circulação', 'Impedir a produção de ATP'], 1, 'A atividade muscular eleva o consumo de oxigênio e a produção de dióxido de carbono.'],
  ],
  evolution: [
    ['Na seleção natural, indivíduos com características hereditárias vantajosas tendem a:', ['Deixar mais descendentes em certo ambiente', 'Mudar intencionalmente seus genes', 'Parar de competir', 'Transmitir características adquiridas pelo esforço'], 0, 'A seleção altera frequências de características herdáveis ao longo de gerações conforme o sucesso reprodutivo.'],
    ['Fósseis são evidências importantes porque:', ['Registram organismos e mudanças ao longo do tempo geológico', 'Mostram que todas as espécies surgiram juntas', 'Revelam apenas espécies atuais', 'Provam que ambientes nunca mudaram'], 0, 'O registro fóssil permite investigar organismos do passado e transformações da biodiversidade.'],
    ['Estruturas homólogas indicam:', ['Uma origem evolutiva compartilhada, mesmo com funções diferentes', 'Sempre a mesma função', 'Ausência de parentesco', 'Adaptação idêntica ao mesmo ambiente'], 0, 'Homologia aponta semelhanças de origem e plano estrutural, ainda que a função tenha divergido.'],
    ['A resistência bacteriana a antibióticos aumenta quando:', ['Bactérias resistentes sobrevivem e se reproduzem sob pressão do antibiótico', 'Cada bactéria decide adaptar-se', 'O antibiótico cria sempre a mutação necessária', 'O uso do remédio elimina a seleção'], 0, 'Variantes resistentes podem ser favorecidas pela seleção quando o antibiótico elimina as suscetíveis.'],
    ['A deriva genética tende a ter maior efeito em:', ['Populações pequenas', 'Populações infinitas', 'Indivíduos isolados sem reprodução', 'Ambientes sem mutações'], 0, 'Em populações pequenas, eventos ao acaso podem alterar bastante as frequências dos alelos.'],
    ['A especiação pode ocorrer quando populações ficam:', ['Isoladas e acumulam diferenças hereditárias', 'Completamente idênticas para sempre', 'Sem qualquer reprodução', 'Em contato com o mesmo alimento'], 0, 'Isolamento reprodutivo e divergência ao longo do tempo podem originar novas espécies.'],
    ['Uma árvore filogenética representa hipóteses sobre:', ['Relações de parentesco evolutivo', 'Tamanho corporal exato', 'Ordem de importância dos seres vivos', 'Idade individual dos organismos'], 0, 'Ramos compartilham ancestrais comuns e representam hipóteses de parentesco.'],
    ['Mutações são relevantes à evolução porque:', ['Podem gerar novas variantes hereditárias', 'Sempre beneficiam o organismo', 'Ocorrem apenas por necessidade', 'Eliminam a reprodução sexuada'], 0, 'Mutações introduzem variação genética; seus efeitos podem ser neutros, prejudiciais ou vantajosos.'],
    ['A seleção artificial difere da natural porque:', ['A escolha de quais organismos se reproduzem é feita por humanos', 'Não envolve hereditariedade', 'Ocorre sem variação', 'Sempre aumenta a diversidade'], 0, 'Na seleção artificial, pessoas favorecem características ao escolher reprodutores.'],
  ],
  electricity: [
    ['Um aparelho ligado a 120 V conduz corrente de 2 A. Sua potência é:', ['60 W', '122 W', '240 W', '2400 W'], 2, 'P = U × I = 120 × 2 = 240 W.'],
    ['O consumo de energia elétrica depende da potência e do:', ['Tempo de uso', 'Formato do plugue', 'Número de tomadas da casa', 'Material da parede'], 0, 'A energia consumida é potência multiplicada pelo tempo: E = P × t.'],
    ['Em uma instalação doméstica, aparelhos em paralelo recebem, em geral:', ['A mesma tensão da rede', 'Sempre a mesma corrente', 'Tensão zero', 'Correntes sem relação com a carga'], 0, 'Em paralelo, cada ramo está conectado à mesma diferença de potencial da fonte.'],
    ['Um resistor de 6 Ω ligado a 12 V conduz corrente de:', ['0,5 A', '2 A', '6 A', '72 A'], 1, 'Pela lei de Ohm, I = U/R = 12/6 = 2 A.'],
    ['O efeito Joule corresponde à transformação de energia elétrica em:', ['Energia térmica', 'Energia nuclear', 'Massa', 'Energia química sempre'], 0, 'A corrente em um material resistivo pode aquecê-lo, convertendo energia elétrica em térmica.'],
    ['Um aparelho de 1000 W funciona por 2 horas. O consumo é:', ['0,5 kWh', '2 kWh', '1000 kWh', '2000 kWh'], 1, '1 kW × 2 h = 2 kWh.'],
    ['O disjuntor protege o circuito ao:', ['Interromper correntes excessivas', 'Aumentar a tensão da rede', 'Armazenar energia', 'Reduzir a resistência dos aparelhos'], 0, 'O disjuntor abre o circuito quando a corrente ultrapassa o limite previsto.'],
    ['Para a mesma tensão, um aparelho de maior potência normalmente:', ['Solicita maior corrente', 'Solicita menor corrente', 'Não consome energia', 'Tem resistência infinita'], 0, 'Como P = U × I, mantendo U, maior potência corresponde a maior corrente.'],
    ['Trocar uma lâmpada por outra de mesma iluminação e menor potência tende a:', ['Reduzir o consumo ao longo do mesmo tempo de uso', 'Aumentar o consumo', 'Manter corrente sempre zero', 'Aumentar a tensão da residência'], 0, 'Com menor potência e igual tempo de uso, a energia consumida diminui.'],
  ],
  'acid-base': [
    ['Uma solução com pH 3 é, em relação a uma de pH 5:', ['Menos ácida', 'Mais ácida', 'Neutra', 'Necessariamente básica'], 1, 'Em soluções aquosas diluídas, menor pH indica maior acidez.'],
    ['Uma neutralização entre ácido e base geralmente produz:', ['Sal e água', 'Oxigênio e metal', 'Apenas gás hidrogênio', 'Glicose'], 0, 'Em uma neutralização, íons H+ e OH− formam água, e os demais íons podem formar um sal.'],
    ['Um indicador ácido-base serve para:', ['Sugerir o caráter ácido ou básico por mudança de cor', 'Medir diretamente a massa', 'Separar todos os sais', 'Aumentar a concentração de H+'], 0, 'Indicadores mudam de cor conforme a faixa de pH do meio.'],
    ['Ao diluir um ácido com água, mantendo a quantidade de soluto, o pH tende a:', ['Aumentar em direção à neutralidade', 'Diminuir sempre até zero', 'Permanecer obrigatoriamente em 1', 'Tornar-se negativo'], 0, 'A diluição reduz a concentração de íons ácidos e aproxima o pH de 7.'],
    ['A chuva ácida está associada principalmente a óxidos de:', ['Enxofre e nitrogênio', 'Hélio e neônio', 'Sódio e potássio metálicos', 'Carbono sólido e ouro'], 0, 'SOx e NOx podem reagir na atmosfera e originar ácidos que se depositam com a chuva.'],
    ['Em água, uma base de Arrhenius aumenta a concentração de:', ['OH−', 'H+', 'N2', 'Elétrons livres no vácuo'], 0, 'Bases de Arrhenius liberam íons hidróxido em solução aquosa.'],
    ['Uma solução tampão resiste a:', ['Variações bruscas de pH após pequenas adições de ácido ou base', 'Qualquer mudança de temperatura', 'Toda evaporação', 'Passagem de corrente em metal'], 0, 'Tampões atenuam variações de pH por conterem pares ácido-base conjugados.'],
    ['No equilíbrio químico, as reações direta e inversa:', ['Continuam ocorrendo com velocidades iguais', 'Param completamente', 'Têm sempre concentrações iguais', 'Produzem apenas reagentes'], 0, 'Equilíbrio dinâmico significa velocidades iguais, não interrupção das reações.'],
    ['Aumentar a concentração de um reagente em equilíbrio tende a favorecer:', ['Seu consumo pela reação que forma produtos', 'A interrupção de toda reação', 'A diminuição obrigatória de todos os produtos', 'A mudança da constante de equilíbrio pela concentração'], 0, 'O sistema responde à perturbação deslocando a composição; a constante depende principalmente da temperatura.'],
  ],
  electrochemistry: [
    ['Em uma pilha em funcionamento, a energia química é convertida em:', ['Energia elétrica', 'Energia sonora apenas', 'Massa', 'Energia gravitacional'], 0, 'Reações espontâneas de oxirredução geram diferença de potencial e corrente elétrica.'],
    ['Oxidação corresponde à:', ['Perda de elétrons', 'Ganho de elétrons', 'Perda de prótons sempre', 'Formação de água'], 0, 'A espécie oxidada perde elétrons e aumenta seu número de oxidação.'],
    ['Redução corresponde ao:', ['Ganho de elétrons', 'Aumento obrigatório da massa', 'Ganho de nêutrons', 'Aumento do número de oxidação'], 0, 'A espécie reduzida recebe elétrons e diminui seu número de oxidação.'],
    ['Na eletrólise, uma fonte externa de energia elétrica promove:', ['Uma reação não espontânea', 'Uma reação de combustão obrigatória', 'A interrupção do movimento iônico', 'Apenas aquecimento sem reação'], 0, 'A eletrólise usa energia elétrica para forçar uma transformação química não espontânea.'],
    ['A corrosão do ferro é um processo de:', ['Oxidação do metal', 'Fusão nuclear', 'Neutralização ácido-base apenas', 'Destilação'], 0, 'O ferro perde elétrons e forma produtos de corrosão, processo favorecido por água e oxigênio.'],
    ['Em uma pilha, os elétrons percorrem o circuito externo do:', ['Ânodo para o cátodo', 'Cátodo para o ânodo', 'Sal para a ponte salina', 'Eletrólito para a solução sem fio'], 0, 'Na pilha, a oxidação ocorre no ânodo e os elétrons chegam ao cátodo pelo circuito externo.'],
    ['A ponte salina de uma pilha ajuda a:', ['Manter a neutralidade elétrica das soluções', 'Transportar elétrons diretamente entre eletrodos', 'Impedir toda reação', 'Aumentar a massa dos elétrons'], 0, 'Íons migram pela ponte salina e evitam acúmulo de carga nos compartimentos.'],
    ['Revestir ferro com zinco pode protegê-lo porque o zinco:', ['Oxida-se preferencialmente, atuando como proteção sacrificial', 'Impede qualquer contato com elétrons', 'É um gás nobre', 'Transforma ferro em plástico'], 0, 'O zinco é oxidado antes do ferro e pode protegê-lo mesmo se o revestimento for danificado.'],
    ['Na eletrólise, a quantidade de produto formado depende da carga elétrica que passou; carga é:', ['Corrente multiplicada pelo tempo', 'Tensão dividida pela massa', 'Potência dividida pela área', 'Resistência multiplicada pelo volume'], 0, 'Q = I × t; as leis de Faraday relacionam a carga à quantidade de transformação química.'],
  ],
};

export function natureExpansionQuestions(id: keyof typeof natureExpansionEntries, topicId: TopicId = id): Question[] {
  const entries = natureExpansionEntries[id];
  const sectionSize = Math.ceil(entries.length / 3);
  return entries.map((entry, index) => ({
    ...question(topicId, index, entry),
    purpose: index < sectionSize ? 'diagnostic' : index < sectionSize * 2 ? 'practice' : 'review',
  }));
}

// Languages: language-functions
const languageEntries: Entry[] = [
  ['A função emotiva (ou expressiva) da linguagem destaca-se pelo foco:', ['No destinatário com ordens', 'No próprio emissor, em seus sentimentos, opiniões e marcas de 1ª pessoa', 'No código linguístico como dicionários', 'Apenas no canal de comunicação'], 1, 'A função emotiva evidencia a subjetividade e a emoção do locutor (eu, verbos na primeira pessoa, exclamações).', enem(2024, 'Azul', 15, 'H18')],
  ['A função apelativa (ou conativa), muito comum em peças publicitárias e discursos persuasivos, tem foco:', ['No emissor lírico', 'No receptor (ou interlocutor), usando vocativos e verbos no imperativo', 'Na metalinguagem formal', 'Na rima poética'], 1, 'A função apelativa busca influenciar, persuadir ou ordenar o destinatário ("Compre", "Vote", "Faça").', enem(2023, 'Azul', 22, 'H19')],
  ['A função referencial (ou denotativa) prioriza a clareza e a transmissão objetiva de informações, com foco:', ['No contexto (ou referente)', 'Na sonoridade das palavras', 'No humor ambíguo', 'No canal físico'], 0, 'Predomina em notícias jornalísticas, artigos científicos e manuais informativos sem juízo de valor pessoal.', enem(2022, 'Azul', 38, 'H21')],
  ['A função metalinguística ocorre quando a linguagem é usada para:', ['Testar se o microfone está ligado', 'Explicar ou refletir sobre o próprio código linguístico', 'Criticar pessoas famosas', 'Emocionar o leitor com rimas'], 1, 'Metalinguagem é o código falando do código (um poema sobre o ato de escrever, um dicionário, um filme sobre cinema).', enem(2021, 'Azul', 8, 'H18')],
  ['A função fática tem como objetivo principal:', ['Transmitir dados estatísticos precisos', 'Estabelecer, testar, prolongar ou interromper o contato com o interlocutor', 'Convencer o eleitor a votar', 'Criar metáforas estéticas'], 1, 'Foco no canal ("Alô?", "Entende?", "Boa tarde", "Você está me ouvindo?").'],
  ['A função poética valoriza a elaboração artística da mensagem, enfatizando:', ['A velocidade da fala', 'A forma, o ritmo, as rimas e os efeitos estéticos do texto', 'Apenas informações científicas', 'A ausência de figuras de linguagem'], 1, 'Foco na própria mensagem, explorando sonoridades, imagens e metáforas (na literatura e na publicidade criativa).'],
  ['O uso de termos técnicos e linguagem denotativa e impessoal em um artigo da revista Nature exemplifica a função:', ['Emotiva', 'Referencial', 'Fática', 'Apelativa'], 1, 'Artigos científicos priorizam objetividade e clareza informativa sem sentimentalismos.'],
  ['Um poema de Drummond que discute a dificuldade de encontrar a palavra exata para o verso explora a função:', ['Fática', 'Metalinguística e Poética', 'Apelativa pura', 'Conativa'], 1, 'Trata-se de metalinguagem poética: a poesia refletindo sobre o próprio fazer poético.'],
  ['O anúncio "Doe sangue. Salve vidas hoje mesmo." evidencia predominantemente a função:', ['Referencial', 'Apelativa (conativa)', 'Emotiva isolada', 'Fática'], 1, 'O uso dos verbos no imperativo ("Doe", "Salve") visa orientar a ação e persuadir o leitor.'],
  ['Expressões como "sabe?", "né?", "olha só" no diálogo oral cumprem predominantemente a função:', ['Referencial', 'Fática', 'Metalinguística', 'Conceitual'], 1, 'Servem para checar e manter aberto o canal de comunicação entre os falantes.'],
  ['A ironia é uma figura de pensamento que consiste em:', ['Dizer exatamente o que se pensa com termos literais', 'Afirmar o oposto do que se quer dar a entender para gerar efeito crítico ou de humor', 'Exagerar absurdamente uma ideia', 'Comparar usando conectivos diretos'], 1, 'A ironia exige leitura contextual do tom e das pistas para captar o sentido oposto ao literal.'],
  ['A ambiguidade ocorre em um enunciado quando:', ['Uma única palavra tem significado científico', 'O texto permite mais de uma interpretação, por vezes não intencional', 'Não há verbos na oração', 'Todas as frases rimam'], 1, 'Duplo sentido que pode enriquecer a literatura ou prejudicar a clareza em textos informativos.'],
  ['A intertextualidade acontece quando um texto:', ['Não se relaciona com nenhum outro texto da história', 'Dialoga, cita, parafraseia ou faz alusão a outro texto pré-existente', 'Usa apenas termos estrangeiros', 'Não possui autor conhecido'], 1, 'Diálogo entre textos (paródias, alusões, citações, referências artísticas compartilhadas).'],
  ['Uma paródia diferencia-se de uma paráfrase porque a paródia:', ['Mantém as mesmas ideias com tom reverente', 'Recria o texto original com intenção de humor, sátira ou subversão crítica', 'Copia palavra por palavra', 'Traduz para outra língua'], 1, 'A paródia desconstrói comicamente ou satiriza o texto-fonte.'],
  ['Em "Estou morrendo de fome!", a figura de linguagem predominante é a:', ['Metáfora simples', 'Hipérbole (exagero expressivo)', 'Metonímia formal', 'Eufemismo'], 1, 'Hipérbole é a figura de linguagem caracterizada pelo exagero intencional para dar ênfase expressiva.'],
  ['O eufemismo é um recurso estilístico utilizado para:', ['Ofender gravemente alguém', 'Suavizar uma notícia triste, desagradável ou chocante', 'Gritar no canal de voz', 'Explicar regras gramaticais'], 1, 'Exemplo: "Ele descansou" ou "partiu desta vida" em vez de "morreu".'],
  ['A metáfora diferencia-se da comparação explícita porque a metáfora:', ['Usa conectivos comparativos como "como" e "tal qual"', 'Fundamenta-se em uma analogia implícita sem conectivo comparativo formal', 'É sempre literal', 'Não pode ser usada em poesia'], 1, '"Você é uma flor" (metáfora) versus "Você é delicada como uma flor" (comparação).'],
  ['Na prova de Linguagens do ENEM, identificar a intenção comunicativa do autor exige do estudante:', ['Apenas memorizar regras ortográficas', 'Compreender o contexto de produção, gênero textual, interlocutores e recursos discursivos empregados', 'Ignorar o título e a imagem', 'Traduzir tudo para o latim'], 1, 'A leitura crítica do ENEM avalia competência leitora e situacional do texto no seu suporte social.'],
];

export const languageQuestions = () => languageEntries.map((e, i) => question('language-functions', i, e));
