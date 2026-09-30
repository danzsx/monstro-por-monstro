import type { ExternalQuestionLog, TopicId } from './types';

export function validateExternalQuestion(input: Omit<ExternalQuestionLog, 'id' | 'version' | 'updatedAt'>): void {
  if (!input.source.trim() || !input.locator.trim() || input.source.length > 120 || input.locator.length > 80 || input.comment.length > 240) throw new Error('Confira a fonte, a identificação e o tamanho do comentário.');
  if (input.url && !/^https?:\/\//i.test(input.url)) throw new Error('Use um link http ou https.');
  if (!['correct', 'incorrect', 'unanswered'].includes(input.result) || !Number.isFinite(Date.parse(input.studiedAt)) || input.studiedAt.slice(0, 10) > new Date().toISOString().slice(0, 10)) throw new Error('Confira a data e o resultado informado.');
  if (/(?:^|\n)\s*[A-E][).]\s/mi.test(input.comment) || input.comment.includes('?') && input.comment.length > 160) throw new Error('Anote apenas seu raciocínio; não copie o enunciado ou alternativas.');
}

export function upsertExternalQuestion(logs: ExternalQuestionLog[], log: ExternalQuestionLog, editing = false): ExternalQuestionLog[] {
  if (editing && !logs.some(item => item.id === log.id && item.topicId === log.topicId)) throw new Error('Registro não encontrado.');
  return editing ? logs.map(item => item.id === log.id && item.topicId === log.topicId ? log : item) : [...logs, log];
}

export function removeExternalQuestion(logs: ExternalQuestionLog[], id: string, topicId: TopicId): ExternalQuestionLog[] {
  return logs.filter(item => item.id !== id || item.topicId !== topicId);
}
