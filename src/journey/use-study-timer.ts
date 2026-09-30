import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AppState as NativeAppState, Platform } from 'react-native';
import { useApp } from '@/data/provider';
import { activeIntervalMs } from './timer';

export function useStudyTimer(battleId?: string, activityKey?: string, enabled = true, idleLimitMs = 120_000) {
  const { commit, state } = useApp();
  const [pendingMs, setPendingMs] = useState(0);
  const clock = useRef({ tick: 0, interaction: 0, running: false });
  const listeners = useRef(new Set<() => void>());
  const subscribe = useCallback((listener: () => void) => {
    listeners.current.add(listener);
    return () => { listeners.current.delete(listener); };
  }, []);
  const notify = useCallback(() => { listeners.current.forEach(listener => listener()); }, []);
  const getRunning = useCallback(() => clock.current.running && Date.now() < clock.current.interaction + idleLimitMs, [idleLimitMs]);
  const running = useSyncExternalStore(subscribe, getRunning, () => false);
  const flush = useCallback(async () => {
    if (!battleId || !clock.current.running) return;
    const now = Date.now();
    const elapsed = activeIntervalMs(clock.current.tick, now, clock.current.interaction, idleLimitMs);
    clock.current.tick = now;
    setPendingMs(0);
    if (elapsed > 0) await commit(s => s.activeBattle?.plan.id === battleId
      ? { ...s, activeBattle: { ...s.activeBattle, activeMs: (s.activeBattle.activeMs ?? 0) + elapsed,
          recallActiveMs: (s.activeBattle.recallActiveMs ?? 0) + (s.activeBattle.phase === 'recall' ? elapsed : 0) } }
      : s);
  }, [battleId, commit, idleLimitMs]);
  const markActivity = useCallback(() => {
    const now = Date.now();
    if (clock.current.running && now > clock.current.interaction + idleLimitMs) {
      void flush();
      clock.current.tick = now;
    }
    clock.current.interaction = now;
    notify();
  }, [flush, idleLimitMs, notify]);

  useEffect(() => { if (enabled) markActivity(); }, [activityKey, enabled, markActivity]);
  useEffect(() => {
    if (!battleId || !enabled) { clock.current.running = false; notify(); return; }
    clock.current = { tick: Date.now(), interaction: Date.now(), running: NativeAppState.currentState !== 'background' && NativeAppState.currentState !== 'inactive' && (Platform.OS !== 'web' || !document.hidden) };
    notify();
    const displayTimer = setInterval(() => {
      const now = Date.now();
      setPendingMs(clock.current.running ? activeIntervalMs(clock.current.tick, now, clock.current.interaction, idleLimitMs) : 0);
      notify();
    }, 1000);
    const timer = setInterval(() => { void flush(); }, 60_000);
    const subscription = NativeAppState.addEventListener('change', status => {
      if (status !== 'active') { void flush(); clock.current.running = false; }
      else if (Platform.OS !== 'web' || !document.hidden) { clock.current.running = true; clock.current.tick = Date.now(); clock.current.interaction = Date.now(); }
      notify();
    });
    const visibility = () => {
      if (document.hidden) { void flush(); clock.current.running = false; }
      else { clock.current.running = true; clock.current.tick = Date.now(); clock.current.interaction = Date.now(); }
      notify();
    };
    if (Platform.OS === 'web') document.addEventListener('visibilitychange', visibility);
    return () => {
      clearInterval(timer); clearInterval(displayTimer); subscription.remove();
      if (Platform.OS === 'web') document.removeEventListener('visibilitychange', visibility);
      void flush();
      clock.current.running = false;
    };
  }, [battleId, enabled, flush, idleLimitMs, notify]);
  const savedMs = state.activeBattle?.plan.id === battleId ? state.activeBattle?.activeMs ?? 0 : 0;
  return { flush, markActivity, elapsedMs: savedMs + (enabled ? pendingMs : 0), isRunning: !!battleId && enabled && running };
}
