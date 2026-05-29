"use client"

import { useI18n, type Language } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const languages: Language[] = ["en", "es"]

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n()

  return (
    <div
      className="inline-grid min-h-11 grid-cols-2 rounded-lg border border-border bg-card p-1"
      aria-label="Language"
    >
      {languages.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLang(option)}
          className={cn(
            "min-h-9 min-w-9 rounded-md px-2 text-sm font-medium uppercase transition-colors min-[380px]:min-w-11 min-[380px]:px-3",
            lang === option
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          aria-pressed={lang === option}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
