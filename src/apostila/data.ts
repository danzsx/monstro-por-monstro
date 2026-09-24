import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/auth/client';
import { useApp } from '@/data/provider';
import { bundledModule, selectInteractiveModule } from './selection';

export function usePublishedModuleIds() {
  const { online } = useApp();
  const query = useQuery({
    queryKey: ['interactive-module-index'],
    queryFn: async () => {
      if (!supabase) return [] as string[];
      const { data, error } = await supabase.from('interactive_module_versions').select('topic_id').eq('status', 'published');
      if (error) throw error;
      return (data ?? []).map(row => row.topic_id as string);
    },
    enabled: !!supabase && online,
    staleTime: 30_000,
    retry: false,
  });
  return (topicId: string) => !!bundledModule(topicId) || (online && !!query.data?.includes(topicId));
}

export function useInteractiveModule(topicId: string) {
  const { online } = useApp();
  const query = useQuery({
    queryKey: ['interactive-module', topicId],
    queryFn: async () => {
      if (!supabase) return null;
      const { data, error } = await supabase.from('interactive_module_versions').select('content').eq('topic_id', topicId).eq('status', 'published').maybeSingle();
      if (error) throw error;
      return data?.content ?? null;
    },
    enabled: !!supabase && online && !!topicId,
    staleTime: 30_000,
    retry: false,
  });
  return { module: selectInteractiveModule(topicId, query.data, online), loading: !!supabase && online && query.isPending, error: query.error };
}
