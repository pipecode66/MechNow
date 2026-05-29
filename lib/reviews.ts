import "server-only"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Review } from "@/types"

export async function getApprovedReviews(): Promise<Review[]> {
  const supabase = getSupabaseServerClient()
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("status", "approved")
      .order("approved_at", { ascending: false })

    if (error || !data) return []
    return data as Review[]
  } catch {
    return []
  }
}
