"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n"
import { isValidEmail, normalizePhone } from "@/lib/utils"
import type { PersonalInfo } from "@/types"

interface PersonalDetailsStepProps {
  personal: PersonalInfo
  onChange: (personal: PersonalInfo) => void
  onBack: () => void
  onNext: () => void
}

export function PersonalDetailsStep({
  personal,
  onChange,
  onBack,
  onNext,
}: PersonalDetailsStepProps) {
  const { t } = useI18n()
  const [error, setError] = React.useState("")

  function setField(field: keyof PersonalInfo, value: string) {
    setError("")
    onChange({ ...personal, [field]: value })
  }

  function submit() {
    if (!personal.firstName || !personal.lastName || !personal.email || !personal.phone) {
      setError(t("validation.required"))
      return
    }

    if (!isValidEmail(personal.email)) {
      setError(t("validation.email"))
      return
    }

    const normalizedPhone = normalizePhone(personal.phone)
    if (normalizedPhone.length !== 10) {
      setError(t("validation.phone"))
      return
    }

    onChange({ ...personal, phone: normalizedPhone })
    onNext()
  }

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold">{t("booking.personal.title")}</h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="firstName">{t("booking.personal.first")}</Label>
          <Input
            id="firstName"
            value={personal.firstName}
            onChange={(event) => setField("firstName", event.target.value)}
            className="min-h-11"
            autoComplete="given-name"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="lastName">{t("booking.personal.last")}</Label>
          <Input
            id="lastName"
            value={personal.lastName}
            onChange={(event) => setField("lastName", event.target.value)}
            className="min-h-11"
            autoComplete="family-name"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="email">{t("booking.personal.email")}</Label>
          <Input
            id="email"
            value={personal.email}
            type="email"
            onChange={(event) => setField("email", event.target.value)}
            className="min-h-11"
            autoComplete="email"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="phone">{t("booking.personal.phone")}</Label>
          <Input
            id="phone"
            value={personal.phone}
            onChange={(event) => setField("phone", event.target.value)}
            className="min-h-11"
            inputMode="tel"
            autoComplete="tel"
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="referral">{t("booking.personal.referral")}</Label>
        <Input
          id="referral"
          value={personal.referralSource}
          onChange={(event) => setField("referralSource", event.target.value)}
          className="min-h-11"
        />
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
