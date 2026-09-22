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
