import { battleHealth } from './battle-health';
import { BattleState } from './machine';
import { buildBattlePlan, emptyMasteries, selectNextMonster } from '@/learning/engine';

const at = '2026-09-21T12:00:00.000Z';
const decision = selectNextMonster(emptyMasteries(), at)!;
const plan = buildBattlePlan('b1', decision);

function battle(overrides: Partial<BattleState> = {}): BattleState {
  return {
    decision,
    plan,
    phase: 'question',
    blockIndex: 0,
    questionIndex: 0,
    revealed: false,
    attempts: [],
    startedAt: at,
    ...overrides,
  };
}

test('começa com vida cheia e reduz apenas pelos acertos', () => {
  expect(battleHealth(battle())).toBe(1);
  expect(battleHealth(battle({ attempts: [{ id: 'a1', questionId: plan.questionIds[0], topicId: 'proportions', answer: 0, correct: true, assisted: false, at, source: 'practice' }] }))).toBe(1 - 1 / plan.questionIds.length);
  expect(battleHealth(battle({ attempts: [{ id: 'a1', questionId: plan.questionIds[0], topicId: 'proportions', answer: 1, correct: false, assisted: false, at, source: 'practice' }] }))).toBe(1);
});

test('a vida nunca fica negativa e funciona com batalhas curtas', () => {
  const microPlan = { ...plan, questionIds: plan.questionIds.slice(0, 2) };
  const attempts = microPlan.questionIds.map((questionId, index) => ({ id: `a${index}`, questionId, topicId: 'proportions' as const, answer: 0, correct: true, assisted: false, at, source: 'practice' as const }));
  expect(battleHealth(battle({ plan: microPlan, attempts }))).toBe(0);
  expect(battleHealth(battle({ plan: microPlan, attempts: [...attempts, ...attempts] }))).toBe(0);
});
