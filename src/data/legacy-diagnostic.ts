import { DIAGNOSTIC_GATEWAY_IDS } from '@/diagnostic/engine';
import { updateMastery } from '@/learning/engine';
import { AttemptEvent, TopicMastery } from '@/learning/types';
import { AppState } from './state';

/** Rebuild only legacy gateway projections from actual completed question attempts. */
export function sanitizeLegacyDiagnostic(state: AppState): AppState {
  if (state.diagnosticMasteriesSanitizedAt || !state.diagnosticAttempts.some(a => a.source === 'diagnostic' && a.signal !== 'self_report')) return state;
  const masteries = { ...state.masteries };
  const legacyDiagnosticProjection = { ...(state.legacyDiagnosticProjection ?? {}) };
  for (const topicId of DIAGNOSTIC_GATEWAY_IDS) {
    const old = state.masteries[topicId];
    if (!old) continue;
    legacyDiagnosticProjection[topicId] = old;
    const valid = state.attempts.filter(a => a.topicId === topicId && (a.source === 'practice' || a.source === 'review') && a.correct !== null);
    const groups = new Map<string, AttemptEvent[]>();
    for (const attempt of valid) {
      const key = attempt.battleId ?? attempt.id;
      groups.set(key, [...(groups.get(key) ?? []), attempt]);
    }
    const ordered = [...groups.entries()].map(([id, attempts]) => ({
      attempts,
      at: state.completedSessions?.find(session => session.id === id)?.completedAt ?? attempts.at(-1)!.at,
    })).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
    let next: TopicMastery = { topicId, score: 0, evidence: 0, encountered: old.encountered, stage: old.encountered ? 'learning' : 'unseen', reviewLevel: 0 };
    for (const group of ordered) next = updateMastery(next, group.attempts, group.at);
    masteries[topicId] = next;
  }
  return { ...state, masteries, legacyDiagnosticProjection, diagnosticMasteriesSanitizedAt: new Date().toISOString() };
}
