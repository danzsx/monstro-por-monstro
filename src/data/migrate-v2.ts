import { sanitizeLegacyDiagnostic } from './legacy-diagnostic';
import type { AppState } from './state';
import { isEvolutionPilot } from '@/learning/evolution';

/** Keeps original attempts, sessions and IDs; unknown evidence stays unknown. */
export function migrateStateV2(state: AppState): AppState {
  const safe = state.version === 2 ? state : sanitizeLegacyDiagnostic(state);
  const missingEvolutionFields = !safe.topicChecklists || !safe.externalQuestionLogs;
  const legacyTopics = Object.entries(safe.masteries).filter(([id, mastery]) => isEvolutionPilot(id)
    && mastery.stage === 'mastered' && !mastery.firstClearedAt);
  const unevolvedClears = Object.entries(safe.masteries).filter(([id, mastery]) => isEvolutionPilot(id)
    && mastery.firstClearedAt && !mastery.evolvedAt);
  if (state.version === 2 && !missingEvolutionFields && !legacyTopics.length && !unevolvedClears.length) return state;
  const masteries = { ...safe.masteries };
  for (const [id, mastery] of legacyTopics) masteries[id] = {
    ...mastery, firstClearedAt: mastery.immediatePassedAt ?? mastery.lastPracticedAt ?? safe.createdAt,
    evolvedAt: mastery.immediatePassedAt ?? mastery.lastPracticedAt ?? safe.createdAt, evolutionOrigin: 'legacy',
  };
  for (const [id, mastery] of unevolvedClears) masteries[id] = { ...mastery, evolvedAt: mastery.firstClearedAt };
  return { ...safe, version: 2, masteries,
    completedSessions: safe.completedSessions ?? [],
    confidenceRatings: safe.confidenceRatings ?? [],
    sessionEvents: safe.sessionEvents ?? [],
    topicChecklists: safe.topicChecklists ?? {}, externalQuestionLogs: safe.externalQuestionLogs ?? [],
    remindersEnabled: safe.remindersEnabled ?? false,
  };
}
