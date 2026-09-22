import { STATIC_TOPICS, mergeCatalogs, fetchPublishedCatalog, topicById } from './catalog';
import { Topic } from '@/learning/types';

describe('Catalog dynamics and merging', () => {
  test('STATIC_TOPICS contains 4 base topics', () => {
    expect(STATIC_TOPICS).toHaveLength(4);
    expect(STATIC_TOPICS.map(t => t.id)).toEqual(['proportions', 'rule-of-three', 'cytology', 'genetics']);
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
    expect(merged).toHaveLength(5);
    expect(merged.find(t => t.id === 'functions')).toBeDefined();
    expect(merged.find(t => t.id === 'functions')?.name).toBe('Funções Afins');
  });

  test('fetchPublishedCatalog falls back to current catalog when Supabase is null or disconnected', async () => {
    const result = await fetchPublishedCatalog(null);
    expect(result.length).toBeGreaterThanOrEqual(4);
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
});
