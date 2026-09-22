import { supabase } from '@/auth/client';
import { CloudRepository, SnapshotReply } from './outbox';
import { AppState } from './state';
export const remote: CloudRepository = {
  async load(): Promise<SnapshotReply> {
    if (!supabase) throw new Error('Nuvem indisponível.');
    const { data, error } = await supabase.from('student_snapshots').select('revision,snapshot').maybeSingle();
    if (error) throw error;
    return data ? { revision: data.revision, snapshot: data.snapshot as AppState } : { revision: 0, snapshot: null };
  },
  async push(operationId, expectedRevision, snapshot, events) {
    if (!supabase) throw new Error('Nuvem indisponível.');
    const { data, error } = await supabase.rpc('sync_progress', { p_operation_id: operationId, p_expected_revision: expectedRevision, p_snapshot: snapshot, p_events: events });
    if (error) {
      if (error.code === '40001') throw new Error('Seu progresso mudou em outro aparelho. As respostas locais estão protegidas. Sincronize um aparelho de cada vez; exporte os dados no Perfil antes de reconciliar as sessões.');
      throw error;
    }
    return data as number;
  },
};
