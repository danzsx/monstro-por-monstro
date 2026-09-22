import type { TopicId } from '@/learning/types';

export type MonsterMood = 'calm' | 'ready' | 'friendly';
export interface MonsterReaction {
  kind: 'attack' | 'recoil' | 'celebrate';
  key: string;
}
export interface AnimatedMonsterProps {
  id: TopicId;
  size?: number;
  mood?: MonsterMood;
  reaction?: MonsterReaction;
  active?: boolean;
}
export const monsterMoodLabels: Record<MonsterMood, string> = {
  calm: 'tranquilo', ready: 'pronto para o desafio', friendly: 'amigável',
};
export const monsterReactions = {
  attack: { x: -8, y: 0, scale: 1.025, rotation: -2, out: 120, back: 230 },
  recoil: { x: 6, y: 0, scale: 0.98, rotation: 2, out: 100, back: 220 },
  celebrate: { x: 0, y: -8, scale: 1.025, rotation: 0, out: 180, back: 300 },
} as const;
