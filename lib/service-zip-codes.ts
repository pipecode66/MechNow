import "server-only"

import { getSupabaseServerClient } from "@/lib/supabase/server"
export type ServiceZipLookup =
  | { available: true; covered: boolean }
  | { available: false }

export async function checkServiceZipCode(zip: string): Promise<ServiceZipLookup> {
  const supabase = getSupabaseServerClient()

  if (!supabase) {
    return { available: false }
  }

  try {
    const { data, error } = await supabase
      .from("service_zip_codes")
      .select("zip_code")
      .eq("zip_code", zip)
      .maybeSingle()

    if (error) return { available: false }
    return { available: true, covered: Boolean(data) }
  } catch {
    return { available: false }
  }
}

export async function listServiceZipCodes(): Promise<string[]> {
  const supabase = getSupabaseServerClient()

  if (!supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from("service_zip_codes")
      .select("zip_code")
      .order("zip_code", { ascending: true })

    if (error || !data) return []

    return data
      .map((row) => {
        const value = row as { zip_code?: string }
        return value.zip_code
      })
      .filter((zip): zip is string => Boolean(zip))
  } catch {
    return []
  }
}
