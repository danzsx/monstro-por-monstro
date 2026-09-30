import type { MonsterMood, MonsterReaction } from '@/ui/monster-motion';

export type ArticulatedFeedback = 'correct' | 'incorrect' | undefined;
export const STUDY_CYCLE_MS = 12_000;
export const articulatedReactionMs = { attack: 700, recoil: 650, celebrate: 1100 } as const;

function track(time: number, stops: number[], values: number[]) {
  'worklet';
  for (let i = 1; i < stops.length; i++) {
    if (time <= stops[i]) {
      const t = Math.max(0, Math.min(1, (time - stops[i - 1]) / (stops[i] - stops[i - 1])));
      const smooth = (1 - Math.cos(t * Math.PI)) / 2;
      return values[i - 1] + (values[i] - values[i - 1]) * smooth;
    }
  }
  return values[values.length - 1];
}

// One pose is sampled on the UI thread; all articulated pieces share its clock.
// The first and last poses agree so the twelve-second loop has no visible seam.
export function articulatedPose(seconds: number, mood: MonsterMood, studying: boolean, feedback?: ArticulatedFeedback, reaction?: MonsterReaction['kind'], progress = 0) {
  'worklet';
  const t = reaction ? 0 : Math.max(0, Math.min(12, seconds));
  const beat = Math.sin(t * Math.PI * 2);
  const breath = (1 - Math.cos(t * Math.PI)) / 2;
  const walking = studying ? track(t, [0, .3, 2.6, 3, 12], [0, 1, 1, 0, 0]) : 0;
  const wave = studying ? track(t, [0, 3, 3.5, 5.2, 5.8, 12], [0, 0, 1, 1, 0, 0]) : 0;
  const stretch = studying ? track(t, [0, 7, 7.7, 8.5, 9.2, 12], [0, 0, 1, 1, 0, 0]) : 0;
  const look = studying ? track(t, [0, 5.8, 6.2, 6.6, 7, 9.4, 10, 10.7, 12], [0, 0, -1, -1, 0, 0, 1, 1, 0]) : 0;
  const blink = track(t, [0, 1.8, 1.9, 2.02, 2.14, 6.3, 6.42, 6.54, 10.4, 10.52, 10.64, 12], [1, 1, .08, .08, 1, 1, .08, 1, 1, .08, 1, 1]);
  const ready = !studying && mood === 'ready';
  const friendly = mood === 'friendly' || feedback === 'correct';
  const pose = {
    x: walking * beat * 2, y: -walking * Math.abs(beat) * 3 - stretch * 3,
    tilt: walking * beat * 2 + look * 3,
    bodyScaleY: 1 + breath * .015 - stretch * .025,
    leftArm: ready ? 27 : walking * beat * 16 + wave * (110 + Math.sin(t * Math.PI * 5) * 15) + stretch * 135,
    rightArm: ready ? -38 : -walking * beat * 16 - stretch * 135,
    leftElbow: ready ? -35 : wave * 22 + stretch * 12,
    rightElbow: ready ? 42 : -stretch * 12,
    leftLeg: walking * beat * 14 - stretch * 7,
    rightLeg: -walking * beat * 14 + stretch * 7,
    leftFootY: -walking * Math.max(0, beat) * 5,
    rightFootY: -walking * Math.max(0, -beat) * 5,
    gaze: look * 4, eyes: blink, brows: feedback === 'incorrect' ? -13 : ready ? 12 : -wave * 5,
    smile: friendly ? 1 : studying ? .65 + wave * .35 : .4,
    surprise: 0,
  };
  if (reaction) {
    // Reactions temporarily replace the ongoing cycle, including its blinking.
    pose.eyes = 1;
    pose.gaze = 0;
    const hit = track(progress, [0, .2, .43, .65, 1], [0, -.3, 1, .65, 0]);
    const jump = track(progress, [0, .2, .45, .75, 1], [0, -.15, 1, .4, 0]);
    if (reaction === 'attack') {
      pose.x = -hit * 9; pose.tilt = -hit * 8;
      pose.leftArm = 27 + hit * 68; pose.leftElbow = -35 + hit * 30;
      pose.rightArm = -38 - hit * 20; pose.rightElbow = 42;
      pose.leftLeg = hit * 10; pose.rightLeg = -hit * 8;
      pose.brows = 12; pose.smile = .15;
    } else if (reaction === 'recoil') {
      pose.x = hit * 10; pose.y = -hit * 3; pose.tilt = hit * 12;
      pose.leftArm -= hit * 55; pose.rightArm += hit * 65;
      pose.leftElbow -= hit * 15; pose.rightElbow += hit * 15;
      pose.leftLeg = -hit * 14; pose.rightLeg = hit * 12;
      pose.eyes = 1 + hit * .15; pose.brows -= hit * 24;
      pose.surprise = Math.max(0, hit); pose.smile = 1;
    } else {
      pose.y = -jump * 14; pose.tilt = Math.sin(progress * Math.PI * 4) * jump * 4;
      pose.leftArm = jump * 145; pose.rightArm = -jump * 145;
      pose.leftElbow = jump * 20; pose.rightElbow = -jump * 20;
      pose.leftLeg = -jump * 15; pose.rightLeg = jump * 15;
      pose.brows = -jump * 8; pose.smile = 1;
    }
  }
  return pose;
}
