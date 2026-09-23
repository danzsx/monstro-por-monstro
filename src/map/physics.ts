import { units } from './types';

export const PHYSICS_NODES = [
  ...units('phy-basics', [
    ['measurements', 'Grandezas e unidades', 'Trabalhe com ordens de grandeza, notação científica, medidas e conversões no Sistema Internacional.', [0]],
    ['physical-investigation', 'Investigar fenômenos', 'Relacione observação, medidas, representações e busca de regularidades à construção de explicações físicas.', [1]],
    ['graphs-vectors', 'Gráficos e vetores', 'Interprete gráficos e diferencie grandezas escalares de vetoriais, incluindo operações básicas com vetores.', [2]],
  ]),
  ...units('phy-motion', [
    ['kinematics', 'Cinemática', 'Descreva posição, tempo, velocidade e aceleração em diferentes movimentos, usando equações e gráficos.', [0], 'kinematics'],
    ['newton-laws', 'Leis de Newton', 'Conecte inércia, massa e força às mudanças de movimento e ao papel do referencial. Explore ponto material e centro de massa.', [1], 'newton-laws'],
    ['forces', 'Forças do cotidiano', 'Construa diagramas para identificar peso, normal, atrito e tração e distinguir forças internas e externas.', [2]],
    ['momentum', 'Impulso e quantidade de movimento', 'Relacione força, intervalo de tempo e variação do momento linear para compreender colisões e conservação.', [3]],
    ['statics', 'Torque e equilíbrio', 'Investigue as condições de equilíbrio de partículas e corpos rígidos, incluindo os efeitos de rotação das forças.', [4]],
    ['circular-motion', 'Movimento circular', 'Relacione a mudança de direção da velocidade à aceleração e à força resultante centrípeta.', [5]],
    ['hydrostatics', 'Hidrostática', 'Explore pressão, empuxo e flutuação pelos princípios de Stevin, Pascal e Arquimedes, situando seu desenvolvimento histórico.', [6]],
  ]),
  ...units('phy-energy', [
    ['work-power', 'Trabalho e potência', 'Relacione forças e deslocamentos às transferências de energia e compare a rapidez dessas transferências pela potência.', [0]],
    ['mechanical-energy', 'Energia mecânica', 'Analise energia cinética e potencial, trabalho gravitacional, conservação e dissipação em sistemas mecânicos.', [0, 1]],
  ]),
  ...units('phy-universe', [
    ['gravitation', 'Gravitação', 'Relacione massa, distância, campo gravitacional e força peso, distinguindo massa de peso.', [0]],
    ['astronomy', 'Movimentos celestes', 'Explore Kepler, órbitas, marés e variações climáticas e compare concepções históricas sobre o Universo.', [1]],
  ]),
  ...units('phy-electricity', [
    ['electrostatics', 'Cargas e campos elétricos', 'Conecte cargas, lei de Coulomb, campo e potencial a linhas de campo, equipotenciais, blindagem, poder das pontas e capacitores.', [0]],
    ['electric-current', 'Corrente e resistência', 'Relacione movimento de cargas, tensão, resistência e resistividade usando a lei de Ohm.', [1]],
    ['electric-power', 'Energia elétrica e consumo', 'Analise potência, consumo e efeito Joule, ligando as grandezas elétricas ao funcionamento dos aparelhos.', [2], 'electricity'],
    ['circuits', 'Circuitos elétricos', 'Leia símbolos e esquemas, explore circuitos simples, medidores e as diferenças entre corrente contínua e alternada.', [3]],
    ['magnetism', 'Magnetismo', 'Compreenda ímãs e campos magnéticos por meio de linhas de campo, incluindo o campo da Terra.', [4]],
  ]),
  ...units('phy-waves', [
    ['waves', 'Oscilações e ondas', 'Relacione período, frequência, comprimento de onda e velocidade e compare a propagação em diferentes meios.', [0], undefined, ['ondulatória', 'som']],
    ['wave-phenomena', 'Fenômenos ondulatórios', 'Explore pulsos, feixes e frentes de onda e interprete reflexão, refração e outros fenômenos ondulatórios.', [1]],
    ['optics', 'Óptica e imagens', 'Acompanhe a formação de imagens em espelhos e lentes e compreenda instrumentos ópticos simples.', [2]],
  ]),
  ...units('phy-heat', [
    ['temperature', 'Temperatura e calor', 'Diferencie temperatura e calor, compare escalas e explique equilíbrio térmico, transferência, condução e dilatação.', [0], undefined, ['termometria']],
    ['calorimetry', 'Calorimetria', 'Relacione massa, capacidade térmica, calor específico e calor latente às trocas de energia e mudanças de estado.', [1], 'calorimetry'],
    ['thermodynamics', 'Termodinâmica', 'Conecte gases ideais, trabalho e calor às leis da termodinâmica, máquinas térmicas e ciclo de Carnot, incluindo aplicações e clima.', [2]],
  ]),
];
