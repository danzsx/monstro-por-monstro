import { TOPICS, TOPIC_IDS } from '@/content/catalog';
import { AttemptEvent, Masteries, Question } from '@/learning/types';
import { emptyMasteries } from '@/learning/engine';
export function evaluateDiagnostic(attempts: AttemptEvent[]): Masteries {
  const result = emptyMasteries();
  for (const id of TOPIC_IDS) {
    const own = [...new Map(attempts.filter(a => a.topicId === id && a.source === 'diagnostic').map(a => [a.questionId, a])).values()];
    result[id] = { ...result[id], score: own.length ? own.filter(a => a.correct && !a.assisted).length / own.length : 0, evidence: own.length };
  }
  return result;
}
export function nextDiagnosticQuestion(attempts: AttemptEvent[]): Question | null {
  const state = evaluateDiagnostic(attempts);
  const counts = TOPIC_IDS.map(id => state[id].evidence);
  if (attempts.length >= 20 || (attempts.length >= 12 && counts.every(n => n >= 3) && TOPIC_IDS.every(id => state[id].score === 0 || state[id].score === 1 || state[id].evidence >= 5))) return null;
  const order = [...TOPICS].sort((a, b) => {
    const ac = state[a.id].evidence; const bc = state[b.id].evidence;
    if (ac < 3 || bc < 3) return ac - bc || a.prerequisiteIds.length - b.prerequisiteIds.length;
    const uncertainty = (score: number) => 1 - Math.abs(score - .5) * 2;
    return uncertainty(state[b.id].score) - uncertainty(state[a.id].score) || ac - bc;
  });
  for (const topic of order) {
    const last = attempts.filter(a => a.topicId === topic.id).at(-1);
    const target = last ? last.correct ? 3 : 1 : 2;
    const available = topic.questions.filter(q => q.purpose === 'diagnostic' && !attempts.some(a => a.questionId === q.id));
    const next = available.sort((a, b) => Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target))[0];
    if (next) return next;
  }
  return null;
}
