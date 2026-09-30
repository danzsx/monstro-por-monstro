import { useEffect, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useDerivedValue, useSharedValue, withRepeat, withTiming, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg from 'react-native-svg';
import type { AnimatedMonsterProps } from '@/ui/monster-motion';
import { useMonsterReaction, useMotionEnabled } from '@/ui/use-monster-motion';
import { articulatedReactionMs, articulatedPose, STUDY_CYCLE_MS, type ArticulatedFeedback } from './articulated-motion';

type Pose = ReturnType<typeof articulatedPose>;
export type ArticulatedMonsterProps = Omit<AnimatedMonsterProps, 'id'> & { studyRunning?: boolean; feedback?: ArticulatedFeedback };

// Each piece has its own SVG canvas, so animation uses portable View transforms
// around explicit shoulder/elbow/hip pivots instead of platform-specific SVG APIs.
export function Art({ size, children }: { size: number; children: ReactNode }) {
  return <Svg width={size} height={size} viewBox="0 0 240 240" accessible={false}>{children}</Svg>;
}

export function Limb({ monsterId, size, pose, channel, pivot, lift, children }: {
  monsterId: string; size: number; pose: SharedValue<Pose>; channel: 'leftArm' | 'rightArm' | 'leftElbow' | 'rightElbow' | 'leftLeg' | 'rightLeg';
  pivot: [number, number]; lift?: 'leftFootY' | 'rightFootY'; children: ReactNode;
}) {
  const motion = useAnimatedStyle(() => ({ transform: [
    { translateY: lift ? pose.value[lift] * size / 240 : 0 },
    { rotate: `${pose.value[channel]}deg` },
  ] }));
  return <Animated.View testID={`${monsterId}-${channel}`} style={[styles.piece, { width: size, height: size, transformOrigin: [pivot[0] * size / 240, pivot[1] * size / 240, 0] }, motion]}>{children}</Animated.View>;
}

export function useArticulatedMonster(monsterId: AnimatedMonsterProps['id'], { size = 190, mood = 'calm', reaction, active = true, studyRunning = false, feedback }: ArticulatedMonsterProps) {
  const enabled = useMotionEnabled(active);
  const { playing, finish } = useMonsterReaction(monsterId, reaction, enabled);
  const seconds = useSharedValue(0);
  const gesture = useSharedValue(0);
  const moving = enabled && !playing && (studyRunning || mood === 'ready' || mood === 'friendly');
  useEffect(() => {
    seconds.set(0);
    if (moving) seconds.set(withRepeat(withTiming(12, { duration: STUDY_CYCLE_MS, easing: Easing.linear }), -1, false));
    return () => { cancelAnimation(seconds); seconds.set(0); };
  }, [moving, studyRunning, mood, seconds]);

  useEffect(() => {
    gesture.set(0);
    if (playing) gesture.set(withTiming(1, { duration: articulatedReactionMs[playing.kind], easing: Easing.linear }, finished => {
      if (finished) scheduleOnRN(finish);
    }));
    return () => { cancelAnimation(gesture); gesture.set(0); };
  }, [playing, finish, gesture]);

  const pose = useDerivedValue(() => articulatedPose(
    enabled ? seconds.value : 0, mood, studyRunning, feedback,
    enabled ? playing?.kind : undefined, enabled ? gesture.value : 0,
  ));
  const root = useAnimatedStyle(() => ({ transform: [
    { translateX: pose.value.x * size / 240 }, { translateY: pose.value.y * size / 240 }, { rotate: `${pose.value.tilt}deg` },
  ] }));
  const torso = useAnimatedStyle(() => ({ transform: [{ scaleY: pose.value.bodyScaleY }] }));
  const gaze = useAnimatedStyle(() => ({ transform: [{ translateX: pose.value.gaze * size / 240 }] }));
  const eyes = useAnimatedStyle(() => ({ transform: [{ scaleY: pose.value.eyes }] }));
  const leftBrow = useAnimatedStyle(() => ({ transform: [{ rotate: `${pose.value.brows}deg` }] }));
  const rightBrow = useAnimatedStyle(() => ({ transform: [{ rotate: `${-pose.value.brows}deg` }] }));
  const smile = useAnimatedStyle(() => ({ opacity: 1 - pose.value.surprise, transform: [{ scaleY: .4 + pose.value.smile * .6 }] }));
  const grin = useAnimatedStyle(() => ({ opacity: Math.max(0, (pose.value.smile - .8) * 5) * (1 - pose.value.surprise) }));
  const surprise = useAnimatedStyle(() => ({ opacity: pose.value.surprise }));

  return { pose, root, torso, gaze, eyes, leftBrow, rightBrow, smile, grin, surprise };
}

export const articulatedStyles = StyleSheet.create({ piece: { position: 'absolute', left: 0, top: 0 } });
const styles = articulatedStyles;
