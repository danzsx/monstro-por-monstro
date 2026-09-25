import { initialEnvelope } from '@/data/state';
import { flushOutbox, type CloudRepository } from '@/data/outbox';

test('sessão e confiança usam o snapshot sincronizado sem novo formato de evento', async () => {
  const envelope = initialEnvelope();
  const at = '2026-09-25T12:00:00.000Z';
  envelope.state.completedSessions = [{ id: 'battle-1', topicId: 'cytology', startedAt: at, completedAt: at, activeMs: 42_000, mode: 'learn', stageAtCompletion: 'learning' }];
  envelope.state.confidenceRatings = [{ id: 'rating-1', topicId: 'cytology', level: 'medium', at, battleId: 'battle-1' }];
  envelope.pending = [{ id: 'operation-1', snapshot: JSON.parse(JSON.stringify(envelope.state)), events: [] }];
  const push = jest.fn(async (_id, _revision, snapshot) => {
    expect(snapshot.completedSessions?.[0].activeMs).toBe(42_000);
    expect(snapshot.confidenceRatings?.[0].level).toBe('medium');
    return 1;
  });
  const remote: CloudRepository = { load: jest.fn(), push };
  expect((await flushOutbox(envelope, remote)).revision).toBe(1);
  expect(push).toHaveBeenCalledTimes(1);
});
