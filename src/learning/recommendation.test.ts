import { TOPICS } from '@/content/catalog';
import { buildBattlePlan, emptyMasteries, selectNextMonster } from './engine';
import { independentPerformance, recommend, RECOMMENDATION_POLICY_VERSION, usableQuestions } from './recommendation';
import type { AttemptEvent, CompletedStudySession, Topic } from './types';

const NOW = '2026-09-28T12:00:00.000Z';
const previousDay = '2026-09-27T12:00:00.000Z';
const topic = TOPICS.find(t => t.id === 'proportions')!;
const catalog: Topic[] = [{ ...topic, prerequisiteIds: [], priority: 0 }];
const base = () => ({ masteries: emptyMasteries(), attempts: [] as AttemptEvent[], completedSessions: [] as CompletedStudySession[] });
const attempt = (id: string, correct: boolean, at = previousDay): AttemptEvent => ({
  id, questionId: 'proportions-6', topicId: topic.id, answer: correct ? 0 : -1, correct, assisted: false, at, source: 'practice',
});
const session = (completedAt: string, recall?: CompletedStudySession['recall']): CompletedStudySession => ({
  id: completedAt, topicId: topic.id, startedAt: completedAt, completedAt, activeMs: 300_000,
  mode: 'learn', stageAtCompletion: 'learning', recall,
});
const choose = (evidence = base(), minutes: 5 | 15 = 15, topics = catalog) => recommend({ availableMinutes: minutes }, topics, evidence, NOW);

describe('política evidence-v1', () => {
  test('resultado e razões são reproduzíveis com o mesmo catálogo, contexto e relógio', () => {
    const evidence = base();
    expect(choose(evidence)).toEqual(choose(evidence));
    expect(choose(evidence)?.policyVersion).toBe(RECOMMENDATION_POLICY_VERSION);
    expect(choose(evidence)?.signals).toMatchObject({ independentItems: 0, correctItems: 0, availableMinutes: 15 });
  });

  test('filtra tópicos sem item válido e usa o mesmo conjunto ao criar a sessão', () => {
    const invalid = { ...topic.questions[0], purpose: 'practice' as const, options: ['igual', 'igual'] };
    const empty = { ...catalog[0], questions: [] };
    expect(choose(base(), 15, [empty])).toBeNull();
    expect(choose(base(), 15, [{ ...catalog[0], questions: [invalid] }])).toBeNull();
    const decision = choose()!;
    const plan = buildBattlePlan('fixed', decision, undefined, false, [], catalog);
    expect(plan.questionIds.length).toBeGreaterThan(0);
    expect(plan.questionSnapshots?.every(q => usableQuestions(topic, 'practice').some(item => item.id === q.id))).toBe(true);
  });

  test('conta apenas a última resposta independente por questão; diagnóstico e apoio não viram consistência', () => {
    const attempts = [attempt('1', false), { ...attempt('2', true, NOW), id: '2' },
      { ...attempt('3', true), questionId: 'proportions-7', source: 'diagnostic' as const },
      { ...attempt('4', true), questionId: 'proportions-8', assisted: true }];
    expect(independentPerformance(attempts, topic.id)).toEqual({ items: 1, correct: 1, recentErrorAt: undefined });
    const decision = choose({ ...base(), attempts })!;
    expect(decision.signals).toMatchObject({ independentItems: 1, correctItems: 1 });
    expect(decision.reasons.join(' ')).toContain('1 questão distinta respondida sem ajuda');
  });

  test('revisão vencida prevalece, com prazo verificável nas razões', () => {
    const evidence = base();
    evidence.masteries[topic.id] = { ...evidence.masteries[topic.id], stage: 'consolidating', nextReviewAt: previousDay };
    const decision = choose(evidence)!;
    expect(decision.review).toBe(true);
    expect(decision.signals?.dueAt).toBe(previousDay);
    expect(decision.reasons[0]).toContain('27/09/2026');
    expect(buildBattlePlan('review', decision, undefined, false, [], catalog).questionSnapshots?.every(q => q.purpose === 'review')).toBe(true);
    expect(choose(evidence, 15, [{ ...catalog[0], questions: catalog[0].questions.filter(q => q.purpose === 'practice') }])).toBeNull();
  });

  test('erro individual depois de intervalo abre revisão; autorrelato orienta fonte sem alterar domínio', () => {
    const evidence = { ...base(), attempts: [attempt('wrong', false)] };
    const review = choose(evidence)!;
    expect(review.review).toBe(true);
    expect(review.signals?.recentErrorAt).toBe(previousDay);
    expect(review.reasons[0]).toContain('resposta independente recente');
    evidence.completedSessions = [session(previousDay, { report: 'not_yet', at: previousDay, activeMs: 200_000 })];
    const source = choose(evidence)!;
    expect(source.review).toBe(false);
    expect(source.suggestedMode).toBe('learn');
    expect(source.reasons[0]).toContain('informou que ainda não lembrava');
    expect(evidence.masteries[topic.id].score).toBe(0);
  });

  test('tempo curto e retorno mudam a ação e o texto sem premiar ausência', () => {
    const evidence = { ...base(), completedSessions: [session('2026-09-18T12:00:00.000Z')] };
    const decision = choose(evidence, 5)!;
    expect(decision.suggestedMode).toBe('micro');
    expect(decision.signals?.returning).toBe(true);
    expect(decision.reasons.join(' ')).toContain('5 minutos');
    expect(decision.reasons.join(' ')).toContain('mais de sete dias');
    expect(buildBattlePlan('micro', decision, undefined, true, [], catalog).questionIds).toHaveLength(1);
  });

  test('comparação reproduzível: a política anterior não usa erro individual para revisão', () => {
    const evidence = { ...base(), attempts: [attempt('wrong', false)] };
    const legacy = selectNextMonster(evidence.masteries, NOW);
    const current = choose(evidence);
    expect(legacy?.review).toBe(false);
    expect(current?.review).toBe(true);
    expect(current?.topicId).toBe(topic.id);
  });
});
