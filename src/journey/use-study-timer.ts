import { useCallback, useEffect, useRef } from 'react';
import { AppState as NativeAppState, Platform } from 'react-native';
import { useApp } from '@/data/provider';
import { activeIntervalMs } from './timer';

export function useStudyTimer(battleId?: string, activityKey?: string) {
  const { commit } = useApp();
  const clock = useRef({ tick: 0, interaction: 0, running: false });
  const flush = useCallback(async () => {
    if (!battleId || !clock.current.running) return;
    const now = Date.now();
    const elapsed = activeIntervalMs(clock.current.tick, now, clock.current.interaction);
    clock.current.tick = now;
    if (elapsed > 0) await commit(s => s.activeBattle?.plan.id === battleId
      ? { ...s, activeBattle: { ...s.activeBattle, activeMs: (s.activeBattle.activeMs ?? 0) + elapsed } }
      : s);
  }, [battleId, commit]);
  const markActivity = useCallback(() => {
    const now = Date.now();
    if (clock.current.running && now > clock.current.interaction + 120_000) {
      void flush();
      clock.current.tick = now;
    }
    clock.current.interaction = now;
  }, [flush]);

  useEffect(() => { markActivity(); }, [activityKey, markActivity]);
  useEffect(() => {
    if (!battleId) return;
    clock.current = { tick: Date.now(), interaction: Date.now(), running: true };
    const timer = setInterval(() => { void flush(); }, 10_000);
    const subscription = NativeAppState.addEventListener('change', status => {
      if (status !== 'active') { void flush(); clock.current.running = false; }
      else { clock.current.running = true; clock.current.tick = Date.now(); clock.current.interaction = Date.now(); }
    });
    const visibility = () => {
      if (document.hidden) { void flush(); clock.current.running = false; }
      else { clock.current.running = true; clock.current.tick = Date.now(); clock.current.interaction = Date.now(); }
    };
    if (Platform.OS === 'web') document.addEventListener('visibilitychange', visibility);
    return () => {
      clearInterval(timer); subscription.remove();
      if (Platform.OS === 'web') document.removeEventListener('visibilitychange', visibility);
      void flush();
    };
  }, [battleId, flush]);
  return { flush, markActivity };
}
