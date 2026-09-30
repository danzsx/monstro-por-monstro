import { TOPICS } from '@/content/catalog';
import { AttemptEvent, Masteries, Question, TopicId } from '@/learning/types';
import { emptyMasteries } from '@/learning/engine';
export const DIAGNOSTIC_GATEWAY_IDS: TopicId[] = ['proportions', 'rule-of-three', 'cytology', 'genetics'];

export function evaluateDiagnostic(attempts: AttemptEvent[]): Masteries {
  // v1 diagnostic entries are familiarity reports, even when legacy rows have
  // correct=true. Never convert them into demonstrated mastery.
  void attempts;
  return emptyMasteries();
}
export function nextDiagnosticQuestion(attempts: AttemptEvent[]): Question | null {
  // One optional prompt per gateway topic; progress is safe to pause at any time.
  const topic = TOPICS.find(t => DIAGNOSTIC_GATEWAY_IDS.includes(t.id) && !attempts.some(a => a.topicId === t.id && a.source === 'diagnostic'));
  return topic?.questions.find(q => q.purpose === 'diagnostic') ?? null;
}
