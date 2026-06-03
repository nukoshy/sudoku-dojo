import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Supabase client. If env vars are absent (no project provisioned yet), the app
// runs fully in guest mode backed by localStorage. Drop VITE_SUPABASE_URL and
// VITE_SUPABASE_ANON_KEY into a .env file to enable the real backend.

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(url!, anonKey!)
  : null;
