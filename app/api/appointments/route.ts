import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { sendAdminSms, sendSms } from "@/lib/twilio"
import { appointmentSchema, zodErrorToFields } from "@/lib/validators"
import type { SmsResult } from "@/types"

export const runtime = "nodejs"

function smsFailed(result: SmsResult): boolean {
  return result.sent === false && "error" in result
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = appointmentSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid appointment payload", fields: zodErrorToFields(parsed.error) },
      { status: 400 }
    )
  }

  const appointment = parsed.data
  const supabase = getSupabaseAdminClient()

  if (!supabase) {
    return NextResponse.json({ error: "Booking is unavailable" }, { status: 503 })
  }

  const existing = await supabase
    .from("appointments")
    .select("id")
    .eq("appointment_date", appointment.appointmentDate)
    .eq("appointment_time", appointment.appointmentTime)
    .neq("status", "cancelled")
    .maybeSingle()

  if (existing.data) {
    return NextResponse.json({ error: "Time slot already booked" }, { status: 409 })
  }

  if (existing.error) {
    return NextResponse.json({ error: "Unable to verify availability" }, { status: 500 })
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      first_name: appointment.firstName,
      last_name: appointment.lastName,
      email: appointment.email,
      phone: appointment.phone,
      zip_code: appointment.zipCode,
      address: appointment.address,
      additional_info: appointment.additionalInfo || null,
      appointment_date: appointment.appointmentDate,
      appointment_time: appointment.appointmentTime,
      status: "pending",
      vehicle_year: appointment.vehicleYear,
      vehicle_make: appointment.vehicleMake,
      vehicle_model: appointment.vehicleModel,
      engine_type: appointment.engineType,
      service_type: appointment.serviceType,
      referral_source: appointment.referralSource || null,
    })
    .select("id")
    .single()

  if (error || !data) {
    const status = error?.code === "23505" ? 409 : 500
    return NextResponse.json({ error: "Unable to create appointment" }, { status })
  }

  const saved = data as { id: string }
  const customerSms = await sendSms(
    appointment.phone,
    `Rapi Mobile Mechanic: appointment request received for ${appointment.appointmentDate} at ${appointment.appointmentTime}.`
  )
  const adminSms = await sendAdminSms(
    `New booking: ${appointment.firstName} ${appointment.lastName}, ${appointment.serviceType}, ${appointment.appointmentDate} ${appointment.appointmentTime}, ${appointment.address}.`
  )

  return NextResponse.json(
    {
      appointmentId: saved.id,
      ...(smsFailed(customerSms) || smsFailed(adminSms) ? { smsWarning: true } : {}),
    },
    { status: 201 }
  )
}
