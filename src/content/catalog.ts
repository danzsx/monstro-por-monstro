import type { SupabaseClient } from '@supabase/supabase-js';
import { Topic, TopicId, Question, LessonBlock, EnemMetadata } from '@/learning/types';
import {
  mathQuestions,
  biologyQuestions,
  physicsQuestions,
  chemistryQuestions,
  ecologyQuestions,
  languageQuestions,
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
