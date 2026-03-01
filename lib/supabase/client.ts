import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client during build/prerendering
    // This prevents crashes when env vars aren't available at build time
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
  }
  
  client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return client
}
