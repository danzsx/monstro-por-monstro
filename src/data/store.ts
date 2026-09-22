import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { ensureIdentity } from '@/auth/client';
import { acknowledge, flushOutbox } from './outbox';
import { AppState, initialEnvelope, LocalEnvelope, SyncEvent } from './state';
import { remote } from './remote';
import { newEvents } from './events';
export const STORAGE_KEY = 'monstro-por-monstro:v1';
export class StudyStore {
  private value: LocalEnvelope = initialEnvelope();
  private listeners = new Set<() => void>();
  private transaction: Promise<unknown> = Promise.resolve();
  private syncing?: Promise<void>;
  get = () => this.value;
  subscribe = (callback: () => void) => { this.listeners.add(callback); return () => { this.listeners.delete(callback); }; };
  private publish(value: LocalEnvelope) { this.value = value; this.listeners.forEach(cb => cb()); }
  private async persist(value: LocalEnvelope) { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value)); this.publish(value); }
  private serial<T>(work: () => Promise<T>): Promise<T> {
    const next = this.transaction.then(work); this.transaction = next.catch(() => {}); return next;
  }
  async hydrate() {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return;
    const parsed = JSON.parse(json) as LocalEnvelope;
    if (parsed.version !== 1 || parsed.state?.version !== 1 || !parsed.state.masteries || !Array.isArray(parsed.pending)) throw new Error('Não foi possível ler este progresso. Os dados foram preservados; não limpe o armazenamento.');
    this.publish(parsed);
  }
  commit(change: (current: AppState) => AppState, events: SyncEvent[] = []) {
    return this.serial(async () => {
      const state = change(this.value.state);
      if (state === this.value.state) return;
      const operation = { id: randomUUID(), snapshot: state, events: [...new Map([...events, ...newEvents(this.value.state, state)].map(e => [e.id, e])).values()] };
      await this.persist({ ...this.value, state, pending: [...this.value.pending, operation] });
    });
  }
  sync(): Promise<void> {
    if (this.syncing) return this.syncing;
    this.syncing = this.performSync().finally(() => { this.syncing = undefined; });
    return this.syncing;
  }
  private async performSync() {
    const ownerId = await ensureIdentity(this.value.ownerId);
    if (!this.value.ownerId) {
      const cloud = await remote.load();
      if (cloud.snapshot && this.value.pending.length) throw new Error('Há progresso local e nesta conta. Exporte os dados locais no Perfil antes de carregar a conta.');
      await this.serial(() => this.persist({ ...this.value, ownerId, revision: cloud.revision, state: cloud.snapshot ?? this.value.state }));
    }
    await this.transaction;
    const captured = this.value;
    if (!captured.pending.length) {
      const cloud = await remote.load();
      if (cloud.snapshot && cloud.revision > captured.revision) {
        await this.serial(async () => { if (!this.value.pending.length) await this.persist({ ...this.value, state: cloud.snapshot!, revision: cloud.revision }); });
      }
      return;
    }
    const result = await flushOutbox(captured, remote);
    await this.serial(() => this.persist({ ...this.value, pending: acknowledge(this.value.pending, result.acknowledged), revision: result.revision, lastSyncAt: new Date().toISOString() }));
  }
  async loadAccount(ownerId: string) {
    await this.transaction;
    // Preserve an exact local backup before an explicit account switch.
    await AsyncStorage.setItem(`${STORAGE_KEY}:backup:${this.value.ownerId ?? 'local'}`, JSON.stringify(this.value));
    const cloud = await remote.load();
    if (!cloud.snapshot) throw new Error('Esta conta ainda não possui progresso salvo.');
    await this.serial(() => this.persist({ version: 1, ownerId, revision: cloud.revision, state: cloud.snapshot!, pending: [], lastSyncAt: new Date().toISOString() }));
  }
}
