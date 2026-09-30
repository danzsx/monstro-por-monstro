import { act, renderHook } from '@testing-library/react-native';
import { AppState as NativeAppState, type AppStateStatus } from 'react-native';
import { useApp } from '@/data/provider';
import { initialState } from '@/data/state';
import { buildBattlePlan } from '@/learning/engine';
import { useStudyTimer } from './use-study-timer';

jest.mock('@/data/provider', () => ({ useApp: jest.fn() }));

test('foco conta leitura sem cliques, pausa em background e retoma sem somar a pausa', async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-09-29T12:00:00Z'));
  const state = initialState();
  const decision = { topicId: 'cytology', review: false, score: 0, reasons: [] };
  state.activeBattle = { decision, plan: buildBattlePlan('focus', decision), phase: 'acquisition-external', blockIndex: 0, questionIndex: 0, revealed: false, attempts: [], startedAt: new Date().toISOString() };
  const commit = jest.fn(async change => { Object.assign(state, change(state)); });
  (useApp as jest.Mock).mockImplementation(() => ({ state, commit }));
  let onStatus: (status: AppStateStatus) => void = () => {};
  const listener = jest.spyOn(NativeAppState, 'addEventListener').mockImplementation((_event, callback) => {
    onStatus = callback;
    return { remove: jest.fn() };
  });
  const view = await renderHook(() => useStudyTimer('focus', 'theory', true, Infinity));
  expect(view.result.current.isRunning).toBe(true);
  await act(async () => { jest.advanceTimersByTime(10 * 60_000); });
  expect(state.activeBattle?.activeMs).toBe(10 * 60_000);
  expect(view.result.current.isRunning).toBe(true);
  await act(async () => { onStatus('background'); jest.advanceTimersByTime(5 * 60_000); });
  expect(state.activeBattle?.activeMs).toBe(10 * 60_000);
  expect(view.result.current.isRunning).toBe(false);
  await act(async () => { onStatus('active'); jest.advanceTimersByTime(2 * 60_000); });
  expect(state.activeBattle?.activeMs).toBe(12 * 60_000);
  expect(view.result.current.isRunning).toBe(true);
  await view.rerender(undefined);
  expect(view.result.current.elapsedMs).toBe(12 * 60_000);
  await view.unmount();
  listener.mockRestore();
  jest.useRealTimers();
});

afterEach(() => { jest.restoreAllMocks(); jest.useRealTimers(); });

test('estado de execução respeita inatividade, interação e foco sem contar tempo parado', async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-09-29T12:00:00Z'));
  const state = initialState();
  const decision = { topicId: 'proportions', review: false, score: 0, reasons: [] };
  state.activeBattle = { decision, plan: buildBattlePlan('running', decision), phase: 'question', blockIndex: 0, questionIndex: 0, revealed: false, attempts: [], startedAt: new Date().toISOString() };
  const commit = jest.fn(async change => { Object.assign(state, change(state)); });
  (useApp as jest.Mock).mockReturnValue({ state, commit });
  const remove = jest.fn();
  jest.spyOn(NativeAppState, 'addEventListener').mockReturnValue({ remove });
  const view = await renderHook((enabled: boolean) => useStudyTimer('running', 'question', enabled, 2000), { initialProps: true });
  expect(view.result.current.isRunning).toBe(true);
  await act(async () => { jest.advanceTimersByTime(5000); });
  expect(view.result.current.isRunning).toBe(false);
  expect(view.result.current.elapsedMs).toBe(2000);
  await act(async () => { view.result.current.markActivity(); });
  expect(view.result.current.isRunning).toBe(true);
  await act(async () => { jest.advanceTimersByTime(1000); });
  expect(view.result.current.elapsedMs).toBe(3000);
  await view.rerender(false);
  expect(view.result.current.isRunning).toBe(false);
  await act(async () => { jest.advanceTimersByTime(5000); });
  expect(state.activeBattle?.activeMs).toBe(3000);
  await view.rerender(true);
  expect(view.result.current.isRunning).toBe(true);
  await act(async () => { jest.advanceTimersByTime(1000); });
  expect(view.result.current.elapsedMs).toBe(4000);
  await view.unmount();
  expect(remove).toHaveBeenCalledTimes(2);
});

test('sem batalha o cronômetro fica parado', async () => {
  (useApp as jest.Mock).mockReturnValue({ state: initialState(), commit: jest.fn() });
  const view = await renderHook(() => useStudyTimer());
  expect(view.result.current.isRunning).toBe(false);
  await view.unmount();
});
