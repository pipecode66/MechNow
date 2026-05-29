import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { getSupabaseAdminConfig } from "@/lib/supabase/config"

export function getSupabaseAdminClient(): SupabaseClient | null {
  const config = getSupabaseAdminConfig()
  if (!config) return null

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
