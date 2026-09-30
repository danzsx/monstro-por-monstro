import { STATIC_TOPICS } from '@/content/catalog';
import { initialState } from '@/data/state';
import { migrateStateV2 } from '@/data/migrate-v2';
import { buildBattlePlan, updateMastery } from './engine';
import { approvedExamQuestions, earnsFirstClear } from './evolution';
import { recommend } from './recommendation';
import type { AttemptEvent, Question, TopicChecklist } from './types';

const topic = STATIC_TOPICS.find(item => item.id === 'proportions')!;
const at = '2026-09-28T10:00:00.000Z';
const nextDay = '2026-09-29T11:00:00.000Z';
const checklist: TopicChecklist = { version: 1, checked: {}, theoryUnderstood: true, updatedAt: at };
const attempts: AttemptEvent[] = [6, 7, 8].map(index => ({
  id: `a${index}`, questionId: `proportions-${index}`, topicId: topic.id, answer: 0,
  correct: true, assisted: false, at, source: 'practice',
}));
const official = (id: string): Question => ({ ...topic.questions[6], id, purpose: 'exam', options: [...topic.questions[6].options, 'Quinta alternativa'],
  enemMetadata: { exam: 'ENEM', year: 2024, questionNumber: Number(id.slice(-1)) },
  rightsEvidence: { holder: 'Titular documentado', authorizationReference: 'Documento revisado 001', permittedUse: 'Reprodução no app', verifiedAt: '2026-09-29', includesEmbeddedMedia: true },
});

test('os quatro pilotos têm dois conjuntos autorais de três questões de fixação', () => {
  for (const id of ['proportions', 'rule-of-three', 'cytology', 'genetics']) {
    const items = STATIC_TOPICS.find(item => item.id === id)!.questions.filter(question => question.purpose === 'practice');
    expect(items).toHaveLength(6);
    expect(new Set(items.map(item => item.id)).size).toBe(6);
    expect(items.every(item => item.prompt.trim() && item.explanation.trim())).toBe(true);
  }
});

test('primeira evolução exige declaração e três acertos distintos na mesma sessão', () => {
  expect(earnsFirstClear(topic.id, attempts, checklist)).toBe(true);
  expect(earnsFirstClear(topic.id, attempts, { ...checklist, theoryUnderstood: false })).toBe(false);
  expect(earnsFirstClear(topic.id, [{ ...attempts[0], correct: false }, ...attempts.slice(1)], checklist)).toBe(false);
  expect(earnsFirstClear(topic.id, [{ ...attempts[0], repaired: true }, ...attempts.slice(1)], checklist)).toBe(false);
  expect(earnsFirstClear(topic.id, [{ ...attempts[0], questionId: attempts[1].questionId }, ...attempts.slice(1)], checklist)).toBe(false);
  expect(earnsFirstClear(topic.id, attempts.slice(0, 2), checklist)).toBe(false);
  const initialPlan = buildBattlePlan('first', { topicId: topic.id, reasons: [], review: false, score: 0 }, undefined, false, [], [topic]);
  expect(initialPlan.questionIds).toHaveLength(3);
  const retry = buildBattlePlan('retry', { topicId: topic.id, reasons: [], review: false, score: 0 }, undefined, false, attempts, [topic]);
  expect(retry.questionIds.every(id => !attempts.some(a => a.questionId === id))).toBe(true);
});

test('questão oficial sem autorização completa não chega à sessão', () => {
  const verified = official('exam-1');
  const missing = { ...official('exam-2'), rightsEvidence: undefined };
  expect(approvedExamQuestions([verified, missing])).toEqual([verified]);
  expect(approvedExamQuestions([verified, verified])).toEqual([verified]);
  expect(approvedExamQuestions([verified, { ...verified, id: 'same-item' }])).toEqual([verified]);
  const decision = { topicId: topic.id, reasons: [], review: true, score: 0, suggestedMode: 'exam' as const };
  expect(buildBattlePlan('exam', decision, undefined, false, [], [{ ...topic, questions: [verified, missing] }]).questionIds).toEqual(['exam-1']);
});

test('retorno ENEM só aparece após o intervalo e com dois itens autorizados; skin sobrevive ao erro', () => {
  const state = initialState(at);
  const first = updateMastery(state.masteries[topic.id], attempts, at);
  state.masteries[topic.id] = { ...first, firstClearedAt: at, evolvedAt: at, evolutionOrigin: 'earned', immediatePassedAt: at, nextReviewAt: nextDay, stage: 'consolidating' };
  const catalog = [{ ...topic, questions: [...topic.questions, official('exam-1'), official('exam-2')] }];
  const evidence = { masteries: state.masteries, attempts, completedSessions: [] };
  expect(recommend({ availableMinutes: 15 }, [topic], evidence, nextDay)).toBeNull();
  expect(recommend({ availableMinutes: 15 }, catalog, evidence, at)?.suggestedMode).not.toBe('exam');
  expect(recommend({ availableMinutes: 15 }, catalog, evidence, nextDay)?.suggestedMode).toBe('exam');
  const failed = updateMastery(state.masteries[topic.id], [{ ...attempts[0], id: 'exam-attempt', questionId: 'exam-1', correct: false, source: 'review', at: nextDay }], nextDay);
  expect(failed.firstClearedAt).toBe(at);
  expect(failed.evolvedAt).toBe(at);
});

test('migração preserva domínio antigo como segunda forma sem inventar declaração', () => {
  const state = initialState(at);
  state.masteries[topic.id] = { ...state.masteries[topic.id], stage: 'mastered', lastPracticedAt: at };
  state.topicChecklists = undefined;
  state.externalQuestionLogs = undefined;
  const migrated = migrateStateV2(state);
  expect(migrated.masteries[topic.id]).toMatchObject({ firstClearedAt: at, evolvedAt: at, evolutionOrigin: 'legacy' });
  expect(migrated.topicChecklists).toEqual({});
  expect(migrated.externalQuestionLogs).toEqual([]);
  expect(migrateStateV2(migrated)).toBe(migrated);
});

test('migração completa a forma de quem já concluiu a primeira etapa', () => {
  const state = initialState(at);
  state.masteries[topic.id] = { ...state.masteries[topic.id], firstClearedAt: at, evolutionOrigin: 'earned' };
  const migrated = migrateStateV2(state);
  expect(migrated.masteries[topic.id].evolvedAt).toBe(at);
  expect(migrateStateV2(migrated)).toBe(migrated);
});
