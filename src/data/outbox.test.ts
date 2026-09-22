import { acknowledge, CloudRepository, flushOutbox } from './outbox';
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
