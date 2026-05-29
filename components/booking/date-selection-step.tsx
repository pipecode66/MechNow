"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n"
import { getTodayIsoDate, isPastDate, TIME_SLOTS } from "@/lib/date-utils"
import { cn } from "@/lib/utils"
import type { BookingSuccess } from "@/components/booking/success-step"
import type { BookingState } from "@/types"

interface DateSelectionStepProps {
  state: BookingState
  onChange: (patch: Partial<BookingState>) => void
  onBack: () => void
  onSuccess: (result: BookingSuccess) => void
}

export function DateSelectionStep({
  state,
  onChange,
  onBack,
  onSuccess,
}: DateSelectionStepProps) {
  const { t } = useI18n()
  const [bookedSlots, setBookedSlots] = React.useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = React.useState(false)
  const [availabilityLoaded, setAvailabilityLoaded] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    if (!state.appointmentDate || isPastDate(state.appointmentDate)) {
      return
    }

    async function loadAvailability() {
      setLoadingSlots(true)
      setAvailabilityLoaded(false)
      setError("")
      try {
        const response = await fetch(
          `/api/availability?date=${encodeURIComponent(state.appointmentDate)}`
        )
        if (!response.ok) {
          setBookedSlots([])
          setError(t("booking.date.availabilityError"))
          return
        }
        const body = (await response.json()) as { bookedSlots?: string[] }
        setBookedSlots(body.bookedSlots ?? [])
        setAvailabilityLoaded(true)
      } catch {
        setBookedSlots([])
        setError(t("booking.date.availabilityError"))
      } finally {
        setLoadingSlots(false)
      }
    }

    void loadAvailability()
  }, [state.appointmentDate, t])

  async function submit() {
    setError("")

    if (!state.appointmentDate || isPastDate(state.appointmentDate)) {
      setError(t("validation.date"))
      return
    }

    if (!state.appointmentTime) {
      setError(t("validation.required"))
      return
    }

    if (!availabilityLoaded) {
      setError(t("booking.date.availabilityError"))
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        firstName: state.personal.firstName,
        lastName: state.personal.lastName,
        email: state.personal.email,
        phone: state.personal.phone,
        zipCode: state.zipCode,
        address: [state.address.street, state.address.city, state.address.state, state.address.zipCode]
          .filter(Boolean)
          .join(", "),
        additionalInfo: state.additionalInfo,
        appointmentDate: state.appointmentDate,
        appointmentTime: state.appointmentTime,
        vehicleYear: state.vehicle.year,
        vehicleMake: state.vehicle.make,
        vehicleModel: state.vehicle.model,
        engineType: state.vehicle.engineType,
        serviceType: state.services.join(", "),
        referralSource: state.personal.referralSource,
      }

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const body = (await response.json()) as BookingSuccess & { error?: string }

      if (!response.ok) {
        if (response.status === 503) {
          setError(t("booking.serviceUnavailable"))
        } else if (response.status === 409) {
          setError(t("booking.date.slotTaken"))
        } else {
          setError(body.error ?? t("admin.error"))
        }
        return
      }

      onSuccess(body)
    } catch {
      setError(t("admin.error"))
    } finally {
      setSubmitting(false)
    }
  }

  const allSlotsBooked = state.appointmentDate && TIME_SLOTS.every((slot) => bookedSlots.includes(slot))

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold">{t("booking.date.title")}</h1>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="appointmentDate">{t("booking.date.date")}</Label>
        <Input
          id="appointmentDate"
          type="date"
          min={getTodayIsoDate()}
          value={state.appointmentDate}
          onChange={(event) => {
            setBookedSlots([])
            setAvailabilityLoaded(false)
            onChange({ appointmentDate: event.target.value, appointmentTime: "" })
          }}
          className="min-h-11"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {TIME_SLOTS.map((slot) => {
          const disabled = loadingSlots || !availabilityLoaded || bookedSlots.includes(slot)
          const selected = state.appointmentTime === slot
          return (
            <button
              key={slot}
              type="button"
              disabled={disabled}
              onClick={() => onChange({ appointmentTime: slot })}
              className={cn(
                "min-h-12 rounded-lg border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                selected
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border bg-background hover:bg-muted"
              )}
            >
              {slot}
            </button>
          )
        })}
      </div>

      {allSlotsBooked && (
        <p className="text-sm text-muted-foreground">{t("booking.date.noSlots")}</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack} className="min-h-11">
          {t("common.back")}
        </Button>
        <Button
          type="button"
          onClick={submit}
          className="min-h-11"
          disabled={submitting}
        >
          {submitting ? t("common.loading") : t("booking.date.confirm")}
        </Button>
      </div>
    </div>
  )
}
