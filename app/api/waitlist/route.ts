import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { waitlistSchema, zodErrorToFields } from "@/lib/validators"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = waitlistSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid waitlist payload", fields: zodErrorToFields(parsed.error) },
      { status: 400 }
    )
  }

  const supabase = getSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ success: true, demo: true }, { status: 201 })
  }

  const { error } = await supabase.from("zip_code_waitlist").upsert(
    {
      email: parsed.data.email,
      zip_code: parsed.data.zipCode,
    },
    { onConflict: "email,zip_code" }
  )

  if (error) {
    return NextResponse.json({ error: "Unable to join waitlist" }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
