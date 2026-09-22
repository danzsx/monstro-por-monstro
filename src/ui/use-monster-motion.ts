import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';
import type { MonsterReaction } from './monster-motion';

// React Native Web maps these APIs to visibilitychange and prefers-reduced-motion.
export function useMotionEnabled(active: boolean) {
  const [foreground, setForeground] = useState(() => AppState.currentState === 'active');
  // Stay still until the accessibility preference has been read, including during SSR.
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let mounted = true;
    let preferenceChanged = false;
    const app = AppState.addEventListener('change', value => setForeground(value === 'active'));
    const preference = AccessibilityInfo.addEventListener('reduceMotionChanged', value => {
      preferenceChanged = true;
      setReduced(value);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (mounted && !preferenceChanged) setReduced(value);
    }).catch(() => { /* Keep motion disabled if the preference is unavailable. */ });
    return () => {
      mounted = false;
      app?.remove();
      preference?.remove();
    };
  }, []);
  return active && foreground && !reduced;
}

// Consume events even while inactive: returning to a screen must not replay a hit.
export function useMonsterReaction(id: string, reaction: MonsterReaction | undefined, enabled: boolean) {
  const seen = useRef<{ id: string; key?: string } | null>(null);
  const [playing, setPlaying] = useState<MonsterReaction>();
  const key = reaction?.key;
  const kind = reaction?.kind;
  useEffect(() => {
    const previous = seen.current;
    const newCharacter = !previous || previous.id !== id;
    const newEvent = !!key && previous?.key !== key;
    seen.current = { id, key: key ?? (newCharacter ? undefined : previous?.key) };
    if (!enabled || newCharacter || !kind || !key) {
      setPlaying(undefined);
    } else if (newEvent) {
      setPlaying({ key, kind });
    }
  }, [id, key, kind, enabled]);
  const finish = useCallback(() => setPlaying(undefined), []);
  return { playing: enabled && playing?.key === key ? playing : undefined, finish };
}
