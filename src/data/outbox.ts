import { AppState, LocalEnvelope, PendingOperation, SyncEvent } from './state';
export interface SnapshotReply { revision: number; snapshot: AppState | null }
export interface CloudRepository {
  load(): Promise<SnapshotReply>;
  push(operationId: string, expectedRevision: number, snapshot: AppState, events: SyncEvent[]): Promise<number>;
}
export interface FlushResult { acknowledged: string[]; revision: number }
// Send the exact persisted operation on retry. The server transaction deduplicates its ID.
export async function flushOutbox(envelope: LocalEnvelope, cloud: CloudRepository): Promise<FlushResult> {
  let revision = envelope.revision;
  const acknowledged: string[] = [];
  for (const operation of envelope.pending) {
    revision = await cloud.push(operation.id, revision, operation.snapshot, operation.events);
    acknowledged.push(operation.id);
  }
  return { acknowledged, revision };
}
export function acknowledge(pending: PendingOperation[], ids: string[]): PendingOperation[] {
  const sent = new Set(ids); return pending.filter(op => !sent.has(op.id));
}

// Only operations known never to have reached the server may be combined.
// Keep older operations and their IDs intact so receipt based retries stay safe.
export function appendLocalOperation(pending: PendingOperation[], operation: PendingOperation): PendingOperation[] {
  const last = pending[pending.length - 1];
  if (!last?.localOnly) return [...pending, operation];
  const events = [...new Map([...last.events, ...operation.events].map(event => [event.id, event])).values()];
  return [...pending.slice(0, -1), { ...last, snapshot: operation.snapshot, events }];
}

// An envelope without an owner has never pushed an operation: ownership is
// persisted before the first network write. Its entire backlog can be reduced.
export function compactUnownedOperations(pending: PendingOperation[]): PendingOperation[] {
  if (pending.length < 2) return pending;
  const events = [...new Map(pending.flatMap(operation => operation.events).map(event => [event.id, event])).values()];
  return [{ id: pending[0].id, snapshot: pending[pending.length - 1].snapshot, events, localOnly: true }];
}
