import type { AppState } from '@/data/state';
import type { AttemptEvent, ConfidenceLevel, Topic, TopicId, TopicMastery } from '@/learning/types';

export interface JourneyEntry {
  id: string; topicId: TopicId; completedAt: string; startedAt?: string;
  activeMs?: number; attempts?: AttemptEvent[]; confidence?: ConfidenceLevel;
  stageAtCompletion?: TopicMastery['stage']; legacy: boolean;
}
export interface JourneyFilter { area?: string; discipline?: string; topicId?: string }
export interface JourneyTotals { battles: number; topics: number; correct: number; answered: number; activeMs: number; timedBattles: number }

export function areaForDiscipline(discipline: string): string {
  if (['Biologia', 'Física', 'Química'].includes(discipline)) return 'Ciências da Natureza';
  if (discipline === 'Matemática') return 'Matemática';
  if (discipline === 'Linguagens') return 'Linguagens';
  if (discipline === 'História' || discipline === 'Geografia' || discipline === 'Filosofia' || discipline === 'Sociologia') return 'Ciências Humanas';
  return 'Outras áreas';
}
export function localDay(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function weekStart(day: string): string {
  const [year, month, date] = day.split('-').map(Number);
  const d = new Date(year, month - 1, date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function buildJourney(state: AppState): JourneyEntry[] {
  const sessions = state.completedSessions ?? [];
  const ratings = state.confidenceRatings ?? [];
  const byBattle = new Map<string, AttemptEvent[]>();
  for (const attempt of state.attempts) if (attempt.battleId) byBattle.set(attempt.battleId, [...(byBattle.get(attempt.battleId) ?? []), attempt]);
  const current = sessions.map(session => ({
    id: session.id, topicId: session.topicId, completedAt: session.completedAt, startedAt: session.startedAt,
    activeMs: session.activeMs, attempts: byBattle.get(session.id) ?? [], stageAtCompletion: session.stageAtCompletion,
    confidence: ratings.filter(r => r.battleId === session.id).at(-1)?.level, legacy: false,
  } satisfies JourneyEntry));
  const used = new Set(sessions.map(s => s.id));
  const legacyEvents = state.analytics.filter(e => e.name === 'battle_completed' && e.topicId)
    .filter(event => !sessions.some(s => s.topicId === event.topicId && Math.abs(Date.parse(s.completedAt) - Date.parse(event.at)) < 2000))
    .sort((a, b) => a.at.localeCompare(b.at));
  const legacy = legacyEvents.map((event, index) => {
    const previousAt = legacyEvents.slice(0, index).filter(e => e.topicId === event.topicId).at(-1)?.at;
    const groups = [...byBattle.entries()].filter(([id, attempts]) => !used.has(id) && attempts[0]?.topicId === event.topicId
      && attempts.every(a => a.at <= event.at && (!previousAt || a.at > previousAt)));
    const matched = groups.length === 1 ? groups[0] : undefined;
    if (matched) used.add(matched[0]);
    return { id: event.id, topicId: event.topicId!, completedAt: event.at, attempts: matched?.[1], legacy: true } satisfies JourneyEntry;
  });
  return [...current, ...legacy].sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}
export function filterJourney(entries: JourneyEntry[], topics: Topic[], filter: JourneyFilter): JourneyEntry[] {
  const byId = new Map(topics.map(topic => [topic.id, topic]));
  return entries.filter(entry => {
    const topic = byId.get(entry.topicId);
    return (!filter.area || (topic && areaForDiscipline(topic.discipline) === filter.area))
      && (!filter.discipline || topic?.discipline === filter.discipline)
      && (!filter.topicId || entry.topicId === filter.topicId);
  });
}
export function totals(entries: JourneyEntry[]): JourneyTotals {
  return entries.reduce((sum, entry) => ({
    battles: sum.battles + 1, topics: sum.topics,
    correct: sum.correct + (entry.attempts?.filter(a => a.correct).length ?? 0),
    answered: sum.answered + (entry.attempts?.length ?? 0),
    activeMs: sum.activeMs + (entry.activeMs ?? 0), timedBattles: sum.timedBattles + (entry.activeMs === undefined ? 0 : 1),
  }), { battles: 0, topics: new Set(entries.map(e => e.topicId)).size, correct: 0, answered: 0, activeMs: 0, timedBattles: 0 });
}
export function recommendations(entries: JourneyEntry[], topics: Topic[], masteries: AppState['masteries'], now: string, history: JourneyEntry[] = entries): string[] {
  const byId = new Map(topics.map(topic => [topic.id, topic]));
  const relevant = new Set(entries.map(e => e.topicId));
  const due = [...new Set(history.map(e => e.topicId))].filter(id => masteries[id]?.nextReviewAt && Date.parse(masteries[id].nextReviewAt!) <= Date.parse(now));
  const messages = due.slice(0, 2).map(id => `Reveja ${byId.get(id)?.name ?? id}: a revisão já está disponível.`);
  const byTopic = [...relevant].map(id => ({ id, attempts: entries.filter(e => e.topicId === id).flatMap(e => e.attempts ?? []) }));
  const difficulty = byTopic.filter(item => item.attempts.length >= 5 && item.attempts.filter(a => !a.correct).length >= 2)
    .sort((a, b) => (b.attempts.filter(x => !x.correct).length / b.attempts.length) - (a.attempts.filter(x => !x.correct).length / a.attempts.length))[0];
  if (difficulty && messages.length < 3) {
    const topic = byId.get(difficulty.id);
    const prerequisite = topic?.prerequisiteIds.find(id => byId.has(id) && (masteries[id]?.score ?? 0) < .65);
    messages.push(prerequisite
      ? `Você teve dificuldades em ${topic?.name}. Reforce ${byId.get(prerequisite)?.name} antes de tentar novamente.`
      : `Você teve dificuldades em ${topic?.name ?? difficulty.id}. Releia a explicação e tente uma nova prática.`);
  }
  if (!messages.length) messages.push('Continue praticando: ainda não há evidência suficiente para apontar uma dificuldade específica.');
  return messages;
}
