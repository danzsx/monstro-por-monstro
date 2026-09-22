import { TOPICS, TOPIC_IDS, topicById } from '@/content/catalog';
import { AffectiveCheckIn, AttemptEvent, BattlePlan, Masteries, NextMonsterDecision, TopicId, TopicMastery } from './types';
export const DAY = 86_400_000;
export function emptyMasteries(): Masteries {
  return Object.fromEntries(TOPIC_IDS.map(topicId => [topicId, { topicId, score: 0, evidence: 0, encountered: false, stage: 'unseen', reviewLevel: 0 }])) as Masteries;
}
export function scheduleReview(at: string, level: number, passed = true): string {
  const days = passed ? [1, 3, 7, 14, 30][Math.min(Math.max(level, 0), 4)] : 1;
  return new Date(Date.parse(at) + days * DAY).toISOString();
}
export function prerequisitesMet(id: TopicId, masteries: Masteries): boolean {
  return topicById(id).prerequisiteIds.every(p => masteries[p].evidence >= 3 && masteries[p].score >= .65);
}
export function isDue(m: TopicMastery, now: string): boolean { return !!m.nextReviewAt && Date.parse(m.nextReviewAt) <= Date.parse(now); }
export function selectNextMonster(masteries: Masteries, now: string, active?: TopicId, lastTopic?: TopicId): NextMonsterDecision | null {
  if (active) return { topicId: active, reasons: ['Vamos continuar exatamente de onde você parou.'], review: isDue(masteries[active], now), score: Infinity };
  const candidates = TOPICS.filter(t => prerequisitesMet(t.id, masteries)).filter(t => {
    const m = masteries[t.id]; return !m.nextReviewAt || isDue(m, now);
  }).map(t => {
    const m = masteries[t.id];
    const due = isDue(m, now);
    const recentlyDeferred = !!m.deferredAt && Date.parse(now) - Date.parse(m.deferredAt) < DAY;
    const overdueDays = due ? Math.min(7, (Date.parse(now) - Date.parse(m.nextReviewAt!)) / DAY) : 0;
    const unlocks = TOPICS.filter(other => other.prerequisiteIds.includes(t.id)).length;
    const debt = m.deferredAt && !recentlyDeferred ? 2 : 0;
    const score = (1 - m.score) * 3 + t.priority + unlocks * .5 + (due ? 4 + overdueDays : 0) + debt - (recentlyDeferred ? 8 : 0) - (lastTopic === t.id ? .3 : 0);
    return { topicId: t.id, review: due, score, reasons: [
      due ? 'Uma revisão agora ajuda a manter o que você aprendeu.' : m.evidence ? 'Suas respostas mostram uma oportunidade de fortalecer essa base.' : 'Vamos começar por uma base importante e descobrir seu ritmo.',
      ...(unlocks ? ['Esse conhecimento prepara você para o próximo conteúdo da disciplina.'] : []),
      ...(debt ? ['Retomamos o conteúdo que você adiou, em um passo possível.'] : []),
    ] };
  });
  return candidates.sort((a, b) => b.score - a.score || a.topicId.localeCompare(b.topicId))[0] ?? null;
}
export function buildBattlePlan(id: string, decision: NextMonsterDecision, checkIn?: AffectiveCheckIn, forceMicro = false, attempts: AttemptEvent[] = []): BattlePlan {
  const topic = topicById(decision.topicId);
  const micro = forceMicro || !!checkIn && checkIn.feeling !== 'confident';
  const mode = micro ? 'micro' : decision.review ? 'review' : 'learn';
  const pool = topic.questions.filter(q => q.purpose === (decision.review ? 'review' : 'practice'));
  const useCount = (qid: string) => attempts.filter(a => a.questionId === qid).length;
  const questions = [...pool].sort((a, b) => useCount(a.id) - useCount(b.id) || a.id.localeCompare(b.id)).slice(0, micro ? 2 : 5);
  return { id, topicId: topic.id, mode, estimatedMinutes: micro ? 5 : decision.review ? 10 : 15,
    blocks: decision.review ? [] : micro ? [topic.lessons[0], topic.lessons[3]] : topic.lessons,
    questionIds: questions.map(q => q.id), criteria: micro ? 'Dar o primeiro passo e praticar duas questões.' : 'Recuperar o conteúdo e resolver cinco questões sem ajuda.' };
}
export function updateMastery(previous: TopicMastery, incoming: AttemptEvent[], now: string): TopicMastery {
  const attempts = [...new Map(incoming.filter(a => a.topicId === previous.topicId).map(a => [a.questionId, a])).values()];
  if (!attempts.length) return previous;
  const evidence = [...new Map([...(previous.assessmentEvidence ?? []), ...attempts].map(a => [a.questionId, a])).values()];
  const independent = evidence.filter(a => !a.assisted);
  const accuracy = independent.length ? independent.filter(a => a.correct).length / independent.length : 0;
  const score = previous.evidence ? previous.score * .35 + accuracy * .65 : accuracy;
  const passed = independent.length >= 5 && accuracy >= .8;
  const delayed = !!previous.immediatePassedAt && Date.parse(now) - Date.parse(previous.immediatePassedAt) >= DAY && attempts.every(a => a.source === 'review');
  const base: TopicMastery = { ...previous, encountered: true, score, evidence: previous.evidence + attempts.filter(a => !a.assisted).length, lastPracticedAt: now, stage: 'learning', assessmentEvidence: evidence };
  if (delayed && passed) return { ...base, stage: 'mastered', reviewLevel: previous.reviewLevel + 1, nextReviewAt: scheduleReview(now, previous.reviewLevel + 1), assessmentEvidence: [] };
  if (passed) return { ...base, stage: 'consolidating', immediatePassedAt: previous.immediatePassedAt ?? now, nextReviewAt: scheduleReview(now, 0), assessmentEvidence: [] };
  if (attempts.some(a => a.source === 'review')) return { ...base, stage: 'review', nextReviewAt: scheduleReview(now, 0, false), reviewLevel: 0 };
  return { ...base, nextReviewAt: undefined };
}
export function intervention(checkIn: AffectiveCheckIn, mastery: TopicMastery): string {
  if (checkIn.feeling === 'confident') return 'Vamos colocar essa confiança em prática. Uma questão por vez.';
  switch (checkIn.barrier) {
    case 'tired': return 'Seu ritmo também importa. Vamos fazer só um cartão e duas questões. Depois, você pode descansar.';
    case 'relevance': return `${topicById(checkIn.topicId).relevance} Vamos experimentar isso em cinco minutos.`;
    case 'history': return mastery.evidence >= 3 && mastery.score >= .65 ? `Nas suas respostas recentes, você acertou cerca de ${Math.round(mastery.score * 100)}%. Há evidência de que você já tem uma base. Vamos usá-la.` : 'Uma tentativa anterior não define a próxima. Vamos rever a base e experimentar duas questões com explicação.';
    default: return 'Tudo bem não saber ainda. Vamos dividir: uma ideia, um exemplo e duas questões. O primeiro passo cabe em cinco minutos.';
  }
}
