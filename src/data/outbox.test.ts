import { acknowledge, appendLocalOperation, compactUnownedOperations, CloudRepository, flushOutbox } from './outbox';
import { initialEnvelope } from './state';
test('reenvio após reiniciar reutiliza o ID e não duplica a gravação remota', async () => {
  const envelope = initialEnvelope(); envelope.pending = [{ id: 'op1', snapshot: envelope.state, events: [] }];
  const receipts = new Map<string, number>(); let writes = 0; let loseResponse = true;
  const cloud: CloudRepository = { load: jest.fn(), push: async id => {
    if (receipts.has(id)) return receipts.get(id)!;
    writes++; receipts.set(id, writes);
    if (loseResponse) { loseResponse = false; throw new Error('Conexão perdida depois do commit'); }
    return writes;
  } };
  await expect(flushOutbox(envelope, cloud)).rejects.toThrow('Conexão perdida');
  const reopened = JSON.parse(JSON.stringify(envelope));
  const result = await flushOutbox(reopened, cloud);
  expect(writes).toBe(1); expect(result.revision).toBe(1); expect(acknowledge(envelope.pending, result.acknowledged)).toEqual([]);
});
test('acknowledgement preserva respostas adicionadas durante a sincronização', () => {
  const e = initialEnvelope(); const first = { id: '1', snapshot: e.state, events: [] }; const second = { ...first, id: '2' };
  expect(acknowledge([first, second], ['1'])).toEqual([second]);
});

test('compacta apenas operações ainda não enviadas sem perder eventos', () => {
  const snapshot = initialEnvelope().state;
  const event = { id: 'resposta-1', kind: 'attempt' as const, at: snapshot.createdAt, payload: { questionId: 'q1' } };
  const sent = { id: 'op-antiga', snapshot, events: [] };
  const local = { id: 'op-local', snapshot, events: [event], localOnly: true };
  const latest = { ...local, id: 'op-nova', snapshot: { ...snapshot, lastSeenAt: 'agora' }, events: [event] };
  expect(appendLocalOperation([sent, local], latest)).toEqual([
    sent, { ...local, snapshot: latest.snapshot, events: [event] },
  ]);
  expect(appendLocalOperation([sent], latest)).toEqual([sent, latest]);
});

test('reduz o histórico local anterior à primeira sincronização', () => {
  const snapshot = initialEnvelope().state;
  const event = { id: 'resposta-1', kind: 'attempt' as const, at: snapshot.createdAt, payload: {} };
  const pending = [
    { id: 'primeira', snapshot, events: [event] },
    { id: 'segunda', snapshot: { ...snapshot, lastSeenAt: 'agora' }, events: [event] },
  ];
  expect(compactUnownedOperations(pending)).toEqual([{
    id: 'primeira', snapshot: pending[1].snapshot, events: [event], localOnly: true,
  }]);
});
