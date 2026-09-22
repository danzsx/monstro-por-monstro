import { Topic, TopicId, Question } from '@/learning/types';
import { mathQuestions, biologyQuestions } from './questions';
export const TOPICS: Topic[] = [
  { id: 'proportions', name: 'Razões e proporções', discipline: 'Matemática', subtitle: 'Pequenas relações. Grandes descobertas.', description: 'Encontre o que conecta receitas, mapas e situações do seu dia.', relevance: 'Proporções ajudam a entender escalas, misturas e gráficos. Elas abrem o caminho para regra de três.', prerequisiteIds: [], priority: 1, version: 1,
    lessons: [
      { id: 'p1', kind: 'concept', title: 'Comparar é o primeiro passo', text: 'Uma razão compara duas quantidades por uma divisão. Se uma receita usa 2 copos de suco e 6 de água, suco : água é 2 : 6. A ordem importa: água : suco é 6 : 2.', formula: '2 : 6 = 1 : 3' },
      { id: 'p2', kind: 'example', title: 'A receita cresceu. A relação ficou.', text: 'Para dobrar a receita, multiplique os dois ingredientes por 2: 4 copos de suco e 12 de água. O sabor se mantém porque a razão continua 1 : 3.', formula: '2 / 6 = 4 / 12' },
      { id: 'p3', kind: 'concept', title: 'O tamanho muda; a escala permanece', text: 'Na escala 1 : 1.000, cada centímetro do mapa representa 1.000 centímetros reais. Assim, 3 cm representam 3.000 cm, ou 30 metros. Compare quantidades na mesma unidade.' },
      { id: 'p4', kind: 'recall', title: 'Agora, sem consultar', text: 'Uma mistura tem 3 partes de tinta azul e 9 de branca. Qual é a razão azul : branca? E azul : mistura?', reveal: 'Azul : branca = 3 : 9 = 1 : 3. Azul : mistura = 3 : 12 = 1 : 4. O segundo termo mudou!' },
    ], questions: mathQuestions('proportions') },
  { id: 'rule-of-three', name: 'Regra de três', discipline: 'Matemática', subtitle: 'Você já conhece metade do caminho.', description: 'Use relações conhecidas para descobrir o que falta.', relevance: 'De preços a consumo e velocidade, regra de três transforma informações em uma relação simples.', prerequisiteIds: ['proportions'], priority: .95, version: 1,
    lessons: [
      { id: 'r1', kind: 'concept', title: 'Antes da conta, pense na relação', text: 'Se a quantidade de cadernos dobra e cada um custa o mesmo, o custo dobra. São grandezas diretamente proporcionais. A regra de três exige uma relação proporcional.' },
      { id: 'r2', kind: 'example', title: 'Um valor conhecido revela o outro', text: '3 cadernos custam R$ 24. Cada um custa R$ 8; então 5 custam R$ 40. A proporção confirma o raciocínio.', formula: '3 / 5 = 24 / x   →   x = 40' },
      { id: 'r3', kind: 'concept', title: 'Às vezes, mais significa menos', text: 'Duas máquinas iguais levam 12 horas para um lote. Quatro máquinas, nas mesmas condições e sem interferência, levam 6 horas. Máquinas e tempo são inversamente proporcionais: o produto se mantém.', formula: '2 × 12 = 4 × 6' },
      { id: 'r4', kind: 'recall', title: 'Explique antes de calcular', text: 'Com velocidade constante, dobrar o tempo dobra a distância? Para distância fixa, dobrar a velocidade faz o quê com o tempo?', reveal: 'Distância e tempo são diretos com velocidade constante. Para distância fixa, dobrar a velocidade reduz o tempo à metade.' },
    ], questions: mathQuestions('rule-of-three') },
  { id: 'cytology', name: 'Citologia', discipline: 'Biologia', subtitle: 'Grandes estruturas, pequenas descobertas.', description: 'Conheça a menor unidade capaz de realizar as funções da vida.', relevance: 'Entender a célula ajuda a explicar nutrição, doenças e como a informação genética funciona.', prerequisiteIds: [], priority: .9, version: 1,
    lessons: [
      { id: 'c1', kind: 'concept', title: 'Uma pequena unidade, muitas funções', text: 'Células possuem membrana, citoplasma, material genético e ribossomos. Procariontes, como bactérias, não têm núcleo delimitado. Eucariontes, como animais e plantas, têm núcleo e organelas membranosas.' },
      { id: 'c2', kind: 'example', title: 'Pense em uma fábrica de proteínas', text: 'Ribossomos produzem proteínas. O retículo rugoso participa da produção para exportação. O Golgi modifica e empacota. Mitocôndrias contribuem com energia em ATP. Lisossomos fazem digestão intracelular.', formula: 'Ribossomo → retículo → Golgi → secreção' },
      { id: 'c3', kind: 'concept', title: 'A membrana regula as trocas', text: 'Difusão acompanha o gradiente. Transporte ativo pode atuar contra ele, usando energia. Na osmose, a água atravessa membranas seletivas e tende ao meio de maior concentração efetiva de solutos.' },
      { id: 'c4', kind: 'recall', title: 'Reconstrua com suas palavras', text: 'O que uma bactéria tem em comum com uma célula animal? Qual possui núcleo delimitado?', reveal: 'Ambas têm membrana, citoplasma, DNA e ribossomos. Só a célula animal tem núcleo delimitado; a bactéria possui nucleoide.' },
    ], questions: biologyQuestions('cytology') },
  { id: 'genetics', name: 'Fundamentos de genética', discipline: 'Biologia', subtitle: 'Tudo se conecta.', description: 'Descubra como a informação passa de uma geração para outra.', relevance: 'Genética conecta DNA, herança e diversidade. Probabilidade ajuda a interpretar os cruzamentos do ENEM.', prerequisiteIds: ['cytology'], priority: .85, version: 1,
    lessons: [
      { id: 'g1', kind: 'concept', title: 'DNA, genes e versões', text: 'Um gene é uma região de DNA com informação funcional. Alelos são versões de um gene. Um indivíduo diploide pode ter alelos iguais (AA ou aa, homozigoto) ou diferentes (Aa, heterozigoto).' },
      { id: 'g2', kind: 'concept', title: 'O que você tem e o que se manifesta', text: 'Genótipo é a constituição genética. Fenótipo reúne características observáveis, influenciadas por genes e ambiente. Em dominância completa, Aa expressa o fenótipo dominante. Dominante não significa mais comum ou melhor.' },
      { id: 'g3', kind: 'example', title: 'Cada gameta leva um alelo', text: 'Aa produz gametas A ou a. Em Aa × Aa, as combinações são AA, Aa, aA e aa. A chance de aa é 25% por descendente; isso não garante um aa a cada quatro nascimentos.', formula: 'Aa × Aa → ¼ AA + ½ Aa + ¼ aa' },
      { id: 'g4', kind: 'recall', title: 'Faça o cruzamento de cabeça', text: 'Quais gametas são produzidos por AA? E por aa? O que esperar de AA × aa?', reveal: 'AA produz gametas A; aa produz gametas a. Todos os descendentes esperados são Aa.' },
    ], questions: biologyQuestions('genetics') },
];
export const TOPIC_IDS = TOPICS.map(t => t.id);
export function topicById(id: TopicId): Topic { return TOPICS.find(t => t.id === id)!; }
export function questionById(id: string): Question { const found = TOPICS.flatMap(t => t.questions).find(q => q.id === id); if (!found) throw new Error(`Questão desconhecida: ${id}`); return found; }
