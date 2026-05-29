"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CalendarCheck, MapPinCheck, ShieldCheck } from "lucide-react"
import { Header } from "@/components/header"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import { useI18n } from "@/lib/i18n"
import { SERVICE_OPTIONS } from "@/lib/service-options"
import type { Review } from "@/types"

interface HomePageContentProps {
  reviews: Review[]
}

const benefits = [
  { key: "home.benefits.one", icon: MapPinCheck },
  { key: "home.benefits.two", icon: ShieldCheck },
  { key: "home.benefits.three", icon: CalendarCheck },
]

export function HomePageContent({ reviews }: HomePageContentProps) {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative flex min-h-[calc(100svh-7rem)] max-h-[760px] overflow-hidden border-b border-border">
          <Image
            src="/hero-mobile-mechanic.png"
            alt="Mobile mechanic inspecting a vehicle in a customer's driveway"
            fill
            className="object-cover object-[68%_center]"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,20,17,0.9)_0%,rgba(12,20,17,0.75)_42%,rgba(12,20,17,0.22)_72%,rgba(12,20,17,0.08)_100%)]" />
          <div className="relative mx-auto flex w-full max-w-6xl items-center px-4 py-9 sm:px-6 sm:py-12">
            <div className="grid max-w-xl gap-5 text-white">
              <p className="w-fit rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm font-medium text-white">
                {t("home.hero.kicker")}
              </p>
              <div className="grid gap-4">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  {t("home.hero.title")}
                </h1>
                <p className="text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
                  {t("home.hero.body")}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/booking"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {t("home.hero.cta")}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <a
                  href="#services"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/35 bg-white/10 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  {t("home.hero.secondary")}
                </a>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-sm text-white/80">
                {[t("home.hero.stat1"), t("home.hero.stat2"), t("home.hero.stat3")].map(
                  (stat) => (
                    <span key={stat} className="inline-flex items-center gap-2 font-medium">
                      <span className="size-1.5 rounded-full bg-white" aria-hidden="true" />
                      {stat}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-20">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[320px_1fr]">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("home.benefits.title")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {benefits.map(({ key, icon: Icon }) => (
                <div key={key} className="rounded-lg border border-border bg-card p-4">
                  <Icon className="mb-4 size-6 text-primary" aria-hidden="true" />
                  <p className="text-sm leading-6 text-muted-foreground">{t(key)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="border-y border-border bg-card py-14 sm:py-20">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {t("home.services.title")}
              </h2>
              <p className="mt-3 text-muted-foreground">{t("home.services.body")}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICE_OPTIONS.map((service) => (
                <div
                  key={service.id}
                  className="rounded-lg border border-border bg-background p-4 text-sm font-medium"
                >
                  {t(service.translationKey)}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-20">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("home.how.title")}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {[t("home.how.one"), t("home.how.two"), t("home.how.three")].map(
                (step, index) => (
                  <div key={step} className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-4 grid size-9 place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{step}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <ReviewsSection reviews={reviews} />

        <section className="border-t border-border bg-primary py-12 text-primary-foreground">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {t("home.cta.title")}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-primary-foreground/80">
                {t("home.cta.body")}
              </p>
            </div>
            <Link
              href="/booking"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
            >
              {t("home.hero.cta")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
