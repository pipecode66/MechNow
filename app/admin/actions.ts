"use server"

import { revalidatePath } from "next/cache"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  ADMIN_SESSION_COOKIE,
  adminCookieOptions,
  createSessionToken,
  getAdminSession,
  isSessionConfigured,
  verifyPassword,
} from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { sendSms } from "@/lib/twilio"
import {
  entityIdSchema,
  loginSchema,
  reviewModerationSchema,
  statusUpdateSchema,
  technicianAssignmentSchema,
  technicianSchema,
  zipMutationSchema,
} from "@/lib/validators"
import type { ActionResult, AppointmentStatus } from "@/types"

export interface LoginState {
  error?: string
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 5

async function requireAdmin(): Promise<ActionResult | null> {
  const session = await getAdminSession()
  if (!session) {
    return { success: false, error: "admin.errors.unauthorized" }
  }
  return null
}

async function getIpAddress(): Promise<string> {
  const headerStore = await headers()
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "local"
  )
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = loginAttempts.get(ip)

  if (!record || record.resetAt < now) {
    loginAttempts.set(ip, { count: 0, resetAt: now + LOGIN_WINDOW_MS })
    return false
  }

  return record.count >= LOGIN_MAX_ATTEMPTS
}

function recordFailedLogin(ip: string) {
  const now = Date.now()
  const record = loginAttempts.get(ip)

  if (!record || record.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
    return
  }

  loginAttempts.set(ip, { ...record, count: record.count + 1 })
}

export async function loginAction(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const ip = await getIpAddress()
  if (isRateLimited(ip)) {
    return { error: "admin.loginRateLimited" }
  }

  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  })
  if (!parsed.success) {
    recordFailedLogin(ip)
    return { error: "admin.loginInvalid" }
  }

  if (!isSessionConfigured()) {
    return { error: "admin.loginNotConfigured" }
  }

  const supabase = getSupabaseAdminClient()
  if (!supabase) {
    return { error: "admin.loginNotConfigured" }
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("email,password_hash")
    .eq("email", parsed.data.email)
    .maybeSingle()

  if (error || !data) {
    recordFailedLogin(ip)
    return { error: "admin.loginInvalid" }
  }

  const admin = data as { email: string; password_hash: string }
  const valid = await verifyPassword(parsed.data.password, admin.password_hash)
  if (!valid) {
    recordFailedLogin(ip)
    return { error: "admin.loginInvalid" }
  }

  loginAttempts.delete(ip)
  const token = await createSessionToken({ email: admin.email })
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, token, adminCookieOptions)
  redirect("/admin/dashboard")
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, "", { ...adminCookieOptions, maxAge: 0 })
  redirect("/admin/login")
}

export async function updateAppointmentStatusAction(
  id: string,
  status: AppointmentStatus
): Promise<ActionResult> {
  const authError = await requireAdmin()
  if (authError) return authError

  const parsed = statusUpdateSchema.safeParse({ id, status })
  if (!parsed.success) return { success: false, error: "admin.errors.invalidStatus" }

  const supabase = getSupabaseAdminClient()
  if (!supabase) return { success: false, error: "admin.errors.notConfigured" }

  const { error } = await supabase
    .from("appointments")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)

  if (error) return { success: false, error: "admin.errors.updateStatus" }

  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function deleteAppointmentAction(id: string): Promise<ActionResult> {
  const authError = await requireAdmin()
  if (authError) return authError

  const parsed = entityIdSchema.safeParse(id)
  if (!parsed.success) return { success: false, error: "admin.errors.invalidAppointment" }

  const supabase = getSupabaseAdminClient()
  if (!supabase) return { success: false, error: "admin.errors.notConfigured" }

  const { error } = await supabase.from("appointments").delete().eq("id", parsed.data)
  if (error) return { success: false, error: "admin.errors.deleteAppointment" }

  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function assignTechnicianAction(
  appointmentId: string,
  technicianName: string
): Promise<ActionResult> {
  const authError = await requireAdmin()
  if (authError) return authError

  const parsed = technicianAssignmentSchema.safeParse({ appointmentId, technicianName })
  if (!parsed.success) return { success: false, error: "admin.errors.invalidAssignment" }

  const supabase = getSupabaseAdminClient()
  if (!supabase) return { success: false, error: "admin.errors.notConfigured" }

  const { data: technicianData } = parsed.data.technicianName
    ? await supabase
        .from("technicians")
        .select("name,phone")
        .eq("name", parsed.data.technicianName)
        .maybeSingle()
    : { data: null }

  const { data: appointmentData, error } = await supabase
    .from("appointments")
    .update({ assigned_mechanic: parsed.data.technicianName || null })
    .eq("id", parsed.data.appointmentId)
    .select("*")
    .single()

  if (error) return { success: false, error: "admin.errors.assignTechnician" }

  let smsWarning: true | undefined
  const technician = technicianData as { name?: string; phone?: string } | null
  const appointment = appointmentData as {
    first_name?: string
    last_name?: string
    vehicle_year?: string
    vehicle_make?: string
    vehicle_model?: string
    service_type?: string
    appointment_date?: string
    appointment_time?: string
    address?: string
  } | null

  if (technician?.phone && appointment) {
    const sms = await sendSms(
      technician.phone,
      `Assigned job: ${appointment.first_name} ${appointment.last_name}, ${appointment.vehicle_year} ${appointment.vehicle_make} ${appointment.vehicle_model}, ${appointment.service_type}, ${appointment.appointment_date} ${appointment.appointment_time}, ${appointment.address}.`
    )
    if (sms.sent === false && "error" in sms) smsWarning = true
  }

  revalidatePath("/admin/dashboard")
  return smsWarning ? { success: true, smsWarning } : { success: true }
}

export async function createTechnicianAction(
  formData: FormData
): Promise<ActionResult> {
  const authError = await requireAdmin()
  if (authError) return authError

  const specialties = String(formData.get("specialties") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  const parsed = technicianSchema.safeParse({
    name: formData.get("name"),
    area: formData.get("area"),
    phone: formData.get("phone"),
    join_date: formData.get("join_date"),
    availability: formData.get("availability"),
    specialties,
  })

  if (!parsed.success) return { success: false, error: "admin.errors.invalidTechnician" }

  const supabase = getSupabaseAdminClient()
  if (!supabase) return { success: false, error: "admin.errors.notConfigured" }

  const { error } = await supabase.from("technicians").insert({
    ...parsed.data,
    area: parsed.data.area || null,
    join_date: parsed.data.join_date || null,
    availability: parsed.data.availability || null,
  })

  if (error?.code === "23505") {
    return { success: false, error: "admin.errors.duplicateTechnician" }
  }
  if (error) return { success: false, error: "admin.errors.createTechnician" }

  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function deleteTechnicianAction(id: string): Promise<ActionResult> {
  const authError = await requireAdmin()
  if (authError) return authError

  const parsed = entityIdSchema.safeParse(id)
  if (!parsed.success) return { success: false, error: "admin.errors.technicianNotFound" }

  const supabase = getSupabaseAdminClient()
  if (!supabase) return { success: false, error: "admin.errors.notConfigured" }

  const { data: technicianData, error: technicianError } = await supabase
    .from("technicians")
    .select("name")
    .eq("id", parsed.data)
    .single()

  if (technicianError || !technicianData) {
    return { success: false, error: "admin.errors.technicianNotFound" }
  }

  const technician = technicianData as { name: string }
  const today = new Date().toISOString().slice(0, 10)
  const { data: futureAppointments } = await supabase
    .from("appointments")
    .select("id,appointment_date,appointment_time")
    .eq("assigned_mechanic", technician.name)
    .gte("appointment_date", today)
    .neq("status", "cancelled")

  if (futureAppointments?.length) {
    const details = futureAppointments
      .map((appointment) => {
        const record = appointment as { appointment_date?: string; appointment_time?: string }
        return `${record.appointment_date ?? ""} ${record.appointment_time ?? ""}`.trim()
      })
      .join(", ")
    return { success: false, error: "admin.errors.technicianAssigned", details }
  }

  const { error } = await supabase.from("technicians").delete().eq("id", parsed.data)
  if (error) return { success: false, error: "admin.errors.deleteTechnician" }

  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function addZipCodeAction(zipCode: string): Promise<ActionResult> {
  const authError = await requireAdmin()
  if (authError) return authError

  const parsed = zipMutationSchema.safeParse({ zipCode })
  if (!parsed.success) return { success: false, error: "admin.errors.invalidZip" }

  const supabase = getSupabaseAdminClient()
  if (!supabase) return { success: false, error: "admin.errors.notConfigured" }

  const { error } = await supabase
    .from("service_zip_codes")
    .insert({ zip_code: parsed.data.zipCode })

  if (error?.code === "23505") return { success: false, error: "admin.errors.duplicateZip" }
  if (error) return { success: false, error: "admin.errors.addZip" }

  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function deleteZipCodeAction(zipCode: string): Promise<ActionResult> {
  const authError = await requireAdmin()
  if (authError) return authError

  const parsed = zipMutationSchema.safeParse({ zipCode })
  if (!parsed.success) return { success: false, error: "admin.errors.invalidZip" }

  const supabase = getSupabaseAdminClient()
  if (!supabase) return { success: false, error: "admin.errors.notConfigured" }

  const { error } = await supabase
    .from("service_zip_codes")
    .delete()
    .eq("zip_code", parsed.data.zipCode)

  if (error) return { success: false, error: "admin.errors.deleteZip" }

  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function approveReviewAction(id: string): Promise<ActionResult> {
  return setReviewStatus(id, "approved")
}

export async function rejectReviewAction(id: string): Promise<ActionResult> {
  return setReviewStatus(id, "rejected")
}

async function setReviewStatus(
  id: string,
  status: "approved" | "rejected"
): Promise<ActionResult> {
  const authError = await requireAdmin()
  if (authError) return authError

  const parsed = reviewModerationSchema.safeParse({ id, status })
  if (!parsed.success) return { success: false, error: "admin.errors.invalidReview" }

  const supabase = getSupabaseAdminClient()
  if (!supabase) return { success: false, error: "admin.errors.notConfigured" }

  const { error } = await supabase
    .from("reviews")
    .update({
      status: parsed.data.status,
      approved_at: parsed.data.status === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", parsed.data.id)

  if (error) return { success: false, error: "admin.errors.updateReview" }

  revalidatePath("/admin/dashboard")
  revalidatePath("/")
  return { success: true }
}

export async function deleteReviewAction(id: string): Promise<ActionResult> {
  const authError = await requireAdmin()
  if (authError) return authError

  const parsed = entityIdSchema.safeParse(id)
  if (!parsed.success) return { success: false, error: "admin.errors.invalidReview" }

  const supabase = getSupabaseAdminClient()
  if (!supabase) return { success: false, error: "admin.errors.notConfigured" }

  const { error } = await supabase.from("reviews").delete().eq("id", parsed.data)
  if (error) return { success: false, error: "admin.errors.deleteReview" }

  revalidatePath("/admin/dashboard")
  revalidatePath("/")
  return { success: true }
}
