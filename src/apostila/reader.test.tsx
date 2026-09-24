import { fireEvent, render } from '@testing-library/react-native';
import { ApostilaReader } from './reader';
import { CYTOLOGY_MODULE } from './cytology';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('./data', () => ({ useInteractiveModule: jest.fn() }));
jest.mock('lucide-react-native', () => ({
  ArrowLeft: () => null, ArrowRight: () => null, ArrowDown: () => null,
  BookOpen: () => null, CheckCircle2: () => null, Lightbulb: () => null,
  MapPinned: () => null, Sparkles: () => null, Droplets: () => null,
  Dna: () => null, Zap: () => null, Check: () => null,
}));

test('navega entre etapas sem sair da tela e explica a resposta escolhida', async () => {
  const view = await render(<ApostilaReader module={CYTOLOGY_MODULE} onBack={jest.fn()} />);
  expect(view.getByRole('header', { name: 'O começo de tudo' })).toBeTruthy();
  await fireEvent.press(view.getByRole('radio', { name: /B\. Membrana, DNA, citoplasma e ribossomos/ }));
  expect(view.getByText('Boa leitura do problema.')).toBeTruthy();
  await fireEvent.press(view.getByRole('button', { name: 'Próxima etapa' }));
  expect(view.getByRole('header', { name: 'Quem faz o quê?' })).toBeTruthy();
  await fireEvent.press(view.getByRole('button', { name: 'Etapa anterior' }));
  expect(view.getByText('Boa leitura do problema.')).toBeTruthy();
}, 15000);
