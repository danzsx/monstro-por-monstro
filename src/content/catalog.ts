import type { SupabaseClient } from '@supabase/supabase-js';
import { Topic, TopicId, Question, LessonBlock, EnemMetadata } from '@/learning/types';
import {
  mathQuestions,
  biologyQuestions,
  physicsQuestions,
  chemistryQuestions,
  ecologyQuestions,
  languageQuestions,
  natureExpansionQuestions,
} from './questions';

export function formatEnemTag(meta?: EnemMetadata): string {
  if (!meta) return '';
  if (meta.label) return meta.label;
  const parts: (string | number)[] = [meta.exam || 'ENEM', meta.year];
  if (meta.color) parts.push(`Caderno ${meta.color}`);
  if (meta.questionNumber) parts.push(`Q. ${meta.questionNumber}`);
  if (meta.ability) parts.push(meta.ability);
  return parts.join(' · ');
}

export const STATIC_TOPICS: Topic[] = [
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
    learningContext: {
      overview: 'Citologia estuda a célula: como sua membrana, seu material genético e suas estruturas trabalham juntas para manter a vida. Mais do que decorar nomes, vale compreender a função de cada estrutura e como a célula responde ao que acontece ao seu redor.',
      applications: [
        'Em clínicas de fertilização, profissionais acompanham a fecundação e as primeiras divisões celulares de embriões com microscópios.',
        'Na biotecnologia, células podem ser cultivadas em laboratório para pesquisar processos biológicos e produzir substâncias de interesse médico.',
        'Na saúde, exames de células ajudam equipes especializadas a observar alterações em tecidos e orientar investigações clínicas.',
      ],
      limitations: 'Conhecer as estruturas celulares ajuda a interpretar esses contextos, mas não substitui técnicas laboratoriais, dados clínicos ou a avaliação de profissionais. Em cada situação, é preciso combinar citologia com outros conhecimentos.',
    },
    enemGuidance: { status: 'pending', priorities: [], commonPatterns: [], lowerIncidence: [], examsAnalyzed: '', sources: [] },
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
  { id: 'kinematics', name: 'Cinemática e velocidade média', discipline: 'Física', subtitle: 'O movimento em etapas possíveis.', description: 'Descubra como espaço, tempo e velocidade se relacionam em trajetos e nos gráficos do ENEM.', relevance: 'Velocidade escalar média e leitura gráfica são a porta de entrada para a mecânica.', prerequisiteIds: ['proportions'], priority: .92, version: 1,
    learningContext: {
      overview: 'A cinemática descreve os movimentos sem se preocupar de imediato com suas causas. Dominar velocidade média e conversão de unidades dá segurança para interpretar trajetos reais de veículos, atletas e trens.',
      applications: [
        'Sistemas de GPS e radares de trânsito calculam tempo estimado e velocidades instantâneas.',
        'Engenharia de tráfego projeta tempos de semáforo a partir da velocidade média segura da via.',
      ],
      limitations: 'A velocidade média resume o percurso inteiro em uma taxa única, mascarando acelerações e paradas no meio do trajeto.',
    },
    enemGuidance: { status: 'reviewed', priorities: ['Interpretação de gráficos s x t e v x t', 'Conversão entre km/h e m/s'], commonPatterns: ['Percursos com duas etapas e velocidades distintas'], lowerIncidence: ['Fórmulas complexas de lançamentos oblíquos'], examsAnalyzed: 'ENEM 2018–2024', sources: ['ENEM 2023 Azul Q112', 'ENEM 2021 Amarelo Q98'] },
    lessons: [
      { id: 'k1', kind: 'concept', title: 'Deslocamento por tempo', text: 'Velocidade escalar média é a razão entre o deslocamento total (delta s) e o intervalo de tempo (delta t). Se você anda 60 km em 1 hora, sua velocidade média foi 60 km/h.', formula: 'v = delta s / delta t' },
      { id: 'k2', kind: 'example', title: 'Mudança de unidades sem susto', text: '1 km tem 1.000 metros e 1 hora tem 3.600 segundos. Dividir por 3,6 converte de km/h para m/s. Multiplicar por 3,6 faz o caminho de volta.', formula: '72 km/h ÷ 3,6 = 20 m/s' },
      { id: 'k3', kind: 'concept', title: 'O gráfico conta a história', text: 'Em um gráfico de espaço por tempo (s x t), a inclinação da reta indica a velocidade. Reta horizontal significa repouso (posição constante).' },
      { id: 'k4', kind: 'recall', title: 'Calcule de cabeça', text: 'Um carro anda a 90 km/h durante 2 horas e meia (2,5 h). Qual foi o deslocamento?', reveal: 'Delta s = v × delta t = 90 × 2,5 = 225 km.' },
    ], questions: physicsQuestions('kinematics') },
  { id: 'newton-laws', name: 'Leis de Newton e dinâmica', discipline: 'Física', subtitle: 'Por trás de cada movimento, uma força.', description: 'Entenda inércia, força resultante e ação-reação em frenagens e no cotidiano.', relevance: 'Cintos de segurança, atrito, elevadores e colisões são frequentes na prova de Ciências da Natureza.', prerequisiteIds: ['kinematics'], priority: .88, version: 1,
    learningContext: {
      overview: 'As três leis de Isaac Newton explicam como forças alteram o estado de movimento dos corpos. É a base da mecânica clássica e de toda a segurança veicular moderna.',
      applications: [
        'Projeto de airbags e cintos de segurança que atenuam a desaceleração em frenagens bruscas.',
        'Desenvolvimento de pneus com coeficiente de atrito ideal para pistas secas e molhadas.',
      ],
      limitations: 'As leis de Newton são válidas em referenciais inerciais e para velocidades bem inferiores à da luz.',
    },
    enemGuidance: { status: 'reviewed', priorities: ['Inércia como tendência de manter a velocidade', 'Ação e reação sempre em corpos diferentes'], commonPatterns: ['Análise de forças em veículos e pessoas em movimento'], lowerIncidence: ['Sistemas com múltiplos blocos inclinados'], examsAnalyzed: 'ENEM 2019–2024', sources: ['ENEM 2024 Azul Q119', 'ENEM 2022 Azul Q103'] },
    lessons: [
      { id: 'n1', kind: 'concept', title: 'A tendência natural da inércia', text: 'Se a força resultante sobre um corpo é nula, ele mantém sua velocidade: repouso permanece em repouso e movimento retilíneo uniforme continua sem esforço.' },
      { id: 'n2', kind: 'example', title: 'Força produz aceleração', text: 'A força resultante é proporcional à aceleração e à massa do corpo. Quanto maior a massa, mais força é necessária para mudar a velocidade.', formula: 'F_res = m × a' },
      { id: 'n3', kind: 'concept', title: 'Ação e reação: corpos distintos', text: 'Toda força de ação gera uma reação de mesma intensidade e sentido oposto. Elas nunca se anulam porque atuam em corpos diferentes.' },
      { id: 'n4', kind: 'recall', title: 'Pense antes de responder', text: 'Quando um cavalo puxa uma carroça, por que a carroça se move se a força que ele faz na carroça é igual à que a carroça faz nele?', reveal: 'Porque as forças atuam em corpos diferentes! Para a carroça, a força do cavalo supera o atrito do chão com as rodas.' },
    ], questions: physicsQuestions('newton-laws') },
  { id: 'calorimetry', name: 'Calorimetria e trocas térmicas', discipline: 'Física', subtitle: 'Energia em trânsito no seu dia.', description: 'Diferencie calor sensível de latente e compreenda como a água modera a temperatura da Terra.', relevance: 'Capacidade térmica e calorimetria explicam brisas, climatização e aquecimento solar no ENEM.', prerequisiteIds: ['proportions'], priority: .84, version: 1,
    learningContext: {
      overview: 'Calor é energia térmica em trânsito entre corpos com temperaturas diferentes. A calorimetria estuda a quantidade dessa energia necessária para aquecer ou mudar o estado de uma substância.',
      applications: [
        'Uso de coletores solares para aquecimento de água em residências ecológicas.',
        'Isolamento térmico de edifícios e garrafas com vácuo para reduzir perdas de calor.',
      ],
      limitations: 'Calorimetria básica assume sistemas isolados sem perdas parasitárias de radiação ou convecção externa.',
    },
    enemGuidance: { status: 'reviewed', priorities: ['Diferença entre calor e temperatura', 'Alto calor específico da água nas brisas litorâneas'], commonPatterns: ['Equilíbrio térmico entre dois corpos em um calorímetro ideal'], lowerIncidence: ['Mudança de estado a pressões fora de 1 atm'], examsAnalyzed: 'ENEM 2017–2023', sources: ['ENEM 2023 Azul Q131', 'ENEM 2019 Azul Q116'] },
    lessons: [
      { id: 'cal1', kind: 'concept', title: 'Calor não é temperatura', text: 'Temperatura mede o grau de agitação molecular. Calor é a energia que flui espontaneamente do corpo mais quente para o mais frio.' },
      { id: 'cal2', kind: 'example', title: 'Calor sensível: variou, esquentou', text: 'Para aquecer sem mudar de estado, a quantidade de calor depende da massa, do calor específico e da variação de temperatura desejada.', formula: 'Q = m × c × delta T' },
      { id: 'cal3', kind: 'concept', title: 'Calor latente: a fase muda, a temperatura não', text: 'Durante a fusão do gelo ou a ebulição da água pura a 1 atm, a temperatura permanece constante enquanto a matéria troca de fase.', formula: 'Q = m × L' },
      { id: 'cal4', kind: 'recall', title: 'Reflita sobre a praia', text: 'Por que durante o dia a areia queima o pé mas o mar está frio?', reveal: 'A areia tem calor específico muito menor que a água: precisa de pouca energia para sua temperatura disparar!' },
    ], questions: physicsQuestions('calorimetry') },
  { id: 'stoichiometry', name: 'Estequiometria básica', discipline: 'Química', subtitle: 'A receita da matéria na medida certa.', description: 'Relacione mols, massas molares e coeficientes estequiométricos com tranquilidade.', relevance: 'Cálculo estequiométrico transforma fórmulas em quantidades reais e aparece com alta frequência no ENEM.', prerequisiteIds: ['rule-of-three'], priority: .91, version: 1,
    learningContext: {
      overview: 'Estequiometria é o cálculo das proporções quantitativas entre reagentes e produtos em uma reação química. Funciona exatamente como a receita de um bolo: se dobrar os ovos, deve dobrar a farinha.',
      applications: [
        'Indústria farmacêutica calcula quantidades exatas de reagentes para sintetizar medicamentos puros.',
        'Engenharia ambiental calcula a quantidade de poluentes neutralizados em filtros industriais.',
      ],
      limitations: 'O cálculo teórico fornece o rendimento de 100%, mas processos práticos sempre apresentam perdas ou impurezas.',
    },
    enemGuidance: { status: 'reviewed', priorities: ['Balanceamento prévio indispensável', 'Conservação de massa de Lavoisier'], commonPatterns: ['Cálculo de emissão de CO2 em queima de combustíveis'], lowerIncidence: ['Reações em cadeia de mais de três etapas'], examsAnalyzed: 'ENEM 2018–2024', sources: ['ENEM 2024 Azul Q124', 'ENEM 2023 Azul Q115'] },
    lessons: [
      { id: 's1', kind: 'concept', title: 'A receita balanceada', text: 'Em uma equação química balanceada, os coeficientes indicam a proporção em mols. Na queima do metano (CH4 + 2 O2 -> CO2 + 2 H2O), 1 mol de CH4 consome 2 mols de O2.' },
      { id: 's2', kind: 'example', title: 'Massa molar faz a ponte', text: 'A massa molar converte mols em gramas. O carbono tem 12 g/mol e o O2 tem 32 g/mol. Assim, 1 mol de CO2 pesa 12 + 32 = 44 gramas.', formula: 'n = massa / Massa_Molar' },
      { id: 's3', kind: 'concept', title: 'Quem acaba primeiro manda', text: 'O reagente limitante é o ingrediente que se esgota antes. É ele quem determina a quantidade máxima de produto que pode ser formada.' },
      { id: 's4', kind: 'recall', title: 'Regra de três química', text: 'Se 1 mol de C (12 g) forma 1 mol de CO2 (44 g), quantos gramas de CO2 são gerados por 24 g de C?', reveal: '24 g é o dobro (2 mols); portanto, geram-se 2 × 44 = 88 g de CO2!' },
    ], questions: chemistryQuestions('stoichiometry') },
  { id: 'solutions', name: 'Soluções e concentrações', discipline: 'Química', subtitle: 'Misturas homogêneas que movem a vida.', description: 'Calcule concentração comum, molaridade e diluição sem medo de fórmulas decoradas.', relevance: 'Concentração de soluções é exigida em ecologia, medicamentos, salinidade e química analítica.', prerequisiteIds: ['proportions', 'rule-of-three'], priority: .86, version: 1,
    learningContext: {
      overview: 'Soluções são misturas homogêneas de soluto disperso em solvente. Saber calcular a concentração é essencial para entender remédios, poluição da água e processos biológicos.',
      applications: [
        'Preparo de soro fisiológico a 0,9% para hidratação venosa em hospitais.',
        'Monitoramento de potabilidade e teor de cloro e flúor na água de abastecimento público.',
      ],
      limitations: 'Modelos de concentração ideal desconsideram interações intermoleculares complexas em soluções supersaturadas.',
    },
    enemGuidance: { status: 'reviewed', priorities: ['Diferença entre g/L e mol/L', 'Fórmula de diluição C1V1 = C2V2'], commonPatterns: ['Adição de solvente a uma solução concentrada comercial'], lowerIncidence: ['Cálculos avançados de osmolalidade e crioscopia'], examsAnalyzed: 'ENEM 2019–2023', sources: ['ENEM 2023 Azul Q102', 'ENEM 2022 Amarelo Q118'] },
    lessons: [
      { id: 'sol1', kind: 'concept', title: 'Soluto dentro do solvente', text: 'Soluto é o que é dissolvido (ex.: sal), solvente é o meio que dissolve (ex.: água). A concentração comum mede a massa de soluto pelo volume total da solução.', formula: 'C = m_soluto / V_solucao' },
      { id: 'sol2', kind: 'example', title: 'Diluir é adicionar água', text: 'Ao diluir uma solução adicionando solvente, a massa de soluto não muda: apenas o volume aumenta e a concentração cai.', formula: 'C1 × V1 = C2 × V2' },
      { id: 'sol3', kind: 'concept', title: 'Molaridade: medindo em mols', text: 'A concentração molar (mol/L) indica quantos mols de soluto existem em 1 litro de solução. É a unidade padrão da química universitária e do ENEM.' },
      { id: 'sol4', kind: 'recall', title: 'Diluição rápida', text: 'Se você tem 100 mL de suco com concentração 40 g/L e adiciona água até 200 mL, qual é a nova concentração?', reveal: 'O volume dobrou (de 100 para 200 mL); logo, a concentração cai pela metade: 20 g/L!' },
    ], questions: chemistryQuestions('solutions') },
  { id: 'covalent-bonds', name: 'Ligações covalentes', discipline: 'Química', subtitle: 'Um par de elétrons muda a história.', description: 'Acompanhe como átomos compartilham elétrons e interprete fórmulas de moléculas e compostos covalentes.', relevance: 'Reconhecer o compartilhamento de elétrons ajuda a ler fórmulas como H₂O, NH₃ e CO₂ e a distinguir compostos moleculares de iônicos.', prerequisiteIds: [], priority: .88, version: 1,
    lessons: [
      { id: 'cov1', kind: 'concept', title: 'O par compartilhado', text: 'Ligação covalente é a união entre átomos estabelecida por pares de elétrons. Em geral, ocorre entre não metais, semimetais e hidrogênio.' },
      { id: 'cov2', kind: 'example', title: 'Um, dois ou três traços', text: 'H-H representa uma ligação simples, O=O uma dupla e N≡N uma tripla. Os traços indicam os pares de elétrons compartilhados.' },
      { id: 'cov3', kind: 'concept', title: 'Lewis, estrutural e molecular', text: 'A fórmula de Lewis mostra os elétrons da camada externa; a fórmula estrutural plana usa traços; a fórmula molecular informa os átomos e suas quantidades.' },
      { id: 'cov4', kind: 'recall', title: 'Onde a regra do octeto falha?', text: 'Compare BeH₂, BF₃, PCl₅ e SF₆: quais apresentam menos e quais apresentam mais de 8 elétrons ao redor do átomo central?', reveal: 'BeH₂ e BF₃ apresentam menos de 8; PCl₅ e SF₆ apresentam camada de valência expandida, com 10 e 12 elétrons.' },
    ], questions: chemistryQuestions('covalent-bonds') },
  { id: 'atomic-models', name: 'Modelos atômicos', discipline: 'Química', subtitle: 'Cada experimento revelou uma nova estrutura.', description: 'Acompanhe como evidências experimentais transformaram as explicações sobre a estrutura do átomo.', relevance: 'No ENEM, o tema aparece ligado a evidências, limites dos modelos e fenômenos observáveis, como a emissão de luz por átomos excitados.', prerequisiteIds: [], priority: .86, version: 1,
    learningContext: {
      overview: 'Modelos atômicos são explicações científicas construídas a partir de evidências disponíveis em cada época. Raios catódicos, espalhamento de partículas e espectros de luz levaram a diferentes representações, cada uma útil dentro de seus limites.',
      applications: [
        'O teste de chama relaciona a cor emitida por certos elementos às transições de elétrons entre níveis de energia.',
        'Técnicas de espectroscopia identificam elementos em materiais e ajudam a investigar a composição de estrelas.',
        'A estrutura eletrônica ajuda a explicar propriedades periódicas e a formação de ligações químicas.',
      ],
      limitations: 'Os desenhos de Dalton, Thomson, Rutherford e Bohr são modelos, não fotografias do átomo. O modelo de Bohr explica bem alguns aspectos do hidrogênio, mas o modelo quântico é necessário para descrever átomos mais complexos; elétrons não percorrem órbitas planetárias fixas no modelo atual.',
    },
    enemGuidance: {
      status: 'reviewed',
      priorities: [
        'Identificar que evidência experimental motivou cada mudança de modelo.',
        'Conectar níveis de energia à absorção e à emissão de luz, como na chama amarela do sódio.',
        'Reconhecer quais ideias de Dalton continuam válidas e quais foram revistas com novas evidências.',
      ],
      commonPatterns: [
        'Contextualização em situações cotidianas ou em relatos históricos, seguida da interpretação de um fenômeno ou postulado.',
        'Comparação entre modelos pelo que explicam e por suas limitações, em vez de apenas ordenar nomes e datas.',
        'Aplicação de conceitos sobre elétrons excitados e emissão de fótons para explicar a cor característica de uma chama.',
      ],
      lowerIncidence: [
        'Nas questões analisadas, biografias e datas dos cientistas não são o foco; o raciocínio depende de interpretar evidências e conceitos.',
        'Não foi necessário usar cálculos avançados de órbitas ou resolver equações quânticas.',
      ],
      examsAnalyzed: 'ENEM regular 2017 e 2019 — itens de Ciências da Natureza sobre emissão de luz e teoria de Dalton.',
      sources: [
        'INEP, ENEM 2017, 2º dia, caderno amarelo, questão 91 — teste de chama e emissão de fótons. https://download.inep.gov.br/educacao_basica/enem/provas/2017/2017_PV_impresso_D2_CD5.pdf',
        'INEP, ENEM 2019, 2º dia, questão sobre os postulados de Dalton (questão 128 no caderno azul). Provas oficiais: https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos',
      ],
    },
    lessons: [
      { id: 'am1', kind: 'concept', title: 'Dalton: a matéria em partículas', text: 'Dalton descreveu átomos como partículas maciças e indivisíveis. Seu modelo explica proporções em reações, mas não inclui partículas subatômicas.' },
      { id: 'am2', kind: 'example', title: 'Thomson encontra o elétron', text: 'Experimentos com raios catódicos revelaram partículas negativas. Thomson propôs elétrons inseridos em uma distribuição de carga positiva.' },
      { id: 'am3', kind: 'concept', title: 'Rutherford revela o núcleo', text: 'Na experiência da lâmina de ouro, a maioria das partículas alfa atravessou a lâmina e poucas desviaram muito. O átomo é majoritariamente vazio, com carga positiva concentrada num núcleo pequeno.' },
      { id: 'am4', kind: 'example', title: 'Bohr explica a cor da chama', text: 'O calor pode excitar elétrons de certos átomos. Ao retornarem a níveis de menor energia, eles emitem fótons. No teste de chama, a emissão característica do sódio é amarela.', formula: 'energia absorvida → elétron excitado → fóton emitido' },
      { id: 'am5', kind: 'pitfall', title: 'Um modelo tem alcance e limites', text: 'Não trate as representações como fotografias nem suponha que uma teoria antiga estava simplesmente “errada”: cada modelo respondeu a evidências e problemas de seu tempo. O modelo de Bohr é útil para níveis de energia, mas não descreve adequadamente átomos complexos.' },
      { id: 'am6', kind: 'recall', title: 'Ligue evidência e modelo', text: 'Que observação na lâmina de ouro levou Rutherford a propor um núcleo pequeno e denso? E o que a chama amarela do sódio evidencia?', reveal: 'O desvio acentuado de poucas partículas alfa indicava uma região central que concentrava carga positiva e massa. A chama amarela resulta de fótons emitidos quando elétrons excitados retornam a níveis de menor energia.' },
    ], questions: natureExpansionQuestions('atomic-models') },
  { id: 'biomolecules', name: 'Moléculas da vida', discipline: 'Biologia', subtitle: 'As peças químicas da célula.', description: 'Conheça carboidratos, lipídios, proteínas e ácidos nucleicos e relacione estrutura e função.', relevance: 'Biomoléculas aparecem em questões sobre alimentação, membranas, metabolismo, hereditariedade e saúde.', prerequisiteIds: [], priority: .9, version: 1,
    learningContext: { overview: 'Carboidratos e lipídios participam de funções energéticas e estruturais; proteínas atuam como enzimas, estruturas e moléculas de defesa; ácidos nucleicos armazenam e expressam informação genética. Suas propriedades decorrem da composição e da estrutura molecular.', applications: ['Rótulos alimentares relacionam nutrientes a composição e função.', 'Enzimas e proteínas são usadas em diagnósticos, medicamentos e processos industriais.', 'DNA e RNA conectam estrutura molecular à hereditariedade e à biotecnologia.'], limitations: 'Uma mesma classe pode reunir moléculas com estruturas e funções diferentes; não se deve reduzir toda biomolécula a uma única função.' },
    enemGuidance: { status: 'pending', priorities: ['Relacionar monômeros e polímeros, como aminoácidos e proteínas.', 'Distinguir funções energéticas, estruturais e informacionais das biomoléculas.', 'Interpretar biomoléculas em contextos de nutrição e funcionamento celular.'], commonPatterns: ['Associar estrutura química a uma função biológica.', 'Interpretar rótulos ou situações de alimentação usando funções dos nutrientes.'], lowerIncidence: ['Decorar estruturas moleculares complexas sem conexão funcional.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: moléculas, células e tecidos. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'bm1', kind: 'concept', title: 'Quatro grandes grupos', text: 'Carboidratos, lipídios, proteínas e ácidos nucleicos têm composições e propriedades próprias. A estrutura ajuda a explicar como cada grupo participa da vida celular.' },
      { id: 'bm2', kind: 'example', title: 'Do alimento à função', text: 'Glicose pode ser usada na respiração; triglicerídeos armazenam energia; proteínas podem catalisar reações; DNA armazena informação hereditária.' },
      { id: 'bm3', kind: 'concept', title: 'Unidades que formam moléculas maiores', text: 'Aminoácidos formam proteínas e nucleotídeos formam DNA e RNA. Muitos carboidratos são polímeros de monossacarídeos; lipídios não são polímeros de repetição simples.' },
      { id: 'bm4', kind: 'recall', title: 'Ligue molécula e papel', text: 'Que unidade forma proteínas? Qual grupo contém a informação hereditária?', reveal: 'Proteínas são formadas por aminoácidos. DNA e RNA são ácidos nucleicos que participam do armazenamento e da expressão da informação genética.' },
    ], questions: natureExpansionQuestions('biomolecules') },
  { id: 'dna-proteins', name: 'DNA e síntese proteica', discipline: 'Biologia', subtitle: 'Da informação à proteína.', description: 'Acompanhe replicação, transcrição e tradução e entenda como a informação genética orienta a produção de proteínas.', relevance: 'O ENEM relaciona biologia molecular a características hereditárias, mutações, saúde e aplicações biotecnológicas.', prerequisiteIds: ['cytology'], priority: .92, version: 1,
    learningContext: { overview: 'A informação do DNA pode ser transcrita em RNA; nos ribossomos, códons do RNA mensageiro orientam a sequência de aminoácidos da proteína. A expressão gênica pode ser regulada, e mutações têm efeitos que dependem do local e do contexto.', applications: ['Testes genéticos e diagnóstico molecular analisam sequências de DNA.', 'A produção de proteínas recombinantes usa genes expressos por células hospedeiras.', 'Mutações podem alterar proteínas ou sua quantidade e contribuir para características e doenças.'], limitations: 'A relação entre gene e característica não é sempre direta: regulação, interação entre genes e ambiente também influenciam fenótipos.' },
    enemGuidance: { status: 'pending', priorities: ['Distinguir transcrição de tradução e reconhecer onde ocorrem.', 'Interpretar códons, anticódons e sequência de aminoácidos.', 'Avaliar possíveis consequências de mutações sem supor que todas alteram a proteína.'], commonPatterns: ['Seguir a informação em esquemas DNA → RNA → proteína.', 'Relacionar mutação a alteração na sequência ou na expressão de uma proteína.'], lowerIncidence: ['Decorar o código genético completo sem necessidade de interpretar a situação.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: informação genética e síntese de proteínas. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'dp1', kind: 'concept', title: 'DNA guarda instruções', text: 'Genes são regiões do DNA cuja informação pode contribuir para produtos funcionais, como proteínas ou RNAs. Nem todo gene codifica uma proteína.' },
      { id: 'dp2', kind: 'concept', title: 'Transcrição produz RNA', text: 'Na transcrição, uma fita de DNA serve de molde para produzir RNA. Em células eucarióticas, esse processo ocorre principalmente no núcleo.' },
      { id: 'dp3', kind: 'example', title: 'Tradução monta proteínas', text: 'Nos ribossomos, códons do RNA mensageiro são lidos; tRNAs trazem aminoácidos correspondentes e a cadeia polipeptídica cresce.' },
      { id: 'dp4', kind: 'recall', title: 'Siga o caminho da informação', text: 'Qual molécula é transcrita a partir do DNA? Onde a sequência de aminoácidos é montada?', reveal: 'O RNA é produzido na transcrição. A tradução ocorre nos ribossomos.' },
    ], questions: natureExpansionQuestions('dna-proteins') },
  { id: 'tissues', name: 'Tecidos e diferenciação', discipline: 'Biologia', subtitle: 'Células especializadas em conjunto.', description: 'Entenda como a diferenciação celular forma tecidos animais e vegetais com funções específicas.', relevance: 'O tema conecta organização dos seres vivos, funcionamento do corpo e estrutura das plantas.', prerequisiteIds: ['cytology'], priority: .84, version: 1,
    learningContext: { overview: 'Tecidos são conjuntos organizados de células e matriz que atuam de forma integrada. A diferenciação gera especialização celular; tecidos animais e vegetais têm estruturas associadas a funções como revestimento, sustentação, condução e contração.', applications: ['A histologia auxilia a reconhecer tecidos em exames e pesquisas.', 'Tecidos vasculares explicam o transporte de água e açúcares nas plantas.', 'A relação estrutura-função ajuda a interpretar órgãos e sistemas.'], limitations: 'Tecidos reais variam entre espécies, órgãos e condições; ilustrações didáticas simplificam sua diversidade e organização.' },
    enemGuidance: { status: 'pending', priorities: ['Relacionar características estruturais à função do tecido.', 'Distinguir tecidos animais e vegetais e seus papéis gerais.', 'Compreender diferenciação como especialização celular.'], commonPatterns: ['Identificar a função de um tecido a partir de sua estrutura.', 'Interpretar transporte vegetal ou funcionamento de órgão com base nos tecidos envolvidos.'], lowerIncidence: ['Memorização de classificações histológicas detalhadas sem aplicação.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: moléculas, células e tecidos. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'td1', kind: 'concept', title: 'Da célula ao tecido', text: 'Células diferenciadas adquirem formas e atividades adequadas a funções. Em tecidos, elas atuam em conjunto e podem estar associadas a uma matriz extracelular.' },
      { id: 'td2', kind: 'example', title: 'Tecidos animais em ação', text: 'Epitélios revestem e secretam; tecidos conjuntivos sustentam e conectam; músculos se contraem; tecido nervoso recebe e transmite sinais.' },
      { id: 'td3', kind: 'concept', title: 'Condução nas plantas', text: 'O xilema conduz principalmente água e sais minerais; o floema distribui açúcares e outras substâncias orgânicas.' },
      { id: 'td4', kind: 'recall', title: 'Associe estrutura e função', text: 'Qual tecido vegetal conduz água e sais? Qual conduz açúcares?', reveal: 'O xilema conduz água e sais minerais; o floema transporta açúcares e outras substâncias orgânicas.' },
    ], questions: natureExpansionQuestions('tissues') },
  { id: 'cell-origin', name: 'Origem das células', discipline: 'Biologia', subtitle: 'Pistas sobre a história celular.', description: 'Compare hipóteses sobre a origem da vida e das células e avalie as evidências da teoria endossimbiótica.', relevance: 'O tema desenvolve leitura de evidências científicas e conecta evolução, microbiologia e organização celular.', prerequisiteIds: ['cytology'], priority: .82, version: 1,
    learningContext: { overview: 'A história celular é investigada por evidências geológicas, fósseis, moleculares e comparações entre organismos. A teoria endossimbiótica propõe que mitocôndrias e cloroplastos descendem de bactérias incorporadas por ancestrais celulares.', applications: ['A comparação de DNA e ribossomos ajuda a investigar parentesco evolutivo.', 'A endossimbiose explica aspectos da origem de organelas e da complexidade eucariótica.', 'Experimentos sobre condições da Terra primitiva investigam a formação de moléculas orgânicas.'], limitations: 'A origem da vida ainda é uma questão científica em investigação; experimentos simulam aspectos de hipóteses e não reproduzem todo o processo histórico.' },
    enemGuidance: { status: 'pending', priorities: ['Reconhecer evidências que sustentam a teoria endossimbiótica.', 'Distinguir hipóteses sobre origem da vida de evidências de evolução celular.', 'Avaliar resultados experimentais sem extrapolar além do que demonstram.'], commonPatterns: ['Relacionar uma característica celular a uma hipótese evolutiva.', 'Interpretar observações e experimentos como evidências para modelos científicos.'], lowerIncidence: ['Tratar hipóteses históricas como fatos diretamente observados ou decorar cronologias sem evidências.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: origem e evolução da vida. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'co1', kind: 'concept', title: 'Evidências contam a história', text: 'A origem e a evolução das células são estudadas por evidências fósseis, geológicas e moleculares, além da comparação de estruturas e processos celulares.' },
      { id: 'co2', kind: 'example', title: 'A hipótese endossimbiótica', text: 'Mitocôndrias e cloroplastos têm DNA próprio, ribossomos e divisão interna. Essas características apoiam a hipótese de ancestrais bacterianos incorporados por outra célula.' },
      { id: 'co3', kind: 'concept', title: 'Hipóteses precisam de teste', text: 'Experimentos como o de Miller e Urey mostraram que moléculas orgânicas podem se formar em certas condições simuladas. Eles não produziram vida nem demonstraram todo o caminho da origem da vida.' },
      { id: 'co4', kind: 'recall', title: 'Use a evidência com cuidado', text: 'Que características de mitocôndrias apoiam a endossimbiose? O experimento de Miller e Urey criou vida?', reveal: 'DNA próprio, ribossomos e divisão são evidências compatíveis com a hipótese. Miller e Urey obtiveram moléculas orgânicas, não vida.' },
    ], questions: natureExpansionQuestions('cell-origin') },
  { id: 'biotechnology', name: 'Biotecnologia', discipline: 'Biologia', subtitle: 'A vida como ferramenta e conhecimento.', description: 'Conheça aplicações de DNA recombinante, PCR, células-tronco e clonagem e avalie seus limites e implicações.', relevance: 'O ENEM relaciona biotecnologia a saúde, agricultura, identificação genética, sociedade e sustentabilidade.', prerequisiteIds: ['genetics'], priority: .9, version: 1,
    learningContext: { overview: 'Biotecnologia aplica organismos, células ou moléculas biológicas para resolver problemas. Técnicas de DNA recombinante, PCR e análise de fragmentos têm usos em pesquisa, saúde, agricultura e identificação; células-tronco e clonagem envolvem processos e questões éticas próprios.', applications: ['Microrganismos podem produzir proteínas terapêuticas.', 'PCR amplifica DNA para diagnóstico e pesquisa.', 'Culturas agrícolas podem receber características de interesse, exigindo avaliação de impactos e benefícios.'], limitations: 'Uma técnica pode ter limites de precisão, custo, acesso e impacto ambiental. Aplicações médicas e legais precisam de protocolos, evidências e supervisão adequados.' },
    enemGuidance: { status: 'pending', priorities: ['Interpretar a finalidade de técnicas como PCR e DNA recombinante.', 'Relacionar uma aplicação biotecnológica ao mecanismo biológico envolvido.', 'Avaliar benefícios, riscos e aspectos éticos e ambientais com base em evidências.'], commonPatterns: ['Escolher a técnica adequada a um objetivo de diagnóstico, produção ou identificação.', 'Analisar impactos de uma aplicação sem confundir possibilidade técnica com ausência de riscos.'], lowerIncidence: ['Memorizar protocolos laboratoriais completos sem relação com o problema apresentado.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: biotecnologia e DNA. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'bt1', kind: 'concept', title: 'Biotecnologia usa sistemas vivos', text: 'Células, organismos e moléculas biológicas podem ser usados para produzir substâncias, investigar processos e desenvolver aplicações em saúde, agricultura e ambiente.' },
      { id: 'bt2', kind: 'example', title: 'Amplificar e combinar DNA', text: 'A PCR amplifica segmentos de DNA. DNA recombinante combina sequências que podem ser introduzidas em células para estudar genes ou produzir proteínas.' },
      { id: 'bt3', kind: 'concept', title: 'Aplicações pedem avaliação', text: 'Células-tronco, clonagem e organismos geneticamente modificados têm objetivos e limites diferentes. Avalie evidências, segurança, acesso, efeitos sociais e ambientais.' },
      { id: 'bt4', kind: 'recall', title: 'Escolha pela finalidade', text: 'Que técnica amplia uma região de DNA? O que deve ser considerado ao avaliar uma aplicação biotecnológica?', reveal: 'PCR amplifica segmentos de DNA. A avaliação considera benefícios, riscos, acesso e impactos sociais e ambientais.' },
    ], questions: natureExpansionQuestions('biotechnology') },
  { id: 'immunity', name: 'Imunidade e grupos sanguíneos', discipline: 'Biologia', subtitle: 'Defesa, memória e compatibilidade.', description: 'Relacione antígenos, anticorpos, vacinação e os sistemas ABO e Rh à resposta imunológica.', relevance: 'O assunto aparece em contextos de prevenção, transfusões, transplantes e saúde pública.', prerequisiteIds: ['genetics'], priority: .9, version: 1,
    learningContext: { overview: 'O sistema imune reconhece estruturas chamadas antígenos e pode produzir respostas específicas. Linfócitos de memória contribuem para respostas futuras. Nos grupos sanguíneos ABO e Rh, antígenos das hemácias e anticorpos do plasma determinam compatibilidades importantes em transfusões.', applications: ['Vacinas estimulam memória imunológica e ajudam a prevenir doenças.', 'A tipagem ABO e Rh reduz riscos de reações em transfusões.', 'A imunologia contribui para compreender transplantes e doenças autoimunes.'], limitations: 'A compatibilidade transfusional envolve outros sistemas além de ABO e Rh e depende de avaliação laboratorial. A resposta imune varia conforme o agente e a pessoa.' },
    enemGuidance: { status: 'pending', priorities: ['Relacionar antígeno e anticorpo sem inverter seus papéis.', 'Interpretar compatibilidade ABO e Rh em situações contextualizadas.', 'Explicar como vacinação e memória imunológica contribuem para prevenção.'], commonPatterns: ['Analisar tabelas ou esquemas de tipagem sanguínea e compatibilidade.', 'Relacionar resposta imune a vacinação e prevenção de doenças.'], lowerIncidence: ['Memorização de detalhes moleculares avançados da imunologia sem aplicação.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: genética humana, antígenos, anticorpos e grupos sanguíneos. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'im1', kind: 'concept', title: 'Reconhecer e responder', text: 'Antígenos podem ser reconhecidos por componentes do sistema imune. Anticorpos ligam-se a alvos específicos, enquanto diferentes células coordenam e executam respostas de defesa.' },
      { id: 'im2', kind: 'example', title: 'ABO e transfusão', text: 'No sistema ABO, hemácias A exibem antígeno A; hemácias B exibem B; AB exibem ambos; O não exibe A nem B. Anticorpos do receptor podem reagir com antígenos incompatíveis do doador.' },
      { id: 'im3', kind: 'concept', title: 'Memória e vacinação', text: 'Após contato com um antígeno, células de memória podem permanecer. Um novo contato pode provocar resposta mais rápida. Vacinas treinam essa resposta sem exigir a doença correspondente.' },
      { id: 'im4', kind: 'recall', title: 'Explique a compatibilidade', text: 'Por que uma transfusão ABO incompatível pode aglutinar hemácias? O que uma vacina busca formar?', reveal: 'Anticorpos do receptor podem reconhecer antígenos das hemácias do doador. A vacinação busca induzir proteção e memória imunológica.' },
    ], questions: natureExpansionQuestions('immunity') },
  { id: 'cancer', name: 'Câncer e ambiente', discipline: 'Biologia', subtitle: 'Quando o controle celular falha.', description: 'Compreenda como alterações na regulação celular e fatores ambientais podem contribuir para o desenvolvimento de câncer.', relevance: 'O tema conecta genética, divisão celular, prevenção, ambiente e saúde coletiva.', prerequisiteIds: ['cell-division', 'mutations'], priority: .9, version: 1,
    learningContext: { overview: 'Câncer reúne doenças em que células acumulam alterações e podem proliferar sem controle adequado; tumores malignos podem invadir tecidos e gerar metástases. Exposições ambientais, predisposição hereditária e outros fatores podem interagir no processo.', applications: ['Reduzir exposição a carcinógenos conhecidos pode diminuir alguns riscos.', 'Rastreamento indicado pode identificar alterações em fases iniciais.', 'Estudos epidemiológicos investigam como exposições e hábitos se relacionam à incidência de câncer.'], limitations: 'Risco não significa certeza de adoecimento, e muitos cânceres têm causas múltiplas. Prevenção e rastreamento devem seguir orientações de saúde baseadas em evidências.' },
    enemGuidance: { status: 'pending', priorities: ['Relacionar alterações genéticas a falhas no controle do ciclo celular.', 'Distinguir tumores localizados de invasão e metástase.', 'Interpretar fatores ambientais como riscos, sem tratá-los como causas únicas ou inevitáveis.'], commonPatterns: ['Relacionar exposição ambiental a danos no DNA e risco de câncer.', 'Interpretar prevenção como redução de risco, não como garantia individual.'], lowerIncidence: ['Memorização de classificações clínicas detalhadas ou protocolos terapêuticos.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: neoplasias e fatores ambientais. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'ca1', kind: 'concept', title: 'O ciclo celular tem controles', text: 'Células regulam quando crescem e se dividem. Alterações em genes que controlam esses processos podem favorecer a multiplicação celular desregulada.' },
      { id: 'ca2', kind: 'example', title: 'Ambiente e risco', text: 'Radiação ultravioleta e substâncias do tabaco podem danificar o DNA. O risco depende de intensidade, duração, características individuais e outros fatores.' },
      { id: 'ca3', kind: 'concept', title: 'Tumor, invasão e metástase', text: 'Tumores benignos tendem a permanecer localizados. Tumores malignos podem invadir tecidos; metástase é a disseminação de células tumorais para outros locais.' },
      { id: 'ca4', kind: 'recall', title: 'Pense em risco, não em destino', text: 'Uma exposição associada ao câncer garante que a pessoa desenvolverá a doença?', reveal: 'Não. Uma exposição pode aumentar o risco, mas o desenvolvimento depende de múltiplos fatores e não é inevitável.' },
    ], questions: natureExpansionQuestions('cancer') },
  { id: 'mutations', name: 'Mutações e aconselhamento', discipline: 'Biologia', subtitle: 'Variações no material genético.', description: 'Compare mutações gênicas e cromossômicas e compreenda a transmissão hereditária e o aconselhamento genético.', relevance: 'O tema conecta hereditariedade, diversidade, evolução, saúde e interpretação de probabilidades familiares.', prerequisiteIds: ['genetics', 'dna-proteins'], priority: .88, version: 1,
    learningContext: { overview: 'Mutações alteram a sequência do DNA ou a estrutura e o número de cromossomos. Seus efeitos variam. Mutações em células germinativas podem ser herdadas; mutações somáticas afetam linhagens celulares do indivíduo. O aconselhamento genético informa riscos e opções de forma ética e não diretiva.', applications: ['Testes genéticos podem apoiar diagnóstico e estimativa de riscos.', 'Aconselhamento ajuda famílias a compreender padrões hereditários e incertezas.', 'Mutações fornecem variação hereditária que também participa da evolução.'], limitations: 'Um resultado genético não determina sozinho o futuro de uma pessoa; ambiente, penetrância, expressividade e limites dos testes podem influenciar a interpretação.' },
    enemGuidance: { status: 'pending', priorities: ['Diferenciar mutações gênicas de alterações cromossômicas.', 'Distinguir mutações germinativas, potencialmente herdáveis, de somáticas.', 'Interpretar probabilidades genéticas como riscos, com limites e incertezas.'], commonPatterns: ['Relacionar alteração genética a um possível efeito na proteína ou no fenótipo.', 'Ler heredogramas ou situações familiares sem transformar probabilidade em certeza.'], lowerIncidence: ['Memorizar síndromes raras sem analisar o padrão de herança ou os dados.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: mutações gênicas e cromossômicas e aconselhamento genético. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'mu1', kind: 'concept', title: 'O que muda numa mutação', text: 'Mutações podem substituir, inserir ou remover nucleotídeos; também podem envolver segmentos ou cromossomos inteiros. Seu efeito depende do local e do tipo de alteração.' },
      { id: 'mu2', kind: 'example', title: 'Somática ou germinativa?', text: 'Uma mutação em célula somática pode passar às células-filhas daquela linhagem, mas geralmente não aos descendentes. Uma mutação em gameta pode ser herdada se ele participar da fecundação.' },
      { id: 'mu3', kind: 'concept', title: 'Aconselhamento informa escolhas', text: 'Aconselhamento genético comunica padrões de herança, riscos, opções e incertezas com respeito à autonomia, confidencialidade e decisões da pessoa ou família.' },
      { id: 'mu4', kind: 'recall', title: 'Probabilidade não é certeza', text: 'Um risco de 25% garante que exatamente um em cada quatro filhos terá a característica?', reveal: 'Não. É uma probabilidade para cada gestação, não uma sequência garantida de resultados.' },
    ], questions: natureExpansionQuestions('mutations') },
  { id: 'population-genetics', name: 'Diversidade genética', discipline: 'Biologia', subtitle: 'Variação dentro das populações.', description: 'Relacione alelos, mutação, seleção, deriva e fluxo gênico à diversidade e às mudanças populacionais.', relevance: 'O tema conecta genética e evolução e ajuda a interpretar adaptação, conservação e biodiversidade.', prerequisiteIds: ['genetics', 'evolution'], priority: .88, version: 1,
    learningContext: { overview: 'Diversidade genética é a variedade de alelos e genótipos presente em uma população. Mutação origina variantes; seleção natural, deriva genética, fluxo gênico e acasalamento alteram frequências de maneiras diferentes.', applications: ['Programas de conservação avaliam diversidade para reduzir riscos de populações pequenas.', 'A resistência a agentes infecciosos pode evoluir quando variantes hereditárias diferem em sucesso reprodutivo.', 'Melhoramento de cultivos utiliza variação genética para selecionar características.'], limitations: 'Uma variante vantajosa depende do ambiente e não garante a sobrevivência de indivíduos ou espécies. Frequências observadas também podem mudar por acaso.' },
    enemGuidance: { status: 'pending', priorities: ['Distinguir fontes de variação de processos que alteram frequências alélicas.', 'Compreender deriva genética como mudança aleatória especialmente relevante em populações pequenas.', 'Relacionar diversidade genética a adaptação e conservação sem determinismo.'], commonPatterns: ['Interpretar mudanças em populações submetidas a pressões ambientais.', 'Explicar perda de diversidade após redução populacional ou isolamento.'], lowerIncidence: ['Cálculos avançados de genética de populações sem dados que os justifiquem.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: bases genéticas da evolução e da diversidade biológica. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'pg1', kind: 'concept', title: 'Variabilidade entre indivíduos', text: 'Populações podem conter diferentes alelos e genótipos. Mutações e recombinação geram variantes; seleção, deriva e migração mudam sua frequência.' },
      { id: 'pg2', kind: 'example', title: 'Seleção e resistência', text: 'Se algumas bactérias já possuem variantes resistentes, o antibiótico pode eliminar as suscetíveis e favorecer a reprodução das resistentes. O medicamento seleciona variantes; não produz a mutação necessária sob demanda.' },
      { id: 'pg3', kind: 'concept', title: 'O acaso também importa', text: 'Deriva genética é mudança aleatória de frequências alélicas. Seu efeito costuma ser maior em populações pequenas, podendo reduzir diversidade após um gargalo.' },
      { id: 'pg4', kind: 'recall', title: 'Compare os processos', text: 'Qual processo transfere alelos entre populações? Qual altera frequências ao acaso?', reveal: 'Fluxo gênico transfere alelos entre populações por migração e reprodução. Deriva genética muda frequências aleatoriamente.' },
    ], questions: natureExpansionQuestions('population-genetics') },
  { id: 'living-beings', name: 'Organização da vida', discipline: 'Biologia', subtitle: 'Dos níveis celulares às populações.', description: 'Compare níveis de organização, tipos celulares, número de células e formas de nutrição dos seres vivos.', relevance: 'O tema ajuda a classificar organismos e interpretar relações entre células, indivíduos e ecossistemas.', prerequisiteIds: ['cytology'], priority: .86, version: 1,
    learningContext: { overview: 'Seres vivos variam em organização celular: procariontes ou eucariontes, unicelulares ou pluricelulares. Organismos autotróficos produzem matéria orgânica a partir de substâncias inorgânicas; heterotróficos obtêm matéria orgânica de outros seres ou de seus produtos. Vírus são acelulares e replicam-se usando células hospedeiras.', applications: ['A classificação celular ajuda a entender infecções e escolher estratégias de prevenção.', 'Níveis de organização conectam células a tecidos, organismos e populações.', 'Formas de nutrição ajudam a interpretar cadeias alimentares e ciclos ecológicos.'], limitations: 'Classificações gerais têm exceções e grupos diversos. Vírus, em particular, ocupam uma fronteira conceitual e não realizam reprodução independente.' },
    enemGuidance: { status: 'pending', priorities: ['Distinguir procariontes, eucariontes e vírus quanto à organização celular.', 'Comparar organismos unicelulares e pluricelulares e suas formas de nutrição.', 'Reconhecer níveis ecológicos como organismo, população e comunidade.'], commonPatterns: ['Classificar organismos a partir de características celulares ou nutricionais.', 'Relacionar nível de organização ao fenômeno apresentado.'], lowerIncidence: ['Decorar exemplos taxonômicos extensos sem relacioná-los a características.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: níveis de organização, vírus, procariontes, eucariontes e formas de nutrição. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'lv1', kind: 'concept', title: 'Como as células se organizam', text: 'Procariontes não têm núcleo delimitado; eucariontes têm núcleo e organelas membranosas. Seres unicelulares realizam suas funções em uma célula; pluricelulares têm células especializadas.' },
      { id: 'lv2', kind: 'example', title: 'Autotróficos e heterotróficos', text: 'Autotróficos sintetizam matéria orgânica usando energia luminosa ou química. Heterotróficos obtêm matéria orgânica por consumo ou absorção.' },
      { id: 'lv3', kind: 'concept', title: 'Vírus e níveis ecológicos', text: 'Vírus são acelulares e dependem de células para replicar-se. Em ecologia, indivíduos de uma espécie formam populações; populações de espécies diferentes formam comunidades.' },
      { id: 'lv4', kind: 'recall', title: 'Classifique com cuidado', text: 'Bactérias são procariontes ou eucariontes? Vírus têm organização celular?', reveal: 'Bactérias são procariontes. Vírus são acelulares e precisam de células hospedeiras para se replicar.' },
    ], questions: natureExpansionQuestions('living-beings') },
  { id: 'taxonomy', name: 'Classificação dos seres vivos', discipline: 'Biologia', subtitle: 'Reconstruir parentescos da vida.', description: 'Interprete classificações e árvores filogenéticas a partir de características compartilhadas e evidências evolutivas.', relevance: 'O tema relaciona biodiversidade, evolução e leitura de relações de parentesco entre organismos.', prerequisiteIds: ['evolution'], priority: .84, version: 1,
    learningContext: { overview: 'A sistemática organiza a diversidade e formula hipóteses de parentesco. Árvores filogenéticas representam ancestrais comuns e divergências; características homólogas e dados moleculares ajudam a construir essas hipóteses. Classificações são revistas quando surgem novas evidências.', applications: ['Filogenias apoiam estudos de biodiversidade e conservação.', 'Comparações moleculares ajudam a identificar parentesco quando a aparência é insuficiente.', 'A classificação auxilia a organizar informação sobre organismos e suas características.'], limitations: 'Uma árvore é uma hipótese científica baseada em dados, não uma escala de progresso. Semelhança funcional pode surgir independentemente e não prova parentesco próximo.' },
    enemGuidance: { status: 'pending', priorities: ['Ler nós e ramificações de cladogramas como ancestrais comuns e divergências.', 'Distinguir estruturas homólogas de semelhanças por convergência.', 'Reconhecer grupos monofiléticos e o caráter revisável das classificações.'], commonPatterns: ['Interpretar árvore filogenética ou comparação de características.', 'Inferir parentesco a partir de evidências morfológicas ou moleculares.'], lowerIncidence: ['Memorizar longas listas de categorias taxonômicas sem interpretar relações.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: sistemática, grandes linhas evolutivas e biotecnologia aplicada à classificação. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'tx1', kind: 'concept', title: 'Classificar é formular parentescos', text: 'A sistemática organiza a diversidade com base em características e hipóteses de ancestralidade. Dados morfológicos e moleculares podem contribuir para essas relações.' },
      { id: 'tx2', kind: 'example', title: 'Leia uma árvore', text: 'Cada nó representa um ancestral comum inferido. Duas linhagens que compartilham um nó mais recente tendem a ser mais proximamente aparentadas, sem que uma espécie atual seja necessariamente ancestral da outra.' },
      { id: 'tx3', kind: 'concept', title: 'Homologia e convergência', text: 'Estruturas homólogas compartilham origem evolutiva, embora possam ter funções distintas. Estruturas análogas podem ter função semelhante e surgir independentemente.' },
      { id: 'tx4', kind: 'recall', title: 'Evite a ideia de progresso', text: 'Um cladograma mostra qual espécie é mais evoluída? O que significa um nó?', reveal: 'Não mostra escala de progresso. O nó representa um ancestral comum hipotético das linhagens que dele partem.' },
    ], questions: natureExpansionQuestions('taxonomy') },
  { id: 'life-cycles', name: 'Reprodução e ciclos de vida', discipline: 'Biologia', subtitle: 'Gerações, gametas e novas combinações.', description: 'Compare estratégias reprodutivas e acompanhe meiose, fecundação e ploidia nos ciclos de vida.', relevance: 'O tema conecta divisão celular, hereditariedade, reprodução e diversidade dos seres vivos.', prerequisiteIds: ['cell-division'], priority: .86, version: 1,
    learningContext: { overview: 'Ciclos de vida descrevem as etapas de desenvolvimento e reprodução de um organismo. Meiose reduz a ploidia; fecundação combina gametas; em plantas, a alternância de gerações inclui fases gametofítica e esporofítica. Reprodução sexuada e assexuada têm consequências distintas para a variação.', applications: ['Ciclos reprodutivos ajudam a compreender agricultura e propagação de plantas.', 'A ploidia explica como a fecundação mantém o número cromossômico entre gerações.', 'Estratégias reprodutivas relacionam organismos a condições ambientais.'], limitations: 'Os ciclos variam muito entre grupos. Diagramas devem ser lidos acompanhando a ploidia em cada etapa, sem generalizar um único padrão para todos os seres vivos.' },
    enemGuidance: { status: 'pending', priorities: ['Acompanhar mudanças de ploidia e localizar meiose e fecundação.', 'Distinguir gametófito de esporófito em plantas.', 'Relacionar reprodução sexuada e assexuada à variabilidade dos descendentes.'], commonPatterns: ['Interpretar esquemas de ciclos de vida e número cromossômico.', 'Relacionar estratégias reprodutivas ao ciclo e ao ambiente do organismo.'], lowerIncidence: ['Memorizar ciclos raros sem acompanhar fases e ploidia.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: ciclos de vida. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'lc1', kind: 'concept', title: 'Meiose e fecundação', text: 'A meiose reduz o número de conjuntos cromossômicos; a fecundação une gametas e, em ciclos diplônticos, restabelece a diploidia no zigoto.' },
      { id: 'lc2', kind: 'example', title: 'Alternância nas plantas', text: 'O gametófito haploide produz gametas. Após a fecundação, o zigoto diploide origina o esporófito, que pode produzir esporos por meiose.' },
      { id: 'lc3', kind: 'concept', title: 'Estratégias reprodutivas', text: 'A reprodução assexuada pode gerar descendentes muito semelhantes; a sexuada combina material genético de gametas e amplia combinações hereditárias.' },
      { id: 'lc4', kind: 'recall', title: 'Acompanhe a ploidia', text: 'Na alternância de gerações, qual fase produz gametas? Qual produz esporos por meiose?', reveal: 'O gametófito haploide produz gametas; o esporófito diploide produz esporos por meiose.' },
    ], questions: natureExpansionQuestions('life-cycles') },
  { id: 'comparative-biology', name: 'Diversidade e adaptações', discipline: 'Biologia', subtitle: 'Formas de vida em seus ambientes.', description: 'Compare estruturas e funções em plantas e animais e relacione adaptações a processos evolutivos e condições ambientais.', relevance: 'O tema une diversidade dos seres vivos, seleção natural, anatomia comparada e relações ecológicas.', prerequisiteIds: ['evolution'], priority: .88, version: 1,
    learningContext: { overview: 'A biologia comparada investiga semelhanças e diferenças entre organismos. Características herdáveis podem ser favorecidas por seleção natural em certo ambiente; homologias indicam ancestralidade comum, enquanto semelhanças análogas podem resultar de convergência.', applications: ['Adaptações ajudam a interpretar a distribuição dos organismos em diferentes ambientes.', 'Comparações anatômicas apoiam hipóteses de parentesco evolutivo.', 'Conhecer estruturas e funções contribui para conservação e manejo da biodiversidade.'], limitations: 'Adaptação não é uma mudança intencional nem garante vantagem em qualquer ambiente. A função e o valor adaptativo dependem das condições e da história da linhagem.' },
    enemGuidance: { status: 'pending', priorities: ['Relacionar estrutura e função em diferentes grupos de seres vivos.', 'Distinguir homologia evolutiva de analogia por função semelhante.', 'Explicar adaptação pela seleção de variação herdável ao longo de gerações.'], commonPatterns: ['Comparar estruturas de organismos e inferir função ou parentesco.', 'Interpretar como uma característica pode afetar sobrevivência e reprodução em certo ambiente.'], lowerIncidence: ['Decorar listas extensas de espécies sem comparar características.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: evolução, padrões anatômicos e fisiológicos, funções vitais e adaptação ao ambiente. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'da1', kind: 'concept', title: 'Estrutura e função', text: 'Comparar formas e funções ajuda a entender como organismos interagem com o ambiente. Uma estrutura pode ter funções diferentes em linhagens aparentadas.' },
      { id: 'da2', kind: 'example', title: 'Homologia e analogia', text: 'Membros anteriores de diferentes vertebrados compartilham um plano estrutural herdado. Asas de aves e insetos exercem função semelhante, mas não têm a mesma origem estrutural.' },
      { id: 'da3', kind: 'concept', title: 'Adaptação ocorre em populações', text: 'Variações herdáveis que favorecem reprodução em certo contexto podem tornar-se mais frequentes ao longo de gerações. Indivíduos não desenvolvem características porque precisam delas.' },
      { id: 'da4', kind: 'recall', title: 'Explique o contexto', text: 'Uma adaptação é vantajosa em qualquer ambiente? Como a seleção pode mudar sua frequência?', reveal: 'A vantagem depende do ambiente. Se a característica herdável aumenta o sucesso reprodutivo, pode ficar mais frequente na população ao longo das gerações.' },
    ], questions: natureExpansionQuestions('comparative-biology') },
  { id: 'embryology', name: 'Embriologia', discipline: 'Biologia', subtitle: 'Do zigoto ao organismo em formação.', description: 'Acompanhe fecundação, clivagens, gastrulação e diferenciação dos tecidos embrionários.', relevance: 'O desenvolvimento embrionário integra divisão celular, diferenciação e formação dos sistemas do organismo.', prerequisiteIds: ['cell-division', 'tissues'], priority: .84, version: 1,
    learningContext: { overview: 'Após a fecundação, o zigoto passa por clivagens, formação de estágios embrionários e gastrulação, quando se organizam folhetos embrionários. A diferenciação gera tecidos e órgãos; em mamíferos, anexos embrionários apoiam proteção e trocas.', applications: ['A embriologia apoia cuidados pré-natais e investigação do desenvolvimento.', 'O estudo de folhetos embrionários ajuda a compreender a origem de tecidos e órgãos.', 'A comparação do desenvolvimento revela padrões e diferenças entre grupos animais.'], limitations: 'O desenvolvimento varia entre espécies e não ocorre como uma sequência idêntica em todos os animais. Esquemas escolares representam etapas gerais.' },
    enemGuidance: { status: 'pending', priorities: ['Ordenar fecundação, clivagem e gastrulação.', 'Relacionar folhetos embrionários aos principais tecidos e sistemas derivados.', 'Compreender funções gerais da placenta e do líquido amniótico.'], commonPatterns: ['Interpretar esquemas de desenvolvimento e identificar uma etapa.', 'Relacionar origem embrionária a um tecido ou estrutura adulta.'], lowerIncidence: ['Memorizar listas completas de derivados sem interpretar a etapa do desenvolvimento.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: embriologia, anatomia e fisiologia humana. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'em1', kind: 'concept', title: 'Fecundação e clivagem', text: 'A fecundação forma o zigoto. Clivagens mitóticas sucessivas repartem o citoplasma em células menores, enquanto o embrião inicial passa por estágios de organização.' },
      { id: 'em2', kind: 'example', title: 'Gastrulação organiza camadas', text: 'Na gastrulação formam-se folhetos embrionários. Em geral, ectoderma participa da formação da epiderme e do sistema nervoso; mesoderma de músculos e tecidos de sustentação; endoderma de revestimentos internos.' },
      { id: 'em3', kind: 'concept', title: 'Anexos embrionários', text: 'Em mamíferos, placenta e cordão umbilical participam das trocas entre mãe e feto. O líquido amniótico amortece impactos e permite movimentos.' },
      { id: 'em4', kind: 'recall', title: 'Reconstrua a sequência', text: 'Qual estrutura surge da fecundação? Em que etapa se organizam os folhetos embrionários?', reveal: 'A fecundação forma o zigoto. Os folhetos embrionários se organizam durante a gastrulação.' },
    ], questions: natureExpansionQuestions('embryology') },
  { id: 'human-evolution', name: 'Evolução humana', discipline: 'Biologia', subtitle: 'Uma história de linhagens e evidências.', description: 'Interprete evidências fósseis, anatômicas e genéticas sobre a evolução e a diversidade das linhagens humanas.', relevance: 'O tema desenvolve leitura de evidências evolutivas e compreensão da ancestralidade compartilhada entre primatas.', prerequisiteIds: ['evolution'], priority: .82, version: 1,
    learningContext: { overview: 'A evolução humana é ramificada: diversas espécies de hominínios viveram em épocas diferentes e algumas coexistiram. Fósseis, anatomia, ferramentas e dados genéticos ajudam a reconstruir parentescos, migrações e mudanças como o bipedalismo.', applications: ['Fósseis e DNA ajudam a investigar ancestralidade e migrações humanas.', 'A arqueologia relaciona ferramentas e outros vestígios aos modos de vida antigos.', 'A evolução humana contextualiza a diversidade biológica atual sem hierarquizar populações.'], limitations: 'O registro fóssil é incompleto, e cada evidência responde a perguntas específicas. Humanos atuais não descendem de chimpanzés atuais; ambas as linhagens compartilham ancestrais.' },
    enemGuidance: { status: 'pending', priorities: ['Representar evolução humana como árvore ramificada, sem escala de progresso.', 'Relacionar evidências fósseis, anatômicas e genéticas a hipóteses de parentesco.', 'Reconhecer ancestralidade comum entre humanos e outros primatas atuais.'], commonPatterns: ['Interpretar fósseis ou dados comparativos como evidência de mudanças ao longo do tempo.', 'Relacionar uma característica, como bipedalismo, a evidências anatômicas.'], lowerIncidence: ['Memorizar uma sequência linear de espécies como se uma fosse ancestral direta de outra.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: evolução humana. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'he1', kind: 'concept', title: 'Uma árvore, não uma escada', text: 'A linhagem humana se ramificou. Diferentes espécies de hominínios coexistiram, e espécies atuais de primatas compartilham ancestrais em vez de descender umas das outras.' },
      { id: 'he2', kind: 'example', title: 'Fósseis registram mudanças', text: 'Pelve, pernas, crânios e pegadas podem fornecer evidências sobre locomoção e anatomia. Fósseis são analisados junto a dados arqueológicos e genéticos.' },
      { id: 'he3', kind: 'concept', title: 'Várias evidências se complementam', text: 'Comparações de DNA ajudam a inferir parentesco e migrações. Ferramentas e fósseis revelam aspectos de modos de vida, mas nenhuma evidência isolada conta toda a história.' },
      { id: 'he4', kind: 'recall', title: 'Evite a ideia de progresso', text: 'Humanos atuais descendem dos chimpanzés atuais? O que indica uma árvore ramificada?', reveal: 'Não. Humanos e chimpanzés atuais compartilham ancestrais. A árvore representa divergência de linhagens a partir de ancestrais comuns.' },
    ], questions: natureExpansionQuestions('human-evolution') },
  { id: 'water-minerals', name: 'Água e sais minerais', discipline: 'Biologia', subtitle: 'A química que sustenta a vida.', description: 'Relacione as propriedades da água e as funções dos sais minerais ao equilíbrio dos organismos.', relevance: 'O ENEM costuma integrar propriedades da água e íons a situações de saúde, ambiente e funcionamento celular.', prerequisiteIds: [], priority: .86, version: 1,
    learningContext: { overview: 'A água é polar, participa de reações, dissolve muitas substâncias e ajuda a estabilizar a temperatura. Sais minerais aparecem como íons ou componentes de estruturas e moléculas: cálcio em ossos e sinalização, ferro na hemoglobina e iodo nos hormônios tireoidianos são exemplos.', applications: ['Osmose e equilíbrio hídrico ajudam a interpretar desidratação e reidratação.', 'A solubilidade e o transporte de íons ajudam a explicar a condução elétrica em tecidos.', 'Deficiências de ferro e iodo relacionam nutrição a funções fisiológicas.'], limitations: 'Os efeitos de nutrientes dependem da dose, da forma química e das condições individuais. Exemplos escolares não substituem avaliação clínica.' },
    enemGuidance: { status: 'pending', priorities: ['Relacionar polaridade e calor específico da água às suas funções biológicas.', 'Associar íons minerais a funções sem confundir elemento, íon e molécula.', 'Interpretar osmose e equilíbrio hídrico em contextos celulares e de saúde.'], commonPatterns: ['Aplicar propriedades físico-químicas a uma situação biológica contextualizada.', 'Relacionar deficiência ou disponibilidade de um íon a uma função do organismo.'], lowerIncidence: ['Memorização de listas extensas de elementos-traço sem contexto.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: moléculas, células e tecidos. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'wm1', kind: 'concept', title: 'Água: polaridade e solvente', text: 'A distribuição desigual de cargas torna a água polar. Ela interage com íons e moléculas polares, permitindo dissolver e transportar muitas substâncias. Substâncias apolares, como óleos, não se misturam bem com água.' },
      { id: 'wm2', kind: 'concept', title: 'Temperatura e coesão', text: 'Ligações de hidrogênio contribuem para o alto calor específico e para a coesão da água. Assim, a água reduz variações térmicas e ajuda a manter colunas de seiva em plantas.' },
      { id: 'wm3', kind: 'example', title: 'Íons com funções diferentes', text: 'Ferro participa da hemoglobina; cálcio atua em ossos, contração e sinalização; iodo é necessário a hormônios tireoidianos. A função depende da forma química e da quantidade disponível.' },
      { id: 'wm4', kind: 'recall', title: 'Explique a função', text: 'Por que o suor pode resfriar o corpo? Que relação há entre ferro e transporte de oxigênio?', reveal: 'A evaporação do suor absorve calor da pele. O ferro compõe o grupo heme da hemoglobina, que transporta oxigênio.' },
    ], questions: natureExpansionQuestions('water-minerals') },
  { id: 'membrane-transport', name: 'Membrana e transportes', discipline: 'Biologia', subtitle: 'Entradas e saídas sob controle.', description: 'Compare difusão, osmose, transporte ativo e transporte por vesículas através da membrana celular.', relevance: 'O ENEM apresenta transportes celulares em situações de saúde, soluções, absorção e equilíbrio de água e sais.', prerequisiteIds: ['cytology'], priority: .9, version: 1,
    learningContext: { overview: 'A membrana plasmática é seletivamente permeável. Difusão e osmose ocorrem sem gasto direto de ATP e seguem gradientes; bombas podem transportar contra gradientes com energia; endocitose e exocitose movem materiais em vesículas.', applications: ['A absorção intestinal de água e solutos depende de transportadores e gradientes.', 'O efeito de soluções sobre hemácias pode ser explicado por osmose.', 'Gradientes iônicos participam de sinais elétricos em neurônios.'], limitations: 'O sentido do fluxo depende da substância, da permeabilidade da membrana e das concentrações efetivas; não se deve aplicar uma regra única a todos os solutos.' },
    enemGuidance: { status: 'pending', priorities: ['Distinguir difusão, osmose e transporte ativo pelo gradiente e gasto de energia.', 'Prever o efeito de meios hipotônicos e hipertônicos sobre células.', 'Relacionar transportes a contextos como absorção intestinal e equilíbrio celular.'], commonPatterns: ['Interpretar esquemas de concentração dentro e fora da célula.', 'Aplicar osmose a uma situação experimental ou fisiológica.'], lowerIncidence: ['Decorar nomes de proteínas transportadoras sem interpretar o fluxo.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: estrutura e funcionamento celular. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'mt1', kind: 'concept', title: 'A membrana seleciona', text: 'A bicamada de fosfolipídios separa meios e contém proteínas que facilitam ou regulam passagens. A membrana é seletivamente permeável: cada substância atravessa conforme suas propriedades e os transportadores disponíveis.' },
      { id: 'mt2', kind: 'concept', title: 'Fluxos a favor do gradiente', text: 'Difusão move partículas a favor do gradiente de concentração. Na osmose, a água atravessa a membrana em resposta à diferença de concentração efetiva de solutos.' },
      { id: 'mt3', kind: 'example', title: 'Quando a célula gasta energia', text: 'Bombas de membrana usam energia, frequentemente de ATP, para transportar substâncias contra gradientes. Endocitose e exocitose transportam materiais em vesículas.' },
      { id: 'mt4', kind: 'recall', title: 'Preveja o movimento', text: 'O que tende a ocorrer com uma hemácia colocada em solução hipotônica? E em uma hipertônica?', reveal: 'Na hipotônica, água tende a entrar e a hemácia incha. Na hipertônica, água tende a sair e ela murcha.' },
    ], questions: natureExpansionQuestions('membrane-transport') },
  { id: 'cell-division', name: 'Divisão celular', discipline: 'Biologia', subtitle: 'Uma célula, diferentes destinos.', description: 'Compare mitose e meiose e compreenda como o DNA é distribuído durante a divisão celular.', relevance: 'O tema conecta crescimento, renovação de tecidos, formação de gametas e variabilidade genética.', prerequisiteIds: ['cytology'], priority: .88, version: 1,
    learningContext: { overview: 'Antes da divisão, o DNA é duplicado. A mitose distribui cromátides-irmãs e tende a conservar o número de cromossomos; a meiose inclui duas divisões, reduz a ploidia e pode gerar variabilidade por recombinação e segregação independente.', applications: ['Renovação de tecidos e crescimento dependem de mitoses.', 'A meiose forma gametas e contribui para a variabilidade entre descendentes.', 'Erros de segregação ajudam a explicar alterações no número de cromossomos.'], limitations: 'Esquemas simplificam fases e estruturas; é essencial diferenciar número de cromossomos de quantidade de DNA e acompanhar o que se separa em cada etapa.' },
    enemGuidance: { status: 'pending', priorities: ['Comparar resultado e função de mitose e meiose.', 'Acompanhar cromossomos homólogos e cromátides nas etapas da divisão.', 'Relacionar meiose, recombinação e variabilidade genética.'], commonPatterns: ['Interpretar esquemas de divisão e contagem cromossômica.', 'Relacionar gametogênese ou variabilidade a eventos meióticos.'], lowerIncidence: ['Memorização isolada dos nomes de todas as subfases sem interpretar o processo.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: divisão celular e hereditariedade. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'cd1', kind: 'concept', title: 'Duplicar antes de dividir', text: 'Na fase S da intérfase, o DNA é replicado. Cada cromossomo passa a ter duas cromátides-irmãs, que serão distribuídas durante a divisão.' },
      { id: 'cd2', kind: 'example', title: 'Mitose conserva o número', text: 'Na mitose, cromátides-irmãs se separam. Em geral, uma célula diploide origina duas células diploides geneticamente semelhantes, importantes para crescimento e reparo.' },
      { id: 'cd3', kind: 'concept', title: 'Meiose reduz e recombina', text: 'A meiose separa homólogos na primeira divisão e cromátides-irmãs na segunda. Crossing-over e orientação independente contribuem para gametas diferentes.' },
      { id: 'cd4', kind: 'recall', title: 'Compare os resultados', text: 'Qual divisão forma gametas haploides? Em qual ocorre crossing-over?', reveal: 'A meiose forma gametas haploides. O crossing-over ocorre na prófase I.' },
    ], questions: natureExpansionQuestions('cell-division') },
  { id: 'cell-metabolism', name: 'Metabolismo celular', discipline: 'Biologia', subtitle: 'Transformações que mantêm a vida.', description: 'Entenda o papel das enzimas, do ATP e das vias de síntese e degradação nas células.', relevance: 'Metabolismo integra alimentação, produção de energia, atividade enzimática e funcionamento celular.', prerequisiteIds: ['cytology'], priority: .88, version: 1,
    learningContext: { overview: 'Metabolismo é o conjunto de reações químicas celulares. Enzimas aceleram reações ao reduzir a energia de ativação; ATP transfere energia utilizável; vias catabólicas degradam moléculas e vias anabólicas constroem moléculas.', applications: ['Enzimas são usadas em alimentos, detergentes e processos industriais.', 'A produção de ATP relaciona nutrientes ao trabalho celular.', 'Temperatura e pH podem alterar a atividade enzimática.'], limitations: 'ATP não é um depósito ilimitado de energia e enzimas não tornam qualquer reação possível; cada enzima atua sob condições e substratos específicos.' },
    enemGuidance: { status: 'pending', priorities: ['Interpretar gráficos de atividade enzimática em função de pH ou temperatura.', 'Relacionar ATP ao acoplamento de reações e ao trabalho celular.', 'Distinguir síntese, degradação e fermentação sem confundir matéria e energia.'], commonPatterns: ['Analisar como uma alteração ambiental afeta uma enzima ou via metabólica.', 'Conectar transformação de nutrientes à produção de energia celular.'], lowerIncidence: ['Decorar todas as etapas bioquímicas sem interpretar entradas, produtos e função.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: metabolismo celular e energético. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'cm1', kind: 'concept', title: 'Metabolismo: construir e degradar', text: 'Anabolismo reúne reações de síntese; catabolismo reúne reações de degradação. As duas dimensões se conectam e mantêm a organização e as atividades da célula.' },
      { id: 'cm2', kind: 'concept', title: 'Enzimas reduzem barreiras', text: 'Enzimas são catalisadores biológicos: aceleram reações ao reduzir a energia de ativação e não são consumidas. Temperatura, pH e concentração podem alterar sua atividade.' },
      { id: 'cm3', kind: 'example', title: 'ATP acopla processos', text: 'A hidrólise de ATP pode fornecer energia para transporte ativo, movimento e síntese. A respiração celular captura parte da energia dos nutrientes em ATP.' },
      { id: 'cm4', kind: 'recall', title: 'Explique o papel', text: 'O que acontece com a atividade de uma enzima em condições que alteram seu sítio ativo?', reveal: 'A ligação ao substrato pode ficar prejudicada e a velocidade da reação diminuir; em extremos, a enzima pode desnaturar.' },
    ], questions: natureExpansionQuestions('cell-metabolism') },
  { id: 'photosynthesis', name: 'Fotossíntese e respiração', discipline: 'Biologia', subtitle: 'Matéria e energia em movimento.', description: 'Compare fotossíntese e respiração celular e acompanhe as trocas de matéria e energia entre organismos e ambiente.', relevance: 'O tema conecta produção de matéria orgânica, uso de energia, ciclos ambientais e cadeias alimentares.', prerequisiteIds: ['cytology'], priority: .92, version: 1,
    learningContext: { overview: 'Na fotossíntese, energia luminosa sustenta a produção de matéria orgânica a partir de CO2 e água; o oxigênio liberado vem da água. Na respiração celular, moléculas orgânicas são oxidadas e parte da energia é conservada em ATP. Plantas realizam ambos os processos.', applications: ['A produtividade vegetal sustenta agricultura e redes alimentares.', 'Trocas de CO2 e O2 conectam organismos a ciclos biogeoquímicos.', 'A comparação de taxas ajuda a interpretar crescimento de plantas em diferentes condições.'], limitations: 'Equações globais resumem várias etapas e não significam que fotossíntese e respiração sejam reações idênticas em sentidos opostos.' },
    enemGuidance: { status: 'pending', priorities: ['Identificar origem do carbono orgânico e do oxigênio liberado na fotossíntese.', 'Comparar fotossíntese e respiração quanto a matéria, energia e condições.', 'Interpretar fatores limitantes em gráficos de taxa fotossintética.'], commonPatterns: ['Analisar experimentos com luz, CO2 ou temperatura e prever a taxa fotossintética.', 'Relacionar produtores, matéria orgânica e fluxo de energia nos ecossistemas.'], lowerIncidence: ['Memorização de todas as reações intermediárias sem relação com o fenômeno.'], examsAnalyzed: 'Matriz de Referência do ENEM; curadoria específica de itens ainda pendente.', sources: ['Matriz de Referência do ENEM, Ciências da Natureza: metabolismo energético e ecologia. https://download.inep.gov.br/download/enem/matriz_referencia.pdf'] },
    lessons: [
      { id: 'pr1', kind: 'concept', title: 'Fotossíntese armazena energia', text: 'Organismos fotossintetizantes convertem energia luminosa em energia química, fixando carbono do CO2 em moléculas orgânicas. O oxigênio molecular liberado vem da água.' },
      { id: 'pr2', kind: 'concept', title: 'Respiração disponibiliza energia', text: 'Na respiração aeróbia, moléculas orgânicas são oxidadas e o oxigênio atua como aceptor final de elétrons. Parte da energia é conservada em ATP.' },
      { id: 'pr3', kind: 'example', title: 'Plantas fazem os dois processos', text: 'A fotossíntese depende de luz; a respiração ocorre continuamente. Durante o dia, os dois processos podem ocorrer ao mesmo tempo, e o balanço líquido depende de suas taxas.' },
      { id: 'pr4', kind: 'recall', title: 'Siga a matéria e a energia', text: 'De onde vem o carbono da glicose fotossintética? E de onde vem o oxigênio liberado?', reveal: 'O carbono vem do CO2. O oxigênio molecular liberado tem origem na água.' },
    ], questions: natureExpansionQuestions('photosynthesis') },
  { id: 'ecosystems', name: 'Bases da ecologia', discipline: 'Biologia', subtitle: 'A vida e o ambiente em relação.', description: 'Entenda como organismos, populações e condições do ambiente se organizam e influenciam uns aos outros.', relevance: 'O ENEM contextualiza ecologia em situações ambientais que pedem interpretar relações entre organismos, hábitats e conservação.', prerequisiteIds: [], priority: .9, version: 1,
    learningContext: {
      overview: 'Ecologia estuda as relações entre os seres vivos e o ambiente. Organismos formam populações; populações interagem em comunidades; comunidades e fatores abióticos, como água, luz e temperatura, compõem ecossistemas. Habitat indica onde uma espécie vive; nicho descreve seu modo de vida, recursos e relações.',
      applications: [
        'Restauração de matas ciliares considera solo, água, espécies nativas e conexões entre áreas de habitat.',
        'Agricultura e controle biológico dependem de compreender interações entre pragas, predadores, polinizadores e condições ambientais.',
        'Monitoramento de rios combina indicadores físicos, como temperatura e oxigênio dissolvido, com a presença de organismos.',
      ],
      limitations: 'Um ecossistema real reúne muitas relações simultâneas. Diagramas e exemplos didáticos isolam alguns fatores para facilitar a análise; conclusões sobre uma espécie ou local precisam considerar as condições específicas do ambiente.',
    },
    enemGuidance: {
      status: 'reviewed',
      priorities: [
        'Distinguir habitat (onde vive) de nicho (como vive e com quais recursos e relações).',
        'Classificar fatores bióticos e abióticos e prever como uma mudança em um deles afeta os organismos.',
        'Relacionar perda ou recuperação de hábitats à biodiversidade e às medidas de conservação.',
      ],
      commonPatterns: [
        'Na questão analisada do ENEM PPL 2023, um problema ambiental é apresentado e o estudante escolhe uma medida de conservação coerente com seus efeitos sobre a biodiversidade.',
        'O raciocínio parte de uma situação concreta e exige interpretar relações ecológicas e consequências ambientais, não apenas repetir definições.',
      ],
      lowerIncidence: [
        'No item consultado, não foi preciso memorizar classificações taxonômicas nem calcular crescimento populacional.',
      ],
      examsAnalyzed: 'ENEM PPL 2023 — Ciências da Natureza, questão 97 da reaplicação (caderno rosa).',
      sources: [
        'INEP, ENEM PPL 2023, 2º dia, caderno 8 (rosa), questão 97 — perda de biodiversidade e plantio de espécies nativas. https://download.inep.gov.br/enem/provas_e_gabaritos/2023_PV_reaplicacao_PPL_D2_CD8_superampliada.pdf',
        'Matriz de Referência do ENEM, Ciências da Natureza — ecossistemas, fatores bióticos e abióticos, habitat e nicho. https://download.inep.gov.br/download/enem/matriz_referencia.pdf',
      ],
    },
    lessons: [
      { id: 'bas1', kind: 'concept', title: 'Do organismo ao ecossistema', text: 'Indivíduos da mesma espécie formam populações. Populações de espécies diferentes formam comunidades; a comunidade em interação com os fatores abióticos compõe um ecossistema.' },
      { id: 'bas2', kind: 'example', title: 'O ambiente também faz parte', text: 'Num lago, algas, peixes e microrganismos interagem com água, luz, temperatura e sais minerais. Alterar a transparência ou a temperatura da água pode mudar as condições de vida dos organismos.' },
      { id: 'bas3', kind: 'concept', title: 'Habitat é o lugar; nicho é o modo de vida', text: 'Habitat indica onde a espécie vive. Nicho envolve como utiliza recursos, quando está ativa e como interage com outras espécies e com o ambiente.' },
      { id: 'bas4', kind: 'example', title: 'Interprete antes de escolher a medida', text: 'Em questões ambientais, identifique primeiro o que foi alterado — uma espécie, o habitat ou uma condição física — e depois acompanhe os efeitos sobre as relações e a biodiversidade.' },
      { id: 'bas5', kind: 'recall', title: 'Aplique ao caso', text: 'Após a retirada da mata ciliar, a água fica mais quente e turva. Cite um fator abiótico alterado e uma possível consequência para os organismos.', reveal: 'A temperatura e a turbidez da água são fatores abióticos alterados. Isso pode reduzir organismos sensíveis ou mudar alimento, abrigo e relações na comunidade.' },
    ], questions: natureExpansionQuestions('ecosystems') },
  { id: 'human-physiology', name: 'Corpo humano e saúde', discipline: 'Biologia', subtitle: 'Sistemas que trabalham em conjunto.', description: 'Relacione digestão, respiração, circulação, excreção, coordenação e imunidade à manutenção do organismo.', relevance: 'A integração entre sistemas do corpo ajuda a interpretar situações de saúde, prevenção e equilíbrio interno no ENEM.', prerequisiteIds: ['cytology'], priority: .89, version: 1,
    lessons: [
      { id: 'hp1', kind: 'concept', title: 'O organismo funciona em rede', text: 'Sistemas do corpo trocam matéria e sinais. Digestão disponibiliza nutrientes, respiração realiza trocas gasosas e circulação distribui substâncias entre tecidos.' },
      { id: 'hp2', kind: 'example', title: 'Oxigênio chega às células', text: 'Nos alvéolos, O2 difunde-se para o sangue e liga-se à hemoglobina. A circulação o leva aos tecidos, onde participa da respiração celular.' },
      { id: 'hp3', kind: 'concept', title: 'Homeostase depende de regulação', text: 'Rins ajustam água e sais; hormônios regulam processos como a glicemia; sistemas nervoso e endócrino coordenam respostas do organismo.' },
      { id: 'hp4', kind: 'recall', title: 'Conecte os sistemas', text: 'Durante uma corrida, por que aumentam a frequência respiratória e os batimentos cardíacos?', reveal: 'Os músculos consomem mais oxigênio e produzem mais CO2. Respiração e circulação ajustam as trocas e o transporte.' },
    ], questions: natureExpansionQuestions('human-health', 'human-physiology') },
  { id: 'evolution', name: 'Evolução e biodiversidade', discipline: 'Biologia', subtitle: 'A diversidade muda ao longo das gerações.', description: 'Interprete seleção natural, variação hereditária, evidências evolutivas e relações de parentesco.', relevance: 'Evolução conecta genética, biodiversidade, saúde e adaptação a problemas ambientais e sociais.', prerequisiteIds: ['genetics'], priority: .9, version: 1,
    lessons: [
      { id: 'ev1', kind: 'concept', title: 'Populações mudam ao longo do tempo', text: 'Evolução é a mudança de características hereditárias em populações ao longo das gerações. Indivíduos não evoluem por necessidade ou intenção.' },
      { id: 'ev2', kind: 'example', title: 'A resistência é selecionada', text: 'Se há variantes bacterianas resistentes, o antibiótico pode eliminar as suscetíveis. As resistentes deixam mais descendentes, aumentando sua frequência.' },
      { id: 'ev3', kind: 'concept', title: 'Várias evidências contam a história', text: 'Fósseis, anatomia comparada, embriologia e dados moleculares ajudam a investigar ancestralidade e parentesco entre espécies.' },
      { id: 'ev4', kind: 'recall', title: 'Seleção não é intenção', text: 'O antibiótico faz cada bactéria desenvolver resistência porque precisa sobreviver?', reveal: 'Não. Variações surgem sem objetivo; em certas condições, indivíduos resistentes sobrevivem e se reproduzem mais.' },
    ], questions: natureExpansionQuestions('evolution') },
  { id: 'electricity', name: 'Eletricidade e consumo', discipline: 'Física', subtitle: 'Energia elétrica em casa e na cidade.', description: 'Use tensão, corrente, resistência, potência e tempo para entender circuitos e consumo de energia.', relevance: 'Contas de luz, segurança elétrica e funcionamento de aparelhos são contextos recorrentes de Física no ENEM.', prerequisiteIds: ['proportions'], priority: .9, version: 1,
    lessons: [
      { id: 'el1', kind: 'concept', title: 'Tensão impulsiona cargas', text: 'Corrente elétrica descreve o fluxo de cargas. A tensão representa a diferença de potencial que pode impulsionar esse fluxo em um circuito.' },
      { id: 'el2', kind: 'example', title: 'Potência e energia consumida', text: 'Potência indica a rapidez de transformação de energia. Para estimar consumo, multiplique a potência pelo tempo de funcionamento.', formula: 'P = U × I   |   E = P × t' },
      { id: 'el3', kind: 'concept', title: 'Resistência e segurança', text: 'A lei de Ohm relaciona tensão, corrente e resistência. Fusíveis e disjuntores interrompem correntes excessivas para proteger a instalação.' },
      { id: 'el4', kind: 'recall', title: 'Leia a conta de energia', text: 'Uma lâmpada de 100 W fica acesa por 10 horas. Qual energia consome em kWh?', reveal: '100 W = 0,1 kW; 0,1 kW × 10 h = 1 kWh.' },
    ], questions: natureExpansionQuestions('electricity') },
  { id: 'ph-hydrolysis', name: 'Ácidos, bases e equilíbrio', discipline: 'Química', subtitle: 'O que o pH revela sobre uma solução.', description: 'Interprete pH, indicadores, neutralização e equilíbrios ácido-base em contextos do cotidiano e do ambiente.', relevance: 'Acidez de solos e águas, produtos domésticos e equilíbrio químico conectam conceitos a problemas contextualizados no ENEM.', prerequisiteIds: ['solutions'], priority: .88, version: 1,
    lessons: [
      { id: 'ab1', kind: 'concept', title: 'pH indica acidez', text: 'Em soluções aquosas diluídas, pH menor indica maior acidez. Indicadores mudam de cor em faixas de pH e ajudam a comparar soluções.' },
      { id: 'ab2', kind: 'example', title: 'Neutralização forma produtos', text: 'Em uma neutralização, espécies ácidas e básicas reagem. Frequentemente formam água e um sal, como na reação entre HCl e NaOH.' },
      { id: 'ab3', kind: 'concept', title: 'Equilíbrio continua dinâmico', text: 'No equilíbrio químico, as reações direta e inversa continuam ocorrendo à mesma velocidade. Alterar concentrações pode deslocar a composição do sistema.' },
      { id: 'ab4', kind: 'recall', title: 'Compare sem decorar', text: 'Uma solução de pH 3 é mais ou menos ácida que outra de pH 5?', reveal: 'É mais ácida: menor pH corresponde a maior acidez.' },
    ], questions: natureExpansionQuestions('acid-base', 'ph-hydrolysis') },
  { id: 'electrochemistry', name: 'Pilhas e eletrólise', discipline: 'Química', subtitle: 'Reações químicas que movem cargas.', description: 'Acompanhe oxidação e redução em pilhas, eletrólise, corrosão e proteção de metais.', relevance: 'Baterias, corrosão e obtenção de metais aproximam eletroquímica de tecnologias e impactos ambientais.', prerequisiteIds: ['stoichiometry', 'solutions'], priority: .87, version: 1,
    lessons: [
      { id: 'ec1', kind: 'concept', title: 'Oxidação e redução andam juntas', text: 'Oxidação é perda de elétrons; redução é ganho. Em uma reação de oxirredução, uma espécie doa elétrons e outra os recebe.' },
      { id: 'ec2', kind: 'example', title: 'Uma pilha produz corrente', text: 'Em uma pilha, uma reação espontânea separa os processos de oxidação e redução. Os elétrons percorrem o circuito externo e fornecem energia elétrica.' },
      { id: 'ec3', kind: 'concept', title: 'Eletrólise usa energia elétrica', text: 'Uma fonte externa força uma reação não espontânea. A eletrólise pode ser usada para obter ou purificar substâncias e revestir objetos.' },
      { id: 'ec4', kind: 'recall', title: 'Proteja o ferro', text: 'Por que uma camada de zinco pode proteger uma peça de ferro contra corrosão?', reveal: 'O zinco pode oxidar-se preferencialmente e atuar como metal de sacrifício, protegendo o ferro.' },
    ], questions: natureExpansionQuestions('electrochemistry') },
  { id: 'ecology', name: 'Cadeias e ciclos biogeoquímicos', discipline: 'Biologia', subtitle: 'O campeão absoluto de incidência do ENEM.', description: 'Acompanhe o fluxo unidirecional de energia e a reciclagem dos elementos químicos na biosfera.', relevance: 'Ecologia representa historicamente mais de 30% da prova de Biologia do ENEM.', prerequisiteIds: [], priority: .98, version: 1,
    learningContext: {
      overview: 'Ecologia investiga as relações entre os seres vivos e o ambiente. No ENEM, o foco está em como as atividades humanas desequilibram teias tróficas e ciclos vitais como carbono e nitrogênio.',
      applications: [
        'Recuperação de nascentes e bacias hidrográficas afetadas por esgoto e eutrofização.',
        'Manejo biológico de pragas agrícolas sem o uso de pesticidas bioacumulativos.',
      ],
      limitations: 'Diagramas de cadeias alimentares simplificam teias tróficas reais que possuem dezenas de conexões dinâmicas.',
    },
    enemGuidance: { status: 'reviewed', priorities: ['Bioacumulação trófica no topo da cadeia', 'Ciclos do carbono e do nitrogênio', 'Eutrofização artificial'], commonPatterns: ['Identificação de níveis tróficos e perdas energéticas na cadeia'], lowerIncidence: ['Taxonomia minuciosa de espécies de fitoplâncton'], examsAnalyzed: 'ENEM 2015–2024', sources: ['ENEM 2024 Azul Q98', 'ENEM 2023 Azul Q120', 'ENEM 2021 Azul Q114'] },
    lessons: [
      { id: 'eco1', kind: 'concept', title: 'Energia flui; matéria cicla', text: 'Produtores captam luz solar e iniciam a cadeia alimentar. A cada nível trófico, cerca de 90% da energia se dissipa em calor. Por isso, o fluxo de energia é unidirecional e decrescente.' },
      { id: 'eco2', kind: 'example', title: 'O perigo da bioacumulação', text: 'Poluentes lipossolúveis não biodegradáveis (como mercúrio e agrotóxicos) não são eliminados pelos organismos e se concentram nos predadores do topo da cadeia.' },
      { id: 'eco3', kind: 'concept', title: 'Ciclos do carbono e nitrogênio', text: 'Plantas retiram CO2 pela fotossíntese e animais liberam pela respiração. No nitrogênio, bactérias fixadoras transformam N2 gasoso em amônia e nitratos para os vegetais.' },
      { id: 'eco4', kind: 'recall', title: 'Ponto chave do ENEM', text: 'Por que o esgoto jogado em uma lagoa provoca a morte dos peixes por asfixia?', reveal: 'O esgoto nutre algas que proliferam; quando morrem, bactérias decompositoras consomem todo o oxigênio da água!' },
    ], questions: ecologyQuestions() },
  { id: 'language-functions', name: 'Funções da linguagem e intenção', discipline: 'Linguagens', subtitle: 'Decodifique o propósito por trás do texto.', description: 'Reconheça se o autor quer emocionar, persuadir, informar ou refletir sobre as palavras.', relevance: 'Funções da linguagem e interpretação crítica formam a espinha dorsal de Linguagens no ENEM.', prerequisiteIds: [], priority: .97, version: 1,
    learningContext: {
      overview: 'Toda comunicação tem uma intenção predominante: convencer, emocionar, informar, testar contato ou refletir sobre a fala. Identificar o objetivo comunicativo é a chave do ENEM.',
      applications: [
        'Análise crítica de campanhas de vacinação, saúde pública e conscientização cidadã.',
        'Identificação de estratégias persuasivas em publicidade comercial e redes sociais.',
      ],
      limitations: 'Textos reais raramente apresentam uma função isolada; em geral, combinam duas ou mais funções com uma dominante.',
    },
    enemGuidance: { status: 'reviewed', priorities: ['Função apelativa em propagandas e campanhas', 'Função metalinguística em poemas e dicionários'], commonPatterns: ['Associação entre verbos no imperativo e a intenção de orientar a ação do leitor'], lowerIncidence: ['Memorização estrita sem o texto-fonte'], examsAnalyzed: 'ENEM 2016–2024', sources: ['ENEM 2024 Azul Q15', 'ENEM 2023 Azul Q22', 'ENEM 2021 Azul Q8'] },
    lessons: [
      { id: 'lang1', kind: 'concept', title: 'O foco muda o efeito', text: 'Roman Jakobson identificou que cada função enfatiza um elemento da comunicação: o emissor (emotiva), o receptor (apelativa), o contexto (referencial), o canal (fática), o código (metalinguística) ou a mensagem (poética).' },
      { id: 'lang2', kind: 'example', title: 'Apelativa: o foco é em você', text: 'Campanhas como "Não dirija após beber. Preserve vidas." usam verbos no imperativo e vocativos para persuadir o interlocutor a mudar de conduta.' },
      { id: 'lang3', kind: 'concept', title: 'Metalinguagem: a língua falando de si', text: 'Quando um poema discute a dificuldade de rimar, uma canção fala sobre compor música ou um verbete define uma palavra, temos função metalinguística.' },
      { id: 'lang4', kind: 'recall', title: 'Interprete a intenção', text: 'Um manual de instruções de um aparelho celular predomina em qual função da linguagem?', reveal: 'Função referencial (ou denotativa), pois prioriza transmitir informações objetivas e claras sem emitir opinião.' },
    ], questions: languageQuestions() },
];

let currentTopics: Topic[] = [...STATIC_TOPICS];
const listeners = new Set<() => void>();

export function getCatalog(): Topic[] {
  return currentTopics;
}

export function setCatalog(nextTopics: Topic[]) {
  currentTopics = nextTopics;
  TOPICS = currentTopics;
  TOPIC_IDS = currentTopics.map(t => t.id);
  listeners.forEach(cb => cb());
}

export function subscribeCatalog(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export let TOPICS: Topic[] = currentTopics;
export let TOPIC_IDS: TopicId[] = currentTopics.map(t => t.id);

export function topicById(id: TopicId, topics: Topic[] = currentTopics): Topic {
  const found = topics.find(t => t.id === id);
  if (!found) {
    // Fallback: search in static if not in dynamic
    const staticFound = STATIC_TOPICS.find(t => t.id === id);
    if (staticFound) return staticFound;
    throw new Error(`Monstro desconhecido: ${id}`);
  }
  return found;
}

export function questionById(id: string, topics: Topic[] = currentTopics): Question {
  const found = topics.flatMap(t => t.questions).find(q => q.id === id);
  if (!found) {
    const staticFound = STATIC_TOPICS.flatMap(t => t.questions).find(q => q.id === id);
    if (staticFound) return staticFound;
    throw new Error(`Questão desconhecida: ${id}`);
  }
  return found;
}

export function mergeCatalogs(staticCatalog: Topic[], remoteCatalog: Topic[]): Topic[] {
  const remoteMap = new Map(remoteCatalog.map(t => [t.id, t]));
  const result: Topic[] = [];

  for (const staticTopic of staticCatalog) {
    if (remoteMap.has(staticTopic.id)) {
      const remoteTopic = remoteMap.get(staticTopic.id)!;
      result.push({
        ...staticTopic,
        ...remoteTopic,
        learningContext: remoteTopic.learningContext ?? staticTopic.learningContext,
        enemGuidance: remoteTopic.enemGuidance ?? staticTopic.enemGuidance,
      });
      remoteMap.delete(staticTopic.id);
    } else {
      result.push(staticTopic);
    }
  }

  // Append any new topics created in CMS
  for (const newTopic of remoteMap.values()) {
    result.push(newTopic);
  }

  return result;
}

interface RawTopicRow {
  id: string;
  name: string;
  discipline: string;
  version: number;
  content: {
    subtitle?: string;
    description?: string;
    relevance?: string;
    priority?: number;
    prerequisiteIds?: string[];
    lessons?: {
      id?: string;
      kind?: string;
      title: string;
      text: string;
      formula?: string;
      reveal?: string;
    }[];
    learningContext?: Topic['learningContext'];
    enemGuidance?: Topic['enemGuidance'];
  };
}

interface RawQuestionRow {
  id: string;
  topic_id: string;
  purpose: 'diagnostic' | 'practice' | 'review';
  difficulty: 1 | 2 | 3;
  content: {
    id: string;
    topicId: string;
    prompt: string;
    options: string[];
    answer: number;
    explanation: string;
    difficulty: 1 | 2 | 3;
    purpose: 'diagnostic' | 'practice' | 'review';
  };
}

export async function fetchPublishedCatalog(supabase: SupabaseClient | null): Promise<Topic[]> {
  if (!supabase) return STATIC_TOPICS;

  try {
    const [topicsResponse, questionsResponse] = await Promise.all([
      supabase.from('topics').select('id, name, discipline, version, content').eq('published', true),
      supabase.from('questions').select('id, topic_id, purpose, difficulty, content'),
    ]);

    if (topicsResponse.error || !topicsResponse.data) {
      return getCatalog();
    }

    const topicsRows = topicsResponse.data as unknown as RawTopicRow[];
    const questionsRows = (questionsResponse.data ?? []) as unknown as RawQuestionRow[];

    const remoteTopics: Topic[] = topicsRows.map(row => {
      const content = row.content || {};
      const topicQuestions: Question[] = questionsRows
        .filter(q => q.topic_id === row.id)
        .map(q => {
          const qc = q.content || {};
          return {
            id: q.id,
            topicId: row.id,
            prompt: qc.prompt ?? '',
            options: qc.options ?? [],
            answer: qc.answer ?? 0,
            explanation: qc.explanation ?? '',
            difficulty: (q.difficulty ?? qc.difficulty ?? 1) as 1 | 2 | 3,
            purpose: (q.purpose ?? qc.purpose ?? 'practice') as 'diagnostic' | 'practice' | 'review',
          };
        });

      const lessons: LessonBlock[] = (content.lessons || []).map((l, index) => ({
        id: l.id || `${row.id}-block-${index + 1}`,
        kind: l.kind || 'concept',
        title: l.title || '',
        text: l.text || '',
        formula: l.formula,
        reveal: l.reveal,
      }));

      return {
        id: row.id,
        name: row.name,
        discipline: row.discipline as Topic['discipline'],
        subtitle: content.subtitle || '',
        description: content.description || '',
        relevance: content.relevance || '',
        priority: content.priority ?? 0,
        version: row.version,
        prerequisiteIds: (content.prerequisiteIds || []) as TopicId[],
        lessons,
        learningContext: content.learningContext,
        enemGuidance: content.enemGuidance,
        questions: topicQuestions,
      };
    });

    const merged = mergeCatalogs(STATIC_TOPICS, remoteTopics);
    setCatalog(merged);
    return merged;
  } catch {
    return getCatalog();
  }
}
