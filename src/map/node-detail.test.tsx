import { fireEvent, render } from '@testing-library/react-native';
import { useApp } from '@/data/provider';
import { STATIC_TOPICS } from '@/content/catalog';
import { NODES_BY_ID } from './catalog';
import { NodeDetail } from './node-detail';

jest.mock('@/data/provider', () => ({ useApp: jest.fn() }));
jest.mock('@/apostila/data', () => ({ usePublishedModuleIds: () => (topicId: string) => topicId === 'cytology' }));
jest.mock('lucide-react-native', () => ({ ArrowRight: () => null, BookOpen: () => null, ExternalLink: () => null, Sprout: () => null, X: () => null, Check: () => null }));
beforeEach(() => {
  (useApp as jest.Mock).mockReturnValue({ topics: STATIC_TOPICS, state: { masteries: {} }, online: false });
});

test('a ficha funciona sem conexão e abre somente o monstro resolvido no catálogo', async () => {
  const open = jest.fn();
  const view = await render(<NodeDetail node={NODES_BY_ID.genetics} onSelect={jest.fn()} onClose={jest.fn()} onMonster={open} />);
  expect(view.getByRole('header', { name: 'Fundamentos de genética' })).toBeTruthy();
  await fireEvent.press(view.getByRole('button', { name: 'Conhecer este monstro' }));
  expect(open).toHaveBeenCalledWith('genetics');
  expect(view.getByRole('link', { name: /Abrir matriz oficial/ })).toBeTruthy();
}, 15000); // The first native component render also initializes Expo Image in Jest.

test('Citologia oferece a apostila incluída no app e preserva o ID para retorno', async () => {
  const open = jest.fn();
  const view = await render(<NodeDetail node={NODES_BY_ID.cytology} onSelect={jest.fn()} onClose={jest.fn()} onMonster={jest.fn()} onApostila={open} />);
  await fireEvent.press(view.getByRole('button', { name: 'Abrir apostila interativa' }));
  expect(open).toHaveBeenCalledWith('cytology');
});

test('conteúdo em preparação mantém resumo e relações acessíveis, sem botão de monstro', async () => {
  (useApp as jest.Mock).mockReturnValue({ topics: [], state: { masteries: {} }, online: false });
  const select = jest.fn();
  const view = await render(<NodeDetail node={NODES_BY_ID['membrane-transport']} onSelect={select} onClose={jest.fn()} onMonster={jest.fn()} />);
  expect(view.getByText('Monstro em preparação')).toBeTruthy();
  expect(view.queryByRole('button', { name: 'Conhecer este monstro' })).toBeNull();
  const link = view.getByRole('button', { name: /^Soluções/ });
  await fireEvent.press(link);
  expect(select).toHaveBeenCalledWith('solutions');
});

test('atualização do catálogo remove link antigo da ficha aberta', async () => {
  const props = { node: NODES_BY_ID.genetics, onSelect: jest.fn(), onClose: jest.fn(), onMonster: jest.fn() };
  const view = await render(<NodeDetail {...props} />);
  (useApp as jest.Mock).mockReturnValue({ topics: [], state: { masteries: {} }, online: false });
  await view.rerender(<NodeDetail {...props} />);
  expect(view.queryByRole('button', { name: 'Conhecer este monstro' })).toBeNull();
  expect(view.getByText('Monstro em preparação')).toBeTruthy();
});
