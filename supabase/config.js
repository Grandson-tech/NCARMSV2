const runtimeConfig = globalThis.NCARMS_SUPABASE_CONFIG ?? {};

export const SUPABASE_CONFIG = Object.freeze({
  url: runtimeConfig.url ?? '',
  anonKey: runtimeConfig.anonKey ?? '',
});

export function getSupabaseConfig() {
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    throw new Error('Supabase configuration is unavailable. Provide NCARMS_SUPABASE_CONFIG before initialising the application.');
  }

  return SUPABASE_CONFIG;
}
