"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n"
import { isValidZip } from "@/lib/utils"
import type { AddressInfo, LatLng } from "@/types"

interface AddressStepProps {
  address: AddressInfo
  onAddressChange: (address: AddressInfo) => void
  onCoordinatesChange: (coordinates: LatLng | null) => void
  onBack: () => void
  onNext: () => void
}

type ValidationState = "idle" | "validating" | "manual" | "invalid" | "error"

export function AddressStep({
  address,
  onAddressChange,
  onCoordinatesChange,
  onBack,
  onNext,
}: AddressStepProps) {
  const { t } = useI18n()
  const [state, setState] = React.useState<ValidationState>("idle")
  const [error, setError] = React.useState("")
  const [manualConfirmed, setManualConfirmed] = React.useState(false)

  function setField(field: keyof AddressInfo, value: string) {
    setState("idle")
    setError("")
    onAddressChange({ ...address, [field]: value })
  }

  async function validateAddress() {
    setError("")
    setManualConfirmed(false)

    if (!address.street.trim()) {
      setError(t("validation.required"))
      return
    }

    if (!isValidZip(address.zipCode)) {
      setError(t("validation.zip"))
      return
    }

    setState("validating")
    try {
      const response = await fetch("/api/validate-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      })

      const body = (await response.json()) as {
        status?: "valid" | "invalid" | "geocoderUnavailable"
        address?: AddressInfo
        coordinates?: LatLng
      }

      if (body.status === "valid" && body.address) {
        onAddressChange(body.address)
        onCoordinatesChange(body.coordinates ?? null)
        onNext()
        return
      }

      if (body.status === "geocoderUnavailable") {
        setState("manual")
        onCoordinatesChange(null)
        return
      }

      setState("invalid")
      setError(t("booking.address.invalid"))
    } catch {
      setState("manual")
      onCoordinatesChange(null)
    }
  }

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold">{t("booking.address.title")}</h1>
      </div>
      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="street">{t("booking.address.street")}</Label>
          <Input
            id="street"
            value={address.street}
            onChange={(event) => setField("street", event.target.value)}
            className="min-h-11"
            autoComplete="street-address"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="addressZip">{t("booking.zip.label")}</Label>
            <Input
              id="addressZip"
              value={address.zipCode}
              onChange={(event) =>
                setField("zipCode", event.target.value.replace(/\D/g, "").slice(0, 5))
              }
              className="min-h-11"
              inputMode="numeric"
              autoComplete="postal-code"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="city">{t("booking.address.city")}</Label>
            <Input
              id="city"
              value={address.city}
              onChange={(event) => setField("city", event.target.value)}
              className="min-h-11"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="state">{t("booking.address.state")}</Label>
            <Input
              id="state"
              value={address.state}
              onChange={(event) => setField("state", event.target.value.toUpperCase().slice(0, 2))}
              className="min-h-11"
            />
          </div>
        </div>
      </div>

      {state === "manual" && (
        <div className="grid gap-3 rounded-lg border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">{t("booking.address.warning")}</p>
          <Label className="min-h-11 items-center">
            <Checkbox
              checked={manualConfirmed}
              onCheckedChange={(checked) => setManualConfirmed(checked === true)}
            />
            {t("booking.address.manual")}
          </Label>
          <Button
            type="button"
            onClick={onNext}
            disabled={!manualConfirmed}
            className="min-h-11"
          >
            {t("common.next")}
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack} className="min-h-11">
          {t("common.back")}
        </Button>
        <Button
          type="button"
          onClick={validateAddress}
          className="min-h-11"
          disabled={state === "validating"}
        >
          {state === "validating" ? t("common.loading") : t("booking.address.validate")}
        </Button>
      </div>
    </div>
  )
}
