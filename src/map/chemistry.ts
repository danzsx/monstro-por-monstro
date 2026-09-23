import { units } from './types';

export const CHEMISTRY_NODES = [
  ...units('chem-matter', [
    ['chemical-changes', 'Transformações químicas', 'Use evidências para identificar reações e explique transformações da matéria por rearranjo de partículas.', [0]],
    ['gases', 'Gases', 'Relacione pressão, volume, temperatura e quantidade de matéria. Explore Avogadro, volume molar, teoria cinética e misturas gasosas.', [1]],
    ['atomic-models', 'Modelos atômicos', 'Acompanhe os modelos de Dalton, Thomson, Rutherford e Bohr e as evidências associadas à estrutura e à natureza elétrica da matéria.', [2], 'atomic-models'],
    ['periodic-table', 'Átomos e tabela periódica', 'Identifique prótons, nêutrons e elétrons, números atômico e de massa, isótopos e massa atômica e leia a organização dos elementos.', [3]],
  ]),
  ...units('chem-amount', [
    ['chemical-equations', 'Fórmulas e balanceamento', 'Leia fórmulas e equações e balanceie reações conservando os átomos de cada elemento.', [0]],
    ['chemical-laws', 'Leis ponderais', 'Relacione massas e composição das substâncias às leis de conservação e proporções e à determinação de fórmulas.', [1]],
    ['mole', 'Mol e massa molar', 'Faça a ponte entre partículas, mol, massa e volume por meio da constante de Avogadro e da massa molar.', [2]],
    ['stoichiometry', 'Estequiometria', 'Use equações balanceadas para relacionar quantidades de reagentes e produtos e reconhecer o reagente limitante.', [3], 'stoichiometry'],
  ]),
  ...units('chem-materials', [
    ['materials', 'Substâncias e misturas', 'Compare propriedades, estados físicos e mudanças de estado, classifique substâncias e escolha métodos de separação de misturas.', [0]],
    ['metallic-bonds', 'Metais e ligas', 'Relacione a ligação metálica às propriedades e aos usos de metais e ligas, incluindo ferro, cobre e alumínio.', [1]],
    ['ionic-bonds', 'Ligações iônicas', 'Relacione íons à estrutura e às propriedades de substâncias como cloretos, carbonatos, nitratos e sulfatos.', [2]],
    ['covalent-bonds', 'Ligações covalentes', 'Explique o compartilhamento de elétrons e interprete moléculas como água, metano, amônia e gases simples.', [3]],
    ['polarity', 'Polaridade e interações', 'Relacione distribuição de cargas, forças intermoleculares, propriedades físicas e aplicações das substâncias.', [4]],
  ]),
  ...units('chem-water', [
    ['water-chemistry', 'A química da água', 'Relacione estrutura e ligações da água às suas propriedades, à ocorrência na natureza e à importância para os seres vivos.', [0]],
    ['solutions', 'Soluções e concentrações', 'Diferencie soluções, coloides e suspensões. Explore solubilidade, concentração e diluição.', [1], 'solutions'],
    ['colligative', 'Propriedades coligativas', 'Explique qualitativamente como partículas dissolvidas afetam congelamento, ebulição, pressão de vapor e osmose.', [2]],
    ['inorganic-functions', 'Ácidos, bases, sais e óxidos', 'Reconheça funções inorgânicas, conceitos ácido-base, nomenclatura, fórmulas e propriedades.', [3]],
    ['acid-base-reactions', 'Reações e indicadores', 'Interprete indicadores, condutividade, reações com metais e neutralização para compreender o comportamento de ácidos e bases.', [4]],
  ]),
  ...units('chem-energy', [
    ['thermochemistry', 'Termoquímica', 'Leia equações termoquímicas e relacione calor de reação, entalpia e lei de Hess às transformações químicas.', [0]],
    ['redox', 'Oxirredução', 'Acompanhe transferências de elétrons e use potenciais de redução para interpretar reações de oxirredução.', [1]],
    ['electrochemistry', 'Pilhas e eletrólise', 'Conecte reações químicas e corrente elétrica no funcionamento de pilhas e eletrólise, incluindo relações quantitativas de Faraday.', [2]],
    ['radioactivity', 'Radioatividade', 'Diferencie transformações químicas e nucleares e estude decaimento, radioisótopos, fissão e fusão.', [3]],
  ]),
  ...units('chem-rates', [
    ['kinetics', 'Cinética química', 'Interprete a velocidade das transformações e o papel da energia de ativação.', [0]],
    ['reaction-factors', 'Fatores e catalisadores', 'Explique como concentração, pressão, temperatura e catalisadores alteram a rapidez de uma reação.', [1]],
  ]),
  ...units('chem-equilibrium', [
    ['chemical-equilibrium', 'Equilíbrio dinâmico', 'Compreenda reações reversíveis, taxas de reação e constante de equilíbrio sem confundir equilíbrio com ausência de transformação.', [0]],
    ['ph-hydrolysis', 'pH e equilíbrio em água', 'Conecte produto iônico da água, equilíbrio ácido-base, pH, solubilidade dos sais e hidrólise.', [1]],
    ['equilibrium-shifts', 'Deslocamento do equilíbrio', 'Investigue como mudanças no sistema afetam o equilíbrio e relacione equilíbrio e velocidade a situações cotidianas.', [2]],
  ]),
  ...units('chem-carbon', [
    ['organic-chemistry', 'Funções orgânicas', 'Relacione estruturas e propriedades de hidrocarbonetos e compostos oxigenados e nitrogenados aos grupos funcionais.', [0], undefined, ['química orgânica']],
    ['fermentation', 'Fermentação', 'Explore transformações de matéria orgânica na produção de alimentos e combustíveis e sua relação com processos celulares.', [1]],
    ['polymers', 'Polímeros', 'Compare macromoléculas naturais e sintéticas: amido, glicogênio, celulose, borrachas e plásticos como PVC, polietileno, teflon e náilon.', [2]],
    ['biochemistry-materials', 'Gorduras, proteínas e sabões', 'Relacione propriedades de óleos, gorduras, proteínas e enzimas às suas estruturas e ao funcionamento de sabões e detergentes.', [3]],
  ]),
  ...units('chem-society', [
    ['everyday-chemistry', 'Química no cotidiano', 'Relacione substâncias e transformações a alimentos, agricultura, saúde e ambiente, avaliando benefícios e impactos.', [0]],
    ['chemical-industry', 'Indústria química', 'Explore obtenção e uso de cloro, soda cáustica, ácido sulfúrico, amônia e ácido nítrico e suas dimensões ambientais e socioeconômicas.', [1]],
    ['mining', 'Mineração e metalurgia', 'Relacione obtenção de metais, transformações químicas, uso de recursos e impactos da mineração e da metalurgia.', [2]],
    ['water-treatment', 'Poluição e tratamento', 'Compare processos de tratamento de água e controle da poluição e relacione contaminantes a estratégias de proteção ambiental.', [3]],
  ]),
  ...units('chem-fuels', [
    ['fossil-fuels', 'Combustíveis fósseis', 'Estude petróleo, gás natural, carvão e hulha como fontes de energia, relacionando usos, transformações e impactos ambientais.', [0]],
    ['biofuels', 'Biomassa e biocombustíveis', 'Compare madeira, biomassa e combustíveis de origem biológica, considerando ciclos da matéria e impactos de produção e uso.', [1]],
    ['nuclear-energy', 'Energia nuclear', 'Relacione transformações nucleares à produção de energia e avalie vantagens, limitações e manejo dos rejeitos radioativos.', [2]],
  ]),
];
