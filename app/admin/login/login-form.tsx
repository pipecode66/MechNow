"use client"

import { useActionState } from "react"
import { loginAction, type LoginState } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from "@/lib/demo-credentials"
import { useI18n } from "@/lib/i18n"

const initialState: LoginState = {}

export function LoginForm({ demoMode }: { demoMode: boolean }) {
  const { t } = useI18n()
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  return (
    <form action={formAction} className="grid gap-4 rounded-lg border border-border bg-card p-5">
      <div>
        <h1 className="text-2xl font-semibold">{t("admin.login")}</h1>
      </div>
      {demoMode && (
        <div className="rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Credenciales demo</p>
          <p>Email: {DEMO_ADMIN_EMAIL}</p>
          <p>Password: {DEMO_ADMIN_PASSWORD}</p>
        </div>
      )}
      <div className="grid gap-1.5">
        <Label htmlFor="email">{t("admin.email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="min-h-11"
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">{t("admin.password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="min-h-11"
          required
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{t(state.error)}</p>}
      <Button type="submit" className="min-h-11" disabled={pending}>
        {pending ? t("common.loading") : t("admin.signIn")}
      </Button>
    </form>
  )
}
