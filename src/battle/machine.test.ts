import { battleReducer, BattleState } from './machine';
import { buildBattlePlan, emptyMasteries, selectNextMonster } from '@/learning/engine';
const at = '2026-09-21T12:00:00.000Z';
function initial(): BattleState { const decision = selectNextMonster(emptyMasteries(), at)!; return { decision, plan: buildBattlePlan('b1', decision), phase: 'check-in', blockIndex: 0, questionIndex: 0, revealed: false, attempts: [], startedAt: at }; }
test('máquina encaminha resistência para investigação da barreira', () => {
  const state = battleReducer(initial(), { type: 'CHECK_IN', checkIn: { feeling: 'anxious', topicId: 'proportions', at } });
  expect(state.phase).toBe('barrier'); expect(battleReducer(state, { type: 'BEGIN' })).toBe(state);
});
test('recuperação ativa exige uma tentativa antes de continuar', () => {
  const state = { ...initial(), phase: 'lesson' as const, blockIndex: 3 };
  expect(battleReducer(state, { type: 'NEXT' })).toBe(state);
  expect(battleReducer(battleReducer(state, { type: 'REVEAL' }), { type: 'NEXT' }).phase).toBe('question');
});
test('envios repetidos na tela de feedback não criam novas respostas', () => {
  const state = { ...initial(), phase: 'question' as const };
  const action = { type: 'ANSWER' as const, attempt: { id: 'a1', questionId: state.plan.questionIds[0], topicId: 'proportions' as const, answer: 0, correct: true, assisted: false, at, source: 'practice' as const } };
  const result = battleReducer(state, action); expect(result.phase).toBe('feedback');
  expect(battleReducer(result, action).attempts).toHaveLength(1);
});
