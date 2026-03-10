import { createClient } from '@supabase/supabase-js'

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// If the env var doesn't start with http, it's a placeholder or missing
if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    supabaseUrl = 'https://placeholder.supabase.co'
}
if (!supabaseAnonKey || supabaseAnonKey.includes('your_')) {
    supabaseAnonKey = 'placeholder-anon-key'
}

const isConfigured = !supabaseUrl.includes('placeholder') && !supabaseAnonKey.includes('placeholder')

if (!isConfigured) {
    console.warn('⚠️  Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export { isConfigured as supabaseConfigured }
