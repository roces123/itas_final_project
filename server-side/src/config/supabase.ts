import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Siguraduhing naka-load ang environment variables
dotenv.config();

// Tatawagin na natin ang mga variables mula sa .env
const supabaseUrl = process.env.SUPABASE_URL as string; 
const supabaseKey = process.env.SUPABASE_KEY as string;

// Magdadagdag tayo ng kaunting checking para sigurado
if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase Environment Variables!");
}

export const supabase = createClient(supabaseUrl, supabaseKey);