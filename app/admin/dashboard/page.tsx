import { redirect } from "next/navigation"
import { AdminDashboardContent } from "@/components/admin/admin-dashboard-content"
import { getAdminSession } from "@/lib/auth"
import { getTodayIsoDate } from "@/lib/date-utils"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { listServiceZipCodes } from "@/lib/service-zip-codes"
import type { Appointment, DashboardMetrics, Review, Technician } from "@/types"

export const dynamic = "force-dynamic"

function computeMetrics(appointments: Appointment[]): DashboardMetrics {
  const today = getTodayIsoDate()

  return {
    total: appointments.length,
    pending: appointments.filter((appointment) => appointment.status === "pending").length,
    completed: appointments.filter((appointment) => appointment.status === "completed").length,
    upcoming: appointments.filter(
      (appointment) =>
        appointment.appointment_date >= today && appointment.status !== "cancelled"
    ).length,
  }
}

export default async function AdminDashboardPage() {
  const session = await getAdminSession()
  if (!session) redirect("/admin/login")

  const supabase = getSupabaseAdminClient()
  let appointments: Appointment[] = []
  let technicians: Technician[] = []
  let pendingReviews: Review[] = []
  let zipCodes: string[] = await listServiceZipCodes()

  if (supabase) {
    const [appointmentsResult, techniciansResult, reviewsResult, zipsResult] =
      await Promise.all([
        supabase
          .from("appointments")
          .select("*")
          .order("appointment_date", { ascending: true }),
        supabase.from("technicians").select("*").order("created_at", { ascending: false }),
        supabase
          .from("reviews")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
        supabase.from("service_zip_codes").select("zip_code").order("zip_code"),
      ])

    appointments = (appointmentsResult.data ?? []) as Appointment[]
    technicians = (techniciansResult.data ?? []) as Technician[]
    pendingReviews = (reviewsResult.data ?? []) as Review[]
    zipCodes = (zipsResult.data ?? [])
      .map((row) => (row as { zip_code?: string }).zip_code)
      .filter((zip): zip is string => Boolean(zip))
  }

  return (
    <AdminDashboardContent
      appointments={appointments}
      technicians={technicians}
      zipCodes={zipCodes}
      pendingReviews={pendingReviews}
      metrics={computeMetrics(appointments)}
    />
  )
}
