import { Monster } from './primitives';
import { AnimatedMonsterProps, monsterMoodLabels } from './monster-motion';
import { useMonsterReaction, useMotionEnabled } from './use-monster-motion';
import './animated-monster.css';

export function AnimatedMonster({ id, size = 260, mood = 'calm', reaction, active = true }: AnimatedMonsterProps) {
  const enabled = useMotionEnabled(active);
  const { playing, finish } = useMonsterReaction(id, reaction, enabled);
  return <div className="monster-motion" data-mood={mood} data-moving={enabled} role="img" aria-label={`Monstro ${id}, ${monsterMoodLabels[mood]}`} style={{ width: size + 24, height: size + 24 }}>
    <div className="monster-motion__posture" aria-hidden="true">
      <div key={`${id}:${playing?.key ?? 'rest'}`} className="monster-motion__reaction" data-reaction={playing?.kind} onAnimationEnd={event => { if (event.target === event.currentTarget) finish(); }}>
        <div className="monster-motion__idle"><Monster id={id} size={size} /></div>
      </div>
    </div>
  </div>;
}
