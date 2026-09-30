import { act, render } from '@testing-library/react-native';
import { cancelAnimation, withRepeat, withTiming } from 'react-native-reanimated';
import { useMotionEnabled } from '@/ui/use-monster-motion';
import { ProportionsMonster } from './proportions-monster';
import { CytologyMonster } from './cytology-monster';

jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  // Keep the clocks stable across React rerenders, as the real library does.
  useSharedValue: (initial: number) => jest.requireActual('react').useRef({ value: initial, set(value: number) { this.value = value; } }).current,
  useDerivedValue: (sample: () => unknown) => ({ get value() { return sample(); } }),
  withRepeat: jest.fn(value => value),
  withTiming: jest.fn(value => value),
  cancelAnimation: jest.fn(),
}));
jest.mock('react-native-worklets', () => ({ ...jest.requireActual('react-native-worklets/src/mock'), scheduleOnRN: (callback: () => void) => callback() }));
jest.mock('@/ui/use-monster-motion', () => ({ ...jest.requireActual('@/ui/use-monster-motion'), useMotionEnabled: jest.fn((active: boolean) => active) }));

beforeEach(() => { jest.clearAllMocks(); (useMotionEnabled as jest.Mock).mockImplementation((active: boolean) => active); });

describe.each([['proportions', ProportionsMonster], ['cytology', CytologyMonster]] as const)('%s articulado', (topicId, Monster) => {
test('as duas formas renderizam peças articuladas; atualizações não reiniciam o ciclo', async () => {
  const view = await render(<Monster studyRunning />);
  expect(view.getByRole('image').props.accessibilityLabel).toContain('acompanhando seu estudo');
  expect(view.getByTestId(`${topicId}-leftArm`)).toBeTruthy();
  expect(view.getByTestId(`${topicId}-rightArm`)).toBeTruthy();
  expect(view.getByTestId(`${topicId}-leftLeg`)).toBeTruthy();
  expect(view.getByTestId(`${topicId}-rightLeg`)).toBeTruthy();
  expect(withRepeat).toHaveBeenCalledTimes(1);
  await view.rerender(<Monster studyRunning evolved />);
  expect(view.getByRole('image').props.accessibilityLabel).toContain('segunda forma');
  expect(withRepeat).toHaveBeenCalledTimes(1);
  await view.unmount();
  expect(cancelAnimation).toHaveBeenCalled();
});

test('a reação interrompe o ciclo, termina e não repete o mesmo evento', async () => {
  const view = await render(<Monster studyRunning />);
  await view.rerender(<Monster mood="ready" reaction={{ kind: 'attack', key: 'question-1' }} />);
  const calls = (withTiming as jest.Mock).mock.calls;
  const attack = calls.find(call => call[1]?.duration === 700);
  expect(attack).toBeDefined();
  await view.rerender(<Monster mood="ready" reaction={{ kind: 'attack', key: 'question-1' }} />);
  expect(calls.filter(call => call[1]?.duration === 700)).toHaveLength(1);
  const loopsBeforeFinish = (withRepeat as jest.Mock).mock.calls.length;
  await act(() => attack![2](true));
  expect(withRepeat).toHaveBeenCalledTimes(loopsBeforeFinish + 1);
  await view.rerender(<Monster mood="ready" reaction={{ kind: 'attack', key: 'question-1' }} />);
  expect(calls.filter(call => call[1]?.duration === 700)).toHaveLength(1);
  await view.unmount();
});

test('movimento reduzido cancela ciclos e consome reações sem reproduzi-las ao retomar', async () => {
  const view = await render(<Monster studyRunning />);
  (useMotionEnabled as jest.Mock).mockReturnValue(false);
  await view.rerender(<Monster mood="ready" reaction={{ kind: 'attack', key: 'question-2' }} />);
  expect(cancelAnimation).toHaveBeenCalled();
  expect((withTiming as jest.Mock).mock.calls.some(call => call[1]?.duration === 700)).toBe(false);
  (useMotionEnabled as jest.Mock).mockReturnValue(true);
  await view.rerender(<Monster mood="ready" reaction={{ kind: 'attack', key: 'question-2' }} />);
  expect((withTiming as jest.Mock).mock.calls.some(call => call[1]?.duration === 700)).toBe(false);
  await view.unmount();
});

test('pausar e retomar o cronômetro suspende e reinicia o ciclo sem reproduzir golpes antigos', async () => {
  const view = await render(<Monster studyRunning />);
  const loopsBeforePause = (withRepeat as jest.Mock).mock.calls.length;
  await view.rerender(<Monster studyRunning={false} active={false} reaction={{ kind: 'attack', key: 'old' }} />);
  expect(withRepeat).toHaveBeenCalledTimes(loopsBeforePause);
  expect(cancelAnimation).toHaveBeenCalled();
  await view.rerender(<Monster studyRunning reaction={{ kind: 'attack', key: 'old' }} />);
  expect(withRepeat).toHaveBeenCalledTimes(loopsBeforePause + 1);
  expect((withTiming as jest.Mock).mock.calls.some(call => call[1]?.duration === 700)).toBe(false);
  await view.unmount();
});
});
