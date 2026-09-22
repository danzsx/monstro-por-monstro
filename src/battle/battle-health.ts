import { BattleState } from './machine';

export function battleHealth(battle: Pick<BattleState, 'attempts' | 'plan'>): number {
  const totalQuestions = battle.plan.questionIds.length;
  if (!totalQuestions) return 1;

  const correctAnswers = battle.attempts.filter(attempt => attempt.correct).length;
  return Math.max(0, 1 - correctAnswers / totalQuestions);
}
