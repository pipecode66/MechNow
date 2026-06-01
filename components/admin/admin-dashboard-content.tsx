"use client"

import * as React from "react"
import { LogOut } from "lucide-react"
import {
  addZipCodeAction,
  approveReviewAction,
  assignTechnicianAction,
  createTechnicianAction,
  deleteAppointmentAction,
  deleteReviewAction,
  deleteTechnicianAction,
  deleteZipCodeAction,
  logoutAction,
  rejectReviewAction,
  updateAppointmentStatusAction,
} from "@/app/admin/actions"
import { AppointmentDetailDialog } from "@/components/admin/appointment-detail-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTodayIsoDate } from "@/lib/date-utils"
import { useI18n } from "@/lib/i18n"
import { findServiceOption } from "@/lib/service-options"
import { formatPhone } from "@/lib/utils"
import type { Appointment, AppointmentStatus, DashboardProps, Technician } from "@/types"

const statuses: AppointmentStatus[] = ["pending", "postponed", "completed", "cancelled"]
const tabTriggerClassName =
  "!h-10 basis-[calc(50%-0.1875rem)] px-2 text-xs min-[380px]:text-sm sm:basis-auto sm:px-3"
type Notice = { key: string; values?: Record<string, string | number> }

export function AdminDashboardContent({
  appointments,
  technicians,
  zipCodes,
  pendingReviews,
}: DashboardProps) {
  const { t } = useI18n()
  const [localAppointments, setLocalAppointments] = React.useState(appointments)
  const [message, setMessage] = React.useState<Notice | null>(null)
  const currentMetrics = React.useMemo(() => {
    const today = getTodayIsoDate()
    return {
      total: localAppointments.length,
      pending: localAppointments.filter((appointment) => appointment.status === "pending").length,
      completed: localAppointments.filter((appointment) => appointment.status === "completed").length,
      upcoming: localAppointments.filter(
        (appointment) =>
          appointment.appointment_date >= today && appointment.status !== "cancelled"
      ).length,
    }
  }, [localAppointments])

  function errorNotice(error: string, details?: string): Notice {
    return {
      key: error,
      values: details ? { appointments: details } : undefined,
    }
  }

  async function updateStatus(id: string, status: AppointmentStatus) {
    const previous = localAppointments
    setLocalAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id ? { ...appointment, status } : appointment
      )
    )
    const result = await updateAppointmentStatusAction(id, status)
    if (!result.success) {
      setLocalAppointments(previous)
      setMessage(errorNotice(result.error, result.details))
    }
  }

  async function deleteAppointment(id: string) {
    if (!window.confirm(t("admin.appointment.deleteConfirm"))) return
    const result = await deleteAppointmentAction(id)
    if (!result.success) {
      setMessage(errorNotice(result.error, result.details))
      return
    }
    setLocalAppointments((current) =>
      current.filter((appointment) => appointment.id !== id)
    )
  }

  async function assignTechnician(appointmentId: string, technicianName: string) {
    const result = await assignTechnicianAction(appointmentId, technicianName)
    if (!result.success) {
      setMessage(errorNotice(result.error, result.details))
      return
    }
    setLocalAppointments((current) =>
      current.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, assigned_mechanic: technicianName || null }
          : appointment
      )
    )
    setMessage({
      key: result.smsWarning
        ? "admin.messages.assignedSmsWarning"
        : "admin.messages.assigned",
    })
  }

  async function createTechnician(formData: FormData) {
    const result = await createTechnicianAction(formData)
    setMessage(
      result.success
        ? { key: "admin.messages.technicianSaved" }
        : errorNotice(result.error, result.details)
    )
  }

  async function addZip(formData: FormData) {
    const result = await addZipCodeAction(String(formData.get("zipCode") ?? ""))
    setMessage(
      result.success
        ? { key: "admin.messages.zipSaved" }
        : errorNotice(result.error, result.details)
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-3 min-[390px]:px-4 sm:px-6">
          <h1 className="min-w-0 text-lg font-semibold leading-tight sm:text-xl">
            {t("admin.title")}
          </h1>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" className="min-h-10 px-3">
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden min-[380px]:inline">{t("admin.logout")}</span>
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-4 px-3 py-4 min-[390px]:px-4 sm:gap-6 sm:px-6 sm:py-6">
        <section className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          <MetricCard label={t("admin.metrics.total")} value={currentMetrics.total} />
          <MetricCard label={t("admin.metrics.pending")} value={currentMetrics.pending} />
          <MetricCard label={t("admin.metrics.completed")} value={currentMetrics.completed} />
          <MetricCard label={t("admin.metrics.upcoming")} value={currentMetrics.upcoming} />
        </section>

        {message && (
          <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
            {t(message.key, message.values)}
          </div>
        )}

        <Tabs defaultValue="appointments" className="gap-4">
          <TabsList className="!h-auto w-full flex-wrap justify-start gap-1.5 p-1 sm:w-fit">
            <TabsTrigger className={tabTriggerClassName} value="appointments">
              {t("admin.tabs.appointments")}
            </TabsTrigger>
            <TabsTrigger className={tabTriggerClassName} value="technicians">
              {t("admin.tabs.technicians")}
            </TabsTrigger>
            <TabsTrigger className={tabTriggerClassName} value="zips">
              {t("admin.tabs.zips")}
            </TabsTrigger>
            <TabsTrigger className={tabTriggerClassName} value="reviews">
              {t("admin.tabs.reviews")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <AppointmentsPanel
              appointments={localAppointments}
              technicians={technicians}
              onStatusChange={updateStatus}
              onDelete={deleteAppointment}
              onAssign={assignTechnician}
            />
          </TabsContent>

          <TabsContent value="technicians">
            <TechniciansPanel
              technicians={technicians}
              createTechnician={createTechnician}
              onDelete={async (id) => {
                const result = await deleteTechnicianAction(id)
                setMessage(
                  result.success
                    ? { key: "admin.messages.technicianDeleted" }
                    : errorNotice(result.error, result.details)
                )
              }}
            />
          </TabsContent>

          <TabsContent value="zips">
            <ZipPanel
              zipCodes={zipCodes}
              addZip={addZip}
              onDelete={async (zip) => {
                const result = await deleteZipCodeAction(zip)
                setMessage(
                  result.success
                    ? { key: "admin.messages.zipDeleted" }
                    : errorNotice(result.error, result.details)
                )
              }}
            />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsPanel
              reviews={pendingReviews}
              onApprove={async (id) => {
                const result = await approveReviewAction(id)
                setMessage(
                  result.success
                    ? { key: "admin.messages.reviewApproved" }
                    : errorNotice(result.error, result.details)
                )
              }}
              onReject={async (id) => {
                const result = await rejectReviewAction(id)
                setMessage(
                  result.success
                    ? { key: "admin.messages.reviewRejected" }
                    : errorNotice(result.error, result.details)
                )
              }}
              onDelete={async (id) => {
                const result = await deleteReviewAction(id)
                setMessage(
                  result.success
                    ? { key: "admin.messages.reviewDeleted" }
                    : errorNotice(result.error, result.details)
                )
              }}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-h-24 rounded-lg border border-border bg-card p-3 sm:p-4">
      <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
      <p className="mt-2 text-2xl font-semibold sm:text-3xl">{value}</p>
    </div>
  )
}

function AppointmentsPanel({
  appointments,
  technicians,
  onStatusChange,
  onDelete,
  onAssign,
}: {
  appointments: Appointment[]
  technicians: Technician[]
  onStatusChange: (id: string, status: AppointmentStatus) => void
  onDelete: (id: string) => void
  onAssign: (id: string, technicianName: string) => void
}) {
  const { t } = useI18n()

  return (
    <div className="grid w-full min-w-0 gap-4 xl:grid-cols-4">
      {statuses.map((status) => {
        const statusAppointments = appointments.filter(
          (appointment) => appointment.status === status
        )

        return (
          <section key={status} className="grid min-w-0 content-start gap-3">
            <h2 className="rounded-lg bg-muted px-3 py-2 text-sm font-semibold capitalize">
              {t(`admin.status.${status}`)}
            </h2>
            <div className="grid min-w-0 gap-3">
              {statusAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  technicians={technicians}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                  onAssign={onAssign}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function AppointmentCard({
  appointment,
  technicians,
  onStatusChange,
  onDelete,
  onAssign,
}: {
  appointment: Appointment
  technicians: Technician[]
  onStatusChange: (id: string, status: AppointmentStatus) => void
  onDelete: (id: string) => void
  onAssign: (id: string, technicianName: string) => void
}) {
  const { t } = useI18n()
  const serviceType = appointment.service_type
    .split(",")
    .map((label) => {
      const service = findServiceOption(label)
      return service ? t(service.translationKey) : label.trim()
    })
    .join(", ")

  return (
    <article className="grid min-w-0 gap-3 rounded-lg border border-border bg-card p-4 text-sm">
      <div className="min-w-0">
        <h3 className="break-words font-semibold">
          {appointment.first_name} {appointment.last_name}
        </h3>
        <p className="break-words text-muted-foreground">{serviceType}</p>
      </div>
      <dl className="grid min-w-0 gap-1 text-xs text-muted-foreground">
        <div className="break-words">
          {appointment.appointment_date} {appointment.appointment_time}
        </div>
        <div className="break-words">{appointment.address}</div>
        <div className="break-words">
          {appointment.vehicle_year} {appointment.vehicle_make} {appointment.vehicle_model}
        </div>
        <div>{formatPhone(appointment.phone)}</div>
      </dl>
      <select
        value={appointment.status}
        onChange={(event) =>
          onStatusChange(appointment.id, event.target.value as AppointmentStatus)
        }
        className="min-h-10 w-full min-w-0 rounded-lg border border-input bg-background px-2 text-sm"
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {t(`admin.status.${status}`)}
          </option>
        ))}
      </select>
      <AppointmentDetailDialog
        appointment={appointment}
        technicians={technicians}
        onAssign={onAssign}
        onDelete={onDelete}
      />
    </article>
  )
}

function TechniciansPanel({
  technicians,
  createTechnician,
  onDelete,
}: {
  technicians: Technician[]
  createTechnician: (formData: FormData) => void
  onDelete: (id: string) => void
}) {
  const { t } = useI18n()

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <form action={createTechnician} className="grid gap-3 rounded-lg border border-border bg-card p-4">
        <h2 className="font-semibold">{t("admin.tech.create")}</h2>
        <Field name="name" label={t("admin.tech.name")} required />
        <Field name="phone" label={t("admin.tech.phone")} required />
        <Field name="area" label={t("admin.tech.area")} />
        <Field name="join_date" label={t("admin.tech.joinDate")} type="date" />
        <Field name="availability" label={t("admin.tech.availability")} />
        <Field name="specialties" label={t("admin.tech.specialties")} placeholder="Brakes, diagnostics" />
        <Button type="submit" className="min-h-11">{t("common.save")}</Button>
      </form>
      <div className="grid content-start gap-3">
        {technicians.map((technician) => (
          <div key={technician.id} className="rounded-lg border border-border bg-card p-4 text-sm">
            <div className="flex flex-col gap-3 min-[390px]:flex-row min-[390px]:items-start min-[390px]:justify-between">
              <div className="min-w-0">
                <h3 className="font-semibold">{technician.name}</h3>
                <p className="text-muted-foreground">{formatPhone(technician.phone)}</p>
                {technician.area && <p className="text-muted-foreground">{technician.area}</p>}
              </div>
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(technician.id)}
                className="w-full min-[390px]:w-auto"
              >
                {t("admin.actions.delete")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ZipPanel({
  zipCodes,
  addZip,
  onDelete,
}: {
  zipCodes: string[]
  addZip: (formData: FormData) => void
  onDelete: (zip: string) => void
}) {
  const { t } = useI18n()

  return (
    <div className="grid gap-4">
      <form action={addZip} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row">
        <Input name="zipCode" placeholder="95814" className="min-h-11" inputMode="numeric" />
        <Button type="submit" className="min-h-11 sm:w-auto">{t("admin.zip.add")}</Button>
      </form>
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {zipCodes.map((zip) => (
          <div key={zip} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3">
            <span className="font-medium">{zip}</span>
            <Button type="button" variant="ghost" onClick={() => onDelete(zip)}>
              {t("admin.actions.delete")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewsPanel({
  reviews,
  onApprove,
  onReject,
  onDelete,
}: {
  reviews: DashboardProps["pendingReviews"]
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { t } = useI18n()

  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        {t("admin.reviews.empty")}
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {reviews.map((review) => (
        <article key={review.id} className="grid gap-3 rounded-lg border border-border bg-card p-4 text-sm">
          <div>
            <h3 className="font-semibold">{review.reviewer_name}</h3>
            <p className="text-muted-foreground">{review.rating}/5</p>
          </div>
          <p className="text-muted-foreground">{review.comment}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => onApprove(review.id)}>{t("admin.actions.approve")}</Button>
            <Button type="button" variant="outline" onClick={() => onReject(review.id)}>{t("admin.actions.reject")}</Button>
            <Button type="button" variant="destructive" onClick={() => onDelete(review.id)}>{t("admin.actions.delete")}</Button>
          </div>
        </article>
      ))}
    </div>
  )
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required = false,
}: {
  name: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="min-h-11"
      />
    </div>
  )
}
