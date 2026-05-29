"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n"
import type { VehicleInfo } from "@/types"

interface VehicleInfoStepProps {
  vehicle: VehicleInfo
  onChange: (vehicle: VehicleInfo) => void
  onBack: () => void
  onNext: () => void
}

const vinPattern = /^[A-HJ-NPR-Z0-9]{17}$/i

export function VehicleInfoStep({
  vehicle,
  onChange,
  onBack,
  onNext,
}: VehicleInfoStepProps) {
  const { t } = useI18n()
  const [vin, setVin] = React.useState("")
  const [error, setError] = React.useState("")
  const [vinMessage, setVinMessage] = React.useState("")
  const [decoding, setDecoding] = React.useState(false)

  function setField(field: keyof VehicleInfo, value: string | boolean) {
    onChange({ ...vehicle, [field]: value })
  }

  async function decodeVin() {
    setError("")
    setVinMessage("")

    if (!vinPattern.test(vin)) {
      setError(t("validation.vin"))
      return
    }

    setDecoding(true)
    try {
      const response = await fetch(`/api/decode-vin?vin=${encodeURIComponent(vin)}`)
      if (!response.ok) {
        setVinMessage(t("booking.vehicle.vinFailed"))
        return
      }

      const body = (await response.json()) as {
        vehicle?: {
          year?: string
          make?: string
          model?: string
          engineType?: string
        }
      }

      if (!body.vehicle) {
        setVinMessage(t("booking.vehicle.vinFailed"))
        return
      }

      onChange({
        year: body.vehicle.year ?? vehicle.year,
        make: body.vehicle.make ?? vehicle.make,
        model: body.vehicle.model ?? vehicle.model,
        engineType: body.vehicle.engineType ?? vehicle.engineType,
        vinUsed: true,
      })
    } catch {
      setVinMessage(t("booking.vehicle.vinFailed"))
    } finally {
      setDecoding(false)
    }
  }

  function submit() {
    if (!vehicle.year || !vehicle.make || !vehicle.model || !vehicle.engineType) {
      setError(t("validation.required"))
      return
    }
    setError("")
    onNext()
  }

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold">{t("booking.vehicle.title")}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("booking.vehicle.body")}
        </p>
      </div>

      <div className="grid gap-2 rounded-lg border border-border bg-background p-4">
        <Label htmlFor="vin">{t("booking.vehicle.vin")}</Label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="vin"
            value={vin}
            onChange={(event) => setVin(event.target.value.toUpperCase().slice(0, 17))}
            className="min-h-11 uppercase"
            placeholder="1HGCM82633A004352"
          />
          <Button
            type="button"
            onClick={decodeVin}
            className="min-h-11 sm:w-40"
            disabled={decoding}
          >
            {decoding ? t("common.loading") : t("booking.vehicle.decode")}
          </Button>
        </div>
        {vinMessage && <p className="text-sm text-muted-foreground">{vinMessage}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="year">{t("booking.vehicle.year")}</Label>
          <Input
            id="year"
            value={vehicle.year}
            onChange={(event) => setField("year", event.target.value)}
            className="min-h-11"
            inputMode="numeric"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="make">{t("booking.vehicle.make")}</Label>
          <Input
            id="make"
            value={vehicle.make}
            onChange={(event) => setField("make", event.target.value)}
            className="min-h-11"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="model">{t("booking.vehicle.model")}</Label>
          <Input
            id="model"
            value={vehicle.model}
            onChange={(event) => setField("model", event.target.value)}
            className="min-h-11"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="engine">{t("booking.vehicle.engine")}</Label>
          <Input
            id="engine"
            value={vehicle.engineType}
            onChange={(event) => setField("engineType", event.target.value)}
            className="min-h-11"
          />
        </div>
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
