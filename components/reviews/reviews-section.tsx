"use client"

import { Star } from "lucide-react"
import { ReviewForm } from "@/components/reviews/review-form"
import { useI18n } from "@/lib/i18n"
import { findServiceOption } from "@/lib/service-options"
import type { Review } from "@/types"

interface ReviewsSectionProps {
  reviews: Review[]
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const { t } = useI18n()

  function translateService(serviceType: string) {
    return serviceType
      .split(",")
      .map((label) => {
        const service = findServiceOption(label)
        return service ? t(service.translationKey) : label.trim()
      })
      .join(", ")
  }

  return (
    <section id="reviews" className="bg-background py-14 sm:py-20">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_420px]">
        <div className="grid content-start gap-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("reviews.title")}
            </h2>
          </div>
          {reviews.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
              {t("reviews.empty")}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="grid gap-3 rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-1 text-primary">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <Star
                        key={index}
                        className="size-4 fill-current"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {review.comment}
                  </p>
                  <div>
                    <p className="text-sm font-semibold">{review.reviewer_name}</p>
                    {review.service_type && (
                      <p className="text-xs text-muted-foreground">
                        {translateService(review.service_type)}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        <ReviewForm />
      </div>
    </section>
  )
}
