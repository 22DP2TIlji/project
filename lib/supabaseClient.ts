import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Read and sanitize env vars (trim quotes/spaces)
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const supabaseUrl = rawUrl.replace(/^['"]|['"]$/g, '').trim()
const supabaseAnonKey = rawKey.replace(/^['"]|['"]$/g, '').trim()

let client: SupabaseClient | null = null

try {
  if (supabaseUrl && supabaseAnonKey) {
    // Validate URL early to give a clearer error
    // Will throw if invalid
    new URL(supabaseUrl)
    client = createClient(supabaseUrl, supabaseAnonKey)
  } else if (typeof window === 'undefined') {
    console.warn('[supabase] Missing env vars NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Create a .env.local file.')
  }
} catch (e) {
  if (typeof window === 'undefined') {
    console.error('[supabase] Invalid NEXT_PUBLIC_SUPABASE_URL. Check .env.local. Current value (masked):', supabaseUrl.slice(0, 30) + '...')
  }
}

export const supabase = client

export function assertSupabaseConfigured(): asserts client is SupabaseClient {
  if (!client) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  }
}
