import { createClient } from '@supabase/supabase-js'

// Using environment variables with fallback values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bpllapvarjdtdgwwsaja.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbGxhcHZhcmpkdGRnd3dzYWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2Nzg1OTMsImV4cCI6MjA2NDI1NDU5M30.NxDqwKxf8qlEmCQUek1KKcLChNc6iDHJwL_Eyd1l_00'
 
// Create client with proper auth configuration for browser environments
export const supabase = createClient(supabaseUrl, supabaseAnonKey) 