import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { ensureIdentity, supabase } from '@/auth/client';
import { acknowledge, appendLocalOperation, compactUnownedOperations, flushOutbox } from './outbox';
import { AppState, initialEnvelope, LocalEnvelope, SyncEvent } from './state';
import { remote } from './remote';
import { newEvents } from './events';
import { migrateStateV2 } from './migrate-v2';
export const STORAGE_KEY = 'monstro-por-monstro:v1';
function preserveConfirmedAgeBand(snapshot: AppState, local: AppState): AppState {
  const migrated = migrateStateV2(snapshot);
  return migrated.cloudAgeBand === local.cloudAgeBand ? migrated : { ...migrated, cloudAgeBand: local.cloudAgeBand };
}
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
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (!json) return;
      const parsed = JSON.parse(json) as LocalEnvelope;
      if (parsed.version !== 1 || ![1, 2].includes(parsed.state?.version) || !parsed.state.masteries || !Array.isArray(parsed.pending)) {
        throw new Error('Formato de progresso corrompido');
      }
      const sanitized = migrateStateV2(parsed.state);
      const pending = parsed.ownerId ? parsed.pending : compactUnownedOperations(parsed.pending);
      if (sanitized === parsed.state && pending === parsed.pending) this.publish(parsed);
      else {
        const migrated = { ...parsed, state: sanitized, pending: sanitized === parsed.state ? pending
          : appendLocalOperation(pending, { id: randomUUID(), snapshot: sanitized, events: [], localOnly: true }) };
        try {
          if (sanitized !== parsed.state) await AsyncStorage.setItem(`${STORAGE_KEY}:backup:before-diagnostic-fix`, json);
        } catch { /* A full store must not prevent migration from saving. */ }
        try { await this.persist(migrated); } catch {
          // A write failure must never make the original progress look corrupt.
          this.publish(migrated);
        }
      }
    } catch {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) await AsyncStorage.setItem(`${STORAGE_KEY}:corrupted:${Date.now()}`, raw);
        const backup = await AsyncStorage.getItem(`${STORAGE_KEY}:backup:local`);
        if (backup) {
          const parsed = JSON.parse(backup) as LocalEnvelope;
          if (parsed?.state?.masteries) {
            this.publish(parsed);
            await AsyncStorage.setItem(STORAGE_KEY, backup);
            return;
          }
        }
      } catch {}
      const fallback = initialEnvelope();
      this.publish(fallback);
      try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fallback)); } catch {}
    }
  }
  commit(change: (current: AppState) => AppState, events: SyncEvent[] = []) {
    return this.serial(async () => {
      const state = change(this.value.state);
      if (state === this.value.state) return;
      const operation = { id: randomUUID(), snapshot: state, events: [...new Map([...events, ...newEvents(this.value.state, state)].map(e => [e.id, e])).values()], localOnly: true };
      await this.persist({ ...this.value, state, pending: appendLocalOperation(this.value.pending, operation) });
    });
  }
  sync(): Promise<void> {
    if (this.syncing) return this.syncing;
    this.syncing = this.performSync().finally(() => { this.syncing = undefined; });
    return this.syncing;
  }
  private async performSync() {
    if (!this.value.state.cloudAgeBand) throw new Error('Confirme a faixa etária 16+ no Perfil antes de salvar dados na nuvem.');
    const ownerId = await ensureIdentity(this.value.ownerId);
    if (!this.value.ownerId) {
      const cloud = await remote.load();
      if (cloud.snapshot && this.value.pending.length) throw new Error('Há progresso local e nesta conta. Exporte os dados locais no Perfil antes de carregar a conta.');
      const state = cloud.snapshot ? preserveConfirmedAgeBand(cloud.snapshot, this.value.state) : this.value.state;
      const pending = cloud.snapshot && state !== cloud.snapshot ? [{ id: randomUUID(), snapshot: state, events: [], localOnly: true }] : this.value.pending;
      await this.serial(() => this.persist({ ...this.value, ownerId, revision: cloud.revision, state, pending }));
    }
    const captured = await this.serial(async () => {
      if (this.value.pending.some(operation => operation.localOnly)) {
        await this.persist({ ...this.value, pending: this.value.pending.map(operation => operation.localOnly ? { ...operation, localOnly: false } : operation) });
      }
      return this.value;
    });
    if (!captured.pending.length) {
      const cloud = await remote.load();
      if (cloud.snapshot && cloud.revision > captured.revision) {
        await this.serial(async () => { if (!this.value.pending.length) {
          const state = preserveConfirmedAgeBand(cloud.snapshot!, this.value.state);
          await this.persist({ ...this.value, state, revision: cloud.revision, pending: state === cloud.snapshot ? [] : [{ id: randomUUID(), snapshot: state, events: [], localOnly: true }] });
        } });
      }
      return;
    }
    const result = await flushOutbox(captured, remote);
    await this.serial(() => this.persist({ ...this.value, pending: acknowledge(this.value.pending, result.acknowledged), revision: result.revision, lastSyncAt: new Date().toISOString() }));
  }
  async loadAccount(ownerId: string) {
    if (!this.value.state.cloudAgeBand) throw new Error('Confirme a faixa etária 16+ antes de carregar uma conta.');
    await this.transaction;
    // Preserve an exact local backup before an explicit account switch.
    await AsyncStorage.setItem(`${STORAGE_KEY}:backup:${this.value.ownerId ?? 'local'}`, JSON.stringify(this.value));
    const cloud = await remote.load();
    if (!cloud.snapshot) throw new Error('Esta conta ainda não possui progresso salvo.');
    const state = preserveConfirmedAgeBand(cloud.snapshot, this.value.state);
    await this.serial(() => this.persist({ version: 1, ownerId, revision: cloud.revision, state, pending: state === cloud.snapshot ? [] : [{ id: randomUUID(), snapshot: state, events: [], localOnly: true }], lastSyncAt: new Date().toISOString() }));
  }
  async signOutAccount() {
    await this.transaction;
    if (this.value.pending.length) {
      try { await this.sync(); } catch {}
    }
    await AsyncStorage.setItem(`${STORAGE_KEY}:backup:${this.value.ownerId ?? 'local'}`, JSON.stringify(this.value));
    await this.serial(() => this.persist(initialEnvelope()));
  }
  async eraseAllStudyData() {
    await this.transaction;
    if (this.syncing) await this.syncing.catch(() => {});
    if (this.value.ownerId) await ensureIdentity(this.value.ownerId);
    const session = await supabase?.auth.getSession();
    if (session?.error) throw session.error;
    if (session?.data.session) await remote.deleteMine();
    const keys = (await AsyncStorage.getAllKeys()).filter(key => key === STORAGE_KEY || key.startsWith(`${STORAGE_KEY}:`));
    await AsyncStorage.multiRemove(keys);
    this.publish(initialEnvelope());
  }
}
