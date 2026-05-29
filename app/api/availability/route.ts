import { NextResponse } from "next/server"
import { getAvailableSlots } from "@/lib/date-utils"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { availabilityQuerySchema, zodErrorToFields } from "@/lib/validators"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const parsed = availabilityQuerySchema.safeParse({
    date: url.searchParams.get("date") ?? "",
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid date", fields: zodErrorToFields(parsed.error) },
      { status: 400 }
    )
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({
      date: parsed.data.date,
      bookedSlots: [],
      availableSlots: getAvailableSlots([]),
    })
  }

  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("appointment_time")
      .eq("appointment_date", parsed.data.date)
      .neq("status", "cancelled")

    if (error || !data) {
      return NextResponse.json({ error: "Availability is unavailable" }, { status: 503 })
    }

    const bookedSlots = data
      .map((row) => {
        const value = row as { appointment_time?: string }
        return value.appointment_time
      })
      .filter((slot): slot is string => Boolean(slot))

    return NextResponse.json({
      date: parsed.data.date,
      bookedSlots,
      availableSlots: getAvailableSlots(bookedSlots),
    })
  } catch {
    return NextResponse.json({ error: "Availability is unavailable" }, { status: 503 })
  }
}
