"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n"
import { isValidEmail, isValidZip } from "@/lib/utils"

interface ZipCodeStepProps {
  zipCode: string
  onZipCodeChange: (zipCode: string) => void
  onNext: () => void
}

type CoverageState = "idle" | "checking" | "covered" | "uncovered" | "error"

export function ZipCodeStep({
  zipCode,
  onZipCodeChange,
  onNext,
}: ZipCodeStepProps) {
  const { t } = useI18n()
  const [coverage, setCoverage] = React.useState<CoverageState>("idle")
  const [error, setError] = React.useState("")
  const [waitlistEmail, setWaitlistEmail] = React.useState("")
  const [waitlistMessage, setWaitlistMessage] = React.useState("")

  async function checkCoverage() {
    setError("")
    setWaitlistMessage("")

    if (!isValidZip(zipCode)) {
      setError(t("validation.zip"))
      return
    }

    setCoverage("checking")
    try {
      const response = await fetch(`/api/service-zip-codes?zip=${encodeURIComponent(zipCode)}`)
      if (!response.ok) {
        setCoverage("error")
        setError(t("booking.serviceUnavailable"))
        return
      }

      const body = (await response.json()) as { covered?: boolean }
      setCoverage(body.covered ? "covered" : "uncovered")
    } catch {
      setCoverage("error")
      setError(t("booking.serviceUnavailable"))
    }
  }

  async function submitWaitlist(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setWaitlistMessage("")

    if (!isValidEmail(waitlistEmail)) {
      setError(t("validation.email"))
      return
    }

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zipCode, email: waitlistEmail }),
      })

      if (!response.ok) {
        setError(t("booking.serviceUnavailable"))
        return
      }

      setWaitlistMessage(t("booking.zip.waitlistSuccess"))
    } catch {
      setError(t("booking.serviceUnavailable"))
    }
  }

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold">{t("booking.zip.title")}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("booking.zip.body")}
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="zipCode">{t("booking.zip.label")}</Label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="zipCode"
            value={zipCode}
            onChange={(event) => {
              onZipCodeChange(event.target.value.replace(/\D/g, "").slice(0, 5))
              setCoverage("idle")
            }}
            className="min-h-11"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="95814"
          />
          <Button
            type="button"
            onClick={checkCoverage}
            className="min-h-11 sm:w-44"
            disabled={coverage === "checking"}
          >
            {coverage === "checking" ? t("common.loading") : t("booking.zip.check")}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {coverage === "covered" && (
        <div className="grid gap-3 rounded-lg border border-primary/30 bg-accent p-4">
          <p className="text-sm font-medium text-accent-foreground">
            {t("booking.zip.covered")}
          </p>
          <Button type="button" onClick={onNext} className="min-h-11">
            {t("common.next")}
          </Button>
        </div>
      )}

      {coverage === "uncovered" && (
        <form
          onSubmit={submitWaitlist}
          className="grid gap-3 rounded-lg border border-border bg-background p-4"
        >
          <p className="text-sm text-muted-foreground">
            {t("booking.zip.uncovered")}
          </p>
          <Label htmlFor="waitlistEmail">{t("booking.zip.waitlistEmail")}</Label>
          <Input
            id="waitlistEmail"
            type="email"
            value={waitlistEmail}
            onChange={(event) => setWaitlistEmail(event.target.value)}
            className="min-h-11"
            autoComplete="email"
          />
          {waitlistMessage && (
            <p className="text-sm text-primary">{waitlistMessage}</p>
          )}
          <Button type="submit" className="min-h-11">
            {t("booking.zip.waitlist")}
          </Button>
        </form>
      )}
    </div>
  )
}
