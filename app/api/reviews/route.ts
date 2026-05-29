import { NextResponse } from "next/server"
import { getApprovedReviews } from "@/lib/reviews"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { reviewSchema, zodErrorToFields } from "@/lib/validators"

export const runtime = "nodejs"

export async function GET() {
  const reviews = await getApprovedReviews()
  return NextResponse.json({ reviews })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = reviewSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid review payload", fields: zodErrorToFields(parsed.error) },
      { status: 400 }
    )
  }

  const supabase = getSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ reviewId: `DEMO-${Date.now()}` }, { status: 201 })
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      reviewer_name: parsed.data.reviewerName,
      reviewer_email: parsed.data.reviewerEmail,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      service_type: parsed.data.serviceType || null,
      status: "pending",
    })
    .select("id")
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Unable to submit review" }, { status: 500 })
  }

  const saved = data as { id: string }
  return NextResponse.json({ reviewId: saved.id }, { status: 201 })
}
