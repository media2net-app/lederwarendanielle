import { createClient } from "@supabase/supabase-js";

/** Anon/publishable client for route handlers zonder browser-cookies (webhooks). */
export function createAnonSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY zijn verplicht");
  }
  return createClient(url, key);
}
