"use client"

import Link from "next/link"
import { CalendarClock, ShieldCheck } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useI18n } from "@/lib/i18n"

export function Header() {
  const { t } = useI18n()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <BrandLogo />
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/booking"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <CalendarClock className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t("nav.book")}</span>
          </Link>
          <Link
            href="/admin/login"
            className="hidden min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            <ShieldCheck className="size-4" aria-hidden="true" />
            {t("nav.admin")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  )
}
