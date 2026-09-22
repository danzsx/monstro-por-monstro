import { useEffect, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Monster } from './primitives';
import { AnimatedMonsterProps, monsterMoodLabels, monsterReactions } from './monster-motion';
import { useMonsterReaction, useMotionEnabled } from './use-monster-motion';

export function AnimatedMonster({ id, size = 260, mood = 'calm', reaction, active = true }: AnimatedMonsterProps) {
  const enabled = useMotionEnabled(active);
  const { playing, finish } = useMonsterReaction(id, reaction, enabled);
  const [breath] = useState(() => new Animated.Value(0));
  const [gesture] = useState(() => new Animated.Value(0));
  const [posture] = useState(() => new Animated.Value(mood === 'ready' ? 1 : 0));

  useEffect(() => {
    breath.setValue(0);
    if (!enabled) return;
    // One precomputed wave keeps the entire loop on the native driver.
    const animation = Animated.loop(Animated.timing(breath, {
      toValue: 1, duration: mood === 'friendly' ? 3600 : 3000,
      easing: t => (1 - Math.cos(t * 2 * Math.PI)) / 2,
      useNativeDriver: true, isInteraction: false,
    }));
    animation.start();
    return () => { animation.stop(); breath.setValue(0); };
  }, [breath, enabled, mood, id]);

  useEffect(() => {
    const target = mood === 'ready' ? 1 : 0;
    if (!enabled) { posture.setValue(target); return; }
    const animation = Animated.timing(posture, { toValue: target, duration: 240, useNativeDriver: true, isInteraction: false });
    animation.start();
    return () => animation.stop();
  }, [posture, mood, enabled, id]);

  useEffect(() => {
    gesture.setValue(0);
    if (!playing) return;
    const profile = monsterReactions[playing.kind];
    const animation = Animated.sequence([
      Animated.timing(gesture, { toValue: 1, duration: profile.out, easing: Easing.out(Easing.quad), useNativeDriver: true, isInteraction: false }),
      Animated.timing(gesture, { toValue: 0, duration: profile.back, easing: Easing.inOut(Easing.quad), useNativeDriver: true, isInteraction: false }),
    ]);
    animation.start(({ finished }) => { if (finished) finish(); });
    return () => { animation.stop(); gesture.setValue(0); };
  }, [gesture, playing, finish, id]);

  const profile = playing ? monsterReactions[playing.kind] : undefined;
  const interpolate = (end: number, start = 0) => gesture.interpolate({ inputRange: [0, 1], outputRange: [start, end] });
  return <View accessible accessibilityRole="image" accessibilityLabel={`Monstro ${id}, ${monsterMoodLabels[mood]}`} style={{ width: size + 24, height: size + 24, alignItems: 'center', justifyContent: 'center' }}>
    <Animated.View style={{ transform: [{ rotate: posture.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-3deg'] }) }] }}>
      <Animated.View style={{ transform: [
        { translateX: interpolate(profile?.x ?? 0) }, { translateY: interpolate(profile?.y ?? 0) },
        { scale: interpolate(profile?.scale ?? 1, 1) },
        { rotate: gesture.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${profile?.rotation ?? 0}deg`] }) },
      ] }}>
        <Animated.View style={{ transform: [
          { scale: breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.015] }) },
          { translateY: breath.interpolate({ inputRange: [0, 1], outputRange: [0, mood === 'friendly' ? -2 : 0] }) },
          { rotate: breath.interpolate({ inputRange: [0, 1], outputRange: ['0deg', mood === 'calm' ? '0deg' : '1deg'] }) },
        ] }}>
          <Monster id={id} size={size} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  </View>;
}
