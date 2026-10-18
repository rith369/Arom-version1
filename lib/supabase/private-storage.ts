import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from './env';

export function createPrivateStorageClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('SUPABASE_SECRET_KEY is not configured');
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
