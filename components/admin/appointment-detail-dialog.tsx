"use client"

import * as React from "react"
import { Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useI18n } from "@/lib/i18n"
import { formatAppointmentDate } from "@/lib/date-utils"
import { findServiceOption } from "@/lib/service-options"
import { formatPhone } from "@/lib/utils"
import type { Appointment, Technician } from "@/types"

interface AppointmentDetailDialogProps {
  appointment: Appointment
  technicians: Technician[]
  onAssign: (id: string, technicianName: string) => void
  onDelete: (id: string) => void
}

export function AppointmentDetailDialog({
  appointment,
  technicians,
  onAssign,
  onDelete,
}: AppointmentDetailDialogProps) {
  const { t } = useI18n()
  const [open, setOpen] = React.useState(false)
  const serviceType = appointment.service_type
    .split(",")
    .map((label) => {
      const service = findServiceOption(label)
      return service ? t(service.translationKey) : label.trim()
    })
    .join(", ")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="min-h-10 w-full"
      >
        <Eye className="size-4" aria-hidden="true" />
        {t("admin.appointment.details")}
      </Button>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("admin.appointment.title")}</DialogTitle>
          <DialogDescription>
            {formatAppointmentDate(appointment.appointment_date)} {appointment.appointment_time}
          </DialogDescription>
        </DialogHeader>
        <dl className="grid gap-3 text-sm">
          <Detail
            label={t("admin.appointment.customer")}
            value={`${appointment.first_name} ${appointment.last_name}`}
          />
          <Detail label={t("admin.appointment.email")} value={appointment.email} />
          <Detail label={t("admin.appointment.phone")} value={formatPhone(appointment.phone)} />
          <Detail
            label={t("admin.appointment.vehicle")}
            value={`${appointment.vehicle_year} ${appointment.vehicle_make} ${appointment.vehicle_model} - ${appointment.engine_type}`}
          />
          <Detail label={t("admin.appointment.service")} value={serviceType} />
          <Detail
            label={t("admin.appointment.dateTime")}
            value={`${formatAppointmentDate(appointment.appointment_date)} ${appointment.appointment_time}`}
          />
          <Detail label={t("admin.appointment.address")} value={appointment.address} />
          <Detail
            label={t("admin.appointment.notes")}
            value={appointment.additional_info || t("admin.appointment.noNotes")}
          />
        </dl>
        <div className="grid gap-1.5">
          <label className="text-sm font-medium" htmlFor={`mechanic-${appointment.id}`}>
            {t("admin.appointment.mechanic")}
          </label>
          <select
            id={`mechanic-${appointment.id}`}
            value={appointment.assigned_mechanic ?? ""}
            onChange={(event) => onAssign(appointment.id, event.target.value)}
            className="min-h-11 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">{t("admin.appointment.unassigned")}</option>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.name}>
                {technician.name}
              </option>
            ))}
          </select>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={() => onDelete(appointment.id)}
            className="min-h-11"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {t("admin.actions.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-border pb-3 last:border-b-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium">{value}</dd>
    </div>
  )
}
