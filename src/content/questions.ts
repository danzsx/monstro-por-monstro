import { Question, TopicId } from '@/learning/types';
type Entry = [string, string[], number, string];
function question(topicId: TopicId, i: number, e: Entry): Question {
  // Rotate alternatives so option position never signals correctness.
  const [prompt, original, answer, explanation] = e;
  const shift = i % original.length;
  const options = [...original.slice(shift), ...original.slice(0, shift)];
  return { id: `${topicId}-${i}`, topicId, prompt, options, answer: (answer - shift + original.length) % original.length,
    explanation, difficulty: (i % 3 + 1) as 1 | 2 | 3, purpose: i < 6 ? 'diagnostic' : i < 12 ? 'practice' : 'review' };
}
export function mathQuestions(id: TopicId): Question[] {
  return Array.from({ length: 18 }, (_, i) => {
    const n = i + 2;
    if (id === 'proportions') {
      if (i % 3 === 0) return question(id, i, [`Uma mistura usa ${n} copos de concentrado e ${n * 3} de água. Qual é a razão concentrado : água?`, ['1 : 3', '3 : 1', '1 : 4', '4 : 1'], 0, `Divida os dois termos por ${n}: 1 : 3. Concentrado : mistura seria 1 : 4. A ordem e as quantidades comparadas importam.`]);
      if (i % 3 === 1) return question(id, i, [`Uma receita usa ${n} xícaras de farinha para ${n * 2} porções. Para ${n * 6} porções, quantas xícaras são necessárias?`, [`${n * 2}`, `${n * 3}`, `${n * 6}`, `${n}`], 1, `As porções foram multiplicadas por 3. A farinha também: ${n} × 3 = ${n * 3}.`]);
      return question(id, i, [`Em um mapa de escala 1 : 1.000, uma distância mede ${n} cm. Quanto isso representa em metros?`, [`${n}`, `${n * 1000}`, `${n * 10}`, `${n * 100}`], 2, `${n} × 1.000 = ${n * 1000} cm. Divida por 100 para converter: ${n * 10} metros.`]);
    }
    if (i % 3 === 0) return question(id, i, [`${n} cadernos custam R$ ${n * 8}. Mantido o preço unitário, quanto custam ${n + 3} cadernos?`, [`R$ ${(n + 3) * 8}`, `R$ ${n * 8 + 3}`, `R$ ${(n + 3) * 4}`, `R$ ${n * 8}`], 0, `Cada caderno custa R$ 8. Quantidade e custo são diretos: ${n + 3} × 8 = ${(n + 3) * 8}.`]);
    if (i % 3 === 1) return question(id, i, [`${n} máquinas iguais fazem um lote em 12 horas. Com ${n * 2} máquinas, nas mesmas condições, quanto tempo leva?`, ['24 horas', '6 horas', '12 horas', '3 horas'], 1, 'O número de máquinas dobra e o tempo cai pela metade. São grandezas inversas: 12 ÷ 2 = 6 horas.']);
    return question(id, i, [`Um carro percorre ${n * 60} km em ${n} horas a velocidade constante. Quantos quilômetros percorre em ${n + 2} horas?`, [`${n * 60 + 2}`, `${n * 60}`, `${(n + 2) * 60}`, `${(n + 2) * 30}`], 2, `A velocidade é 60 km/h. Distância e tempo são diretos: 60 × ${n + 2} = ${(n + 2) * 60} km.`]);
  });
}
const cells: Entry[] = [
  ['Qual estrutura controla as trocas da célula com o meio?', ['Ribossomo', 'Membrana plasmática', 'Cromossomo', 'Nucléolo'], 1, 'A membrana plasmática possui permeabilidade seletiva.'],
  ['O que caracteriza uma célula procariótica?', ['Não ter DNA', 'Não ter membrana', 'Não ter núcleo delimitado', 'Não produzir proteínas'], 2, 'Procariontes possuem DNA, ribossomos e membrana, mas não núcleo delimitado por envoltório.'],
  ['Qual organela participa da respiração aeróbia em eucariontes?', ['Mitocôndria', 'Lisossomo', 'Golgi', 'Vacúolo'], 0, 'Mitocôndrias participam da produção de ATP pela respiração celular.'],
  ['Onde ocorre a síntese de proteínas?', ['Lisossomos', 'Ribossomos', 'Centríolos', 'Membrana nuclear'], 1, 'Ribossomos traduzem o RNA mensageiro em cadeias de aminoácidos.'],
  ['Uma célula animal em meio muito concentrado em solutos tende a:', ['Ganhar água', 'Não trocar água', 'Perder água', 'Produzir cloroplastos'], 2, 'Na osmose, a água tende ao meio com maior concentração efetiva de solutos.'],
  ['Qual estrutura existe em bactérias e células animais?', ['Núcleo delimitado', 'Cloroplasto', 'Mitocôndria', 'Ribossomo'], 3, 'Ambas possuem ribossomos. Bactérias não possuem organelas membranosas.'],
  ['Uma célula secreta muitas proteínas. Qual estrutura deve ser abundante?', ['Retículo endoplasmático rugoso', 'Centríolo', 'Parede celular', 'Cloroplasto'], 0, 'O retículo rugoso possui ribossomos associados à produção de proteínas para secreção e membranas.'],
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
  ['Um gene é, simplificadamente:', ['Uma célula', 'Uma região do DNA com informação funcional', 'Uma organela', 'Um tecido'], 1, 'Um gene é uma região do DNA com informação para um produto funcional, como RNA ou proteína.'],
  ['Alelos são:', ['Células idênticas', 'Organelas', 'Versões de um mesmo gene', 'Proteínas sempre iguais'], 2, 'Alelos são variantes de um gene em um mesmo locus.'],
  ['Qual genótipo é heterozigoto?', ['Aa', 'AA', 'aa', 'Todos'], 0, 'Aa tem dois alelos diferentes; AA e aa são homozigotos.'],
  ['Em Aa × aa, qual proporção esperada é aa?', ['0%', '50%', '75%', '100%'], 1, 'Aa fornece A ou a. aa fornece apenas a. Metade das combinações é aa.'],
  ['Fenótipo se refere:', ['Só à sequência do DNA', 'Apenas aos gametas', 'Às características observáveis', 'Só ao número de cromossomos'], 2, 'Características observáveis resultam da interação entre genótipo e ambiente.'],
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
