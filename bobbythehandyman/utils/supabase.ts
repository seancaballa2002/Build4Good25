import { createClient } from '@supabase/supabase-js';

// Ensure your environment variables are correctly named and loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Basic check to ensure variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 