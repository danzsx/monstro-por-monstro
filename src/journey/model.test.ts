import { STATIC_TOPICS } from '@/content/catalog';
import { initialState } from '@/data/state';
import type { AttemptEvent } from '@/learning/types';
import { activeIntervalMs } from './timer';
import { buildJourney, filterJourney, localDay, recommendations, totals, weekStart } from './model';

const at = (year: number, month: number, date: number, hour = 12) => new Date(year, month - 1, date, hour).toISOString();
const attempt = (id: string, battleId: string, correct: boolean, date: string): AttemptEvent => ({ id, battleId, topicId: 'cytology', questionId: id, answer: 0, correct, assisted: false, at: date, source: 'practice' });

test('mede somente o intervalo ativo e corta após dois minutos sem interação', () => {
  expect(activeIntervalMs(0, 30_000, 0)).toBe(30_000);
  expect(activeIntervalMs(100_000, 200_000, 0)).toBe(20_000);
  expect(activeIntervalMs(200_000, 300_000, 0)).toBe(0);
});

test('agrega batalhas novas por semana local, preservando tempo e confiança', () => {
  const state = initialState();
  const first = at(2026, 9, 21);
  const second = at(2026, 9, 22);
  state.completedSessions = [
    { id: 'b1', topicId: 'cytology', startedAt: first, completedAt: first, activeMs: 180_000, mode: 'learn', stageAtCompletion: 'learning' },
    { id: 'b2', topicId: 'cytology', startedAt: second, completedAt: second, activeMs: 60_000, mode: 'review', stageAtCompletion: 'mastered' },
  ];
  state.attempts = [attempt('a1', 'b1', true, first), attempt('a2', 'b1', false, first), attempt('a3', 'b2', true, second)];
  state.confidenceRatings = [{ id: 'r1', topicId: 'cytology', level: 'low', at: first, battleId: 'b1' }];
  const entries = buildJourney(state);
  expect(entries.map(e => e.id)).toEqual(['b2', 'b1']);
  expect(entries[1].confidence).toBe('low');
  expect(totals(entries)).toEqual({ battles: 2, topics: 1, correct: 2, answered: 3, activeMs: 240_000, timedBattles: 2 });
  expect(weekStart(localDay(first))).toBe('2026-09-21');
  expect(filterJourney(entries, STATIC_TOPICS, { area: 'Ciências da Natureza', discipline: 'Biologia', topicId: 'cytology' })).toHaveLength(2);
  expect(filterJourney(entries, STATIC_TOPICS, { discipline: 'Química' })).toHaveLength(0);
});

test('histórico incompleto mantém a conclusão sem inventar tempo ou acertos', () => {
  const state = initialState();
  state.analytics = [{ id: 'old', name: 'battle_completed', topicId: 'cytology', at: at(2026, 9, 20) }];
  const [entry] = buildJourney(state);
  expect(entry).toMatchObject({ id: 'old', legacy: true, topicId: 'cytology' });
  expect(entry.activeMs).toBeUndefined();
  expect(entry.attempts).toBeUndefined();
});

test('recomendação prioriza revisão e só aponta dificuldade com evidência', () => {
  const state = initialState();
  const date = at(2026, 9, 21);
  state.completedSessions = [{ id: 'b1', topicId: 'cytology', startedAt: date, completedAt: date, activeMs: 60_000, mode: 'learn', stageAtCompletion: 'learning' }];
  state.masteries.cytology.nextReviewAt = at(2026, 9, 22);
  let entries = buildJourney(state);
  expect(recommendations(entries, STATIC_TOPICS, state.masteries, at(2026, 9, 23))[0]).toMatch(/Reveja Citologia/);
  state.attempts = [0, 1, 2, 3, 4].map(i => attempt(`a${i}`, 'b1', i < 2, date));
  entries = buildJourney(state);
  expect(recommendations(entries, STATIC_TOPICS, state.masteries, at(2026, 9, 23)).join(' ')).toMatch(/dificuldades em Citologia/);
});
