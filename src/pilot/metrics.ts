import type { AppState } from '@/data/state';

const DAY = 86_400_000;
const ratio = (numerator: number, denominator: number) => denominator ? numerator / denominator : null;
const median = (values: number[]) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

/** One state per consenting participant. Counts people, not device events. */
export function pilotMetrics(states: AppState[], now: string) {
  const nowMs = Date.parse(now);
  if (!Number.isFinite(nowMs)) throw new Error('Data de análise inválida.');
  const entrants = states.filter(s => s.analytics.some(e => e.name === 'entry_opened'));
  const answered = entrants.filter(s => s.attempts.some(a => a.source === 'entry'));
  const started = entrants.filter(s => s.analytics.some(e => e.name === 'battle_started'));
  const completed = entrants.filter(s => (s.completedSessions ?? []).length > 0);
  const eligible = completed.filter(s => {
    const first = [...(s.completedSessions ?? [])].sort((a, b) => a.completedAt.localeCompare(b.completedAt))[0];
    return first && nowMs - Date.parse(first.completedAt) >= 7 * DAY;
  });
  const returned = eligible.filter(s => {
    const sessions = [...(s.completedSessions ?? [])].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
    const firstMs = Date.parse(sessions[0].completedAt);
    return sessions.slice(1).some(session => {
      const gap = Date.parse(session.completedAt) - firstMs;
      return gap >= DAY && gap <= 7 * DAY;
    });
  });
  const sessions = states.flatMap(s => s.completedSessions ?? []);
  const independent = states.flatMap(s => s.attempts.filter(a =>
    (a.source === 'practice' || a.source === 'review') && !a.assisted && a.correct !== null));
  return {
    participants: states.length,
    entrants: entrants.length,
    entryAnswers: answered.length,
    firstSessionsStarted: started.length,
    firstSessionsCompleted: completed.length,
    entryAnswerRate: ratio(answered.length, entrants.length),
    firstSessionRate: ratio(completed.length, entrants.length),
    returnEligible: eligible.length,
    returnedWithin7Days: returned.length,
    returnRate7Days: ratio(returned.length, eligible.length),
    completedSessions: sessions.length,
    microSessions: sessions.filter(s => s.mode === 'micro').length,
    medianActiveMinutes: median(sessions.map(s => s.activeMs / 60_000)),
    independentAttempts: independent.length,
    independentCorrectRate: ratio(independent.filter(a => a.correct).length, independent.length),
  };
}
