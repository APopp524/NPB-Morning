import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client for cron jobs and backend scripts.
 * 
 * This client:
 * - Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS
 * - Disables session persistence and auto refresh (not needed for server-side)
 * - Should ONLY be used in server-side code (cron jobs, scripts, backend routes)
 * - Must NEVER be imported into frontend code
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable is required');
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY environment variable is required for server-side operations'
  );
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
