import { battleMotion } from './battle-motion';
import { battleReducer, BattleState } from './machine';
import { buildBattlePlan, emptyMasteries, selectNextMonster } from '@/learning/engine';

const at = '2026-09-22T12:00:00.000Z';
const decision = selectNextMonster(emptyMasteries(), at)!;
function initial(): BattleState {
  return { decision, plan: buildBattlePlan('session-1', decision), phase: 'intervention', blockIndex: 0, questionIndex: 0, revealed: false, attempts: [], startedAt: at };
}

test('acolhimento é calmo; ler e revelar não disparam ataques', () => {
  const state = initial();
  expect(battleMotion(state)).toEqual({ mood: 'calm' });
  const lesson = battleReducer(state, { type: 'BEGIN' });
  expect(battleMotion(lesson)).toEqual({ mood: 'ready' });
  expect(battleMotion(battleReducer(lesson, { type: 'REVEAL' }))).toEqual({ mood: 'ready' });
});

test('cada questão e cada acerto têm eventos próprios e estáveis', () => {
  const state: BattleState = { ...initial(), phase: 'question' };
  const attack = battleMotion(state);
  expect(attack.reaction?.kind).toBe('attack');
  expect(battleMotion({ ...state })).toEqual(attack);
  const feedback = battleReducer(state, { type: 'ANSWER', attempt: { id: 'attempt-1', questionId: state.plan.questionIds[0], topicId: state.plan.topicId, answer: 0, correct: true, assisted: false, at, source: 'practice' } });
  expect(battleMotion(feedback).reaction?.kind).toBe('recoil');
  expect(battleMotion(feedback).reaction?.key).not.toBe(attack.reaction?.key);
  const next = battleReducer(feedback, { type: 'NEXT' });
  expect(battleMotion(next).reaction?.kind).toBe('attack');
  expect(battleMotion(next).reaction?.key).not.toBe(attack.reaction?.key);
});

test('uma sessão com todos os erros também termina amigável e a revisão volta ao desafio', () => {
  let state: BattleState = { ...initial(), phase: 'question' };
  for (const questionId of state.plan.questionIds) {
    state = battleReducer(state, { type: 'ANSWER', attempt: { id: questionId, questionId, topicId: state.plan.topicId, answer: -1, correct: false, assisted: false, at, source: 'practice' } });
    expect(battleMotion(state)).toEqual({ mood: 'ready' });
    state = battleReducer(state, { type: 'NEXT' });
  }
  expect(state.phase).toBe('complete');
  expect(battleMotion(state)).toEqual({ mood: 'friendly', reaction: { kind: 'celebrate', key: 'session-1:complete' } });
  const review: BattleState = { ...initial(), plan: { ...state.plan, id: 'review-2', mode: 'review' }, phase: 'question' };
  expect(battleMotion(review)).toEqual({ mood: 'ready', reaction: { kind: 'attack', key: 'review-2:question:0' } });
});
