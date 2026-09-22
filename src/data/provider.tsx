import { createContext, use, useCallback, useEffect, useState, useSyncExternalStore, PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { AppState as NativeAppState, ActivityIndicator, Text, View } from 'react-native';
import { cloudConfigured, observeAuthRefresh, supabase } from '@/auth/client';
import { StudyStore } from './store';
import { AppState, SyncEvent } from './state';
import { fetchPublishedCatalog, getCatalog, subscribeCatalog, topicById, questionById } from '@/content/catalog';
import { Topic, TopicId } from '@/learning/types';
const context = createContext<ReturnType<typeof useStore> | null>(null);
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
function useStore() {
  const [store] = useState(() => new StudyStore());
  const envelope = useSyncExternalStore(store.subscribe, store.get, store.get);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>();
  const [online, setOnline] = useState(true);
  const [catalog, setCatalogState] = useState<Topic[]>(() => getCatalog());

  useEffect(() => subscribeCatalog(() => setCatalogState([...getCatalog()])), []);
  useEffect(() => { store.hydrate().then(() => setReady(true)).catch(e => setError(String(e.message))); }, [store]);
  useEffect(observeAuthRefresh, []);
  useEffect(() => NetInfo.addEventListener(state => setOnline(state.isConnected !== false && state.isInternetReachable !== false)), []);

  const catalogQuery = useQuery({
    queryKey: ['published-catalog'],
    queryFn: () => fetchPublishedCatalog(supabase),
    enabled: cloudConfigured && online,
    staleTime: 30_000,
    refetchInterval: 30_000,
    retry: false,
  });

  const sync = useQuery({ queryKey: ['synchronize'], queryFn: async () => { await store.sync(); return new Date().toISOString(); }, enabled: ready && online && cloudConfigured, refetchInterval: 30_000, retry: false });
  const refetch = sync.refetch;
  useEffect(() => { if (ready && online && cloudConfigured) { void refetch(); } }, [envelope.pending.length, ready, online, refetch]);
  useEffect(() => { const s = NativeAppState.addEventListener('change', status => { if (status === 'active' && cloudConfigured && online) { void refetch(); void catalogQuery.refetch(); } }); return () => s.remove(); }, [refetch, catalogQuery, online]);

  // Ensure new topics are gracefully tracked in masteries
  useEffect(() => {
    if (!ready) return;
    const missing = catalog.filter(t => !envelope.state.masteries[t.id]);
    if (missing.length > 0) {
      void store.commit(current => {
        const updated = { ...current.masteries };
        for (const t of missing) {
          if (!updated[t.id]) {
            updated[t.id] = { topicId: t.id, score: 0, evidence: 0, encountered: false, stage: 'unseen', reviewLevel: 0 };
          }
        }
        return { ...current, masteries: updated };
      });
    }
  }, [catalog, ready, envelope.state.masteries, store]);

  const commit = useCallback(async (fn: (s: AppState) => AppState, events?: SyncEvent[]) => {
    try { await store.commit(fn, events); setError(undefined); } catch { setError('Não foi possível salvar neste aparelho. Libere espaço e tente novamente antes de sair.'); throw new Error('Falha ao salvar progresso.'); }
  }, [store]);
  return {
    state: envelope.state, envelope, store, ready, error, online, commit,
    cloudConfigured, syncError: sync.error?.message, syncing: sync.isFetching, syncNow: () => refetch(),
    topics: catalog,
    topicById: (id: TopicId) => topicById(id, catalog),
    questionById: (id: string) => questionById(id, catalog),
    catalogLoading: catalogQuery.isFetching,
    refetchCatalog: () => catalogQuery.refetch(),
  };
}
function Inner({ children }: PropsWithChildren) {
  const value = useStore();
  if (!value.ready) return <View style={{ flex: 1, backgroundColor: '#FFF8F2', alignItems: 'center', justifyContent: 'center', padding: 30 }}><ActivityIndicator color="#1E0C59" /><Text>{value.error ?? 'Preparando seu próximo passo…'}</Text></View>;
  return <context.Provider value={value}>{children}</context.Provider>;
}
export function AppProvider({ children }: PropsWithChildren) { return <QueryClientProvider client={queryClient}><Inner>{children}</Inner></QueryClientProvider>; }
export function useApp() { const value = use(context); if (!value) throw new Error('AppProvider ausente.'); return value; }
