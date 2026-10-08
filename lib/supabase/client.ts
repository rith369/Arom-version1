import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";

/** Browser client. Uses the public anon key only; RLS guards every table. */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
