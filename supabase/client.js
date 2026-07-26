import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config.js';

let supabaseClient;

export function getSupabaseClient() {
  if (!supabaseClient) {
    const { url, anonKey } = getSupabaseConfig();
    supabaseClient = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabaseClient;
}
