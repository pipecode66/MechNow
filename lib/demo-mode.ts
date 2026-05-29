import { getSupabaseAdminConfig } from "@/lib/supabase/config"
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from "@/lib/demo-credentials"

export { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD }

const DEMO_SESSION_SECRET =
  "mechnow-university-demo-session-secret-do-not-use-for-production"

export function isDemoMode(): boolean {
  return !getSupabaseAdminConfig()
}

export function getSessionSecretValue(): string | null {
  return process.env.SESSION_SECRET || (isDemoMode() ? DEMO_SESSION_SECRET : null)
}
