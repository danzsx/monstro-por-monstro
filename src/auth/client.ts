import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const cloudConfigured = !!url && !!key;
const authStorage = {
  getItem: (name: string) => process.env.EXPO_OS === 'web' ? Promise.resolve(typeof window !== 'undefined' ? window.localStorage.getItem(name) : null) : SecureStore.getItemAsync(name),
  setItem: async (name: string, value: string) => { if (process.env.EXPO_OS === 'web') { if (typeof window !== 'undefined') window.localStorage.setItem(name, value); } else await SecureStore.setItemAsync(name, value); },
  removeItem: async (name: string) => { if (process.env.EXPO_OS === 'web') { if (typeof window !== 'undefined') window.localStorage.removeItem(name); } else await SecureStore.deleteItemAsync(name); },
};
export const supabase = cloudConfigured ? createClient(url!, key!, { auth: { storage: authStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } }) : null;
export function observeAuthRefresh() {
  if (!supabase || process.env.EXPO_OS === 'web') return () => {};
  const subscription = AppState.addEventListener('change', status => status === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh());
  supabase.auth.startAutoRefresh();
  return () => { subscription.remove(); supabase?.auth.stopAutoRefresh(); };
}
export async function ensureIdentity(existingOwnerId: string | null): Promise<string> {
  if (!supabase) throw new Error('Conexão com a nuvem ainda não configurada.');
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (data.session) {
    if (existingOwnerId && existingOwnerId !== data.session.user.id) throw new Error('Esta sessão pertence a outra conta. Entre na conta original para sincronizar este progresso.');
    return data.session.user.id;
  }
  if (existingOwnerId) throw new Error('Sua sessão expirou. Entre novamente para sincronizar; o progresso continua neste aparelho.');
  const result = await supabase.auth.signInAnonymously();
  if (result.error) throw result.error;
  return result.data.user!.id;
}
export async function linkEmail(email: string) {
  if (!supabase) throw new Error('A nuvem ainda não está configurada. Seu progresso está salvo neste aparelho.');
  const { error } = await supabase.auth.updateUser({ email });
  if (error) throw error;
}
export async function verifyEmail(email: string, token: string, mode: 'link' | 'login') {
  if (!supabase) throw new Error('Conexão indisponível.');
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: mode === 'link' ? 'email_change' : 'email' });
  if (error) throw error;
  return data.user;
}
export async function sendLoginCode(email: string) {
  if (!supabase) throw new Error('Conexão indisponível.');
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  if (error) throw error;
}
export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

