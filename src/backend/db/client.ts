import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseServer } from '../lib/supabase/server';

/**
 * Get the server-side Supabase client.
 * 
 * This function returns a client configured with:
 * - SUPABASE_SERVICE_ROLE_KEY (bypasses RLS)
 * - Session persistence disabled
 * - Auto refresh disabled
 * 
 * This is used by all backend database operations (cron jobs, scripts, etc.)
 * and should NEVER be imported into frontend code.
 */
export function getSupabaseClient(): SupabaseClient {
  return supabaseServer;
}

