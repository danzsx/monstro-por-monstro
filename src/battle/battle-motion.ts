import type { MonsterMood, MonsterReaction } from '@/ui/monster-motion';
import type { BattleState } from './machine';

export function battleMotion(battle: BattleState): { mood: MonsterMood; reaction?: MonsterReaction } {
  const session = battle.plan.id;
  if (battle.phase === 'complete') {
    return { mood: 'friendly', reaction: { kind: 'celebrate', key: `${session}:complete` } };
  }
  if (battle.phase === 'question') {
    return { mood: 'ready', reaction: { kind: 'attack', key: `${session}:question:${battle.questionIndex}` } };
  }
  const last = battle.attempts.at(-1);
  if (battle.phase === 'feedback' && last?.correct) {
    return { mood: 'ready', reaction: { kind: 'recoil', key: `${session}:answer:${last.id}` } };
  }
  return { mood: ['lesson', 'feedback'].includes(battle.phase) ? 'ready' : 'calm' };
}
