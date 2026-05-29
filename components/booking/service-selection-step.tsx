"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { SERVICE_OPTIONS } from "@/lib/service-options"
import { cn } from "@/lib/utils"

interface ServiceSelectionStepProps {
  services: string[]
  onChange: (services: string[]) => void
  onBack: () => void
  onNext: () => void
}

export function ServiceSelectionStep({
  services,
  onChange,
  onBack,
  onNext,
}: ServiceSelectionStepProps) {
  const { t } = useI18n()
  const [error, setError] = React.useState("")

  function toggleService(label: string) {
    setError("")
    onChange(
      services.includes(label)
        ? services.filter((service) => service !== label)
        : [...services, label]
    )
  }

  function submit() {
    if (services.length === 0) {
      setError(t("booking.services.error"))
      return
    }
    onNext()
  }

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold">{t("booking.services.title")}</h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {SERVICE_OPTIONS.map((service) => {
          const selected = services.includes(service.label)
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => toggleService(service.label)}
              className={cn(
                "flex min-h-14 items-center justify-between rounded-lg border p-4 text-left text-sm font-medium transition-colors",
                selected
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border bg-background hover:bg-muted"
              )}
              aria-pressed={selected}
            >
              {t(service.translationKey)}
              {selected && <Check className="size-5 text-primary" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack} className="min-h-11">
          {t("common.back")}
        </Button>
        <Button type="button" onClick={submit} className="min-h-11">
          {t("common.next")}
        </Button>
      </div>
    </div>
  )
}
