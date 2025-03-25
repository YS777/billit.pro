import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'billit-auth',
    debug: import.meta.env.DEV,
    cookieOptions: {
      name: 'billit-auth',
      lifetime: 60 * 60 * 8, // 8 hours
      domain: window.location.hostname,
      path: '/',
      sameSite: 'lax'
    }
  },
  global: {
    headers: {
      'x-application-name': 'billit-pro'
    }
  },
  db: {
    schema: 'public'
  }
});