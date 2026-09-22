import { act, renderHook } from '@testing-library/react-native';
import { AccessibilityInfo, AppState, AppStateStatus } from 'react-native';
import { useMonsterReaction, useMotionEnabled } from './use-monster-motion';
import type { MonsterReaction } from './monster-motion';

interface Props { id: string; reaction?: MonsterReaction; enabled: boolean }
const attack = (key: string): MonsterReaction => ({ kind: 'attack', key });
const renderReaction = (props: Props) => renderHook((p: Props) => useMonsterReaction(p.id, p.reaction, p.enabled), { initialProps: props });
// Narrow the overloaded API to the event used by this hook.
const motionInfo = AccessibilityInfo as unknown as {
  addEventListener(event: 'reduceMotionChanged', callback: (value: boolean) => void): { remove(): void };
};

afterEach(() => jest.restoreAllMocks());

test('não repete evento ao renderizar, terminar, retomar ou remontar uma batalha', async () => {
  const props = { id: 'proportions', enabled: true };
  const hook = await renderReaction(props);
  await hook.rerender({ ...props, reaction: attack('question-1') });
  expect(hook.result.current.playing?.key).toBe('question-1');
  await act(() => hook.result.current.finish());
  await hook.rerender({ ...props, reaction: attack('question-1') });
  expect(hook.result.current.playing).toBeUndefined();
  await hook.rerender({ ...props, reaction: attack('question-2') });
  expect(hook.result.current.playing?.key).toBe('question-2');
  await hook.rerender({ ...props, reaction: attack('question-2'), enabled: false });
  expect(hook.result.current.playing).toBeUndefined();
  await hook.rerender({ ...props, reaction: attack('question-3'), enabled: false });
  await hook.rerender({ ...props, reaction: attack('question-3') });
  expect(hook.result.current.playing).toBeUndefined();
  await hook.unmount();
  const restored = await renderReaction({ ...props, reaction: attack('question-3') });
  expect(restored.result.current.playing).toBeUndefined();
});

test('trocar de personagem cancela a reação antiga; um novo evento funciona', async () => {
  const hook = await renderReaction({ id: 'proportions', enabled: true });
  await hook.rerender({ id: 'proportions', enabled: true, reaction: attack('a') });
  await hook.rerender({ id: 'cytology', enabled: true, reaction: attack('a') });
  expect(hook.result.current.playing).toBeUndefined();
  await hook.rerender({ id: 'cytology', enabled: true, reaction: attack('b') });
  expect(hook.result.current.playing?.key).toBe('b');
});

test('pausa por foco, segundo plano e movimento reduzido; remove listeners', async () => {
  let onApp: (state: AppStateStatus) => void = () => {};
  let onReduced: (value: boolean) => void = () => {};
  const removeApp = jest.fn();
  const removeReduced = jest.fn();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, callback) => { onApp = callback; return { remove: removeApp }; });
  jest.spyOn(motionInfo, 'addEventListener').mockImplementation((_event, callback) => { onReduced = callback; return { remove: removeReduced }; });
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  const hook = await renderHook((active: boolean) => useMotionEnabled(active), { initialProps: true });
  await act(() => onApp('active'));
  expect(hook.result.current).toBe(true);
  await act(() => onApp('background'));
  expect(hook.result.current).toBe(false);
  await act(() => onApp('active'));
  expect(hook.result.current).toBe(true);
  await act(() => onReduced(true));
  expect(hook.result.current).toBe(false);
  await act(() => onReduced(false));
  await hook.rerender(false);
  expect(hook.result.current).toBe(false);
  await hook.rerender(true);
  expect(hook.result.current).toBe(true);
  await hook.unmount();
  expect(removeApp).toHaveBeenCalledTimes(1);
  expect(removeReduced).toHaveBeenCalledTimes(1);
});

test('aguarda preferência inicial e uma consulta atrasada não sobrescreve a mudança mais recente', async () => {
  let onReduced: (value: boolean) => void = () => {};
  let resolvePreference!: (value: boolean) => void;
  jest.spyOn(motionInfo, 'addEventListener').mockImplementation((_event, callback) => { onReduced = callback; return { remove: jest.fn() }; });
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockReturnValue(new Promise(resolve => { resolvePreference = resolve; }));
  const hook = await renderHook(() => useMotionEnabled(true));
  expect(hook.result.current).toBe(false);
  await act(() => onReduced(true));
  await act(() => resolvePreference(false));
  expect(hook.result.current).toBe(false);
});
