import { activeIntervalMs } from './timer';

test('tempo ativo respeita limite de inatividade e permite recordação de cinco minutos', () => {
  expect(activeIntervalMs(0, 4 * 60_000, 0)).toBe(2 * 60_000);
  expect(activeIntervalMs(0, 4 * 60_000, 0, 5 * 60_000)).toBe(4 * 60_000);
  expect(activeIntervalMs(0, 7 * 60_000, 0, 5 * 60_000)).toBe(5 * 60_000);
  expect(activeIntervalMs(10_000, 10_000, 0)).toBe(0);
});

test('modo de estudo mantém o foco sem cliques frequentes', () => {
  expect(activeIntervalMs(0, 25 * 60_000, 0, Infinity)).toBe(25 * 60_000);
  expect(activeIntervalMs(20 * 60_000, 25 * 60_000, 0, Infinity)).toBe(5 * 60_000);
});
