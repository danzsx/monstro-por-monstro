import { useState } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { useApp } from '@/data/provider';
import { initialState, type AppState } from '@/data/state';
import { STATIC_TOPICS, topicById, questionById } from '@/content/catalog';
import HomeScreen from '@/learning/home-screen';
import BattleScreen from './battle-screen';

jest.mock('@/data/provider', () => ({ useApp: jest.fn() }));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn() }, useIsFocused: () => true, Redirect: () => null }));
jest.mock('@/ui/animated-monster', () => ({ AnimatedMonster: () => null }));
jest.mock('./battle-monster', () => ({ BattleMonster: () => null }));
jest.mock('@/apostila/data', () => ({ useInteractiveModule: () => ({ module: null, loading: false, error: null }) }));
jest.mock('@/journey/use-study-timer', () => ({ useStudyTimer: () => ({ flush: async () => {}, markActivity: () => {}, elapsedMs: 0, isRunning: true }) }));
jest.mock('@/learning/notifications', () => ({ scheduleSpacedReviewNotifications: jest.fn() }));
jest.mock('lucide-react-native', () => ({ ArrowLeft: () => null, ArrowRight: () => null, Check: () => null, CheckCircle2: () => null, Heart: () => null, Leaf: () => null, RotateCcw: () => null, Sparkles: () => null, BookOpen: () => null, Lightbulb: () => null, MapPinned: () => null }));

test('primeira visita: sentimento, tempo, teoria, autoexplicação, revisão e fixação', async () => {
  let saved = initialState();
  function Harness() {
    const [state, setState] = useState(saved);
    saved = state;
    const commit = async (change: (current: AppState) => AppState) => {
      setState(current => change(current));
    };
    (useApp as jest.Mock).mockReturnValue({ state, commit, topics: STATIC_TOPICS.filter(topic => topic.id === 'proportions'), topicById, questionById, store: { get: () => ({ state: saved }) } });
    return state.activeBattle ? <BattleScreen /> : <HomeScreen />;
  }
  const view = await render(<Harness />);
  expect(view.getByRole('header', { name: 'Bem-vindo ao seu espaço de estudo.' })).toBeTruthy();
  expect(view.queryByRole('button', { name: 'Experimentar uma questão' })).toBeNull();
  await fireEvent.press(view.getByRole('button', { name: 'Conhecer meu monstro' }));
  expect(view.getByRole('header', { name: 'Como você está chegando?' })).toBeTruthy();
  await fireEvent.press(view.getByRole('button', { name: 'Inseguro' }));
  expect(view.getByRole('header', { name: 'Quanto tempo cabe agora?' })).toBeTruthy();
  await fireEvent.press(view.getByRole('button', { name: 'Tenho cerca de 5 minutos' }));
  expect(view.getByText('ESTUDO DE TEORIA')).toBeTruthy();
  expect(saved.activeBattle?.attempts).toHaveLength(0);
  await fireEvent.changeText(view.getByLabelText('Nome do material externo'), 'Meu livro');
  await fireEvent.changeText(view.getByLabelText('Texto do meu material'), 'Minha leitura de hoje.');
  await fireEvent.press(view.getByRole('button', { name: 'Estudar com meu material' }));
  expect(view.getByText('Minha leitura de hoje.')).toBeTruthy();
  expect(view.queryByRole('button', { name: 'Confirmar resposta' })).toBeNull();
  await fireEvent.press(view.getByRole('button', { name: 'Concluir teoria e autoexplicar' }));
  await fireEvent.changeText(view.getByLabelText('Minha autoexplicação'), 'Organizei as ideias com minhas palavras.');
  await fireEvent.press(view.getByRole('button', { name: 'Lembrei em parte' }));
  expect(view.getByText('MINI REVISÃO')).toBeTruthy();
  expect(view.getByText('Organizei as ideias com minhas palavras.')).toBeTruthy();
  expect(view.queryByRole('button', { name: 'Confirmar resposta' })).toBeNull();
  await fireEvent.press(view.getByRole('button', { name: 'Começar questões de fixação' }));
  expect(view.getByRole('button', { name: 'Confirmar resposta' })).toBeTruthy();
  expect(saved.activeBattle?.plan.questionIds).toHaveLength(1);
  await fireEvent.press(view.getByRole('button', { name: 'Ainda não sei' }));
  await fireEvent.press(view.getByRole('button', { name: 'Pular e ver conquista' }));
  await fireEvent.press(view.getByRole('button', { name: 'Concluir e voltar ao início' }));
  expect(saved.completedSessions).toHaveLength(1);
  expect(saved.completedSessions?.[0].acquisition?.materialText).toBe('Minha leitura de hoje.');
  expect(saved.completedSessions?.[0].recall?.text).toBe('Organizei as ideias com minhas palavras.');
  expect(saved.activeBattle).toBeNull();
}, 20000);
