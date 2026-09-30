import { initialState } from '@/data/state';
import { pilotMetrics } from './metrics';

test('pilot funnel counts people and waits seven days before return denominator', () => {
  const now = '2026-09-28T12:00:00.000Z';
  const first = initialState();
  first.analytics = [{ id: 'open', name: 'entry_opened', at: '2026-09-18T12:00:00.000Z' },
    { id: 'start', name: 'battle_started', at: '2026-09-18T12:05:00.000Z' }];
  first.attempts = [{ id: 'entry', questionId: 'proportions-6', topicId: 'proportions', answer: 0, correct: true,
    assisted: false, at: '2026-09-18T12:04:00.000Z', source: 'entry' }];
  first.completedSessions = [
    { id: 'one', topicId: 'proportions', startedAt: '2026-09-18T12:05:00.000Z', completedAt: '2026-09-18T12:10:00.000Z', activeMs: 300_000, mode: 'micro', stageAtCompletion: 'learning' },
    { id: 'two', topicId: 'proportions', startedAt: '2026-09-20T12:05:00.000Z', completedAt: '2026-09-20T12:10:00.000Z', activeMs: 300_000, mode: 'review', stageAtCompletion: 'learning' },
  ];
  const recent = initialState();
  recent.analytics = [{ id: 'open2', name: 'entry_opened', at: '2026-09-27T12:00:00.000Z' }];
  recent.completedSessions = [{ id: 'three', topicId: 'cytology', startedAt: '2026-09-27T12:00:00.000Z', completedAt: '2026-09-27T12:05:00.000Z', activeMs: 300_000, mode: 'micro', stageAtCompletion: 'learning' }];
  const result = pilotMetrics([first, recent], now);
  expect(result).toMatchObject({ participants: 2, entrants: 2, entryAnswers: 1, firstSessionsStarted: 1,
    firstSessionsCompleted: 2, returnEligible: 1, returnedWithin7Days: 1, returnRate7Days: 1,
    completedSessions: 3, medianActiveMinutes: 5, independentAttempts: 0, independentCorrectRate: null });
});
