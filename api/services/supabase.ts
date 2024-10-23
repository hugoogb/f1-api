import { createClient } from "@supabase/supabase-js";

// Supabase credentials from the environment variables
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
