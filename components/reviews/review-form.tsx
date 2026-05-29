"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/lib/i18n"
import { SERVICE_OPTIONS } from "@/lib/service-options"

type FormStatus = "idle" | "submitting" | "success" | "error"

export function ReviewForm() {
  const { t } = useI18n()
  const [status, setStatus] = React.useState<FormStatus>("idle")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("submitting")

    const formData = new FormData(event.currentTarget)
    const payload = {
      reviewerName: String(formData.get("reviewerName") ?? ""),
      reviewerEmail: String(formData.get("reviewerEmail") ?? ""),
      rating: Number(formData.get("rating") ?? 5),
      comment: String(formData.get("comment") ?? ""),
      serviceType: String(formData.get("serviceType") ?? ""),
    }

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        setStatus("error")
        return
      }

      event.currentTarget.reset()
      setStatus("success")
    } catch {
      setStatus("error")
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded-lg border border-border bg-card p-4"
    >
      <div className="flex items-center gap-2">
        <Star className="size-5 fill-primary text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold">{t("reviews.form.title")}</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="reviewerName">{t("reviews.name")}</Label>
          <Input id="reviewerName" name="reviewerName" className="min-h-11" required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="reviewerEmail">{t("reviews.email")}</Label>
          <Input
            id="reviewerEmail"
            name="reviewerEmail"
            type="email"
            className="min-h-11"
            required
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="rating">{t("reviews.rating")}</Label>
          <select
            id="rating"
            name="rating"
            className="min-h-11 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            defaultValue="5"
          >
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="serviceType">
            {t("reviews.service")} ({t("reviews.optional")})
          </Label>
          <select
            id="serviceType"
            name="serviceType"
            className="min-h-11 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            defaultValue=""
          >
            <option value="">{t("reviews.optional")}</option>
            {SERVICE_OPTIONS.map((service) => (
              <option key={service.id} value={service.label}>
                {t(service.translationKey)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="comment">{t("reviews.comment")}</Label>
        <Textarea id="comment" name="comment" className="min-h-28" required />
      </div>
      {status === "success" && (
        <p className="text-sm text-primary">{t("reviews.success")}</p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive">{t("reviews.error")}</p>
      )}
      <Button type="submit" className="min-h-11" disabled={status === "submitting"}>
        {status === "submitting" ? t("common.loading") : t("common.submit")}
      </Button>
    </form>
  )
}
