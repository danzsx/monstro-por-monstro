import type { SourceGroup } from './types';

export const MAP_VERSION = 1;
export const SOURCES = {
  checkedAt: '2026-09-23',
  matrix: 'https://download.inep.gov.br/download/enem/matriz_referencia.pdf',
  publication: 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem',
  notice: 'https://www.in.gov.br/web/dou/-/edital-n-64-de-21-de-maio-de-2026-707325396',
  noticeMirror: 'https://sedu.es.gov.br/media/pdf%20e%20Arquivos/Curr%C3%ADculo/edital-no-64-de-21-de-maio-de-2026-dou-imprensa-nacional.pdf',
};

// This inventory is independent of the study nodes. Never remove an item merely
// to make coverage tests pass. Section + official heading are stable locators
// across PDF editions whose pagination differs.
export const SOURCE_GROUPS: SourceGroup[] = [
  { id: 'bio-cell', territory: 'biology', section: '3.3', title: 'Células e moléculas', officialTitle: 'Moléculas, células e tecidos', items: [
    'Estrutura e funcionamento celular: membrana, citoplasma e núcleo.',
    'Divisão celular.',
    'Bioquímica das estruturas celulares.',
    'Metabolismo celular e energético: fotossíntese e respiração.',
    'Informação genética e síntese de proteínas.',
    'Diferenciação celular e tecidos animais e vegetais.',
    'Origem e evolução das células.',
    'Células-tronco, clonagem e DNA recombinante.',
    'Biotecnologia em alimentos, fármacos e componentes biológicos; DNA em pesquisa, paternidade, identificação e investigação criminal.',
    'Ética na biotecnologia e relações com a sustentabilidade.',
  ] },
  { id: 'bio-inheritance', territory: 'biology', section: '3.3', title: 'Genética e herança', officialTitle: 'Hereditariedade e diversidade da vida', items: [
    'Transmissão de características hereditárias e concepções anteriores a Mendel.',
    'Genética do corpo humano; antígenos, anticorpos, grupos sanguíneos, transplantes e autoimunidade.',
    'Neoplasias e fatores ambientais.',
    'Mutações gênicas e cromossômicas e aconselhamento genético.',
    'Bases genéticas da evolução e da formação e manutenção da diversidade biológica.',
  ] },
  { id: 'bio-organisms', territory: 'biology', section: '3.3', title: 'Seres vivos', officialTitle: 'Identidade dos seres vivos', items: [
    'Níveis de organização; vírus, procariontes e eucariontes; organismos uni e pluricelulares; autótrofos e heterótrofos.',
    'Sistemática, grandes linhas evolutivas e biotecnologia aplicada à classificação.',
    'Ciclos de vida.',
    'Evolução, padrões anatômicos e fisiológicos, funções vitais e adaptação ao ambiente.',
    'Embriologia, anatomia e fisiologia humana.',
    'Evolução humana.',
  ] },
  { id: 'bio-ecology', territory: 'biology', section: '3.3', title: 'Ecologia e ambiente', officialTitle: 'Ecologia e ciências ambientais', items: [
    'Ecossistemas, fatores bióticos e abióticos, habitat e nicho.',
    'Teias alimentares e fluxo de energia nos ecossistemas.',
    'Sucessão ecológica e comunidade clímax.',
    'Populações e interações entre seres vivos.',
    'Ciclos biogeoquímicos.',
    'Biogeografia e biomas brasileiros.',
    'Recursos naturais, mudanças climáticas, efeito estufa, desmatamento, erosão e poluição da água, solo e ar.',
    'Conservação, recuperação de ecossistemas e biodiversidade; tecnologias ambientais e saneamento.',
    'Legislação ambiental sobre água, florestas, unidades de conservação e biodiversidade.',
  ] },
  { id: 'bio-evolution', territory: 'biology', section: '3.3', title: 'Origens e evolução', officialTitle: 'Origem e evolução da vida', items: [
    'Biologia como ciência: história, métodos, técnicas e experimentação.',
    'Hipóteses de origem do Universo, Terra e vida.',
    'Teorias evolutivas, explicações pré-darwinistas, Darwin e teoria sintética.',
    'Seleção artificial e efeitos sobre ambientes e populações humanas.',
  ] },
  { id: 'bio-health', territory: 'biology', section: '3.3', title: 'Saúde e sociedade', officialTitle: 'Qualidade de vida das populações humanas', items: [
    'Pobreza, desenvolvimento humano, indicadores sociais, ambientais, econômicos e IDH.',
    'Doenças da população brasileira: características, prevenção e profilaxia; primeiros socorros e infecções sexualmente transmissíveis.',
    'Uso indevido de drogas, gravidez na adolescência, obesidade, violência e segurança pública.',
    'Exercício físico, vida saudável, sustentabilidade, legislação e cidadania.',
  ] },
  { id: 'phy-basics', territory: 'physics', section: '3.1', title: 'Ferramentas da Física', officialTitle: 'Conhecimentos básicos e fundamentais', items: [
    'Ordens de grandeza, notação científica e Sistema Internacional de Unidades.',
    'Investigação, regularidades, observação, mensuração e representação de grandezas físicas.',
    'Gráficos, grandezas escalares e vetoriais e operações com vetores.',
  ] },
  { id: 'phy-motion', territory: 'physics', section: '3.1', title: 'Movimento e equilíbrio', officialTitle: 'O movimento, o equilíbrio e a descoberta de leis físicas', items: [
    'Tempo, espaço, velocidade e aceleração; descrição matemática e gráfica e casos especiais de movimento.',
    'História de força e movimento; inércia, referenciais inerciais e não inerciais; massa, ponto material, centro de massa e leis de Newton.',
    'Forças externas e internas; atrito, peso, normal e tração; diagramas de forças.',
    'Quantidade de movimento, força e sua variação; conservação do momento e impulso.',
    'Torque e equilíbrio estático de partículas e corpos rígidos.',
    'Forças em movimentos circulares e força centrípeta.',
    'História e variáveis da hidrostática; pressão, empuxo, flutuação; Pascal, Arquimedes e Stevin.',
  ] },
  { id: 'phy-energy', territory: 'physics', section: '3.1', title: 'Trabalho e energia', officialTitle: 'Energia, trabalho e potência', items: [
    'Trabalho, potência, energia cinética e potencial; trabalho gravitacional e energia potencial gravitacional.',
    'Conservação e dissipação da energia mecânica; forças conservativas e dissipativas.',
  ] },
  { id: 'phy-universe', territory: 'physics', section: '3.1', title: 'Terra e Universo', officialTitle: 'A Mecânica e o funcionamento do Universo', items: [
    'Peso, aceleração gravitacional e gravitação universal.',
    'Kepler, movimentos celestes, marés e variações climáticas; concepções históricas de origem e evolução do Universo.',
  ] },
  { id: 'phy-electricity', territory: 'physics', section: '3.1', title: 'Eletricidade e magnetismo', officialTitle: 'Fenômenos elétricos e magnéticos', items: [
    'Carga, lei de Coulomb, campo e potencial elétricos; linhas de campo e equipotenciais; poder das pontas, blindagem e capacitores.',
    'Corrente elétrica, lei de Ohm, resistência e resistividade.',
    'Efeito Joule; relações entre tensão, corrente, potência, energia e consumo de dispositivos.',
    'Circuitos simples, corrente contínua e alternada, medidores, representações e símbolos.',
    'Campo magnético, ímãs, linhas de campo e magnetismo terrestre.',
  ] },
  { id: 'phy-waves', territory: 'physics', section: '3.1', title: 'Ondas e luz', officialTitle: 'Oscilações, ondas, óptica e radiação', items: [
    'Pulsos, ondas, ciclos, período e frequência; velocidade, comprimento e propagação em diferentes meios.',
    'Feixes, frentes de onda, fenômenos ondulatórios, reflexão e refração.',
    'Óptica geométrica, lentes, espelhos, imagens e instrumentos ópticos simples.',
  ] },
  { id: 'phy-heat', territory: 'physics', section: '3.1', title: 'Calor e temperatura', officialTitle: 'O calor e os fenômenos térmicos', items: [
    'Calor, temperatura, escalas, equilíbrio e transferência de calor; condução e dilatação.',
    'Capacidade térmica, calor específico, mudanças de estado e calor latente.',
    'Gases ideais, máquinas térmicas, Carnot e leis da termodinâmica; aplicações cotidianas e clima associado ao ciclo da água.',
  ] },
  { id: 'chem-matter', territory: 'chemistry', section: '3.2', title: 'Átomos e transformações', officialTitle: 'Transformações químicas', items: [
    'Evidências e interpretação de transformações e reações químicas.',
    'Leis e equação dos gases ideais; Avogadro, moléculas, massa e volume molar, teoria cinética e misturas gasosas.',
    'Modelo corpuscular; modelos de Dalton, Thomson, Rutherford e Rutherford-Bohr; natureza elétrica da matéria.',
    'Estrutura atômica, números atômico e de massa, isótopos, massa atômica, elementos e tabela periódica.',
  ] },
  { id: 'chem-amount', territory: 'chemistry', section: '3.2', title: 'Quantidades e reações', officialTitle: 'Representação das transformações químicas', items: [
    'Fórmulas químicas e balanceamento de equações.',
    'Leis ponderais, relações quantitativas e determinação de fórmulas.',
    'Massa, volume, mol, massa molar e constante de Avogadro.',
    'Cálculos estequiométricos.',
  ] },
  { id: 'chem-materials', territory: 'chemistry', section: '3.2', title: 'Materiais e ligações', officialTitle: 'Materiais, suas propriedades e usos', items: [
    'Propriedades e estados físicos dos materiais, mudanças de estado, misturas e métodos de separação; classificação de substâncias.',
    'Metais e ligas, ferro, cobre, alumínio e ligação metálica.',
    'Substâncias e ligação iônicas; cloretos, carbonatos, nitratos e sulfatos.',
    'Substâncias moleculares e ligação covalente: hidrogênio, oxigênio, nitrogênio, cloro, amônia, água, ácido clorídrico e metano.',
    'Polaridade e forças intermoleculares; estrutura, propriedades e usos de substâncias.',
  ] },
  { id: 'chem-water', territory: 'chemistry', section: '3.2', title: 'Água e soluções', officialTitle: 'Água', items: [
    'Ocorrência, importância biológica, ligação, estrutura e propriedades da água.',
    'Soluções aquosas, coloides, suspensões, solubilidade e concentração.',
    'Aspectos qualitativos das propriedades coligativas.',
    'Ácidos, bases, sais e óxidos: conceitos, classificação, propriedades, fórmulas e nomenclatura.',
    'Indicadores ácido-base, condução elétrica, reações com metais e neutralização.',
  ] },
  { id: 'chem-energy', territory: 'chemistry', section: '3.2', title: 'Energia das reações', officialTitle: 'Transformações químicas e energia', items: [
    'Calor de reação, entalpia, equações termoquímicas e lei de Hess.',
    'Oxirredução e potenciais padrão de redução.',
    'Pilhas, eletrólise e leis de Faraday.',
    'Transformações nucleares, radioatividade, fissão, fusão, decaimento e radioisótopos.',
  ] },
  { id: 'chem-rates', territory: 'chemistry', section: '3.2', title: 'Velocidade das reações', officialTitle: 'Dinâmica das transformações químicas', items: [
    'Velocidade de reação e energia de ativação.',
    'Efeitos de concentração, pressão, temperatura e catalisadores na velocidade.',
  ] },
  { id: 'chem-equilibrium', territory: 'chemistry', section: '3.2', title: 'Equilíbrio químico', officialTitle: 'Transformação química e equilíbrio', items: [
    'Sistemas em equilíbrio e constante de equilíbrio.',
    'Produto iônico da água, equilíbrio ácido-base, pH, solubilidade dos sais e hidrólise.',
    'Fatores que alteram o equilíbrio; velocidade e equilíbrio no cotidiano.',
  ] },
  { id: 'chem-carbon', territory: 'chemistry', section: '3.2', title: 'Carbono e vida', officialTitle: 'Compostos de carbono', items: [
    'Características orgânicas, funções, estruturas e propriedades de hidrocarbonetos e compostos oxigenados e nitrogenados.',
    'Fermentação.',
    'Macromoléculas e polímeros naturais e sintéticos: amido, glicogênio, celulose, borrachas, polietileno, poliestireno, PVC, teflon e náilon.',
    'Óleos, gorduras, sabões, detergentes, proteínas e enzimas.',
  ] },
  { id: 'chem-society', territory: 'chemistry', section: '3.2', title: 'Química e sociedade', officialTitle: 'Relações da Química com as tecnologias, a sociedade e o meio ambiente', items: [
    'Química no cotidiano, agricultura, saúde, alimentos e ambiente.',
    'Produção química: aspectos tecnológicos, sociais, econômicos e ambientais; cloro, hidróxido de sódio, ácido sulfúrico, amônia e ácido nítrico.',
    'Mineração e metalurgia.',
    'Poluição e tratamento de água, poluição do ar, contaminação e proteção ambiental.',
  ] },
  { id: 'chem-fuels', territory: 'chemistry', section: '3.2', title: 'Combustíveis e energia', officialTitle: 'Energias químicas no cotidiano', items: [
    'Petróleo, gás natural, carvão e hulha; impactos de combustíveis fósseis.',
    'Madeira, biomassa e biocombustíveis.',
    'Energia nuclear, rejeitos radioativos, vantagens e desvantagens.',
  ] },
];
