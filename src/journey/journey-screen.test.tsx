import { fireEvent, render } from '@testing-library/react-native';
import { useApp } from '@/data/provider';
import { STATIC_TOPICS } from '@/content/catalog';
import { initialState } from '@/data/state';
import JourneyScreen from './journey-screen';

jest.mock('@/data/provider', () => ({ useApp: jest.fn() }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('lucide-react-native', () => ({ ArrowRight: () => null, BarChart3: () => null, CalendarDays: () => null, Footprints: () => null }));

test('mostra batalhas concluídas na trilha e resumo do dia sem misturar diagnóstico', async () => {
  const state = initialState();
  const date = new Date().toISOString();
  state.completedSessions = [{ id: 'b1', topicId: 'cytology', startedAt: date, completedAt: date, activeMs: 120_000, mode: 'learn', stageAtCompletion: 'learning' }];
  state.attempts = [{ id: 'a1', questionId: 'q1', topicId: 'cytology', answer: 0, correct: true, assisted: false, at: date, source: 'practice', battleId: 'b1' }];
  state.diagnosticAttempts = [{ ...state.attempts[0], id: 'd1', source: 'diagnostic', correct: false }];
  state.confidenceRatings = [{ id: 'r1', topicId: 'cytology', level: 'high', at: date, battleId: 'b1' }];
  (useApp as jest.Mock).mockReturnValue({ state, topics: STATIC_TOPICS });
  const view = await render(<JourneyScreen />);
  expect(view.getByText('Desempenho: 1 de 1 respostas corretas · Tempo: 2 min')).toBeTruthy();
  await fireEvent.press(view.getByRole('button', { name: 'Resumo de estudos' }));
  expect(view.getByText('1 de 1 respostas corretas')).toBeTruthy();
  await fireEvent.press(view.getByRole('button', { name: /sexta-feira|sábado|domingo|segunda-feira|terça-feira|quarta-feira|quinta-feira/i }));
  expect(view.getByText('1/1 acertos · 2 min')).toBeTruthy();
}, 15000);
