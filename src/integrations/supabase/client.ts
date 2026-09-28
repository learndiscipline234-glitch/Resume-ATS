import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that credentials are real (not placeholder strings)
const isConfigured = (url: string, key: string): boolean => {
  if (!url || !key) return false;
  if (url.includes('placeholder') || url.includes('YOUR-PROJECT')) return false;
  if (key.includes('placeholder') || key.includes('YOUR-ANON')) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
};

const configured = isConfigured(supabaseUrl ?? '', supabaseAnonKey ?? '');

if (!configured) {
  console.warn(
    '[Supabase] Not configured — running in offline/demo mode.\n' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local and restart the dev server.\n' +
    'Database writes will be skipped; localStorage is the source of truth.'
  );
}

// Export a real client when configured, or a dummy that never makes network calls
export const supabase: SupabaseClient = configured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : (new Proxy({} as SupabaseClient, {
      get(_target, prop) {
        // Return chainable no-ops for .from().select/insert/update/delete
        if (prop === 'from') {
          return () => ({
            select: () => Promise.resolve({ data: null, error: null }),
            insert: () => Promise.resolve({ data: null, error: null }),
            update: () => Promise.resolve({ data: null, error: null }),
            delete: () => Promise.resolve({ data: null, error: null }),
            upsert: () => Promise.resolve({ data: null, error: null }),
            eq: function() { return this; },
            order: function() { return this; },
            limit: function() { return this; },
            range: function() { return this; },
            single: () => Promise.resolve({ data: null, error: null }),
          });
        }
        if (prop === 'auth') {
          return {
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            signOut: () => Promise.resolve({ error: null }),
          };
        }
        return () => Promise.resolve({ data: null, error: null });
      },
    }));

/** True when Supabase is properly configured and writes will succeed */
export const isSupabaseConfigured = configured;
