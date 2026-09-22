import { randomUUID } from 'expo-crypto';
import { AppState, SyncEvent } from './state';
export function newEvents(previous: AppState, next: AppState): SyncEvent[] {
  const oldIds = new Set([...previous.attempts, ...previous.diagnosticAttempts, ...(previous.activeBattle?.attempts ?? [])].map(a => a.id));
  const all = [...next.attempts, ...next.diagnosticAttempts, ...(next.activeBattle?.attempts ?? [])];
  const attempts: SyncEvent[] = all.filter(a => !oldIds.has(a.id)).map(a => ({ id: a.id, kind: 'attempt', at: a.at, payload: a }));
  const analytics: SyncEvent[] = next.analytics.filter(e => !previous.analytics.some(p => p.id === e.id)).map(e => ({ id: e.id, kind: 'analytics', at: e.at, payload: e }));
  const affective: SyncEvent[] = next.checkIns.slice(previous.checkIns.length).map(e => ({ id: randomUUID(), kind: 'affective', at: e.at, payload: e }));
  return [...attempts, ...analytics, ...affective];
}
