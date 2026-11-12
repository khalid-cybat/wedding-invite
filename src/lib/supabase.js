import { createClient } from "@supabase/supabase-js";

let supabase;

export function getSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  supabase ??= createClient(url, anonKey);
  return supabase;
}
