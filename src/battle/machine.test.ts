import { battleReducer, BattleState } from './machine';
import { buildBattlePlan, emptyMasteries, selectNextMonster } from '@/learning/engine';
const at = '2026-09-21T12:00:00.000Z';
function initial(): BattleState { const decision = selectNextMonster(emptyMasteries(), at)!; return { decision, plan: buildBattlePlan('b1', decision), phase: 'check-in', blockIndex: 0, questionIndex: 0, revealed: false, attempts: [], startedAt: at }; }
test('sentimento encaminha para escolha de tempo sem exigir esforço cognitivo', () => {
  const state = battleReducer(initial(), { type: 'CHECK_IN', checkIn: { feeling: 'anxious', topicId: 'proportions', at } });
  expect(state.phase).toBe('time-choice'); expect(battleReducer(state, { type: 'BEGIN' })).toBe(state);
  const shortPlan = buildBattlePlan('b1', state.decision, state.checkIn, true);
  const study = battleReducer(state, { type: 'SELECT_TIME', plan: shortPlan });
  expect(study.phase).toBe('source-choice');
  expect(study.attempts).toHaveLength(0);
});
test('sessão v2 separa fonte, aquisição, recordação e questões', () => {
  const started = battleReducer({ ...initial(), phase: 'intervention' }, { type: 'BEGIN' });
  expect(started.phase).toBe('source-choice');
  expect(battleReducer(started, { type: 'CHOOSE_SOURCE', source: 'external', label: ' ', at })).toBe(started);
  const external = battleReducer(started, { type: 'CHOOSE_SOURCE', source: 'external', label: 'Meu livro', at });
  expect(external.phase).toBe('acquisition-external');
  expect(external.acquisition?.label).toBe('Meu livro');
  const recall = battleReducer(external, { type: 'COMPLETE_ACQUISITION', at });
  expect(recall.phase).toBe('recall');
  expect(battleReducer(recall, { type: 'NEXT' })).toBe(recall);
  const answered = battleReducer({ ...recall, recallActiveMs: 180_000 }, { type: 'REPORT_RECALL', report: 'partial', at });
  expect(answered.phase).toBe('mini-review');
  expect(answered.recall).toEqual({ report: 'partial', at, activeMs: 180_000 });
  expect(battleReducer(answered, { type: 'NEXT' }).phase).toBe('question');
});
test('pausa preserva a fase e não permite avançar até retomar', () => {
  const started = battleReducer({ ...initial(), phase: 'intervention' }, { type: 'BEGIN' });
  const paused = battleReducer(started, { type: 'PAUSE' });
  expect(paused.phase).toBe('paused'); expect(paused.resumePhase).toBe('source-choice');
  expect(battleReducer(paused, { type: 'BEGIN' })).toBe(paused);
  expect(battleReducer(paused, { type: 'RESUME' }).phase).toBe('source-choice');
  expect(battleReducer(paused, { type: 'PAUSE' })).toBe(paused);
});
test('material interno preserva blocos e só marca aquisição ao terminar', () => {
  const choice = battleReducer({ ...initial(), phase: 'intervention' }, { type: 'BEGIN' });
  let lesson = battleReducer(choice, { type: 'CHOOSE_SOURCE', source: 'internal', label: 'Material do app', at });
  expect(lesson.phase).toBe('lesson');
  expect(lesson.acquisition?.completedAt).toBeUndefined();
  for (let i = 1; i < lesson.plan.blocks.length; i++) lesson = battleReducer(lesson, { type: 'NEXT' });
  expect(lesson.phase).toBe('lesson');
  const recall = battleReducer(lesson, { type: 'COMPLETE_ACQUISITION', at });
  expect(recall.phase).toBe('recall');
  expect(recall.acquisition?.completedAt).toBe(at);
  expect(recall.attempts).toHaveLength(0);
});
test('passo curto também começa por teoria antes de autoexplicação e revisão', () => {
  const decision = selectNextMonster(emptyMasteries(), at)!;
  const micro: BattleState = { ...initial(), plan: buildBattlePlan('short', decision, undefined, true), phase: 'intervention' };
  const started = battleReducer(micro, { type: 'BEGIN' });
  expect(started.phase).toBe('source-choice'); expect(started.plan.questionIds).toHaveLength(1);
  expect(started.plan.blocks.length).toBeGreaterThan(0);
});

test('material próprio e autoexplicação são preservados ao pausar e recarregar', () => {
  const started = battleReducer({ ...initial(), phase: 'intervention' }, { type: 'BEGIN' });
  const external = battleReducer(started, { type: 'CHOOSE_SOURCE', source: 'external', label: 'Minha aula', url: 'https://example.org/aula', materialText: 'Meu texto de estudo', at });
  const paused = battleReducer(external, { type: 'PAUSE' });
  const restored = battleReducer(JSON.parse(JSON.stringify(paused)), { type: 'RESUME' });
  expect(restored.acquisition).toMatchObject({ url: 'https://example.org/aula', materialText: 'Meu texto de estudo' });
  const recall = battleReducer(restored, { type: 'COMPLETE_ACQUISITION', at });
  const review = battleReducer({ ...recall, recallDraft: 'Aprendi a comparar razões.' }, { type: 'REPORT_RECALL', report: 'clear', at });
  expect(review.recall?.text).toBe('Aprendi a comparar razões.');
  expect(review.attempts).toHaveLength(0);
});

test('aula interativa passa por autoexplicação e mini revisão antes das questões', () => {
  const choice = battleReducer({ ...initial(), phase: 'intervention' }, { type: 'BEGIN' });
  const interactive = battleReducer(choice, { type: 'CHOOSE_SOURCE', source: 'interactive', label: 'Aula interativa', at });
  expect(interactive.phase).toBe('acquisition-interactive');
  expect(battleReducer(interactive, { type: 'NEXT' })).toBe(interactive);
  const recall = battleReducer(interactive, { type: 'COMPLETE_ACQUISITION', at });
  expect(recall.phase).toBe('recall');
  expect(battleReducer(recall, { type: 'REPORT_RECALL', report: 'clear', at }).phase).toBe('mini-review');
});
test('envios repetidos na tela de feedback não criam novas respostas', () => {
  const state = { ...initial(), phase: 'question' as const };
  const action = { type: 'ANSWER' as const, attempt: { id: 'a1', questionId: state.plan.questionIds[0], topicId: 'proportions' as const, answer: 0, correct: true, assisted: false, at, source: 'practice' as const } };
  const result = battleReducer(state, action); expect(result.phase).toBe('feedback');
  expect(battleReducer(result, action).attempts).toHaveLength(1);
});
test('ciclo de reparação imediata permite fixar conceito após erro e avança', () => {
  const state = { ...initial(), phase: 'question' as const };
  const errorAction = { type: 'ANSWER' as const, attempt: { id: 'a1', questionId: state.plan.questionIds[0], topicId: 'proportions' as const, answer: 1, correct: false, assisted: false, at, source: 'practice' as const } };
  const feedbackState = battleReducer(state, errorAction);
  expect(feedbackState.phase).toBe('feedback');
  const repairState = battleReducer(feedbackState, { type: 'START_REPAIR' });
  expect(repairState.phase).toBe('repair');
  expect(repairState.repaired).toBeFalsy();
  const repairedState = battleReducer(repairState, { type: 'REPAIR_ANSWER', correct: true, chosenIndex: 0 });
  expect(repairedState.repaired).toBe(true);
  expect(repairedState.attempts[0].repaired).toBe(true);
  const nextState = battleReducer(repairedState, { type: 'NEXT' });
  expect(nextState.phase).toBe('question');
  expect(nextState.questionIndex).toBe(1);
});
