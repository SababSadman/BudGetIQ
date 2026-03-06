import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || null;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || null;

export const hasSupabase = Boolean(supabaseUrl && supabaseKey);

// Only initialise if both values exist to avoid runtime crashes
export const supabase = hasSupabase
    ? createClient(supabaseUrl, supabaseKey)
    : null;
