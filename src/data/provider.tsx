import { createContext, use, useCallback, useEffect, useState, useSyncExternalStore, PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { AppState as NativeAppState, ActivityIndicator, Text, View } from 'react-native';
import { cloudConfigured, observeAuthRefresh } from '@/auth/client';
import { StudyStore } from './store';
import { AppState, SyncEvent } from './state';
const context = createContext<ReturnType<typeof useStore> | null>(null);
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
function useStore() {
  const [store] = useState(() => new StudyStore());
  const envelope = useSyncExternalStore(store.subscribe, store.get, store.get);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>();
  const [online, setOnline] = useState(true);
  useEffect(() => { store.hydrate().then(() => setReady(true)).catch(e => setError(String(e.message))); }, [store]);
  useEffect(observeAuthRefresh, []);
  useEffect(() => NetInfo.addEventListener(state => setOnline(state.isConnected !== false && state.isInternetReachable !== false)), []);
  const sync = useQuery({ queryKey: ['synchronize'], queryFn: async () => { await store.sync(); return new Date().toISOString(); }, enabled: ready && online && cloudConfigured, refetchInterval: 30_000, retry: false });
  const refetch = sync.refetch;
  useEffect(() => { if (ready && online && cloudConfigured) { void refetch(); } }, [envelope.pending.length, ready, online, refetch]);
  useEffect(() => { const s = NativeAppState.addEventListener('change', status => { if (status === 'active' && cloudConfigured && online) void refetch(); }); return () => s.remove(); }, [refetch, online]);
  const commit = useCallback(async (fn: (s: AppState) => AppState, events?: SyncEvent[]) => {
    try { await store.commit(fn, events); setError(undefined); } catch { setError('Não foi possível salvar neste aparelho. Libere espaço e tente novamente antes de sair.'); throw new Error('Falha ao salvar progresso.'); }
  }, [store]);
  return { state: envelope.state, envelope, store, ready, error, online, commit, cloudConfigured, syncError: sync.error?.message, syncing: sync.isFetching, syncNow: () => refetch() };
}
function Inner({ children }: PropsWithChildren) {
  const value = useStore();
  if (!value.ready) return <View style={{ flex: 1, backgroundColor: '#FFF8F2', alignItems: 'center', justifyContent: 'center', padding: 30 }}><ActivityIndicator color="#1E0C59" /><Text>{value.error ?? 'Preparando seu próximo passo…'}</Text></View>;
  return <context.Provider value={value}>{children}</context.Provider>;
}
export function AppProvider({ children }: PropsWithChildren) { return <QueryClientProvider client={queryClient}><Inner>{children}</Inner></QueryClientProvider>; }
export function useApp() { const value = use(context); if (!value) throw new Error('AppProvider ausente.'); return value; }
