"use client"

import * as React from "react"

export function PwaRegister() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      return undefined
    }

    let cancelled = false

    async function registerServiceWorker() {
      try {
        if (!cancelled) {
          await navigator.serviceWorker.register("/sw.js")
        }
      } catch {
        // PWA support should never block the booking experience.
      }
    }

    if (document.readyState === "complete") {
      void registerServiceWorker()
      return () => {
        cancelled = true
      }
    }

    window.addEventListener("load", registerServiceWorker, { once: true })
    return () => {
      cancelled = true
      window.removeEventListener("load", registerServiceWorker)
    }
  }, [])

  return null
}
