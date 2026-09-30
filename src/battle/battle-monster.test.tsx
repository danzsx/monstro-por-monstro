import { render } from '@testing-library/react-native';
import { useIsFocused } from 'expo-router';
import { AnimatedMonster } from '@/ui/animated-monster';
import { buildBattlePlan } from '@/learning/engine';
import { BattleMonster } from './battle-monster';
import { ProportionsMonster } from './proportions-monster';
import { CytologyMonster } from './cytology-monster';
import type { BattleState } from './machine';

jest.mock('expo-router', () => ({ useIsFocused: jest.fn(() => true) }));
jest.mock('@/ui/animated-monster', () => ({ AnimatedMonster: jest.fn(() => null) }));
jest.mock('./proportions-monster', () => ({ ProportionsMonster: jest.fn(() => null) }));

jest.mock('./cytology-monster', () => ({ CytologyMonster: jest.fn(() => null) }));

function battle(topicId = 'proportions'): BattleState {
  const decision = { topicId, review: false, score: 0, reasons: [] };
  return { decision, plan: buildBattlePlan('animation-test', decision), phase: 'lesson', blockIndex: 0, questionIndex: 0, revealed: false, attempts: [], startedAt: '2026-09-29T12:00:00Z' };
}
beforeEach(() => { jest.clearAllMocks(); (useIsFocused as jest.Mock).mockReturnValue(true); });

describe.each([['proportions', ProportionsMonster], ['cytology', CytologyMonster]] as const)('%s na batalha', (topicId, Monster) => {
const props = () => (Monster as unknown as jest.Mock).mock.calls.at(-1)?.[0];
test('seleciona o desenho articulado nas duas formas e preserva os outros monstros', async () => {
  const view = await render(<BattleMonster battle={battle(topicId)} studyRunning />);
  expect(view.getByTestId(`${topicId}-arena`).props.style.width).toBe(240);
  expect(props()).toMatchObject({ size: 190, active: true, evolved: false, studyRunning: true });
  expect(AnimatedMonster).not.toHaveBeenCalled();
  await view.rerender(<BattleMonster battle={battle(topicId)} studyRunning evolved />);
  expect(props().evolved).toBe(true);
  await view.rerender(<BattleMonster battle={battle('genetics')} studyRunning />);
  expect(view.queryByTestId(`${topicId}-arena`)).toBeNull();
  expect(AnimatedMonster).toHaveBeenCalled();
});

test('cronômetro parado, pausa e perda de foco impedem o movimento', async () => {
  const view = await render(<BattleMonster battle={battle(topicId)} studyRunning={false} />);
  expect(props().active).toBe(false);
  await view.rerender(<BattleMonster battle={battle(topicId)} studyRunning />);
  expect(props().active).toBe(true);
  (useIsFocused as jest.Mock).mockReturnValue(false);
  await view.rerender(<BattleMonster battle={battle(topicId)} studyRunning />);
  expect(props().active).toBe(false);
  (useIsFocused as jest.Mock).mockReturnValue(true);
  await view.rerender(<BattleMonster battle={{ ...battle(topicId), phase: 'paused' }} studyRunning />);
  expect(props().active).toBe(false);
});

test('acertos, erros e conclusão encaminham expressões e eventos estáveis', async () => {
  const state = battle(topicId);
  const attempt = { id: 'answer-1', topicId, questionId: state.plan.questionIds[0], answer: 0, correct: true, assisted: false, at: state.startedAt, source: 'practice' as const };
  const view = await render(<BattleMonster battle={{ ...state, phase: 'feedback', attempts: [attempt] }} />);
  expect(props()).toMatchObject({ feedback: 'correct', reaction: { kind: 'recoil', key: 'animation-test:answer:answer-1' } });
  await view.rerender(<BattleMonster battle={{ ...state, phase: 'feedback', attempts: [{ ...attempt, correct: false }] }} />);
  expect(props()).toMatchObject({ feedback: 'incorrect' });
  expect(props().reaction).toBeUndefined();
  await view.rerender(<BattleMonster battle={{ ...state, phase: 'complete' }} evolved />);
  expect(props()).toMatchObject({ size: 210, evolved: true, reaction: { kind: 'celebrate', key: 'animation-test:complete' } });
  expect(view.getByTestId(`${topicId}-arena`).props.style.height).toBe(240);
});

});
