import { STATIC_TOPICS } from '@/content/catalog';
import { emptyMasteries } from '@/learning/engine';
import { GROUPS_BY_ID, MAP_EDGES, MAP_NODES, NODES_BY_ID, relationsFor, resolveNodeState, searchNodes, SOURCE_GROUPS, validateMap } from './catalog';
import { fitCamera, groupScene, zoomCamera } from './layout';

describe('inventário e relações do mapa', () => {
  test('cobre todos os objetos dos 23 grupos oficiais, com referências e sem ciclos', () => {
    expect(SOURCE_GROUPS).toHaveLength(23);
    expect(SOURCE_GROUPS.filter(g => g.territory === 'biology')).toHaveLength(6);
    expect(SOURCE_GROUPS.filter(g => g.territory === 'physics')).toHaveLength(7);
    expect(SOURCE_GROUPS.filter(g => g.territory === 'chemistry')).toHaveLength(10);
    expect(validateMap(MAP_NODES, MAP_EDGES, SOURCE_GROUPS)).toEqual([]);
  });
  test('detecta referência órfã, explicação ausente e ciclo', () => {
    const edges = [...MAP_EDGES,
      { from: 'missing', to: 'genetics', kind: 'related' as const, reason: '' },
      { from: 'genetics', to: 'cell-division', kind: 'before' as const, reason: 'Ciclo proposital.' },
    ];
    const errors = validateMap(MAP_NODES, edges, SOURCE_GROUPS);
    expect(errors).toContain('Ciclo em estude antes');
    expect(errors).toContain('Ligação inválida: missing/genetics');
    expect(errors).toContain('Ligação sem explicação: missing/genetics');
  });
  test('detecta objeto sem cobertura, IDs duplicados e conexão simétrica duplicada', () => {
    expect(validateMap(MAP_NODES.filter(n => n.id !== 'environmental-law'), MAP_EDGES, SOURCE_GROUPS)).toContain('Objeto sem cobertura: bio-ecology:8');
    expect(validateMap([...MAP_NODES, MAP_NODES[0]], MAP_EDGES, SOURCE_GROUPS)).toContain('ID de conteúdo duplicado');
    const edge = MAP_EDGES.find(e => e.kind === 'related')!;
    expect(validateMap(MAP_NODES, [...MAP_EDGES, { ...edge, from: edge.to, to: edge.from }], SOURCE_GROUPS).some(e => e.startsWith('Ligação duplicada'))).toBe(true);
  });
  test('genética indica DNA e divisão celular; osmose conecta Biologia e Química nos dois sentidos', () => {
    expect(relationsFor('genetics').before.map(e => e.from)).toEqual(expect.arrayContaining(['dna-proteins', 'cell-division']));
    const osmose = relationsFor('membrane-transport').related.find(e => [e.from, e.to].includes('solutions'))!;
    expect(osmose).toBeDefined();
    expect(relationsFor('solutions').related).toContain(osmose);
    expect(GROUPS_BY_ID[NODES_BY_ID[osmose.from].groupId].territory).not.toBe(GROUPS_BY_ID[NODES_BY_ID[osmose.to].groupId].territory);
  });
  test('busca sem acento, por sinônimo, com filtro e com resultado vazio', () => {
    expect(searchNodes('GENETICA').map(n => n.id)).toContain('genetics');
    expect(searchNodes('osmose').map(n => n.id)).toContain('membrane-transport');
    expect(searchNodes('', 'physics').every(n => GROUPS_BY_ID[n.groupId].territory === 'physics')).toBe(true);
    expect(searchNodes('assunto inexistente zzz')).toEqual([]);
  });
});

describe('vínculos com monstros e progresso', () => {
  test('vincula os quinze monstros de Natureza sem fabricar entradas no catálogo', () => {
    const masteries = emptyMasteries();
    const before = JSON.stringify(masteries);
    const resolved = MAP_NODES.map(n => resolveNodeState(n, STATIC_TOPICS, masteries));
    expect(resolved.filter(n => n.topic).map(n => n.topic!.id).sort()).toEqual(['atomic-models', 'calorimetry', 'cytology', 'ecology', 'ecosystems', 'electricity', 'electrochemistry', 'evolution', 'genetics', 'human-physiology', 'kinematics', 'newton-laws', 'ph-hydrolysis', 'solutions', 'stoichiometry']);
    expect(JSON.stringify(masteries)).toBe(before);
    expect(STATIC_TOPICS).toHaveLength(18);
  });
  test('catálogo vazio, remoção e disciplina incompatível nunca produzem um link', () => {
    const node = NODES_BY_ID.genetics;
    expect(resolveNodeState(node, [], {})).toEqual({ label: 'Monstro em preparação' });
    const topic = STATIC_TOPICS.find(t => t.id === 'genetics')!;
    expect(resolveNodeState(node, [{ ...topic, discipline: 'Física' }], {}).topic).toBeUndefined();
    expect(resolveNodeState(NODES_BY_ID['water-minerals'], STATIC_TOPICS, {}).topic).toBeUndefined();
  });
  test('reutiliza o progresso e identifica revisão vencida', () => {
    const masteries = emptyMasteries();
    masteries.genetics = { ...masteries.genetics, encountered: true, stage: 'mastered' };
    expect(resolveNodeState(NODES_BY_ID.genetics, STATIC_TOPICS, masteries).label).toBe('Dominado');
    masteries.genetics.nextReviewAt = '2020-01-01T00:00:00Z';
    expect(resolveNodeState(NODES_BY_ID.genetics, STATIC_TOPICS, masteries).label).toBe('Revisão');
  });
});

describe('câmera e cenas', () => {
  test('zoom mantém o ponto sob o cursor e respeita limites', () => {
    const camera = { x: -50, y: 20, scale: .5 };
    const anchor = { x: 180, y: 200 };
    for (const factor of [.001, 1.5, 100]) {
      const next = zoomCamera(camera, factor, anchor, .2, 2.5);
      expect(next.scale).toBeGreaterThanOrEqual(.2);
      expect(next.scale).toBeLessThanOrEqual(2.5);
      expect((anchor.x - next.x) / next.scale).toBeCloseTo((anchor.x - camera.x) / camera.scale);
      expect((anchor.y - next.y) / next.scale).toBeCloseTo((anchor.y - camera.y) / camera.scale);
    }
  });
  test('enquadra no celular e posiciona todos os vizinhos selecionados dentro da cena', () => {
    for (const node of MAP_NODES) {
      const scene = groupScene(node.groupId, node.id);
      const fit = fitCamera({ width: 390, height: 400 }, scene);
      expect(scene.width * fit.scale).toBeLessThanOrEqual(390);
      expect(scene.height * fit.scale).toBeLessThanOrEqual(400);
      for (const other of scene.nodes) {
        expect(scene.positions[other.id].x + 234).toBeLessThan(scene.width);
        expect(scene.positions[other.id].y + 110).toBeLessThan(scene.height);
      }
      for (const edge of scene.edges) {
        expect(scene.positions[edge.from]).toBeDefined();
        expect(scene.positions[edge.to]).toBeDefined();
      }
    }
  });
});
