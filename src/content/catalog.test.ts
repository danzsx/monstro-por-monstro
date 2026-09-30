import { STATIC_TOPICS, mergeCatalogs, fetchPublishedCatalog, topicById } from './catalog';
import { Topic } from '@/learning/types';

describe('Catalog dynamics and merging', () => {
  test('STATIC_TOPICS contains 52 base topics across all core ENEM disciplines', () => {
    expect(STATIC_TOPICS).toHaveLength(52);
    expect(STATIC_TOPICS.map(t => t.id)).toEqual([
      'proportions',
      'rule-of-three',
      'cytology',
      'genetics',
      'kinematics',
      'newton-laws',
      'calorimetry',
      'stoichiometry',
      'solutions',
      'covalent-bonds',
      'atomic-models',
      'biomolecules',
      'dna-proteins',
      'tissues',
      'cell-origin',
      'biotechnology',
      'immunity',
      'cancer',
      'mutations',
      'population-genetics',
      'living-beings',
      'taxonomy',
      'life-cycles',
      'comparative-biology',
      'embryology',
      'human-evolution',
      'water-minerals',
      'membrane-transport',
      'cell-division',
      'cell-metabolism',
      'photosynthesis',
      'ecosystems',
      'succession',
      'populations',
      'biomes',
      'environmental-impacts',
      'conservation',
      'environmental-law',
      'biology-methods',
      'origin-life',
      'artificial-selection',
      'health-indicators',
      'disease-prevention',
      'social-health',
      'healthy-life',
      'human-physiology',
      'evolution',
      'electricity',
      'ph-hydrolysis',
      'electrochemistry',
      'ecology',
      'language-functions',
    ]);
  });

  test('new nature topics include lessons and diagnostic, practice, and review questions', () => {
    for (const id of ['human-physiology', 'evolution', 'electricity', 'ph-hydrolysis', 'electrochemistry', 'atomic-models', 'ecosystems', 'succession', 'populations', 'biomes', 'environmental-impacts', 'conservation', 'environmental-law', 'biology-methods', 'origin-life', 'artificial-selection', 'health-indicators', 'disease-prevention', 'social-health', 'healthy-life', 'water-minerals', 'membrane-transport', 'cell-division', 'cell-metabolism', 'photosynthesis', 'biomolecules', 'dna-proteins', 'tissues', 'cell-origin', 'biotechnology', 'immunity', 'cancer', 'mutations', 'population-genetics', 'living-beings', 'taxonomy', 'life-cycles', 'comparative-biology', 'embryology', 'human-evolution'] as const) {
      const topic = topicById(id, STATIC_TOPICS);
      expect(topic.lessons.length).toBeGreaterThanOrEqual(4);
      expect(topic.questions).toHaveLength(id === 'atomic-models' ? 14 : 9);
      expect(new Set(topic.questions.map(question => question.purpose))).toEqual(new Set(['diagnostic', 'practice', 'review']));
      expect(topic.questions.every(question => question.topicId === id)).toBe(true);
    }
  });

  test('ecology basics retain sources while exam guidance awaits review', () => {
    const topic = topicById('ecosystems', STATIC_TOPICS);
    expect(topic.learningContext?.overview).toContain('fatores abióticos');
    expect(topic.enemGuidance?.status).toBe('pending');
    expect(topic.enemGuidance?.examsAnalyzed).toContain('ENEM PPL 2023');
    expect(topic.enemGuidance?.sources[0]).toContain('download.inep.gov.br');
    expect(topic.questions).toHaveLength(9);
  });

  test('atomic models retain source leads while exam guidance awaits review', () => {
    const topic = topicById('atomic-models', STATIC_TOPICS);
    expect(topic.learningContext?.applications.length).toBeGreaterThanOrEqual(2);
    expect(topic.learningContext?.limitations).toContain('modelo quântico');
    expect(topic.enemGuidance?.status).toBe('pending');
    expect(topic.enemGuidance?.examsAnalyzed).toContain('2017 e 2019');
    expect(topic.enemGuidance?.sources).toHaveLength(2);
    expect(topic.questions).toHaveLength(14);
  });

  test('locally authored questions do not claim official exam provenance', () => {
    expect(STATIC_TOPICS.flatMap(topic => topic.questions).every(question => !question.enemMetadata)).toBe(true);
    expect(STATIC_TOPICS.every(topic => topic.enemGuidance?.status !== 'reviewed')).toBe(true);
  });

  test('mergeCatalogs overrides existing and appends new topics', () => {
    const customNewTopic: Topic = {
      id: 'functions',
      name: 'Funções Afins',
      discipline: 'Matemática',
      subtitle: 'Entenda os gráficos',
      description: 'Relações lineares',
      relevance: 'Tema frequente',
      prerequisiteIds: ['proportions'],
      priority: 0.9,
      version: 1,
      lessons: [
        { id: 'f1', kind: 'concept', title: 'O que é função', text: 'Uma regra que associa elementos.' },
      ],
      questions: [
        {
          id: 'q-f1',
          topicId: 'functions',
          difficulty: 1,
          purpose: 'practice',
          prompt: 'Qual é o valor de f(2)?',
          options: ['2', '4', '6', '8'],
          answer: 1,
          explanation: 'f(2) = 4',
        },
      ],
    };

    const merged = mergeCatalogs(STATIC_TOPICS, [customNewTopic]);
    expect(merged).toHaveLength(53);
    expect(merged.find(t => t.id === 'functions')).toBeDefined();
    expect(merged.find(t => t.id === 'functions')?.name).toBe('Funções Afins');
  });

  test('fetchPublishedCatalog falls back to current catalog when Supabase is null or disconnected', async () => {
    const result = await fetchPublishedCatalog(null);
    expect(result.length).toBeGreaterThanOrEqual(11);
    expect(topicById('proportions', result).name).toBe('Razões e proporções');
  });

  test('cytology pilot has real-world context and does not claim unreviewed ENEM trends', () => {
    const cytology = topicById('cytology', STATIC_TOPICS);
    expect(cytology.learningContext?.applications.length).toBeGreaterThan(0);
    expect(cytology.learningContext?.limitations).toBeTruthy();
    expect(cytology.enemGuidance?.status).toBe('pending');
    expect(cytology.enemGuidance?.priorities).toEqual([]);
  });

  test('older published topics keep the static pilot context until the CMS publishes its own', () => {
    const { learningContext: _context, enemGuidance: _guidance, ...legacyCytology } = topicById('cytology', STATIC_TOPICS);
    const merged = mergeCatalogs(STATIC_TOPICS, [{ ...legacyCytology }]);
    expect(topicById('cytology', merged).learningContext?.overview).toBeTruthy();
    expect(topicById('cytology', merged).enemGuidance?.status).toBe('pending');
  });

  test('pilot question expansion preserves existing IDs and purposes', () => {
    const covalent = topicById('covalent-bonds', STATIC_TOPICS);
    const atomic = topicById('atomic-models', STATIC_TOPICS);
    expect(covalent.questions.filter(q => q.purpose === 'practice')).toHaveLength(5);
    expect(covalent.questions.filter(q => q.purpose === 'review')).toHaveLength(5);
    expect(covalent.questions.find(q => q.id === 'covalent-bonds-8')?.purpose).toBe('practice');
    expect(atomic.questions.filter(q => q.purpose === 'practice')).toHaveLength(5);
    expect(atomic.questions.filter(q => q.purpose === 'review')).toHaveLength(5);
    expect(atomic.questions.find(q => q.id === 'atomic-models-4')?.purpose).toBe('practice');
    expect(atomic.questions.find(q => q.id === 'atomic-models-8')?.purpose).toBe('review');
  });
});
