import { sanitizeLegacyDiagnostic } from './legacy-diagnostic';
import { initialState } from './state';

const at = '2026-09-28T10:00:00.000Z';

test('removes legacy familiarity from mastery while retaining the old projection', () => {
  const state = initialState(at);
  state.diagnosticAttempts = [{ id: 'report', topicId: 'proportions', questionId: 'proportions-0', answer: 0, correct: true, assisted: false, at, source: 'diagnostic' }];
  state.masteries.proportions = { ...state.masteries.proportions, score: 1, evidence: 3 };
  const migrated = sanitizeLegacyDiagnostic(state);
  expect(migrated.masteries.proportions.score).toBe(0);
  expect(migrated.masteries.proportions.evidence).toBe(0);
  expect(migrated.legacyDiagnosticProjection?.proportions.score).toBe(1);
  expect(sanitizeLegacyDiagnostic(migrated)).toBe(migrated);
});

test('keeps independent practice evidence and ignores a new self report', () => {
  const state = initialState(at);
  state.diagnosticAttempts = [{ id: 'report', topicId: 'proportions', questionId: 'proportions-0', answer: 0, correct: true, assisted: false, at, source: 'diagnostic' }];
  state.attempts = [{ id: 'practice', topicId: 'proportions', questionId: 'proportions-6', answer: 0, correct: true, assisted: false, at, source: 'practice', battleId: 'battle' }];
  state.masteries.proportions = { ...state.masteries.proportions, score: 1, evidence: 4, encountered: true, stage: 'learning' };
  const migrated = sanitizeLegacyDiagnostic(state);
  expect(migrated.masteries.proportions.evidence).toBe(1);
  expect(migrated.masteries.proportions.score).toBe(1);
  expect(migrated.attempts).toEqual(state.attempts);
  const newState = initialState(at);
  newState.diagnosticAttempts = [{ ...state.diagnosticAttempts[0], correct: null, signal: 'self_report' }];
  expect(sanitizeLegacyDiagnostic(newState)).toBe(newState);
});
