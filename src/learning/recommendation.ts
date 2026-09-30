import type { AttemptEvent, BattlePlan, CompletedStudySession, ExternalQuestionLog, Masteries, NextMonsterDecision, Question, Topic, TopicId } from './types';
import { approvedExamQuestions, isEvolutionPilot } from './evolution';

export const RECOMMENDATION_POLICY_VERSION = 'evidence-v1';
const DAY = 86_400_000;

export interface RecommendationContext {
  availableMinutes: 5 | 15;
  activeTopicId?: TopicId;
  activeMode?: BattlePlan['mode'];
  lastTopicId?: TopicId;
}
export interface RecommendationEvidence {
  masteries: Masteries;
  attempts: AttemptEvent[];
  completedSessions?: CompletedStudySession[];
  externalQuestionLogs?: ExternalQuestionLog[];
}

export function usableQuestions(topic: Topic, purpose: 'practice' | 'review'): Question[] {
  const seen = new Set<string>();
  return topic.questions.filter(question => {
    if (question.purpose !== purpose || seen.has(question.id) || !question.prompt.trim() || !question.explanation.trim()
      || question.options.length < 2 || !Number.isInteger(question.answer) || question.answer < 0 || question.answer >= question.options.length
      || question.options.some(option => !option.trim()) || new Set(question.options).size !== question.options.length) return false;
    seen.add(question.id);
    return true;
  });
}

export function independentPerformance(attempts: AttemptEvent[], topicId: TopicId) {
  const latestByItem = new Map<string, AttemptEvent>();
  for (const attempt of attempts.filter(a => a.topicId === topicId && (a.source === 'practice' || a.source === 'review') && !a.assisted && a.correct !== null)
    .sort((a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id))) latestByItem.set(attempt.questionId, attempt);
  const items = [...latestByItem.values()];
  const recentErrorAt = items.filter(a => a.correct === false).map(a => a.at).sort().at(-1);
  return { items: items.length, correct: items.filter(a => a.correct === true).length, recentErrorAt };
}

/** Deterministic policy. Scores order evidence classes; editorial priority only breaks ties after review. */
export function recommend(context: RecommendationContext, catalog: Topic[], evidence: RecommendationEvidence, now: string): NextMonsterDecision | null {
  const nowMs = Date.parse(now);
  if (!Number.isFinite(nowMs)) throw new Error('Data inválida para recomendação.');
  const sessions = evidence.completedSessions ?? [];
  const latestSession = sessions.map(s => s.completedAt).sort().at(-1);
  const returning = !!latestSession && nowMs - Date.parse(latestSession) > 7 * DAY;
  if (context.activeTopicId) {
    return { topicId: context.activeTopicId, reasons: ['Há uma sessão em andamento neste tópico; você pode retomar da mesma etapa.'], review: context.activeMode === 'review', score: Number.MAX_SAFE_INTEGER,
      policyVersion: RECOMMENDATION_POLICY_VERSION, suggestedMode: context.activeMode, signals: { independentItems: 0, correctItems: 0, availableMinutes: context.availableMinutes, returning } };
  }
  const byId = new Map(catalog.map(topic => [topic.id, topic]));
  const candidates = catalog.flatMap<NextMonsterDecision>(topic => {
    if (topic.prerequisiteIds.some(id => {
      const prereq = evidence.masteries[id];
      return !byId.has(id) || !prereq || (isEvolutionPilot(id) ? !prereq.firstClearedAt : prereq.evidence < 3 || prereq.score < .65);
    })) return [];
    const mastery = evidence.masteries[topic.id];
    const firstClearedAt = mastery?.firstClearedAt;
    const examItems = approvedExamQuestions(topic.questions);
    const unseenExamItems = examItems.filter(question => !evidence.attempts.some(attempt => attempt.questionId === question.id));
    const examAnchor = mastery?.examPracticedAt ?? firstClearedAt;
    if (isEvolutionPilot(topic.id) && mastery?.evolvedAt && firstClearedAt && unseenExamItems.length >= 2
      && examAnchor && nowMs - Date.parse(examAnchor) >= DAY) {
      return [{ topicId: topic.id, review: true, score: 650, reasons: [
        `A primeira conquista de ${topic.name} já teve um intervalo. Agora você pode experimentar duas questões oficiais do ENEM.`,
        'Esta prática ajuda a verificar a aplicação do conteúdo; a skin permanece mesmo se você errar.',
      ], policyVersion: RECOMMENDATION_POLICY_VERSION, suggestedMode: 'exam', signals: {
        independentItems: 0, correctItems: 0, availableMinutes: context.availableMinutes, returning,
      } } satisfies NextMonsterDecision];
    }
    if (isEvolutionPilot(topic.id) && firstClearedAt) return [];
    const performance = independentPerformance(evidence.attempts, topic.id);
    const dueAt = mastery?.nextReviewAt;
    const due = !!dueAt && Number.isFinite(Date.parse(dueAt)) && Date.parse(dueAt) <= nowMs;
    const errorAge = performance.recentErrorAt ? nowMs - Date.parse(performance.recentErrorAt) : Infinity;
    const errorReview = errorAge >= DAY && errorAge <= 14 * DAY;
    const lastRecall = sessions.filter(s => s.topicId === topic.id && s.recall).sort((a, b) => a.completedAt.localeCompare(b.completedAt)).at(-1)?.recall;
    const needsSource = lastRecall?.report === 'not_yet' && !!lastRecall.at && nowMs - Date.parse(lastRecall.at) <= 14 * DAY;
    const externalError = (evidence.externalQuestionLogs ?? []).some(log => log.topicId === topic.id && log.result === 'incorrect'
      && (!mastery?.lastPracticedAt || Date.parse(log.studiedAt) > Date.parse(mastery.lastPracticedAt)));
    const practice = usableQuestions(topic, 'practice');
    const reviewItems = usableQuestions(topic, 'review');
    if (due && !reviewItems.length) return [];
    const review = !needsSource && reviewItems.length > 0 && (due || errorReview);
    if (mastery?.stage === 'mastered' && !due && !errorReview && !needsSource) return [];
    if (mastery?.nextReviewAt && !due && !errorReview && !needsSource) return [];
    if (!(review ? reviewItems : practice).length) return [];

    const mode = context.availableMinutes === 5 ? 'micro' : review ? 'review' : 'learn';
    const weakEvidence = performance.items >= 5 && performance.correct / performance.items < .6;
    const tier = review && due ? 5 : review && errorReview ? 4 : needsSource || externalError ? 4 : weakEvidence ? 3 : performance.items ? 2 : 1;
    const recentSession = sessions.filter(s => s.topicId === topic.id).sort((a, b) => a.completedAt.localeCompare(b.completedAt)).at(-1);
    const justStudied = !!recentSession && nowMs - Date.parse(recentSession.completedAt) < DAY && !due;
    const unlocks = catalog.filter(other => other.prerequisiteIds.includes(topic.id)).length;
    const editorialTie = topic.enemGuidance?.status === 'reviewed' && topic.enemGuidance.sources.length ? Math.min(1, Math.max(0, topic.priority)) : 0;
    const score = tier * 100 + Math.min(10, unlocks) + editorialTie + (performance.items >= 5 ? (1 - performance.correct / performance.items) * 5 : 0)
      - (justStudied ? 30 : 0) - (context.lastTopicId === topic.id ? 1 : 0);
    const reasons: string[] = [];
    if (review && due) {
      const [year, month, day] = dueAt!.slice(0, 10).split('-');
      reasons.push(`A revisão de ${topic.name} está disponível desde ${day}/${month}/${year}.`);
    }
    else if (review && errorReview) reasons.push('Uma resposta independente recente neste tópico ficou incorreta; há questões de revisão disponíveis.');
    else if (needsSource && mode === 'learn') reasons.push('Na última sessão, você informou que ainda não lembrava do tema; esta ação começa pela fonte de estudo.');
    else if (externalError) reasons.push('Você registrou um erro em material externo; vale retomar este conteúdo. Esse resultado foi informado por você.');
    else if (performance.items) reasons.push('Este tópico já tem respostas suas e pode ser fortalecido com outra prática.');
    else reasons.push('Este tópico tem questões aptas e seus pré-requisitos já estão disponíveis.');
    reasons.push(performance.items < 5
      ? `Evidência insuficiente: ${performance.items} ${performance.items === 1 ? 'questão distinta respondida' : 'questões distintas respondidas'} sem ajuda neste tópico.`
      : `Em ${performance.items} questões distintas sem ajuda, ${performance.correct} foram respondidas corretamente.`);
    if (mode === 'micro') reasons.push(review ? 'Você dispõe de cerca de 5 minutos agora; a revisão usa uma questão.' : 'Você dispõe de cerca de 5 minutos agora; comece pela teoria e avance até uma questão de fixação no seu ritmo.');
    if (returning) reasons.push('Sua última sessão concluída foi há mais de sete dias; você pode retomar sem compensar o intervalo.');
    return [{ topicId: topic.id, review, score, reasons, policyVersion: RECOMMENDATION_POLICY_VERSION, suggestedMode: mode,
      signals: { independentItems: performance.items, correctItems: performance.correct, dueAt: due ? dueAt : undefined,
        recentErrorAt: errorReview ? performance.recentErrorAt : undefined, availableMinutes: context.availableMinutes, returning } } satisfies NextMonsterDecision];
  });
  return candidates.sort((a, b) => b.score - a.score || a.topicId.localeCompare(b.topicId))[0] ?? null;
}
