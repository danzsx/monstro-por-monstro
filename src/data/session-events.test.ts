import { newEvents } from './events';
import { initialState } from './state';
import { flushOutbox, type CloudRepository } from './outbox';

const at = '2026-09-28T12:00:00.000Z';

test('fonte e recordação geram eventos estáveis separados da tentativa, sem reenviar a resposta ao concluir', async () => {
  const before = initialState(at);
  const attempt = { id: 'answer-1', questionId: 'cytology-6', topicId: 'cytology' as const, answer: 2, correct: true, assisted: false, at, source: 'practice' as const, battleId: 'session-1', itemVersion: 1 };
  const plan = { id: 'session-1', topicId: 'cytology' as const, mode: 'learn' as const, version: 2 as const, contentVersion: 1, estimatedMinutes: 15, blocks: [], questionIds: ['cytology-6'], criteria: 'Praticar.' };
  const selected = { id: 'source-1', sessionId: plan.id, topicId: plan.topicId, at, sessionVersion: 2 as const, contentVersion: 1, name: 'acquisition_selected' as const, acquisition: { source: 'external' as const, label: 'Meu livro', selectedAt: at } };
  const recorded = { id: 'recall-1', sessionId: plan.id, topicId: plan.topicId, at, sessionVersion: 2 as const, contentVersion: 1, name: 'recall_reported' as const, recall: { report: 'partial' as const, at, activeMs: 180_000 } };
  const active = { ...before, sessionEvents: [selected, recorded], activeBattle: { decision: { topicId: plan.topicId, review: false, score: 1, reasons: [] }, plan, phase: 'feedback' as const, blockIndex: 0, questionIndex: 0, revealed: false, attempts: [attempt], startedAt: at } };
  const first = newEvents(before, active);
  expect(first.filter(e => e.kind === 'attempt').map(e => e.id)).toEqual(['answer-1']);
  expect(first.filter(e => (e.payload as { category?: string }).category === 'session').map(e => e.id)).toEqual(['source-1', 'recall-1']);
  const completed = { ...active, activeBattle: null, attempts: [attempt] };
  expect(newEvents(active, completed)).toEqual([]);

  const receipts = new Map<string, number>();
  const writes = new Set<string>();
  let loseReply = true;
  const cloud: CloudRepository = { load: jest.fn(), push: async (operationId, _revision, _snapshot, events) => {
    if (receipts.has(operationId)) return receipts.get(operationId)!;
    for (const event of events) writes.add(event.id);
    receipts.set(operationId, 1);
    if (loseReply) { loseReply = false; throw new Error('rede'); }
    return 1;
  } };
  const envelope = { version: 1 as const, ownerId: 'student', revision: 0, state: active, pending: [{ id: 'operation-1', snapshot: active, events: first }] };
  await expect(flushOutbox(envelope, cloud)).rejects.toThrow('rede');
  expect((await flushOutbox(JSON.parse(JSON.stringify(envelope)), cloud)).revision).toBe(1);
  expect([...writes].sort()).toEqual(['answer-1', 'recall-1', 'source-1']);
});
