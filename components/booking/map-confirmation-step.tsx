"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/lib/i18n"
import type { AddressInfo, LatLng } from "@/types"

interface MapConfirmationStepProps {
  address: AddressInfo
  coordinates: LatLng | null
  additionalInfo: string
  onAdditionalInfoChange: (additionalInfo: string) => void
  onBack: () => void
  onNext: () => void
}

function formatAddress(address: AddressInfo) {
  return [address.street, address.city, address.state, address.zipCode]
    .filter(Boolean)
    .join(", ")
}

export function MapConfirmationStep({
  address,
  coordinates,
  additionalInfo,
  onAdditionalInfoChange,
  onBack,
  onNext,
}: MapConfirmationStepProps) {
  const { t } = useI18n()
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const mapUrl =
    mapsKey && coordinates
      ? `https://www.google.com/maps/embed/v1/view?key=${encodeURIComponent(
          mapsKey
        )}&center=${coordinates.lat},${coordinates.lng}&zoom=15`
      : ""

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold">{t("booking.map.title")}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("booking.map.body")}
        </p>
      </div>

      {mapUrl ? (
        <iframe
          title={t("booking.map.title")}
          src={mapUrl}
          className="h-72 w-full rounded-lg border border-border"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-sm font-medium">{formatAddress(address)}</p>
        </div>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="additionalInfo">{t("booking.map.notes")}</Label>
        <Textarea
          id="additionalInfo"
          value={additionalInfo}
          onChange={(event) => onAdditionalInfoChange(event.target.value.slice(0, 500))}
          className="min-h-28"
          maxLength={500}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack} className="min-h-11">
          {t("common.back")}
        </Button>
        <Button type="button" onClick={onNext} className="min-h-11">
          {t("booking.map.confirm")}
        </Button>
      </div>
    </div>
  )
}
