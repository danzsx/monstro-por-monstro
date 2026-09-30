import type { AttemptEvent, ExternalQuestionLog, Question, TopicChecklist, TopicId, TopicMastery } from './types';

export const EVOLUTION_PILOT_TOPICS = ['proportions', 'rule-of-three', 'cytology', 'genetics'] as const;
export const isEvolutionPilot = (id: TopicId) => EVOLUTION_PILOT_TOPICS.some(topic => topic === id);
export const evolutionReady = (mastery?: TopicMastery) => !!mastery?.evolvedAt;

export function earnsFirstClear(topicId: TopicId, attempts: AttemptEvent[], checklist?: TopicChecklist): boolean {
  if (!isEvolutionPilot(topicId) || !checklist?.theoryUnderstood || attempts.length !== 3) return false;
  return new Set(attempts.map(attempt => attempt.questionId)).size === 3
    && attempts.every(attempt => attempt.topicId === topicId && attempt.source === 'practice'
      && attempt.correct === true && !attempt.assisted && !attempt.repaired);
}

export function approvedExamQuestions(questions: Question[]): Question[] {
  const seen = new Set<string>();
  const seenExamItems = new Set<string>();
  return questions.filter(question => {
    const rights = question.rightsEvidence;
    const itemKey = `${question.enemMetadata?.year}:${question.enemMetadata?.color ?? ''}:${question.enemMetadata?.questionNumber}`;
    const filled = (value: unknown) => typeof value === 'string' && !!value.trim();
    const approved = !seen.has(question.id) && !seenExamItems.has(itemKey) && question.purpose === 'exam' && question.enemMetadata?.exam === 'ENEM'
      && !!question.enemMetadata.year && !!question.enemMetadata.questionNumber
      && filled(rights?.holder) && filled(rights?.authorizationReference)
      && filled(rights?.permittedUse) && filled(rights?.verifiedAt)
      && rights?.includesEmbeddedMedia === true
      && filled(question.prompt) && filled(question.explanation)
      && question.options.length === 5 && question.options.every(filled)
      && Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 5;
    if (approved) { seen.add(question.id); seenExamItems.add(itemKey); }
    return approved;
  });
}

export function externalErrors(logs: ExternalQuestionLog[], topicId: TopicId): number {
  return logs.filter(log => log.topicId === topicId && log.result === 'incorrect').length;
}
