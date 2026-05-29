"use client"

import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { formatAppointmentDate } from "@/lib/date-utils"
import { findServiceOption } from "@/lib/service-options"
import type { BookingState } from "@/types"

export interface BookingSuccess {
  appointmentId?: string
  smsWarning?: boolean
}

interface SuccessStepProps {
  state: BookingState
  result: BookingSuccess | null
}

export function SuccessStep({ state, result }: SuccessStepProps) {
  const { t } = useI18n()
  const address = [state.address.street, state.address.city, state.address.state, state.address.zipCode]
    .filter(Boolean)
    .join(", ")
  const services = state.services
    .map((label) => {
      const service = findServiceOption(label)
      return service ? t(service.translationKey) : label
    })
    .join(", ")

  return (
    <div className="grid gap-5 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-accent text-primary">
        <CheckCircle2 className="size-8" aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold">{t("booking.success.title")}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("booking.success.body")}
        </p>
      </div>

      <dl className="grid gap-3 rounded-lg border border-border bg-background p-4 text-left text-sm">
        {result?.appointmentId && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">ID</dt>
            <dd className="font-medium">{result.appointmentId}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{t("booking.date.date")}</dt>
          <dd className="font-medium">{formatAppointmentDate(state.appointmentDate)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{t("booking.success.time")}</dt>
          <dd className="font-medium">{state.appointmentTime}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-muted-foreground">{t("home.services.title")}</dt>
          <dd className="font-medium">{services}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-muted-foreground">{t("booking.address.title")}</dt>
          <dd className="font-medium">{address}</dd>
        </div>
      </dl>

      {result?.smsWarning && (
        <p className="rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">
          {t("booking.success.smsWarning")}
        </p>
      )}

      <Link
        href="/"
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {t("booking.success.home")}
      </Link>
    </div>
  )
}
