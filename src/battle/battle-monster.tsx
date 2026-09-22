import { useIsFocused } from 'expo-router';
import { View } from 'react-native';
import { AnimatedMonster } from '@/ui/animated-monster';
import { battleMotion } from './battle-motion';
import type { BattleState } from './machine';

export function BattleMonster({ battle }: { battle: BattleState }) {
  const active = useIsFocused();
  const motion = battleMotion(battle);
  // The celebration grows inside the same stage, without moving the lesson below.
  return <View style={{ width: 199, height: 199, alignItems: 'center', justifyContent: 'center' }}>
    <AnimatedMonster id={battle.plan.topicId} size={battle.phase === 'complete' ? 175 : 135} active={active} {...motion} />
  </View>;
}
