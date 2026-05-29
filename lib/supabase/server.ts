import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { getSupabasePublicConfig } from "@/lib/supabase/config"

export function getSupabaseServerClient(): SupabaseClient | null {
  const config = getSupabasePublicConfig()
  if (!config) return null

  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
