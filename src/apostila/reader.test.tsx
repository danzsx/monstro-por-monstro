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

test('modo teoria retoma a etapa salva e deixa perguntas para depois', async () => {
  const onStepChange = jest.fn();
  const onComplete = jest.fn();
  const view = await render(<ApostilaReader module={CYTOLOGY_MODULE} onBack={jest.fn()} study={{ initialStep: 1, onStepChange, onComplete }} />);
  expect(view.getByRole('header', { name: 'Quem faz o quê?' })).toBeTruthy();
  expect(view.queryAllByRole('radio')).toHaveLength(0);
  await fireEvent.press(view.getByRole('tab', { name: `Etapa ${CYTOLOGY_MODULE.sections.length}: ${CYTOLOGY_MODULE.sections.at(-1)!.title}` }));
  expect(onStepChange).toHaveBeenCalledWith(CYTOLOGY_MODULE.sections.length - 1);
  await fireEvent.press(view.getByRole('button', { name: 'Concluir teoria e autoexplicar' }));
  expect(onComplete).toHaveBeenCalledTimes(1);
});
