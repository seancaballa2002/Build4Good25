import { createClient } from '@supabase/supabase-js';

// Ensure your environment variables are correctly named and loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Basic check to ensure variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL and Anon Key are not defined in environment variables. Using fallback values for development.");
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  supabaseUrl || 'https://example.supabase.co',
  supabaseAnonKey || 'public-anon-key'
); 