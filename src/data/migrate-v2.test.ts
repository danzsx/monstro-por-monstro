import { initialState } from './state';
import { migrateStateV2 } from './migrate-v2';

test('v1 -> v2 preserves evidence and active session without manufacturing progress', () => {
  const legacy = initialState('2026-09-28T10:00:00.000Z');
  legacy.version = 1;
  legacy.completedSessions = undefined;
  legacy.sessionEvents = undefined;
  legacy.attempts = [{ id: 'same-attempt', topicId: 'proportions', questionId: 'proportions-6', answer: 1,
    correct: false, assisted: false, at: '2026-09-28T10:00:00.000Z', source: 'practice' }];
  legacy.activeBattle = { decision: { topicId: 'proportions', review: false, reasons: [], score: 1 },
    plan: { id: 'ongoing', topicId: 'proportions', mode: 'micro', estimatedMinutes: 5, blocks: [], questionIds: ['proportions-6'], criteria: '' },
    phase: 'question', blockIndex: 0, questionIndex: 0, revealed: false, attempts: [], startedAt: '2026-09-28T10:00:00.000Z' };
  const migrated = migrateStateV2(legacy);
  expect(migrated.version).toBe(2);
  expect(migrated.attempts).toEqual(legacy.attempts);
  expect(migrated.activeBattle).toEqual(legacy.activeBattle);
  expect(migrated.masteries).toEqual(legacy.masteries);
  expect(migrated.completedSessions).toEqual([]);
  expect(migrateStateV2(migrated)).toBe(migrated);
});
