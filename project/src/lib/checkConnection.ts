import { supabase } from './supabase';

export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('count');
    if (error) throw error;
    console.log('✓ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('✗ Supabase connection failed:', error.message);
    return false;
  }
}