import { createClient } from '@supabase/supabase-js';
import { config } from './index.js';

// Admin client with service role key for backend operations
export const supabaseAdmin = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Create a client scoped to a user's JWT for RLS enforcement
export function createUserClient(accessToken: string) {
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
