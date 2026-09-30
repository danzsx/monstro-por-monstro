import { useIsFocused } from 'expo-router';
import { View } from 'react-native';
import { AnimatedMonster } from '@/ui/animated-monster';
import { battleMotion } from './battle-motion';
import type { BattleState } from './machine';
import Svg, { Ellipse } from 'react-native-svg';
import { ProportionsMonster } from './proportions-monster';
import { CytologyMonster } from './cytology-monster';

export function BattleMonster({ battle, evolved = false, studyRunning = false }: { battle: BattleState; evolved?: boolean; studyRunning?: boolean }) {
  const focused = useIsFocused();
  const active = focused && battle.phase !== 'paused';
  const motion = battleMotion(battle);
  if (battle.plan.topicId === 'proportions' || battle.plan.topicId === 'cytology') {
    const cytology = battle.plan.topicId === 'cytology';
    const Monster = cytology ? CytologyMonster : ProportionsMonster;
    const studying = ['lesson', 'acquisition-external', 'acquisition-interactive', 'recall', 'mini-review'].includes(battle.phase);
    const last = battle.attempts.at(-1);
    const feedback = battle.phase === 'feedback' && last ? last.correct ? 'correct' : 'incorrect' : undefined;
    return <View testID={`${battle.plan.topicId}-arena`} style={{ width: 240, height: 240, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      <Svg width={240} height={240} viewBox="0 0 240 240" style={{ position: 'absolute' }} accessible={false}>
        <Ellipse cx="120" cy="209" rx="94" ry="22" fill={cytology ? '#F7E6E8' : '#EEE7F5'} />
        <Ellipse cx="120" cy="207" rx="67" ry="11" fill={cytology ? '#E9CCD5' : '#DBD0E8'} />
      </Svg>
      <Monster size={battle.phase === 'complete' ? 210 : 190} active={active && (!studying || studyRunning)} evolved={evolved} studyRunning={studyRunning} feedback={feedback} {...motion} />
    </View>;
  }
  // The celebration grows inside the same stage, without moving the lesson below.
  return <View style={{ width: 199, height: 199, alignItems: 'center', justifyContent: 'center' }}>
    <AnimatedMonster id={battle.plan.topicId} size={battle.phase === 'complete' ? 175 : 135} active={active} evolved={evolved} {...motion} />
  </View>;
}
